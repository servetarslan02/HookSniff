use crate::config::Config;
use crate::error::AppError;
use crate::resend_email::ResendEmailClient;
use base64::Engine;
use serde::Deserialize;

// Re-export from email_templates for backward compatibility
pub use crate::email_templates::Language;
pub use crate::email_templates::{
    tpl_delivery_failed, tpl_invoice, tpl_password_reset, tpl_verification, tpl_webhook_success,
    tpl_welcome,
};

/// Unified email provider — tries Resend first, falls back to GCloud Gmail API.
///
/// Priority: Resend (simpler, free tier 100/day) → GCloud Gmail (OAuth2, more complex).
/// If neither is configured, email sending is a no-op with a warning log.
#[derive(Clone)]
pub enum EmailProvider {
    Resend(ResendEmailClient),
    GCloud(GCloudEmailClient),
    None,
}

impl EmailProvider {
    /// Create from environment: Resend if RESEND_API_KEY is set, else GCloud, else None.
    pub fn from_config(cfg: &Config) -> Self {
        if let Some(resend) = ResendEmailClient::from_env() {
            tracing::info!("📧 Email provider: Resend");
            return Self::Resend(resend);
        }
        if let Some(gcloud) = GCloudEmailClient::from_config(cfg) {
            tracing::info!("📧 Email provider: GCloud Gmail API");
            return Self::GCloud(gcloud);
        }
        tracing::warn!(
            "⚠️ No email provider configured (RESEND_API_KEY and GCP_SA_JSON both missing)"
        );
        Self::None
    }

    /// Returns true if an email provider is actually configured.
    pub fn is_configured(&self) -> bool {
        !matches!(self, Self::None)
    }

    pub async fn send_contact_email(
        &self,
        to: &str,
        subject: &str,
        html: &str,
    ) -> Result<(), AppError> {
        match self {
            Self::Resend(c) => c.send_contact_email(to, subject, html).await,
            Self::GCloud(c) => c.send_contact_email(to, subject, html).await,
            Self::None => {
                tracing::warn!(
                    "Email not sent (no provider): to={}, subject={}",
                    to,
                    subject
                );
                Ok(())
            }
        }
    }

    pub async fn send_welcome_email(
        &self,
        to: &str,
        name: Option<&str>,
        lang: Language,
    ) -> Result<(), AppError> {
        match self {
            Self::Resend(c) => c.send_welcome_email(to, name, lang).await,
            Self::GCloud(c) => c.send_welcome_email(to, name, lang).await,
            Self::None => {
                tracing::warn!("Welcome email not sent (no provider): to={}", to);
                Ok(())
            }
        }
    }

    pub async fn send_verification_email(
        &self,
        to: &str,
        verification_url: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        match self {
            Self::Resend(c) => c.send_verification_email(to, verification_url, lang).await,
            Self::GCloud(c) => c.send_verification_email(to, verification_url, lang).await,
            Self::None => {
                tracing::warn!("Verification email not sent (no provider): to={}", to);
                Ok(())
            }
        }
    }

    pub async fn send_password_reset_email(
        &self,
        to: &str,
        reset_url: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        match self {
            Self::Resend(c) => c.send_password_reset_email(to, reset_url, lang).await,
            Self::GCloud(c) => c.send_password_reset_email(to, reset_url, lang).await,
            Self::None => {
                tracing::warn!("Password reset email not sent (no provider): to={}", to);
                Ok(())
            }
        }
    }

    pub async fn send_delivery_failed_email(
        &self,
        to: &str,
        endpoint_name: &str,
        error_details: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        match self {
            Self::Resend(c) => {
                c.send_delivery_failed_email(to, endpoint_name, error_details, lang)
                    .await
            }
            Self::GCloud(c) => {
                c.send_delivery_failed_email(to, endpoint_name, error_details, lang)
                    .await
            }
            Self::None => {
                tracing::warn!(
                    "Delivery failed email not sent (no provider): to={}, endpoint={}",
                    to,
                    endpoint_name
                );
                Ok(())
            }
        }
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
        match self {
            Self::Resend(c) => {
                c.send_invoice_email(
                    to,
                    invoice_number,
                    amount,
                    plan_name,
                    period_start,
                    period_end,
                    payment_url,
                    lang,
                )
                .await
            }
            Self::GCloud(c) => {
                c.send_invoice_email(
                    to,
                    invoice_number,
                    amount,
                    plan_name,
                    period_start,
                    period_end,
                    payment_url,
                    lang,
                )
                .await
            }
            Self::None => {
                tracing::warn!(
                    "Invoice email not sent (no provider): to={}, invoice={}",
                    to,
                    invoice_number
                );
                Ok(())
            }
        }
    }

