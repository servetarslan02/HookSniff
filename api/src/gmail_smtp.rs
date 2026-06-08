use crate::email::Language;
use crate::error::AppError;
use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};

/// Gmail SMTP email client — sends emails from a personal Gmail account.
///
/// Uses Gmail SMTP (smtp.gmail.com:465) with an App Password.
/// Looks like you're sending emails personally from your Gmail.
///
/// Environment:
///   GMAIL_ADDRESS    — your Gmail address (e.g. user@gmail.com)
///   GMAIL_APP_PASSWORD — 16-char app password from Google Account settings
///
/// Limit: ~500 emails/day for regular Gmail, ~2000 for Google Workspace.
#[derive(Clone)]
pub struct GmailSmtpClient {
    email: String,
    transport: AsyncSmtpTransport<Tokio1Executor>,
}

impl GmailSmtpClient {
    pub fn from_env() -> Option<Self> {
        let email = std::env::var("GMAIL_ADDRESS").ok()?;
        let app_password = std::env::var("GMAIL_APP_PASSWORD").ok()?;

        if email.is_empty() || app_password.is_empty() {
            return None;
        }

        let creds = Credentials::new(email.clone(), app_password);

        let transport = match AsyncSmtpTransport::<Tokio1Executor>::relay("smtp.gmail.com") {
            Ok(t) => t.credentials(creds).build(),
            Err(e) => {
                tracing::error!("Failed to create Gmail SMTP transport: {}", e);
                return None;
            }
        };

        tracing::info!("✅ Gmail SMTP client initialized (from={})", email);

        Some(Self { email, transport })
    }

    /// Send an email via Gmail SMTP with retry.
    async fn send(&self, to: &str, subject: &str, html: &str) -> Result<(), AppError> {
        let max_retries = 2u32;
        let base_delay = std::time::Duration::from_secs(1);

        for attempt in 0..=max_retries {
            let result = self.send_once(to, subject, html).await;

            match &result {
                Ok(_) => return result,
                Err(e) => {
                    if attempt == max_retries {
                        return result;
                    }
                    let delay = base_delay * 2u32.pow(attempt);
                    tracing::warn!(
                        "Gmail SMTP attempt {}/{} failed, retrying in {:?}: {}",
                        attempt + 1,
                        max_retries + 1,
                        delay,
                        e
                    );
                    tokio::time::sleep(delay).await;
                }
            }
        }
        unreachable!()
    }

    /// Single attempt to send via Gmail SMTP.
    async fn send_once(&self, to: &str, subject: &str, html: &str) -> Result<(), AppError> {
        let from = format!("HookSniff <{}>", self.email);
        let email = Message::builder()
            .from(from.parse().map_err(|e| {
                AppError::Internal(anyhow::anyhow!("Invalid from address: {}", e))
            })?)
            .to(to.parse().map_err(|e| {
                AppError::Internal(anyhow::anyhow!("Invalid to address: {}", e))
            })?)
            .subject(subject)
            .header(ContentType::TEXT_HTML)
            .body(html.to_string())
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to build email: {}", e)))?;

        self.transport.send(email).await.map_err(|e| {
            tracing::error!("Gmail SMTP error: {}", e);
            AppError::Internal(anyhow::anyhow!("Gmail SMTP send failed: {}", e))
        })?;

        tracing::info!("✅ Email sent via Gmail SMTP to {}: {}", to, subject);
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
        self.send(to, &subject, &html).await
    }

    pub async fn send_verification_email(
        &self,
        to: &str,
        verification_url: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = super::email::tpl_verification(verification_url, lang);
        self.send(to, &subject, &html).await
    }

    pub async fn send_password_reset_email(
        &self,
        to: &str,
        reset_url: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = super::email::tpl_password_reset(reset_url, lang);
        self.send(to, &subject, &html).await
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
        self.send(to, &subject, &html).await
    }

    pub async fn send_webhook_success_email(
        &self,
        to: &str,
        endpoint_name: &str,
        lang: Language,
    ) -> Result<(), AppError> {
        let (subject, html) = super::email::tpl_webhook_success(endpoint_name, lang);
        self.send(to, &subject, &html).await
    }
}
