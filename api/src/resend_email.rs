use crate::email::Language;
use crate::error::AppError;
use serde::Serialize;

/// Resend.com email client — lightweight alternative to GCloudEmailClient.
///
/// Uses Resend's REST API (https://resend.com/docs/api-reference).
/// Free tier: 100 emails/day, 3,000/month.
///
/// Environment: RESEND_API_KEY
#[derive(Clone)]
pub struct ResendEmailClient {
    api_key: String,
    from_email: String,
    client: reqwest::Client,
}

#[derive(Serialize)]
struct ResendSendRequest<'a> {
    from: &'a str,
    to: Vec<&'a str>,
    subject: &'a str,
    html: &'a str,
}

#[derive(serde::Deserialize)]
struct ResendSendResponse {
    id: String,
}

impl ResendEmailClient {
    pub fn from_env() -> Option<Self> {
        let api_key = std::env::var("RESEND_API_KEY").ok()?;
        let from_email =
            std::env::var("NOTIFY_FROM_EMAIL").unwrap_or_else(|_| "onboarding@resend.dev".into());

        if api_key.is_empty() {
            return None;
        }

        // Ensure "HookSniff" display name is always present
        let from_email = if from_email.contains('<') {
            from_email // Already has display name format
        } else {
            format!("HookSniff <{}>", from_email)
        };

        tracing::info!("✅ Resend email client initialized (from={})", from_email);

        Some(Self {
            api_key,
            from_email,
            client: crate::http_client::get_client().clone(),
        })
    }

    /// Send an email via Resend with exponential backoff retry.
    ///
    /// Retries up to 3 times on transient errors (network failures, 5xx responses).
    /// Does NOT retry on 4xx client errors.
    async fn send(&self, to: &str, subject: &str, html: &str) -> Result<(), AppError> {
        let max_retries = 3u32;
        let base_delay = std::time::Duration::from_secs(1);

        for attempt in 0..=max_retries {
            let result = self.send_once(to, subject, html).await;

            match &result {
                Ok(_) => return result,
                Err(e) => {
                    let is_retryable = match e {
                        AppError::Internal(inner) => {
                            let msg = format!("{:?}", inner);
                            msg.contains("connection")
                                || msg.contains("timeout")
                                || msg.contains("dns")
                                || msg.contains("request")
                                || msg.contains("returned 5")
                        }
                        _ => false,
                    };

                    if !is_retryable || attempt == max_retries {
                        return result;
                    }

                    let delay = base_delay * 2u32.pow(attempt);
                    tracing::warn!(
                        "Resend email attempt {}/{} failed, retrying in {:?}: {}",
                        attempt + 1,
                        max_retries,
                        delay,
                        e
                    );
                    tokio::time::sleep(delay).await;
                }
            }
        }

        unreachable!()
    }

    /// Single attempt to send an email via Resend.
    async fn send_once(&self, to: &str, subject: &str, html: &str) -> Result<(), AppError> {
        let body = ResendSendRequest {
            from: &self.from_email,
            to: vec![to],
            subject,
            html,
        };

        let resp = self
            .client
            .post("https://api.resend.com/emails")
            .bearer_auth(&self.api_key)
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Resend request failed: {}", e)))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            tracing::error!("Resend API error: status={}, body={}", status, text);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Resend returned {}: {}",
                status,
                text
            )));
        }

        let result: ResendSendResponse = resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse Resend response: {}", e))
        })?;

        tracing::info!(
            "✅ Email sent via Resend to {}: {} (id={})",
            to,
            subject,
            result.id
        );
        Ok(())
    }

    pub async fn send_contact_email(
        &self,
        to: &str,
        subject: &str,
        html: &str,
    ) -> Result<(), AppError> {
        self.send(to, subject, html).await
    }

    pub async fn send_welcome_email(
        &self,
        to: &str,
        name: Option<&str>,
        lang: Language,
    ) -> Result<(), AppError> {
        let display_name = name.unwrap_or(if lang == Language::Tr { "kullanıcı" } else { "there" });
        let (subject, html) = super::email::tpl_welcome(display_name, lang);
        self.send(to, subject, &html).await
    }

    pub async fn send_verification_email(
        &self,
        to: &str,
        verification_url: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = super::email::tpl_verification(verification_url, lang);
        self.send(to, subject, &html).await
    }

    pub async fn send_password_reset_email(
        &self,
        to: &str,
        reset_url: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = super::email::tpl_password_reset(reset_url, lang);
        self.send(to, subject, &html).await
    }

    pub async fn send_delivery_failed_email(
        &self,
        to: &str,
        endpoint_name: &str,
        error_details: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = super::email::tpl_delivery_failed(endpoint_name, error_details, lang);
        self.send(to, &subject, &html).await
    }

    #[allow(clippy::too_many_arguments)]
    pub async fn send_invoice_email(
        &self,
        to: &str,
        invoice_number: &str,
        amount: &str,
        plan_name: &str,
        period_start: &str,
        period_end: &str,
        payment_url: Option<&str>,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = super::email::tpl_invoice(
            invoice_number,
            amount,
            plan_name,
            period_start,
            period_end,
            payment_url,
            lang,
        );
        self.send(to, subject, &html).await
    }

    pub async fn send_webhook_success_email(
        &self,
        to: &str,
        endpoint_name: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = super::email::tpl_webhook_success(endpoint_name, lang);
        self.send(to, subject, &html).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_from_env_no_key() {
        std::env::remove_var("RESEND_API_KEY");
        let client = ResendEmailClient::from_env();
        assert!(client.is_none());
    }

    #[test]
    fn test_from_env_empty_key() {
        std::env::set_var("RESEND_API_KEY", "");
        let client = ResendEmailClient::from_env();
        assert!(client.is_none());
        std::env::remove_var("RESEND_API_KEY");
    }

    #[test]
    fn test_from_env_valid_key() {
        std::env::set_var("RESEND_API_KEY", "re_test_key_123");
        let client = ResendEmailClient::from_env();
        assert!(client.is_some());
        let c = client.unwrap();
        assert_eq!(c.api_key, "re_test_key_123");
        std::env::remove_var("RESEND_API_KEY");
    }

    #[test]
    fn test_from_env_custom_from() {
        std::env::set_var("RESEND_API_KEY", "re_test");
        std::env::set_var("NOTIFY_FROM_EMAIL", "custom@example.com");
        let client = ResendEmailClient::from_env().unwrap();
        assert_eq!(client.from_email, "HookSniff <custom@example.com>");
        std::env::remove_var("RESEND_API_KEY");
        std::env::remove_var("NOTIFY_FROM_EMAIL");
    }
}