    #[allow(clippy::too_many_arguments)]
    pub async fn send_webhook_success_email(
        &self,
        to: &str,
        endpoint_name: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        match self {
            Self::Resend(c) => c.send_webhook_success_email(to, endpoint_name, lang).await,
            Self::GCloud(c) => c.send_webhook_success_email(to, endpoint_name, lang).await,
            Self::None => {
                tracing::warn!(
                    "Webhook success email not sent (no provider): to={}, endpoint={}",
                    to,
                    endpoint_name
                );
                Ok(())
            }
        }
    }
}

/// Google Cloud Gmail API email client using service account credentials.
#[derive(Clone)]
pub struct GCloudEmailClient {
    service_account_key: ServiceAccountKey,
    /// Email address to send from (must be authorized in Google Workspace).
    from_email: String,
    /// Cached access token (short-lived, refreshed automatically).
    access_token: std::sync::Arc<tokio::sync::RwLock<Option<CachedToken>>>,
    client: reqwest::Client,
}

#[derive(Clone, Debug, Deserialize)]
struct ServiceAccountKey {
    _type: String,
    _project_id: String,
    _private_key_id: String,
    private_key: String,
    client_email: String,
    _client_id: String,
    _auth_uri: String,
    token_uri: String,
}

struct CachedToken {
    token: String,
    expires_at: std::time::Instant,
}

#[derive(serde::Serialize)]
struct JwtClaims {
    iss: String,
    scope: String,
    aud: String,
    exp: u64,
    iat: u64,
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
    expires_in: u64,
}

impl GCloudEmailClient {
    /// Create a new GCloudEmailClient from config.
    pub fn from_config(cfg: &Config) -> Option<Self> {
        let sa_json = if let Ok(json) = std::env::var("GCP_SA_JSON") {
            json
        } else if let Some(ref path) = cfg.gcp_service_account_path {
            match std::fs::read_to_string(path) {
                Ok(json) => json,
                Err(e) => {
                    tracing::error!("Failed to read GCP service account file {}: {}", path, e);
                    return None;
                }
            }
        } else {
            tracing::debug!("No GCP_SA_JSON or GCP_SERVICE_ACCOUNT_PATH set — email disabled");
            return None;
        };

        let sa_key: ServiceAccountKey = match serde_json::from_str(&sa_json) {
            Ok(key) => key,
            Err(e) => {
                tracing::error!("Failed to parse GCP service account JSON: {}", e);
                return None;
            }
        };

        tracing::info!(
            "✅ GCloud Email client initialized (service_account={}, from={})",
            sa_key.client_email,
            cfg.notify_from_email
        );

        let from_email = if cfg.notify_from_email.contains('<') {
            cfg.notify_from_email.clone()
        } else {
            format!("HookSniff <{}>", cfg.notify_from_email)
        };

        Some(Self {
            service_account_key: sa_key,
            from_email,
            access_token: std::sync::Arc::new(tokio::sync::RwLock::new(None)),
            client: reqwest::Client::new(),
        })
    }

