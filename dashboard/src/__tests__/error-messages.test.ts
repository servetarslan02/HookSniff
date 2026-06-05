import { describe, it, expect, vi } from 'vitest';

// Mock dependencies
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const { getFriendlyError, extractErrorCode } = await import('@/lib/error-messages');

const t = (key: string) => key;

describe('getFriendlyError', () => {
  it('returns i18n key for known error code NOT_FOUND', () => {
    expect(getFriendlyError('NOT_FOUND', t)).toBe('errors:generic.notFound');
  });

  it('returns i18n key for UNAUTHORIZED', () => {
    expect(getFriendlyError('UNAUTHORIZED', t)).toBe('errors:generic.unauthorized');
  });

  it('returns i18n key for FORBIDDEN', () => {
    expect(getFriendlyError('FORBIDDEN', t)).toBe('errors:generic.forbidden');
  });

  it('returns i18n key for PAYLOAD_TOO_LARGE', () => {
    expect(getFriendlyError('PAYLOAD_TOO_LARGE', t)).toBe('errors:generic.payloadTooLarge');
  });

  it('returns i18n key for RATE_LIMIT_EXCEEDED', () => {
    expect(getFriendlyError('RATE_LIMIT_EXCEEDED', t)).toBe('errors:generic.rateLimited');
  });

  it('returns i18n key for INTERNAL_ERROR', () => {
    expect(getFriendlyError('INTERNAL_ERROR', t)).toBe('errors:generic.internalError');
  });

  it('returns i18n key for DATABASE_ERROR', () => {
    expect(getFriendlyError('DATABASE_ERROR', t)).toBe('errors:generic.internalError');
  });

  it('returns i18n key for INVALID_FORMAT', () => {
    expect(getFriendlyError('INVALID_FORMAT', t)).toBe('errors:generic.invalidFormat');
  });

  it('returns i18n key for CONFLICT', () => {
    expect(getFriendlyError('CONFLICT', t)).toBe('errors:generic.conflict');
  });

  // Auth codes
  it('returns i18n key for INVALID_CREDENTIALS', () => {
    expect(getFriendlyError('INVALID_CREDENTIALS', t)).toBe('errors:auth.invalidCredentials');
  });

  it('returns i18n key for ACCOUNT_DISABLED', () => {
    expect(getFriendlyError('ACCOUNT_DISABLED', t)).toBe('errors:auth.accountDisabled');
  });

  it('returns i18n key for EMAIL_NOT_VERIFIED', () => {
    expect(getFriendlyError('EMAIL_NOT_VERIFIED', t)).toBe('errors:auth.emailNotVerified');
  });

  it('returns i18n key for TOO_MANY_ATTEMPTS', () => {
    expect(getFriendlyError('TOO_MANY_ATTEMPTS', t)).toBe('errors:auth.tooManyAttempts');
  });

  it('returns i18n key for REQUEST_BLOCKED', () => {
    expect(getFriendlyError('REQUEST_BLOCKED', t)).toBe('errors:auth.requestBlocked');
  });

  it('returns i18n key for PASSWORD_LOGIN_NOT_SETUP', () => {
    expect(getFriendlyError('PASSWORD_LOGIN_NOT_SETUP', t)).toBe('errors:auth.passwordLoginNotSetup');
  });

  it('returns i18n key for PASSWORD_NOT_SET', () => {
    expect(getFriendlyError('PASSWORD_NOT_SET', t)).toBe('errors:auth.passwordNotSet');
  });

  it('returns i18n key for PASSWORD_REQUIRED', () => {
    expect(getFriendlyError('PASSWORD_REQUIRED', t)).toBe('errors:auth.passwordRequired');
  });

  it('returns i18n key for PASSWORD_TOO_SHORT', () => {
    expect(getFriendlyError('PASSWORD_TOO_SHORT', t)).toBe('errors:auth.passwordTooShort');
  });

  it('returns i18n key for PASSWORD_TOO_LONG', () => {
    expect(getFriendlyError('PASSWORD_TOO_LONG', t)).toBe('errors:auth.passwordTooLong');
  });

  it('returns i18n key for PASSWORD_NEEDS_UPPERCASE', () => {
    expect(getFriendlyError('PASSWORD_NEEDS_UPPERCASE', t)).toBe('errors:auth.passwordNeedsUppercase');
  });

  it('returns i18n key for PASSWORD_NEEDS_LOWERCASE', () => {
    expect(getFriendlyError('PASSWORD_NEEDS_LOWERCASE', t)).toBe('errors:auth.passwordNeedsLowercase');
  });

  it('returns i18n key for PASSWORD_NEEDS_DIGIT', () => {
    expect(getFriendlyError('PASSWORD_NEEDS_DIGIT', t)).toBe('errors:auth.passwordNeedsDigit');
  });

  it('returns i18n key for WRONG_PASSWORD', () => {
    expect(getFriendlyError('WRONG_PASSWORD', t)).toBe('errors:auth.wrongPassword');
  });

  it('returns i18n key for EMAIL_IN_USE', () => {
    expect(getFriendlyError('EMAIL_IN_USE', t)).toBe('errors:auth.emailInUse');
  });

  it('returns i18n key for EMAIL_UNAVAILABLE', () => {
    expect(getFriendlyError('EMAIL_UNAVAILABLE', t)).toBe('errors:auth.emailUnavailable');
  });

  it('returns i18n key for SAME_EMAIL', () => {
    expect(getFriendlyError('SAME_EMAIL', t)).toBe('errors:auth.sameEmail');
  });

  it('returns i18n key for INVALID_RESET_TOKEN', () => {
    expect(getFriendlyError('INVALID_RESET_TOKEN', t)).toBe('errors:auth.invalidResetToken');
  });

  it('returns i18n key for INVALID_VERIFICATION_TOKEN', () => {
    expect(getFriendlyError('INVALID_VERIFICATION_TOKEN', t)).toBe('errors:auth.invalidVerificationToken');
  });

  it('returns i18n key for REFRESH_TOKEN_REQUIRED', () => {
    expect(getFriendlyError('REFRESH_TOKEN_REQUIRED', t)).toBe('errors:auth.refreshTokenRequired');
  });

  // 2FA codes
  it('returns i18n key for 2FA_ALREADY_ENABLED', () => {
    expect(getFriendlyError('2FA_ALREADY_ENABLED', t)).toBe('errors:auth.2faAlreadyEnabled');
  });

  it('returns i18n key for 2FA_NOT_ENABLED', () => {
    expect(getFriendlyError('2FA_NOT_ENABLED', t)).toBe('errors:auth.2faNotEnabled');
  });

  it('returns i18n key for INVALID_2FA_CODE', () => {
    expect(getFriendlyError('INVALID_2FA_CODE', t)).toBe('errors:auth.invalid2faCode');
  });

  it('returns i18n key for CODE_EXPIRED', () => {
    expect(getFriendlyError('CODE_EXPIRED', t)).toBe('errors:auth.codeExpired');
  });

  it('returns i18n key for TOO_MANY_2FA_ATTEMPTS', () => {
    expect(getFriendlyError('TOO_MANY_2FA_ATTEMPTS', t)).toBe('errors:auth.tooMany2faAttempts');
  });

  it('returns i18n key for INVALID_CODE_FORMAT', () => {
    expect(getFriendlyError('INVALID_CODE_FORMAT', t)).toBe('errors:auth.invalidCodeFormat');
  });

  // SSO codes
  it('returns i18n key for SSO_NOT_CONFIGURED', () => {
    expect(getFriendlyError('SSO_NOT_CONFIGURED', t)).toBe('errors:sso.notConfigured');
  });

  it('returns i18n key for SSO_NOT_ENABLED', () => {
    expect(getFriendlyError('SSO_NOT_ENABLED', t)).toBe('errors:sso.notEnabled');
  });

  it('returns i18n key for SSO_CONFIG_NOT_FOUND', () => {
    expect(getFriendlyError('SSO_CONFIG_NOT_FOUND', t)).toBe('errors:sso.configNotFound');
  });

  it('returns i18n key for SSO_INVALID_PROVIDER', () => {
    expect(getFriendlyError('SSO_INVALID_PROVIDER', t)).toBe('errors:sso.invalidProvider');
  });

  it('returns i18n key for SSO_STATE_EXPIRED', () => {
    expect(getFriendlyError('SSO_STATE_EXPIRED', t)).toBe('errors:sso.stateExpired');
  });

  it('returns i18n key for SSO_SESSION_EXPIRED', () => {
    expect(getFriendlyError('SSO_SESSION_EXPIRED', t)).toBe('errors:sso.sessionExpired');
  });

  it('returns i18n key for SSO_CODE_REJECTED', () => {
    expect(getFriendlyError('SSO_CODE_REJECTED', t)).toBe('errors:sso.codeRejected');
  });

  it('returns i18n key for SSO_IDP_UNREACHABLE', () => {
    expect(getFriendlyError('SSO_IDP_UNREACHABLE', t)).toBe('errors:sso.idpUnreachable');
  });

  it('returns i18n key for SSO_NO_ID_TOKEN', () => {
    expect(getFriendlyError('SSO_NO_ID_TOKEN', t)).toBe('errors:sso.noIdToken');
  });

  it('returns i18n key for SSO_INVALID_IDP_RESPONSE', () => {
    expect(getFriendlyError('SSO_INVALID_IDP_RESPONSE', t)).toBe('errors:sso.invalidIdpResponse');
  });

  it('returns i18n key for SSO_TOKEN_MISMATCH', () => {
    expect(getFriendlyError('SSO_TOKEN_MISMATCH', t)).toBe('errors:sso.tokenMismatch');
  });

  it('returns i18n key for CANNOT_IMPERSONATE_SELF', () => {
    expect(getFriendlyError('CANNOT_IMPERSONATE_SELF', t)).toBe('errors:sso.cannotImpersonateSelf');
  });

  // SAML codes
  it('returns i18n key for SAML_MISSING_URL', () => {
    expect(getFriendlyError('SAML_MISSING_URL', t)).toBe('errors:saml.missingUrl');
  });

  it('returns i18n key for SAML_MISSING_CERTIFICATE', () => {
    expect(getFriendlyError('SAML_MISSING_CERTIFICATE', t)).toBe('errors:saml.missingCertificate');
  });

  it('returns i18n key for SAML_NOT_SIGNED', () => {
    expect(getFriendlyError('SAML_NOT_SIGNED', t)).toBe('errors:saml.notSigned');
  });

  it('returns i18n key for SAML_MISSING_SIGNATURE', () => {
    expect(getFriendlyError('SAML_MISSING_SIGNATURE', t)).toBe('errors:saml.missingSignature');
  });

  it('returns i18n key for SAML_MISSING_SIGNED_INFO', () => {
    expect(getFriendlyError('SAML_MISSING_SIGNED_INFO', t)).toBe('errors:saml.missingSignedInfo');
  });

  it('returns i18n key for SAML_SIGNATURE_FAILED', () => {
    expect(getFriendlyError('SAML_SIGNATURE_FAILED', t)).toBe('errors:saml.signatureFailed');
  });

  it('returns i18n key for SAML_CERT_MISMATCH', () => {
    expect(getFriendlyError('SAML_CERT_MISMATCH', t)).toBe('errors:saml.certMismatch');
  });

  it('returns i18n key for SAML_EMAIL_MISMATCH', () => {
    expect(getFriendlyError('SAML_EMAIL_MISMATCH', t)).toBe('errors:saml.emailMismatch');
  });

  it('returns i18n key for SAML_ASSERTION_EXPIRED', () => {
    expect(getFriendlyError('SAML_ASSERTION_EXPIRED', t)).toBe('errors:saml.assertionExpired');
  });

  it('returns i18n key for SAML_INVALID_ENCODING', () => {
    expect(getFriendlyError('SAML_INVALID_ENCODING', t)).toBe('errors:saml.invalidEncoding');
  });

  it('returns i18n key for SAML_RESPONSE_TOO_LARGE', () => {
    expect(getFriendlyError('SAML_RESPONSE_TOO_LARGE', t)).toBe('errors:saml.responseTooLarge');
  });

  it('returns i18n key for SAML_INVALID_CERTIFICATE', () => {
    expect(getFriendlyError('SAML_INVALID_CERTIFICATE', t)).toBe('errors:saml.invalidCertificate');
  });

  it('returns i18n key for SAML_CERT_KEY_ERROR', () => {
    expect(getFriendlyError('SAML_CERT_KEY_ERROR', t)).toBe('errors:saml.certKeyError');
  });

  it('returns i18n key for SAML_INVALID_BASE64', () => {
    expect(getFriendlyError('SAML_INVALID_BASE64', t)).toBe('errors:saml.invalidBase64');
  });

  // OIDC codes
  it('returns i18n key for GOOGLE_OAUTH_NOT_CONFIGURED', () => {
    expect(getFriendlyError('GOOGLE_OAUTH_NOT_CONFIGURED', t)).toBe('errors:oidc.googleNotConfigured');
  });

  it('returns i18n key for GITHUB_OAUTH_NOT_CONFIGURED', () => {
    expect(getFriendlyError('GITHUB_OAUTH_NOT_CONFIGURED', t)).toBe('errors:oidc.githubNotConfigured');
  });

  it('returns i18n key for OIDC_TOKEN_EXPIRED', () => {
    expect(getFriendlyError('OIDC_TOKEN_EXPIRED', t)).toBe('errors:oidc.tokenExpired');
  });

  it('returns i18n key for OIDC_ALGORITHM_NONE', () => {
    expect(getFriendlyError('OIDC_ALGORITHM_NONE', t)).toBe('errors:oidc.algorithmNone');
  });

  it('returns i18n key for OIDC_INVALID_TOKEN_FORMAT', () => {
    expect(getFriendlyError('OIDC_INVALID_TOKEN_FORMAT', t)).toBe('errors:oidc.invalidTokenFormat');
  });

  it('returns i18n key for OIDC_INVALID_TOKEN_HEADER', () => {
    expect(getFriendlyError('OIDC_INVALID_TOKEN_HEADER', t)).toBe('errors:oidc.invalidTokenHeader');
  });

  it('returns i18n key for OIDC_INVALID_TOKEN_PAYLOAD', () => {
    expect(getFriendlyError('OIDC_INVALID_TOKEN_PAYLOAD', t)).toBe('errors:oidc.invalidTokenPayload');
  });

  it('returns i18n key for OIDC_MISSING_STATE', () => {
    expect(getFriendlyError('OIDC_MISSING_STATE', t)).toBe('errors:oidc.missingState');
  });

  it('returns i18n key for OIDC_MISSING_CODE', () => {
    expect(getFriendlyError('OIDC_MISSING_CODE', t)).toBe('errors:oidc.missingCode');
  });

  // Billing codes
  it('returns i18n key for ALREADY_ON_PLAN', () => {
    expect(getFriendlyError('ALREADY_ON_PLAN', t)).toBe('errors:billing.alreadyOnPlan');
  });

  it('returns i18n key for CANNOT_REFUND_FREE', () => {
    expect(getFriendlyError('CANNOT_REFUND_FREE', t)).toBe('errors:billing.cannotRefundFree');
  });

  it('returns i18n key for COUPON_EXPIRED', () => {
    expect(getFriendlyError('COUPON_EXPIRED', t)).toBe('errors:billing.couponExpired');
  });

  it('returns i18n key for COUPON_MAX_USAGE', () => {
    expect(getFriendlyError('COUPON_MAX_USAGE', t)).toBe('errors:billing.couponMaxUsage');
  });

  it('returns i18n key for COUPON_ALREADY_USED', () => {
    expect(getFriendlyError('COUPON_ALREADY_USED', t)).toBe('errors:billing.couponAlreadyUsed');
  });

  it('returns i18n key for COUPON_DUPLICATE', () => {
    expect(getFriendlyError('COUPON_DUPLICATE', t)).toBe('errors:billing.couponDuplicate');
  });

  it('returns i18n key for NEGATIVE_PRICE', () => {
    expect(getFriendlyError('NEGATIVE_PRICE', t)).toBe('errors:billing.negativePrice');
  });

  it('returns i18n key for INVALID_DISCOUNT_TYPE', () => {
    expect(getFriendlyError('INVALID_DISCOUNT_TYPE', t)).toBe('errors:billing.invalidDiscountType');
  });

  it('returns i18n key for INVALID_DISCOUNT_VALUE', () => {
    expect(getFriendlyError('INVALID_DISCOUNT_VALUE', t)).toBe('errors:billing.invalidDiscountValue');
  });

  it('returns i18n key for INVALID_PERCENTAGE', () => {
    expect(getFriendlyError('INVALID_PERCENTAGE', t)).toBe('errors:billing.invalidPercentage');
  });

  it('returns i18n key for INVALID_FREE_MONTHS', () => {
    expect(getFriendlyError('INVALID_FREE_MONTHS', t)).toBe('errors:billing.invalidFreeMonths');
  });

  it('returns i18n key for INVALID_REFUND_AMOUNT', () => {
    expect(getFriendlyError('INVALID_REFUND_AMOUNT', t)).toBe('errors:billing.invalidRefundAmount');
  });

  it('returns i18n key for REFUND_REASON_REQUIRED', () => {
    expect(getFriendlyError('REFUND_REASON_REQUIRED', t)).toBe('errors:billing.refundReasonRequired');
  });

  it('returns i18n key for INVALID_PAYMENT_TYPE', () => {
    expect(getFriendlyError('INVALID_PAYMENT_TYPE', t)).toBe('errors:billing.invalidType');
  });

  it('returns i18n key for POLAR_SYNC_ONLY', () => {
    expect(getFriendlyError('POLAR_SYNC_ONLY', t)).toBe('errors:billing.polarSyncOnly');
  });

  it('returns i18n key for INVALID_CHECKOUT_URL', () => {
    expect(getFriendlyError('INVALID_CHECKOUT_URL', t)).toBe('errors:billing.invalidCheckoutUrl');
  });

  it('returns i18n key for CSV_ONLY', () => {
    expect(getFriendlyError('CSV_ONLY', t)).toBe('errors:billing.csvOnly');
  });

  // Endpoint codes
  it('returns i18n key for ENDPOINT_INACTIVE', () => {
    expect(getFriendlyError('ENDPOINT_INACTIVE', t)).toBe('errors:endpoint.inactive');
  });

  it('returns i18n key for BATCH_TOO_LARGE', () => {
    expect(getFriendlyError('BATCH_TOO_LARGE', t)).toBe('errors:endpoint.batchTooLarge');
  });

  it('returns i18n key for BULK_REPLAY_DISABLED', () => {
    expect(getFriendlyError('BULK_REPLAY_DISABLED', t)).toBe('errors:endpoint.bulkReplayDisabled');
  });

  it('returns i18n key for CUSTOM_RETRY_DISABLED', () => {
    expect(getFriendlyError('CUSTOM_RETRY_DISABLED', t)).toBe('errors:endpoint.customRetryDisabled');
  });

  it('returns i18n key for NO_DELIVERY_IDS', () => {
    expect(getFriendlyError('NO_DELIVERY_IDS', t)).toBe('errors:endpoint.noDeliveryIds');
  });

  it('returns i18n key for ENDPOINT_NOT_FOUND', () => {
    expect(getFriendlyError('ENDPOINT_NOT_FOUND', t)).toBe('errors:endpoint.notFound');
  });

  it('returns i18n key for DELIVERY_NOT_FOUND', () => {
    expect(getFriendlyError('DELIVERY_NOT_FOUND', t)).toBe('errors:endpoint.deliveryNotFound');
  });

  // Domain codes
  it('returns i18n key for DOMAIN_ALREADY_REGISTERED', () => {
    expect(getFriendlyError('DOMAIN_ALREADY_REGISTERED', t)).toBe('errors:domain.alreadyRegistered');
  });

  it('returns i18n key for DOMAIN_CANNOT_USE', () => {
    expect(getFriendlyError('DOMAIN_CANNOT_USE', t)).toBe('errors:domain.cannotUse');
  });

  it('returns i18n key for DOMAIN_PUBLIC_DOMAIN', () => {
    expect(getFriendlyError('DOMAIN_PUBLIC_DOMAIN', t)).toBe('errors:domain.publicDomain');
  });

  it('returns i18n key for DOMAIN_INVALID_CHARS', () => {
    expect(getFriendlyError('DOMAIN_INVALID_CHARS', t)).toBe('errors:domain.invalidChars');
  });

  it('returns i18n key for DOMAIN_INVALID_FORMAT', () => {
    expect(getFriendlyError('DOMAIN_INVALID_FORMAT', t)).toBe('errors:domain.invalidFormat');
  });

  // Team codes
  it('returns i18n key for CANNOT_REMOVE_OWNER', () => {
    expect(getFriendlyError('CANNOT_REMOVE_OWNER', t)).toBe('errors:team.cannotRemoveOwner');
  });

  it('returns i18n key for NOT_TEAM_MEMBER', () => {
    expect(getFriendlyError('NOT_TEAM_MEMBER', t)).toBe('errors:team.notMember');
  });

  it('returns i18n key for TEAM_NAME_REQUIRED', () => {
    expect(getFriendlyError('TEAM_NAME_REQUIRED', t)).toBe('errors:team.nameRequired');
  });

  it('returns i18n key for INVALID_ROLE', () => {
    expect(getFriendlyError('INVALID_ROLE', t)).toBe('errors:team.invalidRole');
  });

  // Alert codes
  it('returns i18n key for INVALID_ALERT_CONDITION', () => {
    expect(getFriendlyError('INVALID_ALERT_CONDITION', t)).toBe('errors:alert.invalidCondition');
  });

  it('returns i18n key for INVALID_THRESHOLD', () => {
    expect(getFriendlyError('INVALID_THRESHOLD', t)).toBe('errors:alert.invalidThreshold');
  });

  it('returns i18n key for INVALID_NOTIFICATION_CHANNEL', () => {
    expect(getFriendlyError('INVALID_NOTIFICATION_CHANNEL', t)).toBe('errors:alert.invalidChannel');
  });

  it('returns i18n key for INVALID_NOTIFICATION_URL', () => {
    expect(getFriendlyError('INVALID_NOTIFICATION_URL', t)).toBe('errors:alert.invalidUrl');
  });

  it('returns i18n key for CHANNEL_DISABLED', () => {
    expect(getFriendlyError('CHANNEL_DISABLED', t)).toBe('errors:alert.channelDisabled');
  });

  it('returns i18n key for TITLE_REQUIRED', () => {
    expect(getFriendlyError('TITLE_REQUIRED', t)).toBe('errors:alert.titleRequired');
  });

  it('returns i18n key for SCHEMA_NAME_REQUIRED', () => {
    expect(getFriendlyError('SCHEMA_NAME_REQUIRED', t)).toBe('errors:alert.schemaNameRequired');
  });

  it('returns i18n key for TAG_EMPTY', () => {
    expect(getFriendlyError('TAG_EMPTY', t)).toBe('errors:alert.tagEmpty');
  });

  it('returns i18n key for TAG_TOO_LONG', () => {
    expect(getFriendlyError('TAG_TOO_LONG', t)).toBe('errors:alert.tagTooLong');
  });

  // System codes
  it('returns i18n key for INVALID_RATE_LIMIT', () => {
    expect(getFriendlyError('INVALID_RATE_LIMIT', t)).toBe('errors:system.invalidRateLimit');
  });

  it('returns i18n key for INVALID_RETENTION', () => {
    expect(getFriendlyError('INVALID_RETENTION', t)).toBe('errors:system.invalidRetention');
  });

  it('returns i18n key for INVALID_RETRY_ATTEMPTS', () => {
    expect(getFriendlyError('INVALID_RETRY_ATTEMPTS', t)).toBe('errors:system.invalidRetryAttempts');
  });

  it('returns i18n key for CSS_TOO_LARGE', () => {
    expect(getFriendlyError('CSS_TOO_LARGE', t)).toBe('errors:system.cssTooLarge');
  });

  it('returns i18n key for EMAIL_SUBJECT_REQUIRED', () => {
    expect(getFriendlyError('EMAIL_SUBJECT_REQUIRED', t)).toBe('errors:system.emailSubjectRequired');
  });

  it('returns i18n key for EMAIL_BODY_REQUIRED', () => {
    expect(getFriendlyError('EMAIL_BODY_REQUIRED', t)).toBe('errors:system.emailBodyRequired');
  });

  it('returns i18n key for DEVICE_TOKEN_REQUIRED', () => {
    expect(getFriendlyError('DEVICE_TOKEN_REQUIRED', t)).toBe('errors:system.deviceTokenRequired');
  });

  it('returns i18n key for CANNOT_DELETE_ADMIN', () => {
    expect(getFriendlyError('CANNOT_DELETE_ADMIN', t)).toBe('errors:system.cannotDeleteAdmin');
  });

  it('returns i18n key for INVALID_IP_ADDRESS', () => {
    expect(getFriendlyError('INVALID_IP_ADDRESS', t)).toBe('errors:system.invalidIp');
  });

  it('returns i18n key for INVALID_JWT', () => {
    expect(getFriendlyError('INVALID_JWT', t)).toBe('errors:system.invalidJwt');
  });

  it('returns i18n key for INVALID_DATE_FORMAT', () => {
    expect(getFriendlyError('INVALID_DATE_FORMAT', t)).toBe('errors:system.invalidDateFormat');
  });

  // Edge cases
  it('normalizes lowercase codes', () => {
    expect(getFriendlyError('not_found', t)).toBe('errors:generic.notFound');
  });

  it('normalizes mixed case codes', () => {
    expect(getFriendlyError('Not_Found', t)).toBe('errors:generic.notFound');
  });

  it('trims whitespace from codes', () => {
    expect(getFriendlyError(' NOT_FOUND ', t)).toBe('errors:generic.notFound');
  });

  it('returns fallback for unknown code', () => {
    expect(getFriendlyError('UNKNOWN_CODE', t, 'Custom fallback')).toBe('Custom fallback');
  });

  it('returns default unknown for unknown code without fallback', () => {
    expect(getFriendlyError('UNKNOWN_CODE', t)).toBe('errors:generic.unknown');
  });

  it('returns default unknown for null code', () => {
    expect(getFriendlyError(null, t)).toBe('errors:generic.unknown');
  });

  it('returns default unknown for undefined code', () => {
    expect(getFriendlyError(undefined, t)).toBe('errors:generic.unknown');
  });

  it('returns fallback for null code', () => {
    expect(getFriendlyError(null, t, 'No code')).toBe('No code');
  });

  it('returns fallback for empty string code', () => {
    expect(getFriendlyError('', t, 'Empty')).toBe('Empty');
  });

  it('returns default unknown for empty string without fallback', () => {
    expect(getFriendlyError('', t)).toBe('errors:generic.unknown');
  });
});

