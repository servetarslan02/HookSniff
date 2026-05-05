pub mod slack;
pub mod email;

use serde::Serialize;

/// Bildirim seviyeleri
#[derive(Debug, Clone, Serialize, PartialEq)]
pub enum NotifyLevel {
    Info,
    Warning,
    Critical,
}

/// Bildirim mesajı
#[derive(Debug, Clone, Serialize)]
pub struct Notification {
    pub level: NotifyLevel,
    pub title: String,
    pub message: String,
    pub source: String,       // "ai_center", "defense", "fix"
    pub action_url: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

impl Notification {
    pub fn info(title: &str, message: &str) -> Self {
        Self {
            level: NotifyLevel::Info,
            title: title.to_string(),
            message: message.to_string(),
            source: "ai_center".to_string(),
            action_url: None,
            metadata: None,
        }
    }

    pub fn warning(title: &str, message: &str) -> Self {
        Self {
            level: NotifyLevel::Warning,
            title: title.to_string(),
            message: message.to_string(),
            source: "ai_center".to_string(),
            action_url: None,
            metadata: None,
        }
    }

    pub fn critical(title: &str, message: &str) -> Self {
        Self {
            level: NotifyLevel::Critical,
            title: title.to_string(),
            message: message.to_string(),
            source: "ai_center".to_string(),
            action_url: None,
            metadata: None,
        }
    }

    pub fn with_action_url(mut self, url: &str) -> Self {
        self.action_url = Some(url.to_string());
        self
    }

    pub fn with_source(mut self, source: &str) -> Self {
        self.source = source.to_string();
        self
    }

    pub fn emoji(&self) -> &str {
        match self.level {
            NotifyLevel::Info => "ℹ️",
            NotifyLevel::Warning => "⚠️",
            NotifyLevel::Critical => "🔴",
        }
    }

    /// Slack formatında mesaj oluştur
    pub fn to_slack_text(&self) -> String {
        let mut text = format!("{} **{}**\n{}", self.emoji(), self.title, self.message);
        if let Some(ref url) = self.action_url {
            text.push_str(&format!("\n<{}| Detaylar → >", url));
        }
        text
    }

    /// Email subject
    pub fn email_subject(&self) -> String {
        format!("[{}] {} - HookRelay AI", self.emoji(), self.title)
    }

    /// Email body (HTML)
    pub fn email_body_html(&self) -> String {
        let color = match self.level {
            NotifyLevel::Info => "#3b82f6",
            NotifyLevel::Warning => "#f59e0b",
            NotifyLevel::Critical => "#ef4444",
        };

        let action_link = self
            .action_url
            .as_ref()
            .map(|url| format!(r#"<a href="{}" style="color: #3b82f6;">Detaylar →</a>"#, url))
            .unwrap_or_default();

        format!(
            r#"
<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <div style="background: {}; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">{} {}</h2>
    </div>
    <div style="background: #f9fafb; padding: 16px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p>{}</p>
        <p style="color: #6b7280; font-size: 12px;">Kaynak: {} | HookRelay AI Merkezi</p>
        {}
    </div>
</div>
"#,
            color,
            self.emoji(),
            self.title,
            self.message,
            self.source,
            action_link
        )
    }
}

/// Bildirim gönderici trait
#[async_trait::async_trait]
pub trait Notifier: Send + Sync {
    fn name(&self) -> &str;
    fn is_available(&self) -> bool;
    async fn send(&self, notification: &Notification) -> anyhow::Result<()>;
}

/// Bildirim yöneticisi — tüm notifikasyonları koordine eder
pub struct NotifyManager {
    notifiers: Vec<Box<dyn Notifier>>,
}

impl NotifyManager {
    pub fn new() -> Self {
        Self {
            notifiers: Vec::new(),
        }
    }

    pub fn add_notifier(&mut self, notifier: Box<dyn Notifier>) {
        tracing::info!("📢 Bildirim kanalı eklendi: {}", notifier.name());
        self.notifiers.push(notifier);
    }

    /// Tüm kanallara bildirim gönder
    pub async fn notify(&self, notification: &Notification) {
        // Sadece warning ve critical bildirimleri gönder
        if notification.level == NotifyLevel::Info {
            tracing::debug!("ℹ️ Info bildirim atlandı: {}", notification.title);
            return;
        }

        for notifier in &self.notifiers {
            if !notifier.is_available() {
                continue;
            }
            match notifier.send(notification).await {
                Ok(_) => {
                    tracing::debug!(
                        "📢 Bildirim gönderildi ({}): {}",
                        notifier.name(),
                        notification.title
                    );
                }
                Err(e) => {
                    tracing::warn!(
                        "⚠️ Bildirim gönderilemedi ({}): {:?}",
                        notifier.name(),
                        e
                    );
                }
            }
        }
    }

    /// Kritik bildirim gönder
    pub async fn alert(&self, title: &str, message: &str) {
        self.notify(&Notification::critical(title, message)).await;
    }

    /// Uyarı bildirimi gönder
    pub async fn warn(&self, title: &str, message: &str) {
        self.notify(&Notification::warning(title, message)).await;
    }
}
