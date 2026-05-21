/**
 * HookSniff Error Message Mapping — Code-based (v2)
 *
 * Maps API error codes to user-friendly i18n keys.
 * The API returns { error: { code: string } }.
 * No string matching needed — direct code → i18n key lookup.
 *
 * Usage:
 *   import { getFriendlyError } from '@/lib/error-messages';
 *   const msg = getFriendlyError(errorCode, t);
 */

import type { TFunction } from 'i18next';

/**
 * Map of API error code → i18n key in the `errors` namespace.
 */
const CODE_MAP: Record<string, string> = {
  // ── Generic ──────────────────────────────────────────────
  NOT_FOUND: 'generic.notFound',
  UNAUTHORIZED: 'generic.unauthorized',
  FORBIDDEN: 'generic.forbidden',
  PAYLOAD_TOO_LARGE: 'generic.payloadTooLarge',
  RATE_LIMIT_EXCEEDED: 'generic.rateLimited',
  INTERNAL_ERROR: 'generic.internalError',
  DATABASE_ERROR: 'generic.internalError',
  INVALID_FORMAT: 'generic.invalidFormat',
  CONFLICT: 'generic.conflict',

  // ── Auth ─────────────────────────────────────────────────
  INVALID_CREDENTIALS: 'auth.invalidCredentials',
  ACCOUNT_DISABLED: 'auth.accountDisabled',
  EMAIL_NOT_VERIFIED: 'auth.emailNotVerified',
  TOO_MANY_ATTEMPTS: 'auth.tooManyAttempts',
  REQUEST_BLOCKED: 'auth.requestBlocked',
  PASSWORD_LOGIN_NOT_SETUP: 'auth.passwordLoginNotSetup',
  PASSWORD_NOT_SET: 'auth.passwordNotSet',
  PASSWORD_REQUIRED: 'auth.passwordRequired',
  PASSWORD_TOO_SHORT: 'auth.passwordTooShort',
  PASSWORD_TOO_LONG: 'auth.passwordTooLong',
  PASSWORD_NEEDS_UPPERCASE: 'auth.passwordNeedsUppercase',
  PASSWORD_NEEDS_LOWERCASE: 'auth.passwordNeedsLowercase',
  PASSWORD_NEEDS_DIGIT: 'auth.passwordNeedsDigit',
  WRONG_PASSWORD: 'auth.wrongPassword',
  EMAIL_IN_USE: 'auth.emailInUse',
  EMAIL_UNAVAILABLE: 'auth.emailUnavailable',
  SAME_EMAIL: 'auth.sameEmail',
  INVALID_RESET_TOKEN: 'auth.invalidResetToken',
  INVALID_VERIFICATION_TOKEN: 'auth.invalidVerificationToken',
  REFRESH_TOKEN_REQUIRED: 'auth.refreshTokenRequired',

  // ── 2FA ──────────────────────────────────────────────────
  '2FA_ALREADY_ENABLED': 'auth.2faAlreadyEnabled',
  '2FA_NOT_ENABLED': 'auth.2faNotEnabled',
  INVALID_2FA_CODE: 'auth.invalid2faCode',
  CODE_EXPIRED: 'auth.codeExpired',
  TOO_MANY_2FA_ATTEMPTS: 'auth.tooMany2faAttempts',
  INVALID_CODE_FORMAT: 'auth.invalidCodeFormat',

  // ── SSO ──────────────────────────────────────────────────
  SSO_NOT_CONFIGURED: 'sso.notConfigured',
  SSO_NOT_ENABLED: 'sso.notEnabled',
  SSO_CONFIG_NOT_FOUND: 'sso.configNotFound',
  SSO_INVALID_PROVIDER: 'sso.invalidProvider',
  SSO_STATE_EXPIRED: 'sso.stateExpired',
  SSO_SESSION_EXPIRED: 'sso.sessionExpired',
  SSO_CODE_REJECTED: 'sso.codeRejected',
  SSO_IDP_UNREACHABLE: 'sso.idpUnreachable',
  SSO_NO_ID_TOKEN: 'sso.noIdToken',
  SSO_INVALID_IDP_RESPONSE: 'sso.invalidIdpResponse',
  SSO_TOKEN_MISMATCH: 'sso.tokenMismatch',
  CANNOT_IMPERSONATE_SELF: 'sso.cannotImpersonateSelf',

  // ── SAML ─────────────────────────────────────────────────
  SAML_MISSING_URL: 'saml.missingUrl',
  SAML_MISSING_CERTIFICATE: 'saml.missingCertificate',
  SAML_NOT_SIGNED: 'saml.notSigned',
  SAML_MISSING_SIGNATURE: 'saml.missingSignature',
  SAML_MISSING_SIGNED_INFO: 'saml.missingSignedInfo',
  SAML_SIGNATURE_FAILED: 'saml.signatureFailed',
  SAML_CERT_MISMATCH: 'saml.certMismatch',
  SAML_EMAIL_MISMATCH: 'saml.emailMismatch',
  SAML_ASSERTION_EXPIRED: 'saml.assertionExpired',
  SAML_INVALID_ENCODING: 'saml.invalidEncoding',
  SAML_RESPONSE_TOO_LARGE: 'saml.responseTooLarge',
  SAML_INVALID_CERTIFICATE: 'saml.invalidCertificate',
  SAML_CERT_KEY_ERROR: 'saml.certKeyError',
  SAML_INVALID_BASE64: 'saml.invalidBase64',

  // ── OIDC ─────────────────────────────────────────────────
  GOOGLE_OAUTH_NOT_CONFIGURED: 'oidc.googleNotConfigured',
  GITHUB_OAUTH_NOT_CONFIGURED: 'oidc.githubNotConfigured',
  OIDC_TOKEN_EXPIRED: 'oidc.tokenExpired',
  OIDC_ALGORITHM_NONE: 'oidc.algorithmNone',
  OIDC_INVALID_TOKEN_FORMAT: 'oidc.invalidTokenFormat',
  OIDC_INVALID_TOKEN_HEADER: 'oidc.invalidTokenHeader',
  OIDC_INVALID_TOKEN_PAYLOAD: 'oidc.invalidTokenPayload',
  OIDC_MISSING_STATE: 'oidc.missingState',
  OIDC_MISSING_CODE: 'oidc.missingCode',

  // ── Billing ──────────────────────────────────────────────
  ALREADY_ON_PLAN: 'billing.alreadyOnPlan',
  CANNOT_REFUND_FREE: 'billing.cannotRefundFree',
  COUPON_EXPIRED: 'billing.couponExpired',
  COUPON_MAX_USAGE: 'billing.couponMaxUsage',
  COUPON_ALREADY_USED: 'billing.couponAlreadyUsed',
  COUPON_DUPLICATE: 'billing.couponDuplicate',
  NEGATIVE_PRICE: 'billing.negativePrice',
  INVALID_DISCOUNT_TYPE: 'billing.invalidDiscountType',
  INVALID_DISCOUNT_VALUE: 'billing.invalidDiscountValue',
  INVALID_PERCENTAGE: 'billing.invalidPercentage',
  INVALID_FREE_MONTHS: 'billing.invalidFreeMonths',
  INVALID_REFUND_AMOUNT: 'billing.invalidRefundAmount',
  REFUND_REASON_REQUIRED: 'billing.refundReasonRequired',
  INVALID_PAYMENT_TYPE: 'billing.invalidType',
  POLAR_SYNC_ONLY: 'billing.polarSyncOnly',
  INVALID_CHECKOUT_URL: 'billing.invalidCheckoutUrl',
  CSV_ONLY: 'billing.csvOnly',

  // ── Endpoints ────────────────────────────────────────────
  ENDPOINT_INACTIVE: 'endpoint.inactive',
  BATCH_TOO_LARGE: 'endpoint.batchTooLarge',
  BULK_REPLAY_DISABLED: 'endpoint.bulkReplayDisabled',
  CUSTOM_RETRY_DISABLED: 'endpoint.customRetryDisabled',
  NO_DELIVERY_IDS: 'endpoint.noDeliveryIds',
  ENDPOINT_NOT_FOUND: 'endpoint.notFound',
  DELIVERY_NOT_FOUND: 'endpoint.deliveryNotFound',

  // ── Domain ───────────────────────────────────────────────
  DOMAIN_ALREADY_REGISTERED: 'domain.alreadyRegistered',
  DOMAIN_CANNOT_USE: 'domain.cannotUse',
  DOMAIN_PUBLIC_DOMAIN: 'domain.publicDomain',
  DOMAIN_INVALID_CHARS: 'domain.invalidChars',
  DOMAIN_INVALID_FORMAT: 'domain.invalidFormat',

  // ── Team ─────────────────────────────────────────────────
  CANNOT_REMOVE_OWNER: 'team.cannotRemoveOwner',
  NOT_TEAM_MEMBER: 'team.notMember',
  TEAM_NAME_REQUIRED: 'team.nameRequired',
  INVALID_ROLE: 'team.invalidRole',

  // ── Alerts ───────────────────────────────────────────────
  INVALID_ALERT_CONDITION: 'alert.invalidCondition',
  INVALID_THRESHOLD: 'alert.invalidThreshold',
  INVALID_NOTIFICATION_CHANNEL: 'alert.invalidChannel',
  INVALID_NOTIFICATION_URL: 'alert.invalidUrl',
  CHANNEL_DISABLED: 'alert.channelDisabled',
  TITLE_REQUIRED: 'alert.titleRequired',
  SCHEMA_NAME_REQUIRED: 'alert.schemaNameRequired',
  TAG_EMPTY: 'alert.tagEmpty',
  TAG_TOO_LONG: 'alert.tagTooLong',

  // ── System ───────────────────────────────────────────────
  INVALID_RATE_LIMIT: 'system.invalidRateLimit',
  INVALID_RETENTION: 'system.invalidRetention',
  INVALID_RETRY_ATTEMPTS: 'system.invalidRetryAttempts',
  CSS_TOO_LARGE: 'system.cssTooLarge',
  EMAIL_SUBJECT_REQUIRED: 'system.emailSubjectRequired',
  EMAIL_BODY_REQUIRED: 'system.emailBodyRequired',
  DEVICE_TOKEN_REQUIRED: 'system.deviceTokenRequired',
  CANNOT_DELETE_ADMIN: 'system.cannotDeleteAdmin',
  INVALID_IP_ADDRESS: 'system.invalidIp',
  INVALID_JWT: 'system.invalidJwt',
  INVALID_DATE_FORMAT: 'system.invalidDateFormat',
};

/**
 * Get a user-friendly error message for an API error code.
 * Direct lookup — no string matching, no fallback guessing.
 */
export function getFriendlyError(
  code: string | undefined | null,
  t: TFunction,
  fallback?: string
): string {
  if (!code) {
    return fallback ?? t('errors:generic.unknown');
  }

  const normalized = code.toUpperCase().trim();
  const i18nKey = CODE_MAP[normalized];

  if (i18nKey) {
    return t(`errors:${i18nKey}`);
  }

  return fallback ?? t('errors:generic.unknown');
}

/**
 * Extract error code from API response.
 */
export function extractErrorCode(err: unknown): string | null {
  if (!err) return null;

  if (typeof err === 'object') {
    // { error: { code: "..." } }
    if ('error' in err && err.error && typeof err.error === 'object' && 'code' in err.error) {
      return String((err.error as { code: unknown }).code);
    }
    // { code: "..." }
    if ('code' in err) {
      return String((err as { code: unknown }).code);
    }
  }

  return null;
}
