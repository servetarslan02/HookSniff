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

    // Email
    EmailProviderNotConfigured,
    EmailSendFailed,

    // Webhook
    InvalidWebhookSignature,
    WebhookSignatureExpired,

    // Validation
    EndpointIdRequired,
    InvalidUserId,
    InvalidEmail,
    InvalidPassword,
    MissingField,

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

            // Email
            ErrorCode::EmailProviderNotConfigured => "EMAIL_PROVIDER_NOT_CONFIGURED",
            ErrorCode::EmailSendFailed => "EMAIL_SEND_FAILED",

            // Webhook
            ErrorCode::InvalidWebhookSignature => "INVALID_WEBHOOK_SIGNATURE",
            ErrorCode::WebhookSignatureExpired => "WEBHOOK_SIGNATURE_EXPIRED",

            // Validation
            ErrorCode::EndpointIdRequired => "ENDPOINT_ID_REQUIRED",
            ErrorCode::InvalidUserId => "INVALID_USER_ID",
            ErrorCode::InvalidEmail => "INVALID_EMAIL",
            ErrorCode::InvalidPassword => "INVALID_PASSWORD",
            ErrorCode::MissingField => "MISSING_FIELD",

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

impl ErrorCode {
    /// Human-readable error message (English — primary language).
    pub fn message(&self) -> &'static str {
        match self {
            // Generic
            ErrorCode::NotFound => "The requested resource was not found.",
            ErrorCode::Unauthorized => "You need to sign in to access this resource.",
            ErrorCode::Forbidden => "You don't have permission to perform this action.",
            ErrorCode::PayloadTooLarge => "The request body is too large. Please reduce the payload size.",
            ErrorCode::RateLimitExceeded => "Too many requests. Please slow down and try again shortly.",
            ErrorCode::InternalError => "Something went wrong on our end. Please try again later.",
            ErrorCode::DatabaseError => "A database error occurred. Please try again later.",
            ErrorCode::InvalidFormat => "The request format is invalid. Please check your input.",

            // Auth
            ErrorCode::InvalidCredentials => "The email or password you entered is incorrect.",
            ErrorCode::AccountDisabled => "Your account has been disabled. Please contact support.",
            ErrorCode::EmailNotVerified => "Please verify your email address before signing in.",
            ErrorCode::TooManyAttempts => "Too many failed attempts. Please wait a few minutes and try again.",
            ErrorCode::RequestBlocked => "This request has been blocked for security reasons.",
            ErrorCode::PasswordLoginNotSetup => "Password login is not enabled for this account. Use SSO or OAuth to sign in.",
            ErrorCode::PasswordNotSet => "You haven't set a password yet. Please set one in your account settings.",
            ErrorCode::PasswordRequired => "Please enter your password.",
            ErrorCode::PasswordTooShort => "Password must be at least 8 characters long.",
            ErrorCode::PasswordTooLong => "Password must be no longer than 128 characters.",
            ErrorCode::PasswordNeedsUppercase => "Password must contain at least one uppercase letter.",
            ErrorCode::PasswordNeedsLowercase => "Password must contain at least one lowercase letter.",
            ErrorCode::PasswordNeedsDigit => "Password must contain at least one number.",
            ErrorCode::WrongPassword => "The password you entered is incorrect.",
            ErrorCode::EmailInUse => "This email address is already registered. Try signing in instead.",
            ErrorCode::EmailUnavailable => "This email address is not available.",
            ErrorCode::SameEmail => "The new email is the same as your current one.",
            ErrorCode::InvalidResetToken => "The password reset link is invalid or has expired. Please request a new one.",
            ErrorCode::InvalidVerificationToken => "The verification link is invalid or has expired.",
            ErrorCode::RefreshTokenRequired => "A valid refresh token is required. Please sign in again.",

            // 2FA
            ErrorCode::TwoFaAlreadyEnabled => "Two-factor authentication is already enabled on your account.",
            ErrorCode::TwoFaNotEnabled => "Two-factor authentication is not enabled on your account.",
            ErrorCode::Invalid2faCode => "The 2FA code is incorrect. Please check your authenticator app and try again.",
            ErrorCode::CodeExpired => "The code has expired. Please request a new one.",
            ErrorCode::TooMany2faAttempts => "Too many incorrect 2FA attempts. Please wait and try again.",
            ErrorCode::InvalidCodeFormat => "The code format is invalid. Please enter a 6-digit code.",

            // SSO
            ErrorCode::SsoNotConfigured => "SSO is not configured for your organization.",
            ErrorCode::SsoNotEnabled => "SSO is not enabled for your organization.",
            ErrorCode::SsoConfigNotFound => "SSO configuration not found. Please check your SSO settings.",
            ErrorCode::SsoInvalidProvider => "The SSO provider is not supported.",
            ErrorCode::SsoStateExpired => "The SSO login session has expired. Please try signing in again.",
            ErrorCode::SsoSessionExpired => "Your SSO session has expired. Please sign in again.",
            ErrorCode::SsoCodeRejected => "The SSO authorization code was rejected. Please try again.",
            ErrorCode::SsoIdpUnreachable => "Unable to reach the identity provider. Please try again later.",
            ErrorCode::SsoNoIdToken => "The identity provider did not return an ID token.",
            ErrorCode::SsoInvalidIdpResponse => "Received an invalid response from the identity provider.",
            ErrorCode::SsoTokenMismatch => "The SSO token does not match. Please try signing in again.",
            ErrorCode::CannotImpersonateSelf => "You cannot impersonate yourself.",

            // SAML
            ErrorCode::SamlMissingUrl => "SAML metadata URL is missing. Please provide the IdP metadata URL.",
            ErrorCode::SamlMissingCertificate => "SAML certificate is missing. Please upload your IdP certificate.",
            ErrorCode::SamlNotSigned => "The SAML response is not signed. Please check your IdP configuration.",
            ErrorCode::SamlMissingSignature => "The SAML response is missing a signature.",
            ErrorCode::SamlMissingSignedInfo => "The SAML response is missing signed info.",
            ErrorCode::SamlSignatureFailed => "SAML signature verification failed.",
            ErrorCode::SamlCertMismatch => "The SAML certificate does not match the configured one.",
            ErrorCode::SamlEmailMismatch => "The email in the SAML response does not match any user.",
            ErrorCode::SamlAssertionExpired => "The SAML assertion has expired. Please try again.",
            ErrorCode::SamlInvalidEncoding => "The SAML response has an invalid encoding.",
            ErrorCode::SamlResponseTooLarge => "The SAML response is too large.",
            ErrorCode::SamlInvalidCertificate => "The SAML certificate is invalid.",
            ErrorCode::SamlCertKeyError => "There is an error with the SAML certificate key.",
            ErrorCode::SamlInvalidBase64 => "The SAML response contains invalid Base64 data.",

            // OIDC
            ErrorCode::GoogleOauthNotConfigured => "Google OAuth is not configured. Please contact support.",
            ErrorCode::GithubOauthNotConfigured => "GitHub OAuth is not configured. Please contact support.",
            ErrorCode::OidcTokenExpired => "Your session has expired. Please sign in again.",
            ErrorCode::OidcAlgorithmNone => "Token algorithm 'none' is not allowed.",
            ErrorCode::OidcInvalidTokenFormat => "The token format is invalid. Please sign in again.",
            ErrorCode::OidcInvalidTokenHeader => "The token header is invalid. Please sign in again.",
            ErrorCode::OidcInvalidTokenPayload => "The token payload is invalid. Please sign in again.",
            ErrorCode::OidcMissingState => "The OAuth state parameter is missing. Please try again.",
            ErrorCode::OidcMissingCode => "The OAuth authorization code is missing. Please try again.",

            // Billing
            ErrorCode::AlreadyOnPlan => "You are already on this plan.",
            ErrorCode::CannotRefundFree => "Cannot issue a refund for the free plan.",
            ErrorCode::CouponExpired => "This coupon has expired.",
            ErrorCode::CouponMaxUsage => "This coupon has reached its maximum usage limit.",
            ErrorCode::CouponAlreadyUsed => "You have already used this coupon.",
            ErrorCode::CouponDuplicate => "A coupon with this code already exists.",
            ErrorCode::NegativePrice => "Price cannot be negative.",
            ErrorCode::InvalidDiscountType => "The discount type is invalid.",
            ErrorCode::InvalidDiscountValue => "The discount value is invalid.",
            ErrorCode::InvalidPercentage => "The percentage value must be between 0 and 100.",
            ErrorCode::InvalidFreeMonths => "The number of free months is invalid.",
            ErrorCode::InvalidRefundAmount => "The refund amount is invalid.",
            ErrorCode::RefundReasonRequired => "Please provide a reason for the refund.",
            ErrorCode::InvalidPaymentType => "The payment type is not supported.",
            ErrorCode::PolarSyncOnly => "This operation is only available through Polar sync.",
            ErrorCode::InvalidCheckoutUrl => "The checkout URL is invalid.",
            ErrorCode::CsvOnly => "Only CSV files are supported for this operation.",

            // Endpoints
            ErrorCode::EndpointInactive => "This endpoint is currently inactive.",
            ErrorCode::BatchTooLarge => "The batch size exceeds the maximum allowed limit.",
            ErrorCode::BulkReplayDisabled => "Bulk replay is not available on your current plan.",
            ErrorCode::CustomRetryDisabled => "Custom retry settings are not available on your current plan.",
            ErrorCode::NoDeliveryIds => "Please provide at least one delivery ID.",
            ErrorCode::EndpointNotFound => "The endpoint was not found.",
            ErrorCode::DeliveryNotFound => "The delivery was not found.",

            // Domain
            ErrorCode::DomainAlreadyRegistered => "This domain is already registered.",
            ErrorCode::DomainCannotUse => "You cannot use this domain.",
            ErrorCode::DomainPublicDomain => "Public domains cannot be used. Please use a custom domain.",
            ErrorCode::DomainInvalidChars => "The domain contains invalid characters.",
            ErrorCode::DomainInvalidFormat => "The domain format is invalid. Example: example.com",

            // Team
            ErrorCode::CannotRemoveOwner => "The team owner cannot be removed.",
            ErrorCode::NotTeamMember => "You are not a member of this team.",
            ErrorCode::TeamNameRequired => "Please provide a team name.",
            ErrorCode::InvalidRole => "The specified role is not valid.",

            // Alerts
            ErrorCode::InvalidAlertCondition => "The alert condition is invalid.",
            ErrorCode::InvalidThreshold => "The alert threshold value is invalid.",
            ErrorCode::InvalidNotificationChannel => "The notification channel is not supported.",
            ErrorCode::InvalidNotificationUrl => "The notification URL is invalid.",
            ErrorCode::ChannelDisabled => "This notification channel is currently disabled.",
            ErrorCode::TitleRequired => "Please provide a title.",
            ErrorCode::SchemaNameRequired => "Please provide a schema name.",
            ErrorCode::TagEmpty => "Tags cannot be empty.",
            ErrorCode::TagTooLong => "The tag is too long. Maximum 64 characters allowed.",

            // System
            ErrorCode::InvalidRateLimit => "The rate limit value is invalid.",
            ErrorCode::InvalidRetention => "The retention period is invalid.",
            ErrorCode::InvalidRetryAttempts => "The number of retry attempts is invalid.",
            ErrorCode::CssTooLarge => "The custom CSS is too large.",
            ErrorCode::EmailSubjectRequired => "Please provide an email subject.",
            ErrorCode::EmailBodyRequired => "Please provide an email body.",
            ErrorCode::DeviceTokenRequired => "A device token is required.",
            ErrorCode::CannotDeleteAdmin => "Admin accounts cannot be deleted.",
            ErrorCode::InvalidIpAddress => "The IP address format is invalid.",
            ErrorCode::InvalidJwt => "Your session token is invalid. Please sign in again.",
            ErrorCode::InvalidDateFormat => "The date format is invalid. Use YYYY-MM-DD.",

            // Email
            ErrorCode::EmailProviderNotConfigured => "Email sending is not configured. Please contact support.",
            ErrorCode::EmailSendFailed => "Failed to send the email. Please try again later.",

            // Webhook
            ErrorCode::InvalidWebhookSignature => "The webhook signature is invalid.",
            ErrorCode::WebhookSignatureExpired => "The webhook signature has expired.",

            // Validation
            ErrorCode::EndpointIdRequired => "Please provide an endpoint ID.",
            ErrorCode::InvalidUserId => "The user ID is invalid.",
            ErrorCode::InvalidEmail => "Please enter a valid email address.",
            ErrorCode::InvalidPassword => "The password does not meet the requirements.",
            ErrorCode::MissingField => "A required field is missing from the request.",

            // Conflict
            ErrorCode::Conflict => "This action conflicts with the current state. Please refresh and try again.",
        }
    }

    /// Turkish error message (secondary language).
    pub fn message_tr(&self) -> &'static str {
        match self {
            // Generic
            ErrorCode::NotFound => "İstenen kaynak bulunamadı.",
            ErrorCode::Unauthorized => "Bu kaynağa erişmek için giriş yapmanız gerekiyor.",
            ErrorCode::Forbidden => "Bu işlemi yapmaya yetkiniz yok.",
            ErrorCode::PayloadTooLarge => "İstek boyutu çok büyük. Lütfen veri boyutunu azaltın.",
            ErrorCode::RateLimitExceeded => "Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.",
            ErrorCode::InternalError => "Sunucu tarafında bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
            ErrorCode::DatabaseError => "Veritabanı hatası oluştu. Lütfen daha sonra tekrar deneyin.",
            ErrorCode::InvalidFormat => "İstek biçimi geçersiz. Lütfen girdinizi kontrol edin.",

            // Auth
            ErrorCode::InvalidCredentials => "Girdiğiniz e-posta veya şifre hatalı.",
            ErrorCode::AccountDisabled => "Hesabınız devre dışı bırakılmış. Lütfen destek ekibiyle iletişime geçin.",
            ErrorCode::EmailNotVerified => "Giriş yapmadan önce e-posta adresinizi doğrulamanız gerekiyor.",
            ErrorCode::TooManyAttempts => "Çok fazla başarısız deneme. Lütfen birkaç dakika bekleyip tekrar deneyin.",
            ErrorCode::RequestBlocked => "Bu istek güvenlik nedeniyle engellendi.",
            ErrorCode::PasswordLoginNotSetup => "Bu hesap için şifre girişi etkin değil. SSO veya OAuth ile giriş yapın.",
            ErrorCode::PasswordNotSet => "Henüz bir şifre belirlemediniz. Lütfen hesap ayarlarınızdan bir şifre belirleyin.",
            ErrorCode::PasswordRequired => "Lütfen şifrenizi girin.",
            ErrorCode::PasswordTooShort => "Şifre en az 8 karakter uzunluğunda olmalıdır.",
            ErrorCode::PasswordTooLong => "Şifre en fazla 128 karakter olabilir.",
            ErrorCode::PasswordNeedsUppercase => "Şifre en az bir büyük harf içermelidir.",
            ErrorCode::PasswordNeedsLowercase => "Şifre en az bir küçük harf içermelidir.",
            ErrorCode::PasswordNeedsDigit => "Şifre en az bir rakam içermelidir.",
            ErrorCode::WrongPassword => "Girdiğiniz şifre hatalı.",
            ErrorCode::EmailInUse => "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.",
            ErrorCode::EmailUnavailable => "Bu e-posta adresi kullanılamıyor.",
            ErrorCode::SameEmail => "Yeni e-posta adresiniz mevcut adresinizle aynı.",
            ErrorCode::InvalidResetToken => "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir tane isteyin.",
            ErrorCode::InvalidVerificationToken => "Doğrulama bağlantısı geçersiz veya süresi dolmuş.",
            ErrorCode::RefreshTokenRequired => "Geçerli bir yenileme token'ı gerekiyor. Lütfen tekrar giriş yapın.",

            // 2FA
            ErrorCode::TwoFaAlreadyEnabled => "İki faktörlü doğrulama zaten etkin.",
            ErrorCode::TwoFaNotEnabled => "İki faktörlü doğrulama etkin değil.",
            ErrorCode::Invalid2faCode => "2FA kodu hatalı. Lütfen doğrulayıcı uygulamanızı kontrol edin.",
            ErrorCode::CodeExpired => "Kodun süresi dolmuş. Lütfen yeni bir kod isteyin.",
            ErrorCode::TooMany2faAttempts => "Çok fazla hatalı 2FA denemesi. Lütfen bekleyip tekrar deneyin.",
            ErrorCode::InvalidCodeFormat => "Kod biçimi geçersiz. Lütfen 6 haneli bir kod girin.",

            // SSO
            ErrorCode::SsoNotConfigured => "Organizasyonunuz için SSO yapılandırılmamış.",
            ErrorCode::SsoNotEnabled => "Organizasyonunuz için SSO etkin değil.",
            ErrorCode::SsoConfigNotFound => "SSO yapılandırması bulunamadı. Lütfen SSO ayarlarınızı kontrol edin.",
            ErrorCode::SsoInvalidProvider => "SSO sağlayıcısı desteklenmiyor.",
            ErrorCode::SsoStateExpired => "SSO oturumu süresi dolmuş. Lütfen tekrar giriş yapın.",
            ErrorCode::SsoSessionExpired => "SSO oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.",
            ErrorCode::SsoCodeRejected => "SSO yetkilendirme kodu reddedildi. Lütfen tekrar deneyin.",
            ErrorCode::SsoIdpUnreachable => "Kimlik sağlayıcısına ulaşılamıyor. Lütfen daha sonra tekrar deneyin.",
            ErrorCode::SsoNoIdToken => "Kimlik sağlayıcısı bir ID token döndürmedi.",
            ErrorCode::SsoInvalidIdpResponse => "Kimlik sağlayıcısından geçersiz bir yanıt alındı.",
            ErrorCode::SsoTokenMismatch => "SSO token'ı eşleşmiyor. Lütfen tekrar giriş yapın.",
            ErrorCode::CannotImpersonateSelf => "Kendinizi taklit edemezsiniz.",

            // SAML
            ErrorCode::SamlMissingUrl => "SAML metadata URL'si eksik. Lütfen IdP metadata URL'sini girin.",
            ErrorCode::SamlMissingCertificate => "SAML sertifikası eksik. Lütfen IdP sertifikanızı yükleyin.",
            ErrorCode::SamlNotSigned => "SAML yanıtı imzalanmamış. Lütfen IdP yapılandırmanızı kontrol edin.",
            ErrorCode::SamlMissingSignature => "SAML yanıtında imza eksik.",
            ErrorCode::SamlMissingSignedInfo => "SAML yanıtında imza bilgisi eksik.",
            ErrorCode::SamlSignatureFailed => "SAML imza doğrulaması başarısız oldu.",
            ErrorCode::SamlCertMismatch => "SAML sertifikası yapılandırılanla eşleşmiyor.",
            ErrorCode::SamlEmailMismatch => "SAML yanıtındaki e-posta herhangi bir kullanıcıyla eşleşmiyor.",
            ErrorCode::SamlAssertionExpired => "SAML assertion süresi dolmuş. Lütfen tekrar deneyin.",
            ErrorCode::SamlInvalidEncoding => "SAML yanıtının kodlaması geçersiz.",
            ErrorCode::SamlResponseTooLarge => "SAML yanıtı çok büyük.",
            ErrorCode::SamlInvalidCertificate => "SAML sertifikası geçersiz.",
            ErrorCode::SamlCertKeyError => "SAML sertifika anahtarında bir hata var.",
            ErrorCode::SamlInvalidBase64 => "SAML yanıtı geçersiz Base64 verisi içeriyor.",

            // OIDC
            ErrorCode::GoogleOauthNotConfigured => "Google OAuth yapılandırılmamış. Lütfen destek ekibiyle iletişime geçin.",
            ErrorCode::GithubOauthNotConfigured => "GitHub OAuth yapılandırılmamış. Lütfen destek ekibiyle iletişime geçin.",
            ErrorCode::OidcTokenExpired => "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.",
            ErrorCode::OidcAlgorithmNone => "Token algoritması 'none' olamaz.",
            ErrorCode::OidcInvalidTokenFormat => "Token biçimi geçersiz. Lütfen tekrar giriş yapın.",
            ErrorCode::OidcInvalidTokenHeader => "Token başlığı geçersiz. Lütfen tekrar giriş yapın.",
            ErrorCode::OidcInvalidTokenPayload => "Token içeriği geçersiz. Lütfen tekrar giriş yapın.",
            ErrorCode::OidcMissingState => "OAuth state parametresi eksik. Lütfen tekrar deneyin.",
            ErrorCode::OidcMissingCode => "OAuth yetkilendirme kodu eksik. Lütfen tekrar deneyin.",

            // Billing
            ErrorCode::AlreadyOnPlan => "Zaten bu plandasınız.",
            ErrorCode::CannotRefundFree => "Ücretsiz plan için iade yapılamaz.",
            ErrorCode::CouponExpired => "Bu kuponun süresi dolmuş.",
            ErrorCode::CouponMaxUsage => "Bu kupon maksimum kullanım sayısına ulaştı.",
            ErrorCode::CouponAlreadyUsed => "Bu kuponu zaten kullandınız.",
            ErrorCode::CouponDuplicate => "Bu kodla bir kupon zaten mevcut.",
            ErrorCode::NegativePrice => "Fiyat negatif olamaz.",
            ErrorCode::InvalidDiscountType => "İndirim türü geçersiz.",
            ErrorCode::InvalidDiscountValue => "İndirim değeri geçersiz.",
            ErrorCode::InvalidPercentage => "Yüzde değeri 0 ile 100 arasında olmalıdır.",
            ErrorCode::InvalidFreeMonths => "Ücretsiz ay sayısı geçersiz.",
            ErrorCode::InvalidRefundAmount => "İade tutarı geçersiz.",
            ErrorCode::RefundReasonRequired => "Lütfen iade nedeni belirtin.",
            ErrorCode::InvalidPaymentType => "Ödeme türü desteklenmiyor.",
            ErrorCode::PolarSyncOnly => "Bu işlem yalnızca Polar senkronizasyonu ile yapılabilir.",
            ErrorCode::InvalidCheckoutUrl => "Ödeme URL'si geçersiz.",
            ErrorCode::CsvOnly => "Bu işlem için yalnızca CSV dosyaları destekleniyor.",

            // Endpoints
            ErrorCode::EndpointInactive => "Bu endpoint şu anda aktif değil.",
            ErrorCode::BatchTooLarge => "Toplu işlem boyutu izin verilen maksimum limiti aşıyor.",
            ErrorCode::BulkReplayDisabled => "Toplu tekrar gönderme mevcut planınızda mevcut değil.",
            ErrorCode::CustomRetryDisabled => "Özel yeniden deneme ayarları mevcut planınızda mevcut değil.",
            ErrorCode::NoDeliveryIds => "Lütfen en az bir teslimat ID'si girin.",
            ErrorCode::EndpointNotFound => "Endpoint bulunamadı.",
            ErrorCode::DeliveryNotFound => "Teslimat bulunamadı.",

            // Domain
            ErrorCode::DomainAlreadyRegistered => "Bu domain zaten kayıtlı.",
            ErrorCode::DomainCannotUse => "Bu domaini kullanamazsınız.",
            ErrorCode::DomainPublicDomain => "Genel alan adları kullanılamaz. Lütfen özel bir domain kullanın.",
            ErrorCode::DomainInvalidChars => "Domainde geçersiz karakterler var.",
            ErrorCode::DomainInvalidFormat => "Domain biçimi geçersiz. Örnek: example.com",

            // Team
            ErrorCode::CannotRemoveOwner => "Takım sahibi kaldırılamaz.",
            ErrorCode::NotTeamMember => "Bu takımın üyesi değilsiniz.",
            ErrorCode::TeamNameRequired => "Lütfen bir takım adı girin.",
            ErrorCode::InvalidRole => "Belirtilen rol geçersiz.",

            // Alerts
            ErrorCode::InvalidAlertCondition => "Uyarı koşulu geçersiz.",
            ErrorCode::InvalidThreshold => "Uyarı eşik değeri geçersiz.",
            ErrorCode::InvalidNotificationChannel => "Bildirim kanalı desteklenmiyor.",
            ErrorCode::InvalidNotificationUrl => "Bildirim URL'si geçersiz.",
            ErrorCode::ChannelDisabled => "Bu bildirim kanalı şu anda devre dışı.",
            ErrorCode::TitleRequired => "Lütfen bir başlık girin.",
            ErrorCode::SchemaNameRequired => "Lütfen bir şema adı girin.",
            ErrorCode::TagEmpty => "Etiketler boş olamaz.",
            ErrorCode::TagTooLong => "Etiket çok uzun. Maksimum 64 karakter.",

            // System
            ErrorCode::InvalidRateLimit => "Hız limiti değeri geçersiz.",
            ErrorCode::InvalidRetention => "Saklama süresi geçersiz.",
            ErrorCode::InvalidRetryAttempts => "Yeniden deneme sayısı geçersiz.",
            ErrorCode::CssTooLarge => "Özel CSS çok büyük.",
            ErrorCode::EmailSubjectRequired => "Lütfen bir e-posta konusu girin.",
            ErrorCode::EmailBodyRequired => "Lütfen bir e-posta içeriği girin.",
            ErrorCode::DeviceTokenRequired => "Cihaz token'ı gerekiyor.",
            ErrorCode::CannotDeleteAdmin => "Admin hesapları silinemez.",
            ErrorCode::InvalidIpAddress => "IP adresi biçimi geçersiz.",
            ErrorCode::InvalidJwt => "Oturum token'ınız geçersiz. Lütfen tekrar giriş yapın.",
            ErrorCode::InvalidDateFormat => "Tarih biçimi geçersiz. YYYY-MM-DD kullanın.",

            // Email
            ErrorCode::EmailProviderNotConfigured => "E-posta gönderimi yapılandırılmamış. Lütfen destek ekibiyle iletişime geçin.",
            ErrorCode::EmailSendFailed => "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.",

            // Webhook
            ErrorCode::InvalidWebhookSignature => "Webhook imzası geçersiz.",
            ErrorCode::WebhookSignatureExpired => "Webhook imzasının süresi dolmuş.",

            // Validation
            ErrorCode::EndpointIdRequired => "Lütfen bir endpoint ID'si girin.",
            ErrorCode::InvalidUserId => "Kullanıcı ID'si geçersiz.",
            ErrorCode::InvalidEmail => "Lütfen geçerli bir e-posta adresi girin.",
            ErrorCode::InvalidPassword => "Şifre gereksinimleri karşılanmıyor.",
            ErrorCode::MissingField => "İstekte gerekli bir alan eksik.",

            // Conflict
            ErrorCode::Conflict => "Bu işlem mevcut durumla çakışıyor. Lütfen sayfayı yenileyip tekrar deneyin.",
        }
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
        let (status, code, detail, error_code): (StatusCode, &str, String, Option<ErrorCode>) = match self {
            AppError::NotFound => (StatusCode::NOT_FOUND, ErrorCode::NotFound.as_str(), String::new(), Some(ErrorCode::NotFound)),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, ErrorCode::Unauthorized.as_str(), String::new(), Some(ErrorCode::Unauthorized)),
            AppError::Forbidden => (StatusCode::FORBIDDEN, ErrorCode::Forbidden.as_str(), String::new(), Some(ErrorCode::Forbidden)),
            AppError::Coded(code) => {
                let status = match &code {
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
                let code_str = code.as_str();
                (status, code_str, String::new(), Some(code))
            }
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, "BAD_REQUEST", msg, None),
            AppError::PayloadTooLarge => (StatusCode::PAYLOAD_TOO_LARGE, ErrorCode::PayloadTooLarge.as_str(), String::new(), Some(ErrorCode::PayloadTooLarge)),
            AppError::Conflict => (StatusCode::CONFLICT, ErrorCode::Conflict.as_str(), String::new(), Some(ErrorCode::Conflict)),
            AppError::Validation(msg) => (StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg, None),
            AppError::RateLimitExceeded => (StatusCode::TOO_MANY_REQUESTS, ErrorCode::RateLimitExceeded.as_str(), String::new(), Some(ErrorCode::RateLimitExceeded)),
            AppError::Internal(e) => {
                tracing::error!("Internal error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, ErrorCode::InternalError.as_str(), String::new(), Some(ErrorCode::InternalError))
            }
            AppError::Database(e) => {
                let msg = format!("{:?}", e);
                tracing::error!("Database error: {}", msg);
                (StatusCode::INTERNAL_SERVER_ERROR, ErrorCode::DatabaseError.as_str(), msg, Some(ErrorCode::DatabaseError))
            }
            AppError::Serialization(e) => {
                tracing::error!("Serialization error: {:?}", e);
                (StatusCode::BAD_REQUEST, ErrorCode::InvalidFormat.as_str(), String::new(), Some(ErrorCode::InvalidFormat))
            }
        };

        // Determine language from Accept-Language header (fallback: English)
        // NOTE: We cannot access request headers here directly in IntoResponse.
        // The message is always English; frontend should use the `code` field
        // for i18n lookup. We include the English message as a sensible default.

        let message = error_code.map(|c| c.message());

        let body = match (detail.is_empty(), message) {
            (false, Some(msg)) => json!({ "error": { "code": code, "message": msg, "detail": detail } }),
            (false, None) => json!({ "error": { "code": code, "detail": detail } }),
            (true, Some(msg)) => json!({ "error": { "code": code, "message": msg } }),
            (true, None) => json!({ "error": { "code": code } }),
        };

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
        assert_eq!(body["error"]["message"], "The email or password you entered is incorrect.");
    }

    #[tokio::test]
    async fn test_not_found() {
        let resp = AppError::NotFound.into_response();
        let (status, body) = extract(resp).await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        assert_eq!(body["error"]["code"], "NOT_FOUND");
        assert_eq!(body["error"]["message"], "The requested resource was not found.");
    }

    #[tokio::test]
    async fn test_unauthorized() {
        let resp = AppError::Unauthorized.into_response();
        let (status, body) = extract(resp).await;
        assert_eq!(status, StatusCode::UNAUTHORIZED);
        assert_eq!(body["error"]["code"], "UNAUTHORIZED");
        assert_eq!(body["error"]["message"], "You need to sign in to access this resource.");
    }

    #[tokio::test]
    async fn test_rate_limit() {
        let resp = AppError::RateLimitExceeded.into_response();
        let (status, body) = extract(resp).await;
        assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(body["error"]["code"], "RATE_LIMIT_EXCEEDED");
        assert_eq!(body["error"]["message"], "Too many requests. Please slow down and try again shortly.");
    }

    #[tokio::test]
    async fn test_internal_no_leak() {
        let resp = AppError::Internal(anyhow::anyhow!("secret detail")).into_response();
        let (status, body) = extract(resp).await;
        assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
        assert_eq!(body["error"]["code"], "INTERNAL_ERROR");
        // Should NOT contain "secret detail"
        assert!(body.to_string().contains("INTERNAL_ERROR"));
        assert!(!body.to_string().contains("secret detail"));
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

    #[test]
    fn test_error_code_messages() {
        // English messages exist for all codes
        assert!(!ErrorCode::NotFound.message().is_empty());
        assert!(!ErrorCode::InvalidCredentials.message().is_empty());
        assert!(!ErrorCode::InternalError.message().is_empty());

        // Turkish messages exist for all codes
        assert!(!ErrorCode::NotFound.message_tr().is_empty());
        assert!(!ErrorCode::InvalidCredentials.message_tr().is_empty());
        assert!(!ErrorCode::InternalError.message_tr().is_empty());
    }
}
