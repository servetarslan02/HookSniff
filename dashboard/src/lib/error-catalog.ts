/**
 * HookSniff Error Catalog
 * Centralized error codes and user-friendly messages.
 * Maps backend error codes to human-readable messages.
 */

/** Error codes used by the HookSniff API */
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED',
  INVALID_2FA_CODE: 'INVALID_2FA_CODE',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  TOO_MANY_2FA_ATTEMPTS: 'TOO_MANY_2FA_ATTEMPTS',
  REQUEST_BLOCKED: 'REQUEST_BLOCKED',
  PASSWORD_LOGIN_NOT_SETUP: 'PASSWORD_LOGIN_NOT_SETUP',
  PASSWORD_NOT_SET: 'PASSWORD_NOT_SET',
  PASSWORD_REQUIRED: 'PASSWORD_REQUIRED',
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  PASSWORD_TOO_LONG: 'PASSWORD_TOO_LONG',
  PASSWORD_NEEDS_UPPERCASE: 'PASSWORD_NEEDS_UPPERCASE',
  PASSWORD_NEEDS_LOWERCASE: 'PASSWORD_NEEDS_LOWERCASE',
  PASSWORD_NEEDS_DIGIT: 'PASSWORD_NEEDS_DIGIT',
  WRONG_PASSWORD: 'WRONG_PASSWORD',
  REFRESH_TOKEN_REQUIRED: 'REFRESH_TOKEN_REQUIRED',
  INVALID_JWT: 'INVALID_JWT',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  INVALID_VERIFICATION_TOKEN: 'INVALID_VERIFICATION_TOKEN',
  CANNOT_IMPERSONATE_SELF: 'CANNOT_IMPERSONATE_SELF',
  CODE_EXPIRED: 'CODE_EXPIRED',
  INVALID_CODE_FORMAT: 'INVALID_CODE_FORMAT',
  SAME_EMAIL: 'SAME_EMAIL',

  // 2FA
  '2FA_ALREADY_ENABLED': '2FA_ALREADY_ENABLED',
  '2FA_NOT_ENABLED': '2FA_NOT_ENABLED',

  // Validation
  BAD_REQUEST: 'BAD_REQUEST',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_FORMAT: 'INVALID_FORMAT',
  MISSING_FIELD: 'MISSING_FIELD',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_IP_ADDRESS: 'INVALID_IP_ADDRESS',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ENDPOINT_NOT_FOUND: 'ENDPOINT_NOT_FOUND',
  ENDPOINT_INACTIVE: 'ENDPOINT_INACTIVE',
  ENDPOINT_ID_REQUIRED: 'ENDPOINT_ID_REQUIRED',
  DELIVERY_NOT_FOUND: 'DELIVERY_NOT_FOUND',
  NO_DELIVERY_IDS: 'NO_DELIVERY_IDS',
  CONFLICT: 'CONFLICT',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_RATE_LIMIT: 'INVALID_RATE_LIMIT',

  // Billing
  ALREADY_ON_PLAN: 'ALREADY_ON_PLAN',
  CANNOT_REFUND_FREE: 'CANNOT_REFUND_FREE',
  COUPON_EXPIRED: 'COUPON_EXPIRED',
  COUPON_MAX_USAGE: 'COUPON_MAX_USAGE',
  COUPON_ALREADY_USED: 'COUPON_ALREADY_USED',
  COUPON_DUPLICATE: 'COUPON_DUPLICATE',
  NEGATIVE_PRICE: 'NEGATIVE_PRICE',
  INVALID_DISCOUNT_TYPE: 'INVALID_DISCOUNT_TYPE',
  INVALID_DISCOUNT_VALUE: 'INVALID_DISCOUNT_VALUE',
  INVALID_PERCENTAGE: 'INVALID_PERCENTAGE',
  INVALID_FREE_MONTHS: 'INVALID_FREE_MONTHS',
  INVALID_REFUND_AMOUNT: 'INVALID_REFUND_AMOUNT',
  INVALID_PAYMENT_TYPE: 'INVALID_PAYMENT_TYPE',
  INVALID_CHECKOUT_URL: 'INVALID_CHECKOUT_URL',
  REFUND_REASON_REQUIRED: 'REFUND_REASON_REQUIRED',
  POLAR_SYNC_ONLY: 'POLAR_SYNC_ONLY',

  // Teams
  CANNOT_REMOVE_OWNER: 'CANNOT_REMOVE_OWNER',
  NOT_TEAM_MEMBER: 'NOT_TEAM_MEMBER',
  TEAM_NAME_REQUIRED: 'TEAM_NAME_REQUIRED',
  INVALID_ROLE: 'INVALID_ROLE',
  CANNOT_DELETE_ADMIN: 'CANNOT_DELETE_ADMIN',

  // SSO / SAML
  SSO_NOT_CONFIGURED: 'SSO_NOT_CONFIGURED',
  SSO_NOT_ENABLED: 'SSO_NOT_ENABLED',
  SSO_CONFIG_NOT_FOUND: 'SSO_CONFIG_NOT_FOUND',
  SSO_INVALID_PROVIDER: 'SSO_INVALID_PROVIDER',
  SSO_STATE_EXPIRED: 'SSO_STATE_EXPIRED',
  SSO_SESSION_EXPIRED: 'SSO_SESSION_EXPIRED',
  SSO_CODE_REJECTED: 'SSO_CODE_REJECTED',
  SSO_IDP_UNREACHABLE: 'SSO_IDP_UNREACHABLE',
  SSO_NO_ID_TOKEN: 'SSO_NO_ID_TOKEN',
  SSO_INVALID_IDP_RESPONSE: 'SSO_INVALID_IDP_RESPONSE',
  SSO_TOKEN_MISMATCH: 'SSO_TOKEN_MISMATCH',
  SAML_MISSING_URL: 'SAML_MISSING_URL',
  SAML_MISSING_CERTIFICATE: 'SAML_MISSING_CERTIFICATE',
  SAML_NOT_SIGNED: 'SAML_NOT_SIGNED',
  SAML_MISSING_SIGNATURE: 'SAML_MISSING_SIGNATURE',
  SAML_MISSING_SIGNED_INFO: 'SAML_MISSING_SIGNED_INFO',
  SAML_SIGNATURE_FAILED: 'SAML_SIGNATURE_FAILED',
  SAML_CERT_MISMATCH: 'SAML_CERT_MISMATCH',
  SAML_EMAIL_MISMATCH: 'SAML_EMAIL_MISMATCH',
  SAML_ASSERTION_EXPIRED: 'SAML_ASSERTION_EXPIRED',
  SAML_INVALID_ENCODING: 'SAML_INVALID_ENCODING',
  SAML_RESPONSE_TOO_LARGE: 'SAML_RESPONSE_TOO_LARGE',
  SAML_INVALID_CERTIFICATE: 'SAML_INVALID_CERTIFICATE',
  SAML_CERT_KEY_ERROR: 'SAML_CERT_KEY_ERROR',
  SAML_INVALID_BASE64: 'SAML_INVALID_BASE64',

  // OIDC
  GOOGLE_OAUTH_NOT_CONFIGURED: 'GOOGLE_OAUTH_NOT_CONFIGURED',
  GITHUB_OAUTH_NOT_CONFIGURED: 'GITHUB_OAUTH_NOT_CONFIGURED',
  OIDC_TOKEN_EXPIRED: 'OIDC_TOKEN_EXPIRED',
  OIDC_ALGORITHM_NONE: 'OIDC_ALGORITHM_NONE',
  OIDC_INVALID_TOKEN_FORMAT: 'OIDC_INVALID_TOKEN_FORMAT',
  OIDC_INVALID_TOKEN_HEADER: 'OIDC_INVALID_TOKEN_HEADER',
  OIDC_INVALID_TOKEN_PAYLOAD: 'OIDC_INVALID_TOKEN_PAYLOAD',
  OIDC_MISSING_STATE: 'OIDC_MISSING_STATE',
  OIDC_MISSING_CODE: 'OIDC_MISSING_CODE',

  // Email
  EMAIL_IN_USE: 'EMAIL_IN_USE',
  EMAIL_UNAVAILABLE: 'EMAIL_UNAVAILABLE',
  EMAIL_PROVIDER_NOT_CONFIGURED: 'EMAIL_PROVIDER_NOT_CONFIGURED',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  EMAIL_SUBJECT_REQUIRED: 'EMAIL_SUBJECT_REQUIRED',
  EMAIL_BODY_REQUIRED: 'EMAIL_BODY_REQUIRED',

  // Domain
  DOMAIN_ALREADY_REGISTERED: 'DOMAIN_ALREADY_REGISTERED',
  DOMAIN_CANNOT_USE: 'DOMAIN_CANNOT_USE',
  DOMAIN_PUBLIC_DOMAIN: 'DOMAIN_PUBLIC_DOMAIN',
  DOMAIN_INVALID_CHARS: 'DOMAIN_INVALID_CHARS',
  DOMAIN_INVALID_FORMAT: 'DOMAIN_INVALID_FORMAT',

  // Alerts & Schema
  INVALID_ALERT_CONDITION: 'INVALID_ALERT_CONDITION',
  INVALID_THRESHOLD: 'INVALID_THRESHOLD',
  INVALID_NOTIFICATION_CHANNEL: 'INVALID_NOTIFICATION_CHANNEL',
  INVALID_NOTIFICATION_URL: 'INVALID_NOTIFICATION_URL',
  CHANNEL_DISABLED: 'CHANNEL_DISABLED',
  TITLE_REQUIRED: 'TITLE_REQUIRED',
  SCHEMA_NAME_REQUIRED: 'SCHEMA_NAME_REQUIRED',
  TAG_EMPTY: 'TAG_EMPTY',
  TAG_TOO_LONG: 'TAG_TOO_LONG',
  CSS_TOO_LARGE: 'CSS_TOO_LARGE',

  // Webhooks
  INVALID_WEBHOOK_SIGNATURE: 'INVALID_WEBHOOK_SIGNATURE',
  WEBHOOK_SIGNATURE_EXPIRED: 'WEBHOOK_SIGNATURE_EXPIRED',
  BATCH_TOO_LARGE: 'BATCH_TOO_LARGE',
  BULK_REPLAY_DISABLED: 'BULK_REPLAY_DISABLED',
  CUSTOM_RETRY_DISABLED: 'CUSTOM_RETRY_DISABLED',

  // Misc
  DEVICE_TOKEN_REQUIRED: 'DEVICE_TOKEN_REQUIRED',
  INVALID_USER_ID: 'INVALID_USER_ID',
  CSV_ONLY: 'CSV_ONLY',
  INVALID_RETENTION: 'INVALID_RETENTION',
  INVALID_RETRY_ATTEMPTS: 'INVALID_RETRY_ATTEMPTS',

  // Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // CSRF
  CSRF_TOKEN_INVALID: 'CSRF_TOKEN_INVALID',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * User-friendly error messages mapped to error codes.
 * These are safe to display to end users.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  UNAUTHORIZED: 'Oturum açmanız gerekiyor.',
  FORBIDDEN: 'Bu işlem için yetkiniz yok.',
  TOKEN_EXPIRED: 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.',
  INVALID_CREDENTIALS: 'E-posta veya şifre hatalı.',
  ACCOUNT_DISABLED: 'Hesabınız devre dışı bırakılmış. Destek ile iletişime geçin.',
  EMAIL_NOT_VERIFIED: 'Lütfen önce e-posta adresinizi doğrulayın.',
  TWO_FACTOR_REQUIRED: 'İki faktörlü kimlik doğrulama gerekli.',
  INVALID_2FA_CODE: 'Doğrulama kodu hatalı. Tekrar deneyin.',
  TOO_MANY_ATTEMPTS: 'Çok fazla deneme yaptınız. Lütfen biraz bekleyip tekrar deneyin.',
  TOO_MANY_2FA_ATTEMPTS: 'Çok fazla 2FA denemesi. Lütfen biraz bekleyin.',
  REQUEST_BLOCKED: 'İsteğiniz engellendi. Destek ile iletişime geçin.',
  PASSWORD_LOGIN_NOT_SETUP: 'Bu hesap için şifre girişi yapılandırılmamış. SSO ile giriş yapın.',
  PASSWORD_NOT_SET: 'Henüz bir şifre belirlemediniz.',
  PASSWORD_REQUIRED: 'Şifre gerekli.',
  PASSWORD_TOO_SHORT: 'Şifre çok kısa. En az 8 karakter olmalı.',
  PASSWORD_TOO_LONG: 'Şifre çok uzun. En fazla 128 karakter olmalı.',
  PASSWORD_NEEDS_UPPERCASE: 'Şifre en az bir büyük harf içermeli.',
  PASSWORD_NEEDS_LOWERCASE: 'Şifre en az bir küçük harf içermeli.',
  PASSWORD_NEEDS_DIGIT: 'Şifre en az bir rakam içermeli.',
  WRONG_PASSWORD: 'Mevcut şifreniz hatalı.',
  REFRESH_TOKEN_REQUIRED: 'Yenileme token\'ı gerekli. Lütfen tekrar giriş yapın.',
  INVALID_JWT: 'Geçersiz oturum token\'ı. Lütfen tekrar giriş yapın.',
  INVALID_RESET_TOKEN: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.',
  INVALID_VERIFICATION_TOKEN: 'Doğrulama bağlantısı geçersiz veya süresi dolmuş.',
  CANNOT_IMPERSONATE_SELF: 'Kendinizi taklit edemezsiniz.',
  CODE_EXPIRED: 'Doğrulama kodunun süresi dolmuş. Yeni bir kod isteyin.',
  INVALID_CODE_FORMAT: 'Doğrulama kodu geçersiz formatta.',
  SAME_EMAIL: 'Yeni e-posta adresi mevcut adresle aynı olamaz.',
  '2FA_ALREADY_ENABLED': 'İki faktörlü doğrulama zaten etkin.',
  '2FA_NOT_ENABLED': 'İki faktörlü doğrulama henüz etkin değil.',
  // Additional backend codes
  INVALID_PASSWORD: 'Şifre geçersiz.',
  EMAIL_PROVIDER_NOT_CONFIGURED: 'E-posta servisi yapılandırılmamış.',
  EMAIL_SEND_FAILED: 'E-posta gönderilemedi.',
  ENDPOINT_ID_REQUIRED: 'Endpoint ID gerekli.',
  INVALID_WEBHOOK_SIGNATURE: 'Geçersiz webhook imzası.',
  WEBHOOK_SIGNATURE_EXPIRED: 'Webhook imzasının süresi dolmuş.',
  MISSING_FIELD: 'Lütfen tüm zorunlu alanları doldurun.',
  SCHEMA_NAME_REQUIRED: 'Şema adı gerekli.',
  BATCH_TOO_LARGE: 'Batch boyutu çok büyük.',
  BULK_REPLAY_DISABLED: 'Toplu tekrar oynatma devre dışı.',
  CUSTOM_RETRY_DISABLED: 'Özel yeniden deneme politikaları mevcut değil.',
  DEVICE_TOKEN_REQUIRED: 'Cihaz token\'ı gerekli.',
  DOMAIN_ALREADY_REGISTERED: 'Bu domain zaten kayıtlı.',
  DOMAIN_CANNOT_USE: 'Bu domain kullanılamaz.',
  DOMAIN_INVALID_CHARS: 'Domain geçersiz karakterler içeriyor.',
  DOMAIN_INVALID_FORMAT: 'Domain formatı geçersiz.',
  DOMAIN_PUBLIC_DOMAIN: 'Genel domainler kullanılamaz.',
  EMAIL_BODY_REQUIRED: 'E-posta içeriği gerekli.',
  EMAIL_SUBJECT_REQUIRED: 'E-posta konusu gerekli.',
  INVALID_ALERT_CONDITION: 'Geçersiz alarm koşulu.',
  INVALID_NOTIFICATION_CHANNEL: 'Geçersiz bildirim kanalı.',
  INVALID_NOTIFICATION_URL: 'Geçersiz bildirim URL\'i.',
  INVALID_RETENTION: 'Geçersiz saklama süresi.',
  INVALID_RETRY_ATTEMPTS: 'Geçersiz yeniden deneme sayısı.',
  INVALID_THRESHOLD: 'Geçersiz eşik değeri.',
  INVALID_USER_ID: 'Geçersiz kullanıcı ID\'si.',
  CHANNEL_DISABLED: 'Bildirim kanalı devre dışı.',
  CSS_TOO_LARGE: 'Özel CSS çok büyük.',
  CSV_ONLY: 'Yalnızca CSV dosyaları desteklenir.',
  TAG_EMPTY: 'Etiket boş olamaz.',
  TAG_TOO_LONG: 'Etiket çok uzun.',
  TITLE_REQUIRED: 'Başlık gerekli.',
  POLAR_SYNC_ONLY: 'Bu işlem yalnızca Polar.sh ile yapılabilir.',


  // Validation
  BAD_REQUEST: 'İstek işlenemedi. Lütfen girdiğiniz bilgileri kontrol edin.',
  INVALID_EMAIL: 'Geçerli bir e-posta adresi girin.',
  INVALID_FORMAT: 'Veri formatı geçersiz. Kontrol edip tekrar deneyin.',
  MISSING_FIELD: 'Lütfen tüm zorunlu alanları doldurun.',
  PAYLOAD_TOO_LARGE: 'Dosya veya veri çok büyük.',
  INVALID_DATE_FORMAT: 'Geçersiz tarih formatı.',
  INVALID_IP_ADDRESS: 'Geçersiz IP adresi.',

  // Resources
  NOT_FOUND: 'İstenen kaynak bulunamadı.',
  ENDPOINT_NOT_FOUND: 'Webhook endpoint\'i bulunamadı.',
  ENDPOINT_INACTIVE: 'Bu endpoint devre dışı. Önce etkinleştirin.',
  ENDPOINT_ID_REQUIRED: 'Endpoint ID gerekli.',
  DELIVERY_NOT_FOUND: 'Teslimat kaydı bulunamadı.',
  NO_DELIVERY_IDS: 'Teslimat ID\'si gerekli.',
  CONFLICT: 'Bu işlem mevcut durumla çakışıyor. Sayfayı yenileyip tekrar deneyin.',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyip tekrar deneyin.',
  INVALID_RATE_LIMIT: 'Geçersiz rate limit değeri.',

  // Billing
  ALREADY_ON_PLAN: 'Zaten bu plandasınız.',
  CANNOT_REFUND_FREE: 'Ücretsiz plan için geri ödeme yapılamaz.',
  COUPON_EXPIRED: 'Kupon kodunun süresi dolmuş.',
  COUPON_MAX_USAGE: 'Kupon kodu maksimum kullanım sayısına ulaştı.',
  COUPON_ALREADY_USED: 'Bu kupon kodunu zaten kullandınız.',
  COUPON_DUPLICATE: 'Bu kupon kodu zaten mevcut.',
  NEGATIVE_PRICE: 'Fiyat negatif olamaz.',
  INVALID_DISCOUNT_TYPE: 'Geçersiz indirim türü.',
  INVALID_DISCOUNT_VALUE: 'Geçersiz indirim değeri.',
  INVALID_PERCENTAGE: 'Geçersiz yüzde değeri (0-100 arası olmalı).',
  INVALID_FREE_MONTHS: 'Geçersiz ücretsiz ay sayısı.',
  INVALID_REFUND_AMOUNT: 'Geçersiz geri ödeme tutarı.',
  INVALID_PAYMENT_TYPE: 'Geçersiz ödeme türü.',
  INVALID_CHECKOUT_URL: 'Geçersiz ödeme URL\'i.',
  REFUND_REASON_REQUIRED: 'Geri ödeme nedeni gerekli.',
  POLAR_SYNC_ONLY: 'Bu işlem yalnızca Polar.sh ile senkronize edilebilir.',

  // Teams
  CANNOT_REMOVE_OWNER: 'Takım sahibi kaldırılamaz.',
  NOT_TEAM_MEMBER: 'Bu takımın üyesi değilsiniz.',
  TEAM_NAME_REQUIRED: 'Takım adı gerekli.',
  INVALID_ROLE: 'Geçersiz rol.',
  CANNOT_DELETE_ADMIN: 'Admin kullanıcı silinemez.',

  // SSO / SAML
  SSO_NOT_CONFIGURED: 'SSO yapılandırılmamış. Yöneticinizle iletişime geçin.',
  SSO_NOT_ENABLED: 'SSO etkin değil. Yöneticinizle iletişime geçin.',
  SSO_CONFIG_NOT_FOUND: 'SSO yapılandırması bulunamadı.',
  SSO_INVALID_PROVIDER: 'Geçersiz SSO sağlayıcısı.',
  SSO_STATE_EXPIRED: 'SSO oturumunun süresi doldu. Tekrar giriş yapın.',
  SSO_SESSION_EXPIRED: 'SSO oturumunun süresi doldu.',
  SSO_CODE_REJECTED: 'SSO kimlik doğrulama kodu reddedildi.',
  SSO_IDP_UNREACHABLE: 'Kimlik sağlayıcısına ulaşılamıyor. Ağ bağlantınızı kontrol edin.',
  SSO_NO_ID_TOKEN: 'Kimlik sağlayıcısı token döndürmedi.',
  SSO_INVALID_IDP_RESPONSE: 'Kimlik sağlayıcısından geçersiz yanıt.',
  SSO_TOKEN_MISMATCH: 'SSO token uyuşmazlığı.',
  SAML_MISSING_URL: 'SAML yapılandırmasında URL eksik.',
  SAML_MISSING_CERTIFICATE: 'SAML sertifikası eksik.',
  SAML_NOT_SIGNED: 'SAML yanıtı imzalanmamış.',
  SAML_MISSING_SIGNATURE: 'SAML imzası eksik.',
  SAML_MISSING_SIGNED_INFO: 'SAML imza bilgisi eksik.',
  SAML_SIGNATURE_FAILED: 'SAML imza doğrulaması başarısız.',
  SAML_CERT_MISMATCH: 'SAML sertifikası uyuşmuyor.',
  SAML_EMAIL_MISMATCH: 'SAML e-posta adresi uyuşmuyor.',
  SAML_ASSERTION_EXPIRED: 'SAML assertion süresi dolmuş.',
  SAML_INVALID_ENCODING: 'Geçersiz SAML kodlaması.',
  SAML_RESPONSE_TOO_LARGE: 'SAML yanıtı çok büyük.',
  SAML_INVALID_CERTIFICATE: 'Geçersiz SAML sertifikası.',
  SAML_CERT_KEY_ERROR: 'SAML sertifika anahtar hatası.',
  SAML_INVALID_BASE64: 'Geçersiz SAML Base64 kodlaması.',

  // OIDC
  GOOGLE_OAUTH_NOT_CONFIGURED: 'Google girişi yapılandırılmamış.',
  GITHUB_OAUTH_NOT_CONFIGURED: 'GitHub girişi yapılandırılmamış.',
  OIDC_TOKEN_EXPIRED: 'OIDC token süresi dolmuş. Tekrar giriş yapın.',
  OIDC_ALGORITHM_NONE: 'OIDC token algoritması güvenli değil.',
  OIDC_INVALID_TOKEN_FORMAT: 'Geçersiz OIDC token formatı.',
  OIDC_INVALID_TOKEN_HEADER: 'Geçersiz OIDC token başlığı.',
  OIDC_INVALID_TOKEN_PAYLOAD: 'Geçersiz OIDC token içeriği.',
  OIDC_MISSING_STATE: 'OIDC durum parametresi eksik.',
  OIDC_MISSING_CODE: 'OIDC yetkilendirme kodu eksik.',

  // Email
  EMAIL_IN_USE: 'Bu e-posta adresi zaten kullanımda.',
  EMAIL_UNAVAILABLE: 'Bu e-posta adresi kullanılamaz.',
  EMAIL_PROVIDER_NOT_CONFIGURED: 'E-posta servisi yapılandırılmamış.',
  EMAIL_SEND_FAILED: 'E-posta gönderilemedi. Tekrar deneyin.',
  EMAIL_SUBJECT_REQUIRED: 'E-posta konusu gerekli.',
  EMAIL_BODY_REQUIRED: 'E-posta içeriği gerekli.',

  // Domain
  DOMAIN_ALREADY_REGISTERED: 'Bu domain zaten kayıtlı.',
  DOMAIN_CANNOT_USE: 'Bu domain kullanılamaz.',
  DOMAIN_PUBLIC_DOMAIN: 'Genel alan adları (gmail.com vb.) kayıt edilemez.',
  DOMAIN_INVALID_CHARS: 'Domain geçersiz karakterler içeriyor.',
  DOMAIN_INVALID_FORMAT: 'Domain formatı geçersiz.',

  // Alerts & Schema
  INVALID_ALERT_CONDITION: 'Geçersiz alarm koşulu.',
  INVALID_THRESHOLD: 'Geçersiz eşik değeri.',
  INVALID_NOTIFICATION_CHANNEL: 'Geçersiz bildirim kanalı.',
  INVALID_NOTIFICATION_URL: 'Geçersiz bildirim URL\'i.',
  CHANNEL_DISABLED: 'Bu bildirim kanalı devre dışı.',
  TITLE_REQUIRED: 'Başlık gerekli.',
  SCHEMA_NAME_REQUIRED: 'Şema adı gerekli.',
  TAG_EMPTY: 'Etiket boş olamaz.',
  TAG_TOO_LONG: 'Etiket çok uzun.',
  CSS_TOO_LARGE: 'CSS çok büyük.',

  // Webhooks
  INVALID_WEBHOOK_SIGNATURE: 'Geçersiz webhook imzası.',
  WEBHOOK_SIGNATURE_EXPIRED: 'Webhook imzasının süresi dolmuş.',
  BATCH_TOO_LARGE: 'Toplu istek çok büyük.',
  BULK_REPLAY_DISABLED: 'Toplu yeniden oynatma devre dışı.',
  CUSTOM_RETRY_DISABLED: 'Özel yeniden deneme devre dışı.',

  // Misc
  DEVICE_TOKEN_REQUIRED: 'Cihaz token\'ı gerekli.',
  INVALID_USER_ID: 'Geçersiz kullanıcı ID\'si.',
  CSV_ONLY: 'Yalnızca CSV dosyaları kabul edilir.',
  INVALID_RETENTION: 'Geçersiz saklama süresi.',
  INVALID_RETRY_ATTEMPTS: 'Geçersiz yeniden deneme sayısı.',

  // Server
  INTERNAL_ERROR: 'Bir şeyler yanlış gitti. Lütfen daha sonra tekrar deneyin.',
  SERVICE_UNAVAILABLE: 'Servis geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
  DATABASE_ERROR: 'Sistem hatası oluştu. Lütfen daha sonra tekrar deneyin.',
  EXTERNAL_SERVICE_ERROR: 'Harici servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',

  // CSRF
  CSRF_TOKEN_INVALID: 'Güvenlik token\'ının süresi doldu. Sayfayı yenileyip tekrar deneyin.',
};

/**
 * Get a user-friendly error message for an error code.
 * Falls back to the generic message if the code is unknown.
 */
export function getUserFriendlyMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.INTERNAL_ERROR;
}

/**
 * Extract error code from API response.
 * The API returns { error: { code: string, detail: string } }
 */
export function extractErrorCode(err: unknown): string | null {
  if (err && typeof err === 'object') {
    if ('error' in err && err.error && typeof err.error === 'object' && 'code' in err.error) {
      return String((err.error as { code: unknown }).code);
    }
    if ('code' in err) {
      return String((err as { code: unknown }).code);
    }
  }
  return null;
}
