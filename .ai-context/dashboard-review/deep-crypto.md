# 🔐 Deep Cryptographic & Security Implementation Audit — HookSniff

**Auditor:** Deep Crypto Subagent  
**Date:** 2026-05-10  
**Scope:** All cryptographic primitives, authentication flows, secret management, token lifecycle, and encryption at rest.

---

## Executive Summary

HookSniff's crypto implementation is **solid overall** — it uses well-known libraries (argon2, aes-gcm, hmac-sha256, totp-rs) and follows many best practices. However, several findings need attention: weak Argon2id parameters, missing 2FA backup codes, no PKCE for OAuth, endpoint signing secrets using UUID instead of cryptographic random, and JWT access tokens that cannot be revoked. None are showstoppers, but the critical and medium findings should be addressed before production scale.

---

## 1. Password Hashing (Argon2id)

### Files: `api/src/auth/jwt.rs`, `api/src/middleware/mod.rs`

### 🟡 F-01: Argon2id Parameters Below OWASP Recommendations

**Severity:** 🟡 Medium

**Finding:** Both `hash_password()` and `hash_api_key()` use `Argon2::default()`, which in argon2 v0.5 defaults to:
- **Memory:** 4096 KiB (4 MiB)
- **Iterations (time):** 3
- **Parallelism:** 1

OWASP recommends for Argon2id:
- **Option 1:** m=46080 (45 MiB), t=3, p=1
- **Option 2:** m=19456 (19 MiB), t=2, p=1

The current 4 MiB memory is **~5× weaker** than OWASP minimum. This makes passwords more vulnerable to GPU/ASIC-based offline cracking.

**Code (current):**
```rust
// api/src/auth/jwt.rs — hash_password
let argon2 = Argon2::default(); // m=4096, t=3, p=1
```

**Fix:**
```rust
use argon2::{Argon2, Algorithm, Version, Params};

fn create_argon2() -> Argon2<'static> {
    // OWASP-recommended parameters for Argon2id
    let params = Params::new(
        46080,  // m = 45 MiB memory
        3,      // t = 3 iterations
        1,      // p = 1 parallelism
        None,   // output length (default: 32)
    ).expect("valid Argon2 params");
    Argon2::new(Algorithm::Argon2id, Version::V0x13, params)
}

pub fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = create_argon2();
    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Password hashing failed: {}", e)))
}
```

**Note:** Increasing memory will make hashing slower (~200-500ms per hash). This is acceptable for login/registration but benchmark on production hardware.

### 🟢 F-02: Password Policy Too Weak

**Severity:** 🟢 Low

**Finding:** Minimum password length is 8 characters with no complexity requirements. While 8 is the absolute minimum, modern recommendations are 12+ characters.

**Fix:** In `register()` and `change_password()`:
```rust
if password.len() < 12 {
    return Err(AppError::BadRequest(
        "Password must be at least 12 characters".into(),
    ));
}
// Optional: check for character class diversity
```

### 🟢 F-03: Argon2id Defaults Consistent (Positive)

