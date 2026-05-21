use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;
use thiserror::Error;

// ── Error Codes ───────────────────────────────────────────
// Each code maps to a user-friendly i18n key on the frontend.
// Format: CATEGORY_SPECIFIC_DETAIL

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ErrorCode {
    // Generic
    NotFound,
    Unauthorized,
    Forbidden,
    PayloadTooLarge,
    RateLimitExceeded,
    InternalError,
    DatabaseError,
    InvalidFormat,

    // Auth
    InvalidCredentials,
    AccountDisabled,
    EmailNotVerified,
    TooManyAttempts,
    RequestBlocked,
    PasswordLoginNotSetup,
    PasswordNotSet,
    PasswordRequired,
    PasswordTooShort,
    PasswordTooLong,
    PasswordNeedsUppercase,
    PasswordNeedsLowercase,
    PasswordNeedsDigit,
    WrongPassword,
    EmailInUse,
    EmailUnavailable,
    SameEmail,
    InvalidResetToken,
    InvalidVerificationToken,
    RefreshTokenRequired,

    // 2FA
    TwoFaAlreadyEnabled,
    TwoFaNotEnabled,
    Invalid2faCode,
    CodeExpired,
    TooMany2faAttempts,
    InvalidCodeFormat,

    // SSO
    SsoNotConfigured,
    SsoNotEnabled,
    SsoConfigNotFound,
    SsoInvalidProvider,
    SsoStateExpired,
    SsoSessionExpired,
    SsoCodeRejected,
    SsoIdpUnreachable,
    SsoNoIdToken,
    SsoInvalidIdpResponse,
    SsoTokenMismatch,
    CannotImpersonateSelf,

    // SAML
    SamlMissingUrl,
    SamlMissingCertificate,
    SamlNotSigned,
    SamlMissingSignature,
    SamlMissingSignedInfo,
    SamlSignatureFailed,
    SamlCertMismatch,
    SamlEmailMismatch,
    SamlAssertionExpired,
    SamlInvalidEncoding,
    SamlResponseTooLarge,
    SamlInvalidCertificate,
    SamlCertKeyError,
    SamlInvalidBase64,

    // OIDC
    GoogleOauthNotConfigured,
    GithubOauthNotConfigured,
    OidcTokenExpired,
    OidcAlgorithmNone,
    OidcInvalidTokenFormat,
    OidcInvalidTokenHeader,
    OidcInvalidTokenPayload,
    OidcMissingState,
    OidcMissingCode,

    // Billing
    AlreadyOnPlan,
    CannotRefundFree,
    CouponExpired,
    CouponMaxUsage,
    CouponAlreadyUsed,
    CouponDuplicate,
    NegativePrice,
    InvalidDiscountType,
    InvalidDiscountValue,
    InvalidPercentage,
    InvalidFreeMonths,
    InvalidRefundAmount,
    RefundReasonRequired,
    InvalidPaymentType,
    PolarSyncOnly,
    InvalidCheckoutUrl,
    CsvOnly,

    // Endpoints
    EndpointInactive,
    BatchTooLarge,
    BulkReplayDisabled,
    CustomRetryDisabled,
    NoDeliveryIds,
    EndpointNotFound,
    DeliveryNotFound,

    // Domain
    DomainAlreadyRegistered,
    DomainCannotUse,
    DomainPublicDomain,
    DomainInvalidChars,
    DomainInvalidFormat,

    // Team
    CannotRemoveOwner,
    NotTeamMember,
    TeamNameRequired,
    InvalidRole,

    // Alerts
    InvalidAlertCondition,
    InvalidThreshold,
    InvalidNotificationChannel,
    InvalidNotificationUrl,
    ChannelDisabled,
    TitleRequired,
    SchemaNameRequired,
    TagEmpty,
    TagTooLong,

    // System
    InvalidRateLimit,
    InvalidRetention,
    InvalidRetryAttempts,
    CssTooLarge,
    EmailSubjectRequired,
    EmailBodyRequired,
    DeviceTokenRequired,
    CannotDeleteAdmin,
    InvalidIpAddress,
    InvalidJwt,
    InvalidDateFormat,

    // Conflict
    Conflict,
}

