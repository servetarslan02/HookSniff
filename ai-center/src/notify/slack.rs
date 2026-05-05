use anyhow::Result;
use serde::Serialize;

use super::{Notification, NotifyLevel, Notifier};

/// Slack webhook bildirim kanalı
///
/// ## Yapılandırma
/// Ortam değişkeni: `SLACK_WEBHOOK_URL`
/// Slack → Apps → Incoming Webhooks → Webhook URL kopyala

pub struct SlackNotifier {
    webhook_url: String,
    http_client: reqwest::Client,
}

#[derive(Serialize)]
struct SlackMessage {
    text: String,
    blocks: Option<Vec<serde_json::Value>>,
}

impl SlackNotifier {
    pub fn new(webhook_url: String) -> Self {
        Self {
            webhook_url,
            http_client: reqwest::Client::new(),
        }
    }

    pub fn from_env() -> Option<Self> {
        std::env::var("SLACK_WEBHOOK_URL")
            .ok()
            .filter(|u| !u.is_empty() && u != "your-slack-webhook-url-here")
            .map(Self::new)
    }

    fn build_blocks(&self, notification: &Notification) -> Vec<serde_json::Value> {
        let color = match notification.level {
            NotifyLevel::Info => "#3b82f6",
            NotifyLevel::Warning => "#f59e0b",
            NotifyLevel::Critical => "#ef4444",
        };

        let mut blocks = vec![
            serde_json::json!({
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": format!("{} {}", notification.emoji(), notification.title),
                    "emoji": true
                }
            }),
            serde_json::json!({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": notification.message
                }
            }),
            serde_json::json!({
                "type": "context",
                "elements": [{
                    "type": "mrkdwn",
                    "text": format!("Kaynak: {} | HookRelay AI Merkezi", notification.source)
                }]
            }),
        ];

        if let Some(ref url) = notification.action_url {
            blocks.push(serde_json::json!({
                "type": "actions",
                "elements": [{
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Detaylar →"
                    },
                    "url": url,
                    "style": if notification.level == NotifyLevel::Critical { "danger" } else { "primary" }
                }]
            }));
        }

        blocks
    }
}

#[async_trait::async_trait]
impl Notifier for SlackNotifier {
    fn name(&self) -> &str {
        "slack"
    }

    fn is_available(&self) -> bool {
        !self.webhook_url.is_empty()
    }

    async fn send(&self, notification: &Notification) -> Result<()> {
        let message = SlackMessage {
            text: notification.to_slack_text(),
            blocks: Some(self.build_blocks(notification)),
        };

        let response = self
            .http_client
            .post(&self.webhook_url)
            .json(&message)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("Slack webhook hatası: {} - {}", status, body);
        }

        Ok(())
    }
}
