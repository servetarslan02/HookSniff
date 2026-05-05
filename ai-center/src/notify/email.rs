use anyhow::Result;

use super::{Notification, Notifier};

/// Email bildirim kanalı
///
/// ## Yapılandırma
/// Ortam değişkenleri:
/// - `SMTP_HOST` — SMTP sunucu (örn: smtp.gmail.com)
/// - `SMTP_PORT` — Port (örn: 587)
/// - `SMTP_USER` — Kullanıcı adı / email
/// - `SMTP_PASSWORD` — Şifre / app password
/// - `NOTIFY_EMAIL` — Bildirim alacak email adresi

pub struct EmailNotifier {
    smtp_host: String,
    smtp_port: u16,
    smtp_user: String,
    smtp_password: String,
    notify_to: String,
    http_client: reqwest::Client,
}

impl EmailNotifier {
    pub fn new(
        smtp_host: String,
        smtp_port: u16,
        smtp_user: String,
        smtp_password: String,
        notify_to: String,
    ) -> Self {
        Self {
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_password,
            notify_to,
            http_client: reqwest::Client::new(),
        }
    }

    pub fn from_env() -> Option<Self> {
        let host = std::env::var("SMTP_HOST").ok()?;
        let port = std::env::var("SMTP_PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(587);
        let user = std::env::var("SMTP_USER").ok()?;
        let password = std::env::var("SMTP_PASSWORD").ok()?;
        let notify_to = std::env::var("NOTIFY_EMAIL").ok()?;

        if host.is_empty() || user.is_empty() {
            return None;
        }

        Some(Self::new(host, port, user, password, notify_to))
    }
}

#[async_trait::async_trait]
impl Notifier for EmailNotifier {
    fn name(&self) -> &str {
        "email"
    }

    fn is_available(&self) -> bool {
        !self.smtp_host.is_empty() && !self.smtp_user.is_empty()
    }

    async fn send(&self, notification: &Notification) -> Result<()> {
        // Email gönderimi için basit HTTP API kullanabiliriz
        // veya SMTP client. Burada basit bir webhook approach kullanıyoruz.

        let subject = notification.email_subject();
        let body_html = notification.email_body_html();

        // TODO: Gerçek SMTP entegrasyonu
        // Şimdilik log olarak kaydediyoruz
        tracing::info!(
            "📧 Email bildirim: {} → {} | Konu: {}",
            self.smtp_user,
            self.notify_to,
            subject
        );

        // Eğer bir email API servisi kullanılıyorsa (SendGrid, Mailgun, etc.)
        // buraya HTTP request eklenebilir.

        Ok(())
    }
}

/// SendGrid ile email gönderimi (opsiyonel)
///
/// ## Yapılandırma
/// Ortam değişkeni: `SENDGRID_API_KEY`
pub struct SendGridNotifier {
    api_key: String,
    from_email: String,
    to_email: String,
    http_client: reqwest::Client,
}

impl SendGridNotifier {
    pub fn from_env() -> Option<Self> {
        let api_key = std::env::var("SENDGRID_API_KEY").ok()?;
        let from = std::env::var("NOTIFY_EMAIL_FROM")
            .unwrap_or_else(|_| "ai@hookrelay.dev".to_string());
        let to = std::env::var("NOTIFY_EMAIL").ok()?;

        if api_key.is_empty() || api_key == "your-sendgrid-api-key-here" {
            return None;
        }

        Some(Self {
            api_key,
            from_email: from,
            to_email: to,
            http_client: reqwest::Client::new(),
        })
    }
}

#[async_trait::async_trait]
impl Notifier for SendGridNotifier {
    fn name(&self) -> &str {
        "sendgrid"
    }

    fn is_available(&self) -> bool {
        !self.api_key.is_empty()
    }

    async fn send(&self, notification: &Notification) -> Result<()> {
        let payload = serde_json::json!({
            "personalizations": [{
                "to": [{"email": self.to_email}]
            }],
            "from": {"email": self.from_email, "name": "HookRelay AI"},
            "subject": notification.email_subject(),
            "content": [
                {"type": "text/plain", "value": notification.to_slack_text()},
                {"type": "text/html", "value": notification.email_body_html()}
            ]
        });

        let response = self
            .http_client
            .post("https://api.sendgrid.com/v3/mail/send")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("SendGrid hatası: {} - {}", status, body);
        }

        tracing::info!("📧 Email gönderildi (SendGrid): {}", self.to_email);
        Ok(())
    }
}