impl ErrorCode {
    /// Return the string code for JSON response.
    pub fn as_str(&self) -> &'static str {
        match self {
            // Generic
            ErrorCode::NotFound => "NOT_FOUND",
            ErrorCode::Unauthorized => "UNAUTHORIZED",
            ErrorCode::Forbidden => "FORBIDDEN",
            ErrorCode::PayloadTooLarge => "PAYLOAD_TOO_LARGE",
            ErrorCode::RateLimitExceeded => "RATE_LIMIT_EXCEEDED",
            ErrorCode::InternalError => "INTERNAL_ERROR",
            ErrorCode::DatabaseError => "DATABASE_ERROR",
            ErrorCode::InvalidFormat => "INVALID_FORMAT",

            // Auth
            ErrorCode::InvalidCredentials => "INVALID_CREDENTIALS",
            ErrorCode::AccountDisabled => "ACCOUNT_DISABLED",
            ErrorCode::EmailNotVerified => "EMAIL_NOT_VERIFIED",
            ErrorCode::TooManyAttempts => "TOO_MANY_ATTEMPTS",
            ErrorCode::RequestBlocked => "REQUEST_BLOCKED",
            ErrorCode::PasswordLoginNotSetup => "PASSWORD_LOGIN_NOT_SETUP",
            ErrorCode::PasswordNotSet => "PASSWORD_NOT_SET",
            ErrorCode::PasswordRequired => "PASSWORD_REQUIRED",
            ErrorCode::PasswordTooShort => "PASSWORD_TOO_SHORT",
            ErrorCode::PasswordTooLong => "PASSWORD_TOO_LONG",
            ErrorCode::PasswordNeedsUppercase => "PASSWORD_NEEDS_UPPERCASE",
            ErrorCode::PasswordNeedsLowercase => "PASSWORD_NEEDS_LOWERCASE",
            ErrorCode::PasswordNeedsDigit => "PASSWORD_NEEDS_DIGIT",
            ErrorCode::WrongPassword => "WRONG_PASSWORD",
            ErrorCode::EmailInUse => "EMAIL_IN_USE",
            ErrorCode::EmailUnavailable => "EMAIL_UNAVAILABLE",
            ErrorCode::SameEmail => "SAME_EMAIL",
            ErrorCode::InvalidResetToken => "INVALID_RESET_TOKEN",
            ErrorCode::InvalidVerificationToken => "INVALID_VERIFICATION_TOKEN",
            ErrorCode::RefreshTokenRequired => "REFRESH_TOKEN_REQUIRED",

            // 2FA
            ErrorCode::TwoFaAlreadyEnabled => "2FA_ALREADY_ENABLED",
            ErrorCode::TwoFaNotEnabled => "2FA_NOT_ENABLED",
            ErrorCode::Invalid2faCode => "INVALID_2FA_CODE",
            ErrorCode::CodeExpired => "CODE_EXPIRED",
            ErrorCode::TooMany2faAttempts => "TOO_MANY_2FA_ATTEMPTS",
            ErrorCode::InvalidCodeFormat => "INVALID_CODE_FORMAT",

            // SSO
            ErrorCode::SsoNotConfigured => "SSO_NOT_CONFIGURED",
            ErrorCode::SsoNotEnabled => "SSO_NOT_ENABLED",
            ErrorCode::SsoConfigNotFound => "SSO_CONFIG_NOT_FOUND",
            ErrorCode::SsoInvalidProvider => "SSO_INVALID_PROVIDER",
            ErrorCode::SsoStateExpired => "SSO_STATE_EXPIRED",
            ErrorCode::SsoSessionExpired => "SSO_SESSION_EXPIRED",
            ErrorCode::SsoCodeRejected => "SSO_CODE_REJECTED",
            ErrorCode::SsoIdpUnreachable => "SSO_IDP_UNREACHABLE",
            ErrorCode::SsoNoIdToken => "SSO_NO_ID_TOKEN",
            ErrorCode::SsoInvalidIdpResponse => "SSO_INVALID_IDP_RESPONSE",
            ErrorCode::SsoTokenMismatch => "SSO_TOKEN_MISMATCH",
            ErrorCode::CannotImpersonateSelf => "CANNOT_IMPERSONATE_SELF",

            // SAML
            ErrorCode::SamlMissingUrl => "SAML_MISSING_URL",
            ErrorCode::SamlMissingCertificate => "SAML_MISSING_CERTIFICATE",
            ErrorCode::SamlNotSigned => "SAML_NOT_SIGNED",
            ErrorCode::SamlMissingSignature => "SAML_MISSING_SIGNATURE",
            ErrorCode::SamlMissingSignedInfo => "SAML_MISSING_SIGNED_INFO",
            ErrorCode::SamlSignatureFailed => "SAML_SIGNATURE_FAILED",
            ErrorCode::SamlCertMismatch => "SAML_CERT_MISMATCH",
            ErrorCode::SamlEmailMismatch => "SAML_EMAIL_MISMATCH",
            ErrorCode::SamlAssertionExpired => "SAML_ASSERTION_EXPIRED",
            ErrorCode::SamlInvalidEncoding => "SAML_INVALID_ENCODING",
            ErrorCode::SamlResponseTooLarge => "SAML_RESPONSE_TOO_LARGE",
            ErrorCode::SamlInvalidCertificate => "SAML_INVALID_CERTIFICATE",
            ErrorCode::SamlCertKeyError => "SAML_CERT_KEY_ERROR",
            ErrorCode::SamlInvalidBase64 => "SAML_INVALID_BASE64",

            // OIDC
            ErrorCode::GoogleOauthNotConfigured => "GOOGLE_OAUTH_NOT_CONFIGURED",
            ErrorCode::GithubOauthNotConfigured => "GITHUB_OAUTH_NOT_CONFIGURED",
            ErrorCode::OidcTokenExpired => "OIDC_TOKEN_EXPIRED",
            ErrorCode::OidcAlgorithmNone => "OIDC_ALGORITHM_NONE",
            ErrorCode::OidcInvalidTokenFormat => "OIDC_INVALID_TOKEN_FORMAT",
            ErrorCode::OidcInvalidTokenHeader => "OIDC_INVALID_TOKEN_HEADER",
            ErrorCode::OidcInvalidTokenPayload => "OIDC_INVALID_TOKEN_PAYLOAD",
            ErrorCode::OidcMissingState => "OIDC_MISSING_STATE",
            ErrorCode::OidcMissingCode => "OIDC_MISSING_CODE",

            // Billing
            ErrorCode::AlreadyOnPlan => "ALREADY_ON_PLAN",
            ErrorCode::CannotRefundFree => "CANNOT_REFUND_FREE",
            ErrorCode::CouponExpired => "COUPON_EXPIRED",
            ErrorCode::CouponMaxUsage => "COUPON_MAX_USAGE",
            ErrorCode::CouponAlreadyUsed => "COUPON_ALREADY_USED",
            ErrorCode::CouponDuplicate => "COUPON_DUPLICATE",
            ErrorCode::NegativePrice => "NEGATIVE_PRICE",
            ErrorCode::InvalidDiscountType => "INVALID_DISCOUNT_TYPE",
            ErrorCode::InvalidDiscountValue => "INVALID_DISCOUNT_VALUE",
            ErrorCode::InvalidPercentage => "INVALID_PERCENTAGE",
            ErrorCode::InvalidFreeMonths => "INVALID_FREE_MONTHS",
            ErrorCode::InvalidRefundAmount => "INVALID_REFUND_AMOUNT",
            ErrorCode::RefundReasonRequired => "REFUND_REASON_REQUIRED",
            ErrorCode::InvalidPaymentType => "INVALID_PAYMENT_TYPE",
            ErrorCode::PolarSyncOnly => "POLAR_SYNC_ONLY",
            ErrorCode::InvalidCheckoutUrl => "INVALID_CHECKOUT_URL",
            ErrorCode::CsvOnly => "CSV_ONLY",

            // Endpoints
            ErrorCode::EndpointInactive => "ENDPOINT_INACTIVE",
            ErrorCode::BatchTooLarge => "BATCH_TOO_LARGE",
            ErrorCode::BulkReplayDisabled => "BULK_REPLAY_DISABLED",
            ErrorCode::CustomRetryDisabled => "CUSTOM_RETRY_DISABLED",
            ErrorCode::NoDeliveryIds => "NO_DELIVERY_IDS",
            ErrorCode::EndpointNotFound => "ENDPOINT_NOT_FOUND",
            ErrorCode::DeliveryNotFound => "DELIVERY_NOT_FOUND",

            // Domain
            ErrorCode::DomainAlreadyRegistered => "DOMAIN_ALREADY_REGISTERED",
            ErrorCode::DomainCannotUse => "DOMAIN_CANNOT_USE",
            ErrorCode::DomainPublicDomain => "DOMAIN_PUBLIC_DOMAIN",
            ErrorCode::DomainInvalidChars => "DOMAIN_INVALID_CHARS",
            ErrorCode::DomainInvalidFormat => "DOMAIN_INVALID_FORMAT",

            // Team
            ErrorCode::CannotRemoveOwner => "CANNOT_REMOVE_OWNER",
            ErrorCode::NotTeamMember => "NOT_TEAM_MEMBER",
            ErrorCode::TeamNameRequired => "TEAM_NAME_REQUIRED",
            ErrorCode::InvalidRole => "INVALID_ROLE",

            // Alerts
            ErrorCode::InvalidAlertCondition => "INVALID_ALERT_CONDITION",
            ErrorCode::InvalidThreshold => "INVALID_THRESHOLD",
            ErrorCode::InvalidNotificationChannel => "INVALID_NOTIFICATION_CHANNEL",
            ErrorCode::InvalidNotificationUrl => "INVALID_NOTIFICATION_URL",
            ErrorCode::ChannelDisabled => "CHANNEL_DISABLED",
            ErrorCode::TitleRequired => "TITLE_REQUIRED",
            ErrorCode::SchemaNameRequired => "SCHEMA_NAME_REQUIRED",
            ErrorCode::TagEmpty => "TAG_EMPTY",
            ErrorCode::TagTooLong => "TAG_TOO_LONG",

            // System
            ErrorCode::InvalidRateLimit => "INVALID_RATE_LIMIT",
            ErrorCode::InvalidRetention => "INVALID_RETENTION",
            ErrorCode::InvalidRetryAttempts => "INVALID_RETRY_ATTEMPTS",
            ErrorCode::CssTooLarge => "CSS_TOO_LARGE",
            ErrorCode::EmailSubjectRequired => "EMAIL_SUBJECT_REQUIRED",
            ErrorCode::EmailBodyRequired => "EMAIL_BODY_REQUIRED",
            ErrorCode::DeviceTokenRequired => "DEVICE_TOKEN_REQUIRED",
            ErrorCode::CannotDeleteAdmin => "CANNOT_DELETE_ADMIN",
            ErrorCode::InvalidIpAddress => "INVALID_IP_ADDRESS",
            ErrorCode::InvalidJwt => "INVALID_JWT",
            ErrorCode::InvalidDateFormat => "INVALID_DATE_FORMAT",

            // Conflict
            ErrorCode::Conflict => "CONFLICT",
        }
    }
}

