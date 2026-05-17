// this file is @generated
use crate::{error::Result, Configuration};

#[derive(Default)]
pub struct AuthenticationLogoutOptions {
    pub idempotency_key: Option<String>,
}

pub struct Authentication<'a> {
    cfg: &'a Configuration,
}

impl<'a> Authentication<'a> {
    pub fn new(cfg: &'a Configuration) -> Self {
        Self { cfg }
    }

    /// Logout the current auth token.
    pub async fn logout(&self, options: Option<AuthenticationLogoutOptions>) -> Result<()> {
        let mut req = crate::request::Request::new(http1::Method::POST, "/api/v1/auth/logout");
        if let Some(opts) = options {
            if let Some(key) = opts.idempotency_key {
                req = req.header("idempotency-key", &key);
            }
        }
        req.execute(self.cfg).await?;
        Ok(())
    }
}
