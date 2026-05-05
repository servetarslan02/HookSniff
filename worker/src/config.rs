use anyhow::Result;

#[derive(Debug, Clone)]
pub struct WorkerConfig {
    pub database_url: String,
    pub max_attempts: i32,
}

impl WorkerConfig {
    pub fn from_env() -> Result<Self> {
        dotenvy::dotenv().ok();

        Ok(Self {
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| {
                    "postgresql://hookrelay:hookrelay_local@localhost:5432/hookrelay?sslmode=disable".into()
                }),
            max_attempts: std::env::var("MAX_ATTEMPTS")
                .unwrap_or_else(|_| "3".into())
                .parse()?,
        })
    }
}