impl std::fmt::Display for ErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

// ── AppError ──────────────────────────────────────────────

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Not found")]
    NotFound,

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Forbidden")]
    Forbidden,

    #[error("Bad request")]
    Coded(ErrorCode),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Payload too large")]
    PayloadTooLarge,

    #[error("Conflict")]
    Conflict,

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Rate limit exceeded")]
    RateLimitExceeded,

    #[error("Internal error: {0}")]
    Internal(#[from] anyhow::Error),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}

impl AppError {
    /// Create a coded error (preferred over BadRequest(String)).
    pub fn coded(code: ErrorCode) -> Self {
        AppError::Coded(code)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, _message) = match &self {
            AppError::NotFound => (StatusCode::NOT_FOUND, ErrorCode::NotFound.as_str(), ""),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, ErrorCode::Unauthorized.as_str(), ""),
            AppError::Forbidden => (StatusCode::FORBIDDEN, ErrorCode::Forbidden.as_str(), ""),
            AppError::Coded(code) => {
                let status = match code {
                    ErrorCode::NotFound => StatusCode::NOT_FOUND,
                    ErrorCode::Unauthorized => StatusCode::UNAUTHORIZED,
                    ErrorCode::Forbidden => StatusCode::FORBIDDEN,
                    ErrorCode::PayloadTooLarge => StatusCode::PAYLOAD_TOO_LARGE,
                    ErrorCode::RateLimitExceeded => StatusCode::TOO_MANY_REQUESTS,
                    ErrorCode::Conflict => StatusCode::CONFLICT,
                    ErrorCode::EmailNotVerified => StatusCode::FORBIDDEN,
                    ErrorCode::AccountDisabled => StatusCode::FORBIDDEN,
                    ErrorCode::RequestBlocked => StatusCode::FORBIDDEN,
                    ErrorCode::TooManyAttempts => StatusCode::TOO_MANY_REQUESTS,
                    ErrorCode::SsoNotConfigured
                    | ErrorCode::SsoNotEnabled
                    | ErrorCode::SsoConfigNotFound => StatusCode::BAD_REQUEST,
                    _ => StatusCode::BAD_REQUEST,
                };
                (status, code.as_str(), "")
            }
            AppError::BadRequest(_) => (StatusCode::BAD_REQUEST, "BAD_REQUEST", ""),
            AppError::PayloadTooLarge => (StatusCode::PAYLOAD_TOO_LARGE, ErrorCode::PayloadTooLarge.as_str(), ""),
            AppError::Conflict => (StatusCode::CONFLICT, ErrorCode::Conflict.as_str(), ""),
            AppError::Validation(_) => (StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", ""),
            AppError::RateLimitExceeded => (StatusCode::TOO_MANY_REQUESTS, ErrorCode::RateLimitExceeded.as_str(), ""),
            AppError::Internal(e) => {
                tracing::error!("Internal error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, ErrorCode::InternalError.as_str(), "")
            }
            AppError::Database(e) => {
                tracing::error!("Database error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, ErrorCode::DatabaseError.as_str(), "")
            }
            AppError::Serialization(e) => {
                tracing::error!("Serialization error: {:?}", e);
                (StatusCode::BAD_REQUEST, ErrorCode::InvalidFormat.as_str(), "")
            }
        };

        let body = json!({
            "error": {
                "code": code,
            }
        });

        (status, Json(body)).into_response()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::to_bytes;
    use axum::response::IntoResponse;

    async fn extract(resp: axum::response::Response) -> (StatusCode, serde_json::Value) {
        let status = resp.status();
        let body = to_bytes(resp.into_body(), usize::MAX).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        (status, json)
    }

    #[tokio::test]
    async fn test_coded_error() {
        let resp = AppError::coded(ErrorCode::InvalidCredentials).into_response();
        let (status, body) = extract(resp).await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert_eq!(body["error"]["code"], "INVALID_CREDENTIALS");
    }

    #[tokio::test]
    async fn test_not_found() {
        let resp = AppError::NotFound.into_response();
        let (status, body) = extract(resp).await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        assert_eq!(body["error"]["code"], "NOT_FOUND");
    }

    #[tokio::test]
    async fn test_unauthorized() {
        let resp = AppError::Unauthorized.into_response();
        let (status, body) = extract(resp).await;
        assert_eq!(status, StatusCode::UNAUTHORIZED);
        assert_eq!(body["error"]["code"], "UNAUTHORIZED");
    }

    #[tokio::test]
    async fn test_rate_limit() {
        let resp = AppError::RateLimitExceeded.into_response();
        let (status, body) = extract(resp).await;
        assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(body["error"]["code"], "RATE_LIMIT_EXCEEDED");
    }

    #[tokio::test]
    async fn test_internal_no_leak() {
        let resp = AppError::Internal(anyhow::anyhow!("secret detail")).into_response();
        let (status, body) = extract(resp).await;
        assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
        assert_eq!(body["error"]["code"], "INTERNAL_ERROR");
        // Should NOT contain "secret detail"
        assert!(body.to_string().contains("INTERNAL_ERROR"));
    }

    #[test]
    fn test_error_code_display() {
        assert_eq!(ErrorCode::InvalidCredentials.to_string(), "INVALID_CREDENTIALS");
        assert_eq!(ErrorCode::SamlMissingSignature.to_string(), "SAML_MISSING_SIGNATURE");
    }

    #[test]
    fn test_error_code_as_str() {
        assert_eq!(ErrorCode::NotFound.as_str(), "NOT_FOUND");
        assert_eq!(ErrorCode::CouponExpired.as_str(), "COUPON_EXPIRED");
    }
}