describe('extractErrorCode', () => {
  it('extracts from { error: { code } } shape', () => {
    expect(extractErrorCode({ error: { code: 'NOT_FOUND' } })).toBe('NOT_FOUND');
  });

  it('extracts from { code } shape', () => {
    expect(extractErrorCode({ code: 'UNAUTHORIZED' })).toBe('UNAUTHORIZED');
  });

  it('returns null for null', () => {
    expect(extractErrorCode(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(extractErrorCode(undefined)).toBeNull();
  });

  it('returns null for string', () => {
    expect(extractErrorCode('error')).toBeNull();
  });

  it('returns null for number', () => {
    expect(extractErrorCode(42)).toBeNull();
  });

  it('returns null for object without code', () => {
    expect(extractErrorCode({ message: 'error' })).toBeNull();
  });

  it('returns null for { error: null }', () => {
    expect(extractErrorCode({ error: null })).toBeNull();
  });

  it('returns null for { error: "string" }', () => {
    expect(extractErrorCode({ error: 'string' })).toBeNull();
  });

  it('returns null for empty object', () => {
    expect(extractErrorCode({})).toBeNull();
  });

  it('handles numeric code converted to string', () => {
    expect(extractErrorCode({ code: 404 })).toBe('404');
  });

  it('handles nested error with numeric code', () => {
    expect(extractErrorCode({ error: { code: 403 } })).toBe('403');
  });
});
