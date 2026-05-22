//! Cloudflare R2 storage integration.
//!
//! R2 is S3-compatible object storage with zero egress fees.
//! Used for: dead letter queue payload archival, webhook log storage.
//!
//! Uses Cloudflare R2 API (not S3-compatible) for simplicity.

use anyhow::Result;
use serde::{Deserialize, Serialize};

/// R2 storage client using Cloudflare API.
#[derive(Clone)]
pub struct R2Client {
    client: reqwest::Client,
    account_id: String,
    token: String,
    bucket: String,
}

/// R2 object metadata.
#[derive(Debug, Serialize, Deserialize)]
pub struct R2Object {
    pub key: String,
    pub size: String,
    pub etag: String,
    pub uploaded: String,
}

/// R2 API response wrapper.
#[derive(Debug, Deserialize)]
struct R2Response<T> {
    success: bool,
    result: Option<T>,
    errors: Vec<R2Error>,
}

#[derive(Debug, Deserialize)]
struct R2Error {
    #[allow(dead_code)]
    code: u32,
    message: String,
}

impl R2Client {
    /// Create a new R2 client.
    ///
    /// `account_id` - Cloudflare account ID
    /// `token` - Cloudflare API token with R2 permissions
    /// `bucket` - R2 bucket name (default: "hooksniff-storage")
    pub fn new(account_id: &str, token: &str, bucket: Option<&str>) -> Self {
        Self {
            client: reqwest::Client::new(),
            account_id: account_id.to_string(),
            token: token.to_string(),
            bucket: bucket.unwrap_or("hooksniff-storage").to_string(),
        }
    }

    /// Create from environment variables.
    /// Requires: CF_ACCOUNT_ID, CF_R2_TOKEN
    /// Optional: CF_R2_BUCKET (defaults to "hooksniff-storage")
    pub fn from_env() -> Option<Self> {
        let account_id = std::env::var("CF_ACCOUNT_ID").ok()?;
        let token = std::env::var("CF_R2_TOKEN").ok()?;
        if account_id.is_empty() || token.is_empty() {
            return None;
        }
        let bucket = std::env::var("CF_R2_BUCKET").ok();
        Some(Self::new(&account_id, &token, bucket.as_deref()))
    }

    /// Base URL for R2 API.
    fn base_url(&self) -> String {
        format!(
            "https://api.cloudflare.com/client/v4/accounts/{}/r2/buckets/{}",
            self.account_id, self.bucket
        )
    }

    /// Upload an object to R2.
    pub async fn put_object(&self, key: &str, data: &[u8], content_type: &str) -> Result<R2Object> {
        let url = format!("{}/objects/{}", self.base_url(), key);

        let response = self
            .client
            .put(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Content-Type", content_type)
            .body(data.to_vec())
            .send()
            .await?;

        let status = response.status();
        let text = response.text().await?;

        if !status.is_success() {
            anyhow::bail!("R2 put_object failed ({}): {}", status, text);
        }

        let resp: R2Response<R2Object> = serde_json::from_str(&text)?;
        if !resp.success {
            let errors: Vec<String> = resp.errors.iter().map(|e| e.message.clone()).collect();
            anyhow::bail!("R2 errors: {}", errors.join(", "));
        }

        resp.result.ok_or_else(|| anyhow::anyhow!("R2: no result"))
    }

    /// Download an object from R2.
    pub async fn get_object(&self, key: &str) -> Result<Vec<u8>> {
        let url = format!("{}/objects/{}", self.base_url(), key);

        let response = self
            .client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .send()
            .await?;

        let status = response.status();
        if !status.is_success() {
            let text = response.text().await?;
            anyhow::bail!("R2 get_object failed ({}): {}", status, text);
        }

        let bytes = response.bytes().await?;
        Ok(bytes.to_vec())
    }

    /// Delete an object from R2.
    pub async fn delete_object(&self, key: &str) -> Result<()> {
        let url = format!("{}/objects/{}", self.base_url(), key);

        let response = self
            .client
            .delete(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .send()
            .await?;

        let status = response.status();
        if !status.is_success() {
            let text = response.text().await?;
            anyhow::bail!("R2 delete_object failed ({}): {}", status, text);
        }

        Ok(())
    }

    /// List objects in the bucket with optional prefix.
    pub async fn list_objects(&self, prefix: Option<&str>, limit: Option<u32>) -> Result<Vec<R2Object>> {
        let mut url = format!("{}/objects", self.base_url());
        let mut params = Vec::new();
        if let Some(p) = prefix {
            params.push(format!("prefix={}", p));
        }
        if let Some(l) = limit {
            params.push(format!("limit={}", l));
        }
        if !params.is_empty() {
            url = format!("{}?{}", url, params.join("&"));
        }

        let response = self
            .client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .send()
            .await?;

        let status = response.status();
        let text = response.text().await?;

        if !status.is_success() {
            anyhow::bail!("R2 list_objects failed ({}): {}", status, text);
        }

        #[derive(Deserialize)]
        struct ListResult {
            objects: Vec<R2Object>,
        }

        let resp: R2Response<ListResult> = serde_json::from_str(&text)?;
        if !resp.success {
            let errors: Vec<String> = resp.errors.iter().map(|e| e.message.clone()).collect();
            anyhow::bail!("R2 errors: {}", errors.join(", "));
        }

        Ok(resp.result.map(|r| r.objects).unwrap_or_default())
    }

    // ──────────────────────────────────────────────────────────
    // High-level helpers for HookSniff
    // ──────────────────────────────────────────────────────────

    /// Archive a dead letter delivery to R2.
    pub async fn archive_dead_letter(
        &self,
        delivery_id: &str,
        customer_id: &str,
        payload: &str,
        reason: &str,
    ) -> Result<String> {
        let key = format!("dead-letters/{}/{}.json", customer_id, delivery_id);
        let archive = serde_json::json!({
            "delivery_id": delivery_id,
            "customer_id": customer_id,
            "payload": payload,
            "reason": reason,
            "archived_at": chrono::Utc::now().to_rfc3339(),
        });
        let data = serde_json::to_vec_pretty(&archive)?;
        self.put_object(&key, &data, "application/json").await?;
        Ok(key)
    }

    /// Archive a webhook delivery log to R2.
    pub async fn archive_delivery_log(
        &self,
        delivery_id: &str,
        customer_id: &str,
        log_data: &serde_json::Value,
    ) -> Result<String> {
        let date = chrono::Utc::now().format("%Y/%m/%d");
        let key = format!("delivery-logs/{}/{}/{}.json", customer_id, date, delivery_id);
        let data = serde_json::to_vec_pretty(log_data)?;
        self.put_object(&key, &data, "application/json").await?;
        Ok(key)
    }

    /// Retrieve an archived dead letter from R2.
    pub async fn get_dead_letter(&self, delivery_id: &str, customer_id: &str) -> Result<Vec<u8>> {
        let key = format!("dead-letters/{}/{}.json", customer_id, delivery_id);
        self.get_object(&key).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn r2_client_from_env_none() {
        std::env::remove_var("CF_ACCOUNT_ID");
        std::env::remove_var("CF_R2_TOKEN");
        assert!(R2Client::from_env().is_none());
    }

    #[test]
    fn r2_client_new_defaults() {
        let client = R2Client::new("test-account", "test-token", None);
        assert_eq!(client.bucket, "hooksniff-storage");
    }

    #[test]
    fn dead_letter_key_format() {
        let key = format!("dead-letters/{}/{}.json", "cust_123", "del_456");
        assert_eq!(key, "dead-letters/cust_123/del_456.json");
    }
}