    /// Get a valid OAuth2 access token, refreshing if needed.
    async fn get_access_token(&self) -> Result<String, AppError> {
        {
            let cache = self.access_token.read().await;
            if let Some(ref cached) = *cache {
                if cached.expires_at > std::time::Instant::now() {
                    return Ok(cached.token.clone());
                }
            }
        }

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("system time after UNIX epoch")
            .as_secs();

        let claims = JwtClaims {
            iss: self.service_account_key.client_email.clone(),
            scope: "https://www.googleapis.com/auth/gmail.send".to_string(),
            aud: self.service_account_key.token_uri.clone(),
            exp: now + 3600,
            iat: now,
        };

        let header = jsonwebtoken::Header::new(jsonwebtoken::Algorithm::RS256);
        let encoding_key = jsonwebtoken::EncodingKey::from_rsa_pem(
            self.service_account_key.private_key.as_bytes(),
        )
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create RSA key: {}", e)))?;

        let jwt = jsonwebtoken::encode(&header, &claims, &encoding_key)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to sign JWT: {}", e)))?;

        let params = [
            ("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"),
            ("assertion", &jwt),
        ];

        let resp = self
            .client
            .post(&self.service_account_key.token_uri)
            .form(&params)
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Token exchange failed: {}", e)))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            tracing::error!(
                "GCloud token exchange error: status={}, body={}",
                status,
                text
            );
            return Err(AppError::Internal(anyhow::anyhow!(
                "GCloud token exchange returned {}: {}",
                status,
                text
            )));
        }

        let token_resp: TokenResponse = resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse token response: {}", e))
        })?;

        let cached = CachedToken {
            token: token_resp.access_token.clone(),
            expires_at: std::time::Instant::now()
                + std::time::Duration::from_secs(token_resp.expires_in.saturating_sub(300)),
        };

        let mut cache = self.access_token.write().await;
        *cache = Some(cached);

        Ok(token_resp.access_token)
    }

    /// Build a raw MIME email and base64url-encode it for Gmail API.
    pub(crate) fn build_raw_message(&self, to: &str, subject: &str, html: &str) -> String {
        let boundary = "boundary_hooksniff_email";
        let mime = format!(
            "From: {}\r\n\
             To: {}\r\n\
             Subject: {}\r\n\
             MIME-Version: 1.0\r\n\
             Content-Type: multipart/alternative; boundary=\"{}\"\r\n\
             \r\n\
             --{}\r\n\
             Content-Type: text/html; charset=UTF-8\r\n\
             \r\n\
             {}\r\n\
             --{}--",
            self.from_email, to, subject, boundary, boundary, html, boundary
        );

        base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(mime.as_bytes())
    }

    /// Send an email via the Gmail API with exponential backoff retry.
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
                                || msg.contains("send")
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
                        "Email send attempt {}/{} failed, retrying in {:?}: {}",
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

    /// Single attempt to send an email via the Gmail API.
    async fn send_once(&self, to: &str, subject: &str, html: &str) -> Result<(), AppError> {
        let access_token = self.get_access_token().await?;

        tracing::debug!("Sending email to {} subject={}", to, subject);

        let raw_message = self.build_raw_message(to, subject, html);
        let body = serde_json::json!({ "raw": raw_message });

        let resp = self
            .client
            .post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
            .bearer_auth(&access_token)
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("Gmail API request failed: {:?}", e);
                AppError::Internal(anyhow::anyhow!("Email send failed: {}", e))
            })?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            tracing::error!("Gmail API error: status={}, body={}", status, text);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Gmail API returned {}: {}",
                status,
                text
            )));
        }

        tracing::info!("✅ Email sent to {}: {}", to, subject);
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
        let (subject, html) = tpl_welcome(display_name, lang);
        self.send(to, subject, &html).await
    }

    pub async fn send_verification_email(
        &self,
        to: &str,
        verification_url: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = tpl_verification(verification_url, lang);
        self.send(to, subject, &html).await
    }

    pub async fn send_password_reset_email(
        &self,
        to: &str,
        reset_url: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = tpl_password_reset(reset_url, lang);
        self.send(to, subject, &html).await
    }

    pub async fn send_delivery_failed_email(
        &self,
        to: &str,
        endpoint_name: &str,
        error_details: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = tpl_delivery_failed(endpoint_name, error_details, lang);
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
        let (subject, html) = tpl_invoice(
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

    #[allow(clippy::too_many_arguments)]
    pub async fn send_webhook_success_email(
        &self,
        to: &str,
        endpoint_name: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = tpl_webhook_success(endpoint_name, lang);
        self.send(to, subject, &html).await
    }
}
