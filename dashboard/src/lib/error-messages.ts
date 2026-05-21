/**
 * HookSniff Error Message Mapping
 * 
 * Maps raw API error messages to user-friendly i18n keys.
 * The API returns { error: { code: string, message: string } }.
 * This file maps the raw `message` to a user-friendly key in messages/*.json.
 * 
 * Usage:
 *   import { getFriendlyError } from '@/lib/error-messages';
 *   const msg = getFriendlyError(apiError, t);
 */

import type { TFunction } from 'i18next';

/**
 * Map of raw API error message → i18n key in the `errors` namespace.
 * Case-insensitive matching. First match wins.
 */
const ERROR_MAP: Record<string, string> = {
  // ── Auth & Login ──────────────────────────────────────────
  'invalid email or password': 'auth.invalidCredentials',
  'account is disabled. contact support.': 'auth.accountDisabled',
  'please verify your email address before logging in. check your inbox for the verification link.': 'auth.emailNotVerified',
  'too many failed attempts. please try again later.': 'auth.tooManyAttempts',
  'request blocked': 'auth.requestBlocked',
  'password login not set up': 'auth.passwordLoginNotSetup',
  'password not set': 'auth.passwordNotSet',
  'invalid or expired reset token': 'auth.invalidResetToken',
  'invalid or expired verification token': 'auth.invalidVerificationToken',
  'this email is already in use': 'auth.emailInUse',
  'this email is no longer available.': 'auth.emailUnavailable',
  'this is already your current email': 'auth.sameEmail',
  'current password is incorrect': 'auth.wrongPassword',
  'refresh token required': 'auth.refreshTokenRequired',

  // ── 2FA ──────────────────────────────────────────────────
  '2fa is already enabled': 'auth.2faAlreadyEnabled',
  '2fa is not enabled': 'auth.2faNotEnabled',
  'invalid code. try again.': 'auth.invalid2faCode',
  'code has expired. please request a new one.': 'auth.codeExpired',
  'too many attempts. please request a new code.': 'auth.tooMany2faAttempts',
  'invalid code format': 'auth.invalidCodeFormat',

  // ── Password Requirements ─────────────────────────────────
  'password must be at least 8 characters': 'auth.passwordTooShort',
  'password must be at most 128 characters': 'auth.passwordTooLong',
  'password must contain at least one uppercase letter': 'auth.passwordNeedsUppercase',
  'password must contain at least one lowercase letter': 'auth.passwordNeedsLowercase',
  'password must contain at least one digit': 'auth.passwordNeedsDigit',
  'password is required': 'auth.passwordRequired',
  'password is required for account deletion': 'auth.passwordRequiredForDeletion',

  // ── SSO ──────────────────────────────────────────────────
  'sso is not configured for this account. contact your administrator.': 'sso.notConfigured',
  'sso is not enabled for this account. contact your administrator.': 'sso.notEnabled',
  'sso configuration not found': 'sso.configNotFound',
  'sso provider must be either \'saml\' or \'oidc\'': 'sso.invalidProvider',
  'invalid or expired sso state. please try again.': 'sso.stateExpired',
  'sso login session expired or invalid. please try again.': 'sso.sessionExpired',
  'sso login failed: authorization code rejected by identity provider. please try again or contact your administrator.': 'sso.codeRejected',
  'sso login failed: could not reach identity provider. please try again.': 'sso.idpUnreachable',
  'sso login failed: identity provider did not return an id token. please contact your administrator.': 'sso.noIdToken',
  'sso login failed: invalid response from identity provider. please contact your administrator.': 'sso.invalidIdpResponse',
  'sso login failed: security token mismatch. please try again.': 'sso.tokenMismatch',
  'cannot impersonate yourself': 'sso.cannotImpersonateSelf',

  // ── SAML ──────────────────────────────────────────────────
  'saml requires either a metadata url or an sso url': 'saml.missingUrl',
  'saml requires an x.509 certificate': 'saml.missingCertificate',
  'saml response is not signed. contact your administrator.': 'saml.notSigned',
  'saml response missing signaturevalue': 'saml.missingSignature',
  'saml response missing signedinfo': 'saml.missingSignedInfo',
  'saml response signature verification failed. the response may have been tampered with.': 'saml.signatureFailed',
  'saml response certificate does not match the configured identity provider. contact your administrator.': 'saml.certMismatch',
  'saml response email does not match the expected account. contact your administrator.': 'saml.emailMismatch',
  'saml assertion has expired': 'saml.assertionExpired',
  'samlresponse is not valid utf-8': 'saml.invalidEncoding',
  'saml response too large': 'saml.responseTooLarge',
  'certificate does not contain rsa public key': 'saml.invalidCertificate',
  'could not extract rsa public key from certificate': 'saml.certKeyError',
  'invalid base64 in samlresponse': 'saml.invalidBase64',
  'invalid base64 in saml signaturevalue': 'saml.invalidSignatureBase64',
  'invalid base64 in x.509 certificate': 'saml.invalidCertBase64',

  // ── OIDC ──────────────────────────────────────────────────
  'google oauth not configured': 'oidc.googleNotConfigured',
  'github oauth not configured': 'oidc.githubNotConfigured',
  'id token has expired': 'oidc.tokenExpired',
  'id token algorithm \'none\' is not allowed': 'oidc.algorithmNone',
  'invalid id token format': 'oidc.invalidTokenFormat',
  'invalid base64 in id token header': 'oidc.invalidTokenHeader',
  'invalid base64 in id token payload': 'oidc.invalidTokenPayload',
  'invalid json in id token header': 'oidc.invalidTokenHeaderJson',
  'invalid json in id token payload': 'oidc.invalidTokenPayloadJson',
  'missing state parameter': 'oidc.missingState',
  'missing authorization code': 'oidc.missingCode',

  // ── Billing & Plans ──────────────────────────────────────
  'you are already on this plan': 'billing.alreadyOnPlan',
  'cannot refund a free plan': 'billing.cannotRefundFree',
  'this coupon has expired': 'billing.couponExpired',
  'this coupon has reached its maximum usage': 'billing.couponMaxUsage',
  'you have already used this coupon': 'billing.couponAlreadyUsed',
  'coupon code already exists': 'billing.couponDuplicate',
  'plan prices cannot be negative': 'billing.negativePrice',
  'discount type must be \'percentage\' or \'free_month\'': 'billing.invalidDiscountType',
  'discount value must be between 0 and 100': 'billing.invalidDiscountValue',
  'percentage must be between 0 and 100': 'billing.invalidPercentage',
  'free month count must be at least 1': 'billing.invalidFreeMonths',
  'refund amount must be positive': 'billing.invalidRefundAmount',
  'refund reason cannot be empty': 'billing.refundReasonRequired',
  'type must be \'polar\' or \'internal\'': 'billing.invalidType',
  'only polar-type coupons can be synced to polar.sh': 'billing.polarSyncOnly',
  'invalid checkout url format': 'billing.invalidCheckoutUrl',
  'only format=csv is supported': 'billing.csvOnly',

  // ── Webhook & Endpoints ──────────────────────────────────
  'the endpoint is no longer active': 'endpoint.inactive',
  'a batch cannot contain more than 100 webhooks': 'endpoint.batchTooLarge',
  'bulk replay is not enabled. contact support to enable this feature.': 'endpoint.bulkReplayDisabled',
  'custom retry schedules are not enabled. contact support to enable this feature.': 'endpoint.customRetryDisabled',
  'please provide at least one delivery id to replay': 'endpoint.noDeliveryIds',
  'endpoint not found': 'endpoint.notFound',
  'delivery not found': 'endpoint.deliveryNotFound',

  // ── Domain ────────────────────────────────────────────────
  'domain already registered': 'domain.alreadyRegistered',
  'cannot use this domain': 'domain.cannotUse',
  'cannot verify public email domains': 'domain.publicDomain',
  'domain contains invalid characters': 'domain.invalidChars',
  'invalid domain format': 'domain.invalidFormat',

  // ── Team ──────────────────────────────────────────────────
  'cannot remove the team owner': 'team.cannotRemoveOwner',
  'not a member of this team': 'team.notMember',
  'team name cannot be empty': 'team.nameRequired',
  'default_role must be \'admin\', \'developer\', \'analyst\', or \'viewer\'': 'team.invalidRole',

  // ── Alerts ────────────────────────────────────────────────
  'invalid alert condition': 'alert.invalidCondition',
  'threshold must be positive': 'alert.invalidThreshold',
  'invalid notification channel': 'alert.invalidChannel',
  'invalid notification url': 'alert.invalidUrl',
  'channel is disabled': 'alert.channelDisabled',
  'title is required': 'alert.titleRequired',
  'schema name is required': 'alert.schemaNameRequired',
  'tag cannot be empty': 'alert.tagEmpty',
  'tag too long (max 50 chars)': 'alert.tagTooLong',

  // ── System ────────────────────────────────────────────────
  'rate_limit must be at least 1': 'system.invalidRateLimit',
  'retention_days must be at least 1': 'system.invalidRetention',
  'retry_max_attempts must be 0-10': 'system.invalidRetryAttempts',
  'custom_css must be under 10kb': 'system.cssTooLarge',
  'email subject cannot be empty': 'system.emailSubjectRequired',
  'email body cannot be empty': 'system.emailBodyRequired',
  'device token cannot be empty': 'system.deviceTokenRequired',
  'cannot delete admin user data': 'system.cannotDeleteAdmin',
  'invalid ip address': 'system.invalidIp',
  'invalid jwt format': 'system.invalidJwt',
  'invalid jwt header': 'system.invalidJwtHeader',
  'invalid jwt header json': 'system.invalidJwtHeaderJson',
  'invalid date format for \'since\' parameter. please use iso 8601 format (e.g. 2024-01-01t00:00:00z).': 'system.invalidDateFormat',

  // ── Generic ───────────────────────────────────────────────
  'not found': 'generic.notFound',
  'unauthorized': 'generic.unauthorized',
  'internal server error': 'generic.internalError',
  'invalid request format': 'generic.invalidFormat',
  'payload too large': 'generic.payloadTooLarge',
};

