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
        let idempotency_key = options.and_then(|o| o.idempotency_key);
        crate::request::Request::new(http1::Method::POST, "/api/v1/auth/logout")
            .with_optional_header_param("idempotency-key", idempotency_key)
            .execute(self.cfg)
            .await
    }
}
