// SPDX-FileCopyrightText: © 2022 HookSniff Authors
// SPDX-License-Identifier: MIT

use std::fmt;

use http_body_util::BodyExt;
use hyper::body::Incoming;

use crate::http1_to_02_status_code;

pub type Result<T> = std::result::Result<T, Error>;

/// The error type returned from the HookSniff API
#[derive(Debug, Clone)]
pub enum Error {
    /// A generic error
    Generic(String),
    /// Http Error
    Http(HttpErrorContent<crate::models::HttpErrorOut>),
    /// Http Validation Error
    Validation(HttpErrorContent<crate::models::HttpValidationError>),
    /// 400 Bad Request
    BadRequest(HttpErrorContent<crate::models::HttpErrorOut>),
    /// 401 Unauthorized
    Unauthorized(HttpErrorContent<crate::models::HttpErrorOut>),
    /// 403 Forbidden
    Forbidden(HttpErrorContent<crate::models::HttpErrorOut>),
    /// 404 Not Found
    NotFound(HttpErrorContent<crate::models::HttpErrorOut>),
    /// 409 Conflict
    Conflict(HttpErrorContent<crate::models::HttpErrorOut>),
    /// 429 Rate Limited
    RateLimited {
        content: HttpErrorContent<crate::models::HttpErrorOut>,
        retry_after: Option<u64>,
    },
    /// 500 Internal Server Error
    InternalServerError(HttpErrorContent<crate::models::HttpErrorOut>),
    /// 502 Bad Gateway
    BadGateway(HttpErrorContent<crate::models::HttpErrorOut>),
    /// 503 Service Unavailable
    ServiceUnavailable(HttpErrorContent<crate::models::HttpErrorOut>),
    /// 504 Gateway Timeout
    GatewayTimeout(HttpErrorContent<crate::models::HttpErrorOut>),
}

impl Error {
    pub(crate) fn generic(err: impl std::error::Error) -> Self {
        Self::Generic(format!("{err:?}"))
    }

    pub(crate) async fn from_response(status_code: http1::StatusCode, body: Incoming) -> Self {
        match body.collect().await {
            Ok(collected) => {
                let bytes = collected.to_bytes();
                if status_code == http1::StatusCode::UNPROCESSABLE_ENTITY {
                    Self::Validation(HttpErrorContent {
                        status: http02::StatusCode::UNPROCESSABLE_ENTITY,
                        payload: serde_json::from_slice(&bytes).ok(),
                    })
                } else {
                    let content = HttpErrorContent {
                        status: http1_to_02_status_code(status_code),
                        payload: serde_json::from_slice(&bytes).ok(),
                    };
                    match status_code.as_u16() {
                        400 => Self::BadRequest(content),
                        401 => Self::Unauthorized(content),
                        403 => Self::Forbidden(content),
                        404 => Self::NotFound(content),
                        409 => Self::Conflict(content),
                        500 => Self::InternalServerError(content),
                        502 => Self::BadGateway(content),
                        503 => Self::ServiceUnavailable(content),
                        504 => Self::GatewayTimeout(content),
                        _ => Error::Http(content),
                    }
                }
            }
            Err(e) => Self::Generic(e.to_string()),
        }
    }

    /// Returns true if this error is a rate limit error (429).
    pub fn is_rate_limit(&self) -> bool {
        matches!(self, Error::RateLimited { .. })
    }

    /// Returns true if this error is a server error (5xx).
    pub fn is_server_error(&self) -> bool {
        matches!(
            self,
            Error::InternalServerError(_)
                | Error::BadGateway(_)
                | Error::ServiceUnavailable(_)
                | Error::GatewayTimeout(_)
        )
    }

    /// Returns true if this error is a client error (4xx).
    pub fn is_client_error(&self) -> bool {
        matches!(
            self,
            Error::BadRequest(_)
                | Error::Unauthorized(_)
                | Error::Forbidden(_)
                | Error::NotFound(_)
                | Error::Conflict(_)
                | Error::Validation(_)
                | Error::RateLimited { .. }
        )
    }
}

// TODO: Remove for v2.0 of the library (very uncommon impl for an error type)
impl From<Error> for String {
    fn from(err: Error) -> Self {
        err.to_string()
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Error::Generic(s) => s.fmt(f),
            Error::Http(e) => format!("Http error (status={}) {:?}", e.status, e.payload).fmt(f),
            Error::Validation(e) => format!("Validation error {:?}", e.payload).fmt(f),
            Error::BadRequest(e) => format!("Bad request (status=400) {:?}", e.payload).fmt(f),
            Error::Unauthorized(e) => format!("Unauthorized (status=401) {:?}", e.payload).fmt(f),
            Error::Forbidden(e) => format!("Forbidden (status=403) {:?}", e.payload).fmt(f),
            Error::NotFound(e) => format!("Not found (status=404) {:?}", e.payload).fmt(f),
            Error::Conflict(e) => format!("Conflict (status=409) {:?}", e.payload).fmt(f),
            Error::RateLimited { content, retry_after } => {
                format!("Rate limited (status=429, retry_after={:?}) {:?}", retry_after, content.payload).fmt(f)
            }
            Error::InternalServerError(e) => format!("Internal server error (status=500) {:?}", e.payload).fmt(f),
            Error::BadGateway(e) => format!("Bad gateway (status=502) {:?}", e.payload).fmt(f),
            Error::ServiceUnavailable(e) => format!("Service unavailable (status=503) {:?}", e.payload).fmt(f),
            Error::GatewayTimeout(e) => format!("Gateway timeout (status=504) {:?}", e.payload).fmt(f),
        }
    }
}

impl std::error::Error for Error {}

#[derive(Debug, Clone)]
pub struct HttpErrorContent<T> {
    pub status: http02::StatusCode,
    pub payload: Option<T>,
}