/**
 * Get a user-friendly error message for a raw API error.
 * Tries exact match first, then partial match, then falls back to generic.
 */
export function getFriendlyError(
  rawMessage: string | undefined | null,
  t: TFunction,
  fallback?: string
): string {
  if (!rawMessage) {
    return fallback ?? t('errors:generic.unknown');
  }

  const normalized = rawMessage.toLowerCase().trim();

  // 1. Exact match
  if (ERROR_MAP[normalized]) {
    return t(`errors:${ERROR_MAP[normalized]}`);
  }

  // 2. Partial match (for messages that have dynamic parts)
  for (const [pattern, key] of Object.entries(ERROR_MAP)) {
    if (normalized.includes(pattern) || pattern.includes(normalized)) {
      return t(`errors:${key}`);
    }
  }

  // 3. Category-based fallback
  if (normalized.includes('saml') || normalized.includes('sso')) {
    return t('errors:sso.genericError');
  }
  if (normalized.includes('password')) {
    return t('errors:auth.passwordError');
  }
  if (normalized.includes('coupon')) {
    return t('errors:billing.couponError');
  }
  if (normalized.includes('domain')) {
    return t('errors:domain.genericError');
  }

  // 4. Return the original message if it looks user-friendly (short, no technical jargon)
  if (rawMessage.length < 100 && !rawMessage.includes('&&') && !rawMessage.includes('||')) {
    return rawMessage;
  }

  // 5. Generic fallback
  return fallback ?? t('errors:generic.unknown');
}

/**
 * Extract error message from various error shapes.
 */
export function extractErrorMessage(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === 'string') return err;

  if (err instanceof Error) return err.message;

  if (typeof err === 'object') {
    // { error: { message: "..." } }
    if ('error' in err && err.error && typeof err.error === 'object' && 'message' in err.error) {
      return String((err.error as { message: unknown }).message);
    }
    // { message: "..." }
    if ('message' in err) {
      return String((err as { message: unknown }).message);
    }
  }

  return null;
}
