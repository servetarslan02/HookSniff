use anyhow::{Context, Result};

#[derive(Debug, Clone)]
pub struct AiConfig {
    pub database_url: String,
    pub check_interval_secs: u64,
    pub risk_threshold_warning: i32,
    pub risk_threshold_critical: i32,
    pub auto_fix_enabled: bool,
    pub defense_enabled: bool,
    pub max_auto_actions_per_hour: i32,
}

impl AiConfig {
    pub fn from_env() -> Result<Self> {
        dotenvy::dotenv().ok();

        Ok(Self {
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| {
                    "postgresql://hookrelay:hookrelay_local@localhost:5432/hookrelay?sslmode=disable".into()
                }),
            check_interval_secs: std::env::var("AI_CHECK_INTERVAL_SECS")
                .unwrap_or_else(|_| "30".into())
                .parse()
                .context("AI_CHECK_INTERVAL_SECS must be a number")?,
            risk_threshold_warning: std::env::var("AI_RISK_THRESHOLD_WARNING")
                .unwrap_or_else(|_| "60".into())
                .parse()
                .context("AI_RISK_THRESHOLD_WARNING must be a number")?,
            risk_threshold_critical: std::env::var("AI_RISK_THRESHOLD_CRITICAL")
                .unwrap_or_else(|_| "80".into())
                .parse()
                .context("AI_RISK_THRESHOLD_CRITICAL must be a number")?,
            auto_fix_enabled: std::env::var("AI_AUTO_FIX_ENABLED")
                .unwrap_or_else(|_| "true".into())
                .parse()
                .context("AI_AUTO_FIX_ENABLED must be true/false")?,
            defense_enabled: std::env::var("AI_DEFENSE_ENABLED")
                .unwrap_or_else(|_| "true".into())
                .parse()
                .context("AI_DEFENSE_ENABLED must be true/false")?,
            max_auto_actions_per_hour: std::env::var("AI_MAX_AUTO_ACTIONS_PER_HOUR")
                .unwrap_or_else(|_| "20".into())
                .parse()
                .context("AI_MAX_AUTO_ACTIONS_PER_HOUR must be a number")?,
        })
    }
}