**Finding:** Both `hash_password()` and `hash_api_key()` use the same `Argon2::default()`. This is consistent. API keys are high-entropy, so the lower memory cost is less of a concern for them (they're not dictionary-attackable). However, for consistency and defense-in-depth, consider using the same stronger params for both.

---

## 2. JWT Security

### Files: `api/src/auth/jwt.rs`, `api/src/routes/auth.rs`, `api/src/config.rs`

### 🟡 F-04: JWT Uses HS256 (Symmetric) — No Asymmetric Option

**Severity:** 🟡 Medium

**Finding:** `Header::default()` in jsonwebtoken defaults to HS256. The JWT secret is a shared string from `JWT_SECRET` env var. This means:
- Any service with the secret can forge tokens
- If the secret leaks, all tokens are compromised
- Cannot verify tokens in other services without sharing the secret

**Assessment:** For a monolithic API, HS256 is acceptable. If microservices need to verify tokens independently, switch to RS256/ES256.

**No immediate fix needed** — but document the decision and consider RS256 if architecture evolves.

### 🟢 F-05: Access Token Expiration is Appropriate

**Severity:** 🟢 Low (Positive)

**Finding:**
- Access tokens: **15 minutes** ✅
- Legacy tokens: **24 hours** (backward compat, acceptable)
- Refresh tokens: **30 days** with rotation ✅
- 2FA temp tokens: **5 minutes** ✅

### 🟡 F-06: Access Tokens Cannot Be Revoked

**Severity:** 🟡 Medium

**Finding:** Once issued, a JWT access token is valid until expiration (15 min). There's no blacklist or revocation mechanism. If a token is compromised, the attacker has a 15-minute window.

**Mitigation already in place:**
- Refresh tokens are revoked on password change ✅
- Refresh tokens are revoked on password reset ✅
- 15-minute expiry limits exposure ✅

**Optional enhancement:** Implement a token blacklist using Redis for immediate revocation:
```rust
// On logout or security event:
redis.setex(format!("bl:{}", jti), 900, "1").await?;

// In verify_token:
if redis.exists(format!("bl:{}", claims.jti)).await? {
    return Err(AppError::Unauthorized);
}
```

### 🟢 F-07: Refresh Token Rotation is Properly Implemented

**Severity:** 🟢 Low (Positive)

**Finding:** Refresh tokens are properly rotated on each use — the old token is revoked and a new one is issued. This prevents token reuse attacks.

### 🟢 F-08: Secret Validation in Production

**Severity:** 🟢 Low (Positive)

**Finding:** `Config::from_env()` validates that `JWT_SECRET` and `HMAC_SECRET` are ≥32 characters and don't contain placeholder patterns in production mode. This prevents deployment with weak secrets.

---

## 3. Webhook Signing (Standard Webhooks)

### Files: `api/src/signing.rs`, `worker/src/signing.rs`, `api/src/middleware/webhook_verify.rs`

### 🟢 F-09: HMAC-SHA256 Correctly Implemented

**Severity:** 🟢 Low (Positive)

**Finding:** Both signing and verification correctly implement the Standard Webhooks spec:
- Signed payload: `{msg_id}.{timestamp}.{body}`
- Secret decoding handles `whsec_` prefix + base64
- Signature format: `v1,{base64(hmac)}`
- Passes the official Svix test vector ✅

### 🟢 F-10: Constant-Time Signature Comparison

**Severity:** 🟢 Low (Positive)

**Finding:** Signature verification uses a manual XOR-fold constant-time comparison:
```rust
let diff: u8 = sig_bytes
    .iter()
    .zip(expected_bytes.iter())
    .fold(0u8, |acc, (a, b)| acc | (a ^ b));
if diff == 0 { verified = true; }
```
This prevents timing attacks. The worker-side tests also use `CtOutput` comparison. Both are correct.

### 🟢 F-11: Timestamp Validation Prevents Replay Attacks

**Severity:** 🟢 Low (Positive)

**Finding:** Timestamps are validated against a configurable tolerance (default 5 minutes). Expired timestamps are rejected with a clear error. This prevents replay attacks effectively.

### 🟡 F-12: Endpoint Signing Secrets Use UUID Instead of Cryptographic Random

**Severity:** 🟡 Medium

**Finding:** When creating endpoints, signing secrets are generated as:
```rust
let signing_secret = format!("whsec_{}", Uuid::new_v4().to_string().replace('-', ""));
```

UUID v4 provides 122 bits of randomness. While practically unbreakable, the Standard Webhooks spec recommends 24 random bytes (192 bits) base64-encoded. UUIDs also have a fixed structure (version/variant bits) that reduces effective entropy.

**Fix:**
```rust
use rand::RngCore;
let mut bytes = [0u8; 24];
rand::rngs::OsRng.fill_bytes(&mut bytes);
let signing_secret = format!("whsec_{}", base64::engine::general_purpose::STANDARD.encode(&bytes));
```

### 🟢 F-13: Multiple Signature Support

**Severity:** 🟢 Low (Positive)

**Finding:** Verification correctly handles space-separated multiple signatures, supporting key rotation scenarios.

---

## 4. Encryption at Rest (AES-256-GCM)

### File: `api/src/crypto.rs`

### 🟢 F-14: AES-256-GCM Implementation is Correct

**Severity:** 🟢 Low (Positive)

**Finding:** The encryption implementation follows best practices:
- Algorithm: AES-256-GCM (authenticated encryption) ✅
- Key: 32 bytes from `ENCRYPTION_KEY` env var (hex-encoded) ✅
- Nonce: 12 random bytes per encryption via `OsRng` ✅
- Nonce prepended to ciphertext: `[12-byte nonce][ciphertext + 16-byte tag]` ✅
- Output: base64-encoded ✅
- Each encryption produces different output (random nonce) ✅
- Tampered ciphertext correctly rejected ✅

### 🟡 F-15: ENCRYPTION_KEY Not Validated at Startup

**Severity:** 🟡 Medium

**Finding:** The encryption key is loaded lazily via `Lazy<Option<Aes256Gcm>>`. If `ENCRYPTION_KEY` is missing or invalid, encryption operations fail at runtime with a generic error. In production, this means SSO configuration saves could fail silently.

**Fix:** Add startup validation in `Config::from_env()`:
```rust
// In Config::from_env(), after production secret validation:
if env == "production" || env == "prod" {
    let enc_key = std::env::var("ENCRYPTION_KEY").map_err(|_| {
        anyhow::anyhow!("🚫 ENCRYPTION_KEY must be set in production. Generate with: openssl rand -hex 32")
    })?;
    if hex::decode(&enc_key).map(|b| b.len() != 32).unwrap_or(true) {
        anyhow::bail!("🚫 ENCRYPTION_KEY must be exactly 32 bytes (64 hex chars)");
    }
}
```

### 🟢 F-16: Limited Scope of Encrypted Fields

**Severity:** 🟢 Low (Observation)

**Finding:** Currently only SSO `client_secret` is encrypted at rest. Other sensitive fields (API key hashes are hashed, not encrypted — this is correct). If additional secrets are stored in the database (e.g., OAuth tokens for third-party integrations), they should also be encrypted.

---

## 5. OAuth Security

### File: `api/src/routes/oauth.rs`

### 🟢 F-17: CSRF State Parameter Properly Implemented

**Severity:** 🟢 Low (Positive)

**Finding:** OAuth flows correctly:
1. Generate random UUID state on initiation ✅
2. Store state in HttpOnly cookie ✅
3. Verify state matches on callback ✅
4. Clear state cookie after verification ✅

### 🟡 F-18: No PKCE (Proof Key for Code Exchange)

**Severity:** 🟡 Medium

**Finding:** OAuth flows don't implement PKCE (RFC 7636). While PKCE was originally designed for public clients (SPAs, mobile apps), it's now recommended for all OAuth clients as defense-in-depth against authorization code interception.

Google recommends PKCE for all server-side flows. GitHub supports PKCE for OAuth apps.

**Fix:** Add PKCE to both Google and GitHub flows:
```rust
// In google_login/github_login:
use sha2::{Sha256, Digest};
let code_verifier = generate_random_token(); // 32 random bytes hex
let code_challenge = base64_url_encode(Sha256::digest(code_verifier.as_bytes()));

// Add to auth URL:
// &code_challenge={}&code_challenge_method=S256

// In callback, add code_verifier to token exchange:
// ("code_verifier", &code_verifier),
```

### 🟢 F-19: Redirect URI Properly Constructed

**Severity:** 🟢 Low (Positive)

**Finding:** Redirect URIs are constructed from `OAUTH_REDIRECT_BASE` env var, not from user input. This prevents open redirect attacks.

### 🟡 F-20: OAuth State Cookie Uses SameSite=None

**Severity:** 🟡 Low

**Finding:** The OAuth state cookie uses `SameSite=None; Secure`. While the state parameter itself provides CSRF protection, `SameSite=Lax` would provide an additional defense layer. However, `SameSite=None` may be needed for cross-origin OAuth flows.

**Assessment:** Acceptable if cross-origin OAuth is required. The state parameter provides the actual CSRF protection.

---

## 6. TOTP/2FA

### File: `api/src/routes/auth.rs`

### 🟢 F-21: TOTP Secret Properly Generated

**Severity:** 🟢 Low (Positive)

**Finding:** TOTP secrets use 20 random bytes (160 bits) via `OsRng`, base32-encoded. This meets RFC 4226 requirements.

### 🟡 F-22: TOTP Uses SHA1 Algorithm

**Severity:** 🟢 Low

**Finding:** TOTP is configured with `Algorithm::SHA1`. While SHA1 is the standard algorithm for TOTP (RFC 6238) and is compatible with all authenticator apps, SHA256/SHA512 provide stronger security. Most authenticator apps (Google Authenticator, Authy, etc.) only support SHA1.

**Assessment:** SHA1 is the correct choice for compatibility. No change needed.

### 🔴 F-23: No Backup/Recovery Codes for 2FA

**Severity:** 🔴 Critical

**Finding:** There are **no backup codes** generated when 2FA is enabled. If a user loses their authenticator device, they are **permanently locked out** with no recovery path. The only option is admin intervention or account deletion.

**Fix:** Generate backup codes when 2FA is confirmed:
```rust
async fn confirm_2fa(
    // ... existing params ...
) -> Result<Json<serde_json::Value>, AppError> {
    // ... existing verification ...

    // Generate 10 backup codes
    let backup_codes: Vec<String> = (0..10)
        .map(|_| {
            let mut bytes = [0u8; 4];
            rand::rngs::OsRng.fill_bytes(&mut bytes);
            format!("{:08x}", u32::from_be_bytes(bytes))
        })
        .collect();

    // Store hashed backup codes
    for code in &backup_codes {
        let hash = jwt::hash_token(code);
        sqlx::query(
            "INSERT INTO backup_codes (customer_id, code_hash, used) VALUES ($1, $2, false)"
        )
        .bind(customer.id)
        .bind(&hash)
        .execute(&mut *tx)
        .await?;
    }

    sqlx::query("UPDATE customers SET totp_enabled = true WHERE id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    Ok(Json(serde_json::json!({
        "message": "2FA enabled. Save these backup codes — they won't be shown again.",
        "backup_codes": backup_codes,
    })))
}
```

Also add a `/2fa/backup-verify` endpoint and a `/2fa/regenerate-codes` endpoint.

### 🟢 F-24: TOTP Time Drift Handling

**Severity:** 🟢 Low (Positive)

**Finding:** `totp.check_current()` with `skew: 1` (the default in the TOTP constructor) allows ±1 time step (±30 seconds) of drift. This handles minor clock differences between the server and authenticator device.

---

## 7. API Key Security

### Files: `api/src/middleware/mod.rs`, `api/src/routes/api_keys.rs`

### 🟢 F-25: API Keys Properly Generated and Hashed

**Severity:** 🟢 Low (Positive)

**Finding:**
- Generated with 32 random bytes via `OsRng` (256 bits of entropy) ✅
- Hashed with Argon2id before storage ✅
- 15-character prefix for database lookup ✅
- Keys shown only once at creation ✅
- Rotation supported ✅
- Test/live key distinction (`hr_test_`/`hr_live_`) ✅

### 🟢 F-26: API Key Verification Uses Argon2id (Positive)

**Finding:** API keys are verified using `Argon2::default().verify_password()`, which is constant-time. The same Argon2 parameter concern from F-01 applies, but since API keys have 256 bits of entropy, brute-force resistance is less critical than for passwords.

---

## 8. Cookie Security

### File: `api/src/middleware/mod.rs`

### 🟡 F-27: Auth Cookies Use SameSite=None

**Severity:** 🟡 Medium

**Finding:** Both auth and refresh token cookies use `SameSite=None; Secure`. This is required for cross-origin API access (dashboard on Vercel, API on Cloud Run), but it means cookies are sent with all cross-site requests, increasing CSRF risk.

**Mitigations already in place:**
- Cookies are `HttpOnly` (no JavaScript access) ✅
- Cookies are `Secure` (HTTPS only) ✅
- State-changing operations require authentication ✅

**Additional recommendation:** Consider implementing CSRF tokens for state-changing operations if SameSite=None is required, or migrate to a SameSite=Lax + Bearer token architecture.

---

## 9. Secret Management

### File: `api/src/config.rs`

### 🟢 F-28: Debug Output Properly Redacts Secrets

**Severity:** 🟢 Low (Positive)

**Finding:** `Config::Debug` implementation redacts all sensitive fields with `[REDACTED]`. This prevents accidental secret leakage in logs.

### 🟢 F-29: Production Secret Validation

**Severity:** 🟢 Low (Positive)

**Finding:** Production mode validates that `HMAC_SECRET` and `JWT_SECRET` are ≥32 characters and don't contain common placeholder patterns (`change`, `test`, `example`, `dummy`, etc.).

### 🟡 F-30: Dev Mode Uses Random Secrets That Change on Restart

**Severity:** 🟢 Low

**Finding:** In development, if `HMAC_SECRET`/`JWT_SECRET` are not set, random UUIDs are generated. This means secrets change on restart, invalidating all existing tokens. This is fine for dev but could cause confusion.

---

## 10. Miscellaneous

### 🟢 F-31: Rate Limiting on Auth Endpoints

**Severity:** 🟢 Low (Positive)

**Finding:** All auth endpoints have rate limiting:
- Login: 10 attempts/IP/15min
- Registration: 5 attempts/IP/hour
- Password reset: 5 attempts/IP/hour
- Verification resend: 5 attempts/IP/hour

### 🟢 F-32: Email Enumeration Prevention

**Severity:** 🟢 Low (Positive)

**Finding:** Password reset and email verification resend endpoints return the same response regardless of whether the email exists, preventing user enumeration.

### 🟢 F-33: Password Reset Token Single-Use

**Severity:** 🟢 Low (Positive)

**Finding:** Reset tokens are marked as `used` after successful password reset, preventing replay. All refresh tokens are also revoked on password reset.

---

## Summary Table

| ID | Finding | Severity | Category |
|----|---------|----------|----------|
| F-01 | Argon2id parameters below OWASP recommendations | 🟡 Medium | Password Hashing |
| F-02 | Password minimum 8 chars (should be 12+) | 🟢 Low | Password Policy |
| F-04 | JWT uses HS256 (symmetric) | 🟡 Medium | JWT |
| F-06 | Access tokens cannot be revoked | 🟡 Medium | JWT |
| F-12 | Endpoint signing secrets use UUID, not crypto random | 🟡 Medium | Webhook Signing |
| F-15 | ENCRYPTION_KEY not validated at startup | 🟡 Medium | Encryption |
| F-18 | No PKCE for OAuth | 🟡 Medium | OAuth |
| F-23 | **No backup/recovery codes for 2FA** | 🔴 **Critical** | 2FA |
| F-27 | Auth cookies SameSite=None | 🟡 Medium | Cookies |

**Positive findings (no action needed):** F-03, F-05, F-07, F-08, F-09, F-10, F-11, F-13, F-14, F-16, F-17, F-19, F-20, F-21, F-22, F-24, F-25, F-26, F-28, F-29, F-30, F-31, F-32, F-33

---

## Priority Action Items

1. **🔴 Critical — F-23:** Implement 2FA backup codes immediately. Users without recovery codes will be permanently locked out if they lose their authenticator.

2. **🟡 Medium — F-01:** Increase Argon2id memory to ≥19 MiB (ideally 45 MiB). Benchmark on production hardware first.

3. **🟡 Medium — F-15:** Add `ENCRYPTION_KEY` validation to production startup checks.

4. **🟡 Medium — F-12:** Use `OsRng` for endpoint signing secrets instead of UUID.

5. **🟡 Medium — F-18:** Add PKCE to OAuth flows (both Google and GitHub).

6. **🟡 Medium — F-27:** Evaluate whether SameSite=None is truly required; consider SameSite=Lax + Bearer token migration.
