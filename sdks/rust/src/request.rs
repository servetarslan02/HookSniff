//! HookSniff SDK — HTTP Request Helper
//!
//! Handles auth, retries, error mapping, and idempotency keys.

use reqwest::blocking::Client;
use reqwest::StatusCode;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::collections::HashMap;
use std::time::Duration;

const LIB_VERSION: &str = "0.4.0";

/// Error returned by the HookSniff API.
#[derive(Debug)]
pub struct ApiException {
    pub code: u16,
    pub body: String,
}

impl std::fmt::Display for ApiException {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "HookSniff API Error {}: {}", self.code, self.body)
    }
}

impl std::error::Error for ApiException {}

/// Shared request context.
#[derive(Clone, Debug)]
pub struct HookSniffRequestContext {
    pub base_url: String,
    pub token: String,
    pub timeout: Duration,
    pub num_retries: u32,
}

/// HTTP methods.
#[derive(Clone, Copy)]
pub enum HttpMethod {
    Get,
    Post,
    Put,
    Delete,
}

/// Builder for a HookSniff API request.
pub struct HookSniffRequest {
    method: HttpMethod,
    path: String,
    body: Option<String>,
    query_params: HashMap<String, String>,
    header_params: HashMap<String, String>,
}

impl HookSniffRequest {
    pub fn new(method: HttpMethod, path: &str) -> Self {
        Self {
            method,
            path: path.to_string(),
            body: None,
            query_params: HashMap::new(),
            header_params: HashMap::new(),
        }
    }

    pub fn set_path_param(&mut self, name: &str, value: &str) {
        self.path = self.path.replace(&format!("{{{}}}", name), value);
    }

    pub fn set_query_param(&mut self, name: &str, value: &str) {
        self.query_params.insert(name.to_string(), value.to_string());
    }

    pub fn set_header_param(&mut self, name: &str, value: &str) {
        self.header_params.insert(name.to_string(), value.to_string());
    }

    pub fn set_body<T: Serialize>(&mut self, value: &T) {
        self.body = Some(serde_json::to_string(value).expect("serialization failed"));
    }

    /// Send the request and deserialize the response.
    pub fn send<T: DeserializeOwned>(&self, ctx: &HookSniffRequestContext) -> Result<T, Box<dyn std::error::Error>> {
        let text = self.send_raw(ctx)?;
        let value: T = serde_json::from_str(&text)?;
        Ok(value)
    }

    /// Send the request and return raw text (for void endpoints).
    pub fn send_void(&self, ctx: &HookSniffRequestContext) -> Result<(), Box<dyn std::error::Error>> {
        self.send_raw(ctx)?;
        Ok(())
    }

    /// Read-only accessors for testing.
    #[cfg(feature = "test-utils")]
    pub fn path(&self) -> &str {
        &self.path
    }

    #[cfg(feature = "test-utils")]
    pub fn query_params(&self) -> &HashMap<String, String> {
        &self.query_params
    }

    #[cfg(feature = "test-utils")]
    pub fn header_params(&self) -> &HashMap<String, String> {
        &self.header_params
    }

    #[cfg(feature = "test-utils")]
    pub fn body_str(&self) -> Option<&str> {
        self.body.as_deref()
    }

    fn send_raw(&self, ctx: &HookSniffRequestContext) -> Result<String, Box<dyn std::error::Error>> {
        let client = Client::builder()
            .timeout(ctx.timeout)
            .build()?;

        let mut url = format!("{}{}", ctx.base_url, self.path);
        if !self.query_params.is_empty() {
            let qs: String = self.query_params
                .iter()
                .map(|(k, v)| format!("{}={}", k, v))
                .collect::<Vec<_>>()
                .join("&");
            url = format!("{}?{}", url, qs);
        }

        let method = match self.method {
            HttpMethod::Get => reqwest::Method::GET,
            HttpMethod::Post => reqwest::Method::POST,
            HttpMethod::Put => reqwest::Method::PUT,
            HttpMethod::Delete => reqwest::Method::DELETE,
        };

        let idempotency_key = uuid::Uuid::new_v4().to_string();

        let mut last_err: Option<String> = None;

        for attempt in 0..=ctx.num_retries {
            let mut req = client
                .request(method.clone(), &url)
                .header("accept", "application/json")
                .header("authorization", format!("Bearer {}", ctx.token))
                .header("user-agent", format!("hooksniff-sdk/{}/rust", LIB_VERSION));

            // Auto idempotency key for POST
            if matches!(self.method, HttpMethod::Post) && !self.header_params.contains_key("idempotency-key") {
                req = req.header("idempotency-key", &idempotency_key);
            }

            for (k, v) in &self.header_params {
                req = req.header(k.as_str(), v.as_str());
            }

            if let Some(ref body) = self.body {
                req = req
                    .header("content-type", "application/json")
                    .body(body.clone());
            }

            match req.send() {
                Ok(resp) => {
                    let status = resp.status();
                    if status == StatusCode::NO_CONTENT {
                        return Ok(String::new());
                    }
                    if status.is_success() {
                        return Ok(resp.text()?);
                    }
                    if status.is_client_error() {
                        let body = resp.text().unwrap_or_else(|_| "Unknown error".to_string());
                        return Err(Box::new(ApiException {
                            code: status.as_u16(),
                            body,
                        }));
                    }
                    // 5xx — retry
                    last_err = Some(format!("HTTP {}", status.as_u16()));
                }
                Err(e) => {
                    last_err = Some(e.to_string());
                }
            }

            // Exponential backoff
            if attempt < ctx.num_retries {
                std::thread::sleep(Duration::from_millis(50 * 2u64.pow(attempt)));
            }
        }

        Err(last_err.unwrap_or_else(|| "Request failed after retries".to_string()).into())
    }
}
