// this file is @generated
use crate::{error::Result, models::*, Configuration};

#[derive(Default)]
pub struct EndpointListOptions {
    pub limit: Option<i32>,
    pub iterator: Option<String>,
    pub order: Option<Ordering>,
}

#[derive(Default)]
pub struct EndpointCreateOptions {
    pub idempotency_key: Option<String>,
}

#[derive(Default)]
pub struct EndpointRotateSecretOptions {
    pub idempotency_key: Option<String>,
}

#[derive(Default)]
pub struct EndpointSendExampleOptions {
    pub idempotency_key: Option<String>,
}

pub struct Endpoint<'a> {
    cfg: &'a Configuration,
}

impl<'a> Endpoint<'a> {
    pub(super) fn new(cfg: &'a Configuration) -> Self {
        Self { cfg }
    }

    pub async fn list(
        &self,
        app_id: String,
        options: Option<EndpointListOptions>,
    ) -> Result<ListResponseEndpointOut> {
        let EndpointListOptions { limit, iterator, order } = options.unwrap_or_default();
        crate::request::Request::new(http1::Method::GET, "/api/v1/app/{app_id}/endpoint")
            .with_path_param("app_id", app_id)
            .with_optional_query_param("limit", limit)
            .with_optional_query_param("iterator", iterator)
            .with_optional_query_param("order", order)
            .execute(self.cfg)
            .await
    }

    pub async fn create(
        &self,
        app_id: String,
        endpoint_in: EndpointIn,
        options: Option<EndpointCreateOptions>,
    ) -> Result<EndpointOut> {
        let EndpointCreateOptions { idempotency_key } = options.unwrap_or_default();
        crate::request::Request::new(http1::Method::POST, "/api/v1/app/{app_id}/endpoint")
            .with_path_param("app_id", app_id)
            .with_optional_header_param("idempotency-key", idempotency_key)
            .with_body_param(endpoint_in)
            .execute(self.cfg)
            .await
    }

    pub async fn get(&self, app_id: String, endpoint_id: String) -> Result<EndpointOut> {
        crate::request::Request::new(http1::Method::GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}")
            .with_path_param("app_id", app_id)
            .with_path_param("endpoint_id", endpoint_id)
            .execute(self.cfg)
            .await
    }

    pub async fn update(
        &self,
        app_id: String,
        endpoint_id: String,
        endpoint_update: EndpointUpdate,
    ) -> Result<EndpointOut> {
        crate::request::Request::new(http1::Method::PUT, "/api/v1/app/{app_id}/endpoint/{endpoint_id}")
            .with_path_param("app_id", app_id)
            .with_path_param("endpoint_id", endpoint_id)
            .with_body_param(endpoint_update)
            .execute(self.cfg)
            .await
    }

    pub async fn delete(&self, app_id: String, endpoint_id: String) -> Result<()> {
        crate::request::Request::new(http1::Method::DELETE, "/api/v1/app/{app_id}/endpoint/{endpoint_id}")
            .with_path_param("app_id", app_id)
            .with_path_param("endpoint_id", endpoint_id)
            .returns_nothing()
            .execute(self.cfg)
            .await
    }

    pub async fn patch(
        &self,
        app_id: String,
        endpoint_id: String,
        endpoint_patch: EndpointPatch,
    ) -> Result<EndpointOut> {
        crate::request::Request::new(http1::Method::PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}")
            .with_path_param("app_id", app_id)
            .with_path_param("endpoint_id", endpoint_id)
            .with_body_param(endpoint_patch)
            .execute(self.cfg)
            .await
    }

    pub async fn get_headers(&self, app_id: String, endpoint_id: String) -> Result<EndpointHeadersOut> {
        crate::request::Request::new(http1::Method::GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers")
            .with_path_param("app_id", app_id)
            .with_path_param("endpoint_id", endpoint_id)
            .execute(self.cfg)
            .await
    }

    pub async fn update_headers(
        &self,
        app_id: String,
        endpoint_id: String,
        endpoint_headers_in: EndpointHeadersIn,
    ) -> Result<()> {
        crate::request::Request::new(http1::Method::PUT, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers")
            .with_path_param("app_id", app_id)
            .with_path_param("endpoint_id", endpoint_id)
            .with_body_param(endpoint_headers_in)
            .returns_nothing()
            .execute(self.cfg)
            .await
    }

    pub async fn patch_headers(
        &self,
        app_id: String,
        endpoint_id: String,
        endpoint_headers_patch_in: EndpointHeadersPatchIn,
    ) -> Result<()> {
        crate::request::Request::new(http1::Method::PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers")
            .with_path_param("app_id", app_id)
            .with_path_param("endpoint_id", endpoint_id)
            .with_body_param(endpoint_headers_patch_in)
            .returns_nothing()
            .execute(self.cfg)
            .await
    }

    pub async fn get_secret(&self, app_id: String, endpoint_id: String) -> Result<EndpointSecretOut> {
        crate::request::Request::new(http1::Method::GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret")
            .with_path_param("app_id", app_id)
            .with_path_param("endpoint_id", endpoint_id)
            .execute(self.cfg)
            .await
    }

    pub async fn rotate_secret(
        &self,
        app_id: String,
        endpoint_id: String,
        endpoint_secret_rotate_in: EndpointSecretRotateIn,
        options: Option<EndpointRotateSecretOptions>,
    ) -> Result<()> {
        let EndpointRotateSecretOptions { idempotency_key } = options.unwrap_or_default();
        crate::request::Request::new(http1::Method::POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret/rotate")
            .with_path_param("app_id", app_id)
            .with_path_param("endpoint_id", endpoint_id)
            .with_optional_header_param("idempotency-key", idempotency_key)
            .with_body_param(endpoint_secret_rotate_in)
            .returns_nothing()
            .execute(self.cfg)
            .await
    }

    pub async fn send_example(
        &self,
        app_id: String,
        endpoint_id: String,
        event_example_in: EventExampleIn,
        options: Option<EndpointSendExampleOptions>,
    ) -> Result<MessageOut> {
        let EndpointSendExampleOptions { idempotency_key } = options.unwrap_or_default();
        crate::request::Request::new(http1::Method::POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/send-example")
            .with_path_param("app_id", app_id)
            .with_path_param("endpoint_id", endpoint_id)
            .with_optional_header_param("idempotency-key", idempotency_key)
            .with_body_param(event_example_in)
            .execute(self.cfg)
            .await
    }
}
