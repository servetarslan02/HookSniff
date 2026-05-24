use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::AppError;

// ── JWT Key Configuration ────────────────────────────────────
// Item 260: RS256 support. If RSA keys are configured (JWT_PRIVATE_KEY / JWT_PUBLIC_KEY),
// tokens are signed with RS256. Otherwise falls back to HS256 with JWT_SECRET.
//
// Key format: PEM-encoded RSA keys (set as env vars or Cloud Run secrets).
//   JWT_PRIVATE_KEY: -----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
//   JWT_PUBLIC_KEY:  -----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
//
// Backward compatibility: verify_token() tries RS256 first, falls back to HS256
// so existing HS256 tokens remain valid during migration.

/// Determine the signing algorithm based on available keys.
/// Returns (algorithm, encoding_key, decoding_key).
fn jwt_keys() -> Result<(Algorithm, EncodingKey, DecodingKey), AppError> {
    // Prefer RS256 if RSA keys are configured
    if let (Ok(private_key), Ok(public_key)) = (
        std::env::var("JWT_PRIVATE_KEY"),
        std::env::var("JWT_PUBLIC_KEY"),
    ) {
        if !private_key.is_empty() && !public_key.is_empty() {
            let enc_key = EncodingKey::from_rsa_pem(private_key.as_bytes())
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid JWT_PRIVATE_KEY: {}", e)))?;
            let dec_key = DecodingKey::from_rsa_pem(public_key.as_bytes())
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid JWT_PUBLIC_KEY: {}", e)))?;
            return Ok((Algorithm::RS256, enc_key, dec_key));
        }
    }

    // Fallback to HS256 with shared secret
    let secret = std::env::var("JWT_SECRET")
        .map_err(|_| AppError::Internal(anyhow::anyhow!("JWT_SECRET not set")))?;
    Ok((
        Algorithm::HS256,
        EncodingKey::from_secret(secret.as_bytes()),
        DecodingKey::from_secret(secret.as_bytes()),
    ))
}

/// Get just the decoding key + algorithm for verification (used by middleware).
/// Tries RS256 first, falls back to HS256.
fn verification_keys() -> Result<(Algorithm, DecodingKey), AppError> {
    if let Ok(public_key) = std::env::var("JWT_PUBLIC_KEY") {
        if !public_key.is_empty() {
            let dec_key = DecodingKey::from_rsa_pem(public_key.as_bytes())
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid JWT_PUBLIC_KEY: {}", e)))?;
            return Ok((Algorithm::RS256, dec_key));
        }
    }

    let secret = std::env::var("JWT_SECRET")
        .map_err(|_| AppError::Internal(anyhow::anyhow!("JWT_SECRET not set")))?;
    Ok((
        Algorithm::HS256,
        DecodingKey::from_secret(secret.as_bytes()),
    ))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid, // customer_id
    pub email: String,
    pub plan: String,
    pub exp: usize,
    /// HS-028: Server-side admin flag in JWT — enables admin authorization
    /// verification without DB lookup. Frontend can read this from the token,
    /// and the API middleware can verify it server-side.
    #[serde(default)]
    pub is_admin: bool,
    /// HS-261: JWT ID for token revocation support.
    /// Each access token gets a unique `jti` that can be blacklisted.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub jti: Option<String>,
    /// HS-261: Issued-at timestamp for revoke-all-tokens support.
    /// Tokens issued before a customer's revocation event are rejected.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub iat: Option<usize>,
}

/// Generate a long-lived JWT (24h) — used for legacy/backwards compatibility.
pub fn generate_token(
    customer_id: Uuid,
    email: &str,
    plan: &str,
    secret: &str,
) -> Result<String, AppError> {
    generate_token_with_duration(customer_id, email, plan, secret, Duration::hours(24), false)
}

/// Generate a long-lived JWT with admin claim.
pub fn generate_admin_token(
    customer_id: Uuid,
    email: &str,
    plan: &str,
    secret: &str,
) -> Result<String, AppError> {
    generate_token_with_duration(customer_id, email, plan, secret, Duration::hours(24), true)
}

/// Generate a short-lived JWT (15 min) — used with refresh token flow.
/// HS-039: Short lifetime + proactive refresh = secure + no session drops.
pub fn generate_access_token(
    customer_id: Uuid,
    email: &str,
    plan: &str,
    secret: &str,
    is_admin: bool,
) -> Result<String, AppError> {
    // 1 hour expiry — long enough to survive background tab throttling,
    // short enough to limit damage if token is leaked.
    // Proactive refresh still runs every 50 minutes for active sessions.
    generate_token_with_duration(customer_id, email, plan, secret, Duration::hours(1), is_admin)
}

pub fn generate_token_with_duration(
    customer_id: Uuid,
    email: &str,
    plan: &str,
    secret: &str,
    duration: Duration,
    is_admin: bool,
) -> Result<String, AppError> {
    let expiration = Utc::now()
        .checked_add_signed(duration)
        .expect("valid timestamp")
        .timestamp() as usize;

    let now = Utc::now().timestamp() as usize;
    let claims = Claims {
        sub: customer_id,
        email: email.to_string(),
        plan: plan.to_string(),
        exp: expiration,
        is_admin,
        // HS-261: Include jti and iat for token revocation support
        jti: Some(Uuid::new_v4().to_string()),
        iat: Some(now),
    };

    // Item 260: Use RS256 if RSA keys are configured, otherwise HS256
    let (algorithm, enc_key, _dec_key) = jwt_keys().unwrap_or_else(|_| {
        // Fallback: use the provided secret for HS256 (backward compat)
        (
            Algorithm::HS256,
            EncodingKey::from_secret(secret.as_bytes()),
            DecodingKey::from_secret(secret.as_bytes()),
        )
    });

    let mut header = Header::new(algorithm);
    // Set kid for RS256 key rotation support
    if algorithm == Algorithm::RS256 {
        header.kid = match std::env::var("JWT_KEY_ID") {
            Ok(kid) if !kid.is_empty() => Some(kid),
            _ => Some("hooksniff-1".into()),
        };
    }

    encode(&header, &claims, &enc_key)
        .map_err(|e| AppError::Internal(e.into()))
}

/// Check if an access token has been revoked (blacklisted).
/// Returns `Ok(true)` if revoked, `Ok(false)` if still valid, `Err` on DB error.
pub async fn is_token_revoked(pool: &sqlx::PgPool, jti: &str) -> Result<bool, AppError> {
    let exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS(SELECT 1 FROM revoked_tokens WHERE jti = $1)",
    )
    .bind(jti)
    .fetch_one(pool)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;
    Ok(exists.0)
}

/// Revoke an access token by its JTI.
/// The token's `exp` is stored so the blacklist entry can be cleaned up after expiry.
pub async fn revoke_token(pool: &sqlx::PgPool, jti: &str, exp: i64) -> Result<(), AppError> {
    sqlx::query(
        "INSERT INTO revoked_tokens (jti, expires_at) VALUES ($1, to_timestamp($2)) \
         ON CONFLICT (jti) DO NOTHING",
    )
    .bind(jti)
    .bind(exp)
    .execute(pool)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;
    Ok(())
}

/// Revoke all access tokens for a customer (e.g., on password change or account compromise).
pub async fn revoke_all_tokens_for_customer(
    pool: &sqlx::PgPool,
    customer_id: Uuid,
) -> Result<u64, AppError> {
    // We can't enumerate all JTIs, but we can record a "revoked_before" timestamp.
    // The middleware checks this and rejects tokens issued before the revocation time.
    let result = sqlx::query(
        "INSERT INTO token_revocation_events (customer_id, revoked_at) VALUES ($1, now()) \
         ON CONFLICT (customer_id) DO UPDATE SET revoked_at = now()",
    )
    .bind(customer_id)
    .execute(pool)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;
    Ok(result.rows_affected())
}

/// Generate a random token string (for reset/verification/refresh).
pub fn generate_random_token() -> String {
    use rand::TryRng;
    let mut bytes = [0u8; 32];
    rand::rngs::SysRng
        .try_fill_bytes(&mut bytes)
        .expect("SysRng fill failed");
    hex::encode(bytes)
}

/// SHA256 hash a token for storage.
pub fn hash_token(token: &str) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    // Item 260: Check token's algorithm header to prevent downgrade attacks.
    // If RS256 is configured and the token claims HS256, reject it immediately.
    // Only fall back to HS256 if RS256 is NOT configured.

    // Peek at the header to determine the token's algorithm
    let header = jsonwebtoken::decode_header(token)
        .map_err(|_| AppError::Unauthorized)?;

    if let Ok((rs256_alg, rs256_key)) = verification_keys() {
        if rs256_alg == Algorithm::RS256 {
            // RS256 is configured. Only accept RS256 tokens.
            if header.alg != Algorithm::RS256 {
                // Token claims HS256 but we have RS256 configured — reject (downgrade attack)
                return Err(AppError::Unauthorized);
            }
            let mut validation = Validation::new(Algorithm::RS256);
            validation.set_audience::<&str>(&[]); // No audience check
            return decode::<Claims>(token, &rs256_key, &validation)
                .map(|data| data.claims)
                .map_err(|_| AppError::Unauthorized);
        }
    }

    // RS256 not configured — verify with HS256
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| AppError::Unauthorized)
}

/// OWASP-recommended Argon2id parameters for password hashing.
/// - 46 MiB memory (47104 KiB, above the 19 MiB minimum)
/// - 3 iterations
/// - 1 degree of parallelism
///
/// Note: API key hashing uses Argon2::default() (19 MiB) since keys are high-entropy.
fn argon2_params() -> argon2::Params {
    argon2::Params::new(47_104, 3, 1, None).expect("valid Argon2id params")
}

/// Hash password using Argon2id with OWASP-recommended parameters.
/// This is CPU-intensive (~100ms) and MUST be called via spawn_blocking in async context.
pub fn hash_password(password: &str) -> Result<String, AppError> {
    use argon2::password_hash::rand_core::OsRng;
    use argon2::password_hash::SaltString;
    use argon2::{Argon2, PasswordHasher};

    let salt = SaltString::generate(&mut OsRng);
    let params = argon2_params();
    let argon2 = Argon2::new(argon2::Algorithm::Argon2id, argon2::Version::V0x13, params);
    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Password hashing failed: {}", e)))
}

/// Verify password against Argon2 hash.
/// This is CPU-intensive (~64ms) and MUST be called via spawn_blocking in async context.
pub fn verify_password(password: &str, hash: &str) -> Result<bool, AppError> {
    use argon2::password_hash::PasswordHash;
    use argon2::{Argon2, PasswordVerifier};

    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid hash: {}", e)))?;

    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

/// Async wrapper for hash_password — uses spawn_blocking to avoid starving the tokio runtime.
pub async fn hash_password_async(password: String) -> Result<String, AppError> {
    tokio::task::spawn_blocking(move || hash_password(&password))
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Task join error: {}", e)))?
}

/// Async wrapper for verify_password — uses spawn_blocking to avoid starving the tokio runtime.
pub async fn verify_password_async(password: String, hash: String) -> Result<bool, AppError> {
    tokio::task::spawn_blocking(move || verify_password(&password, &hash))
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Task join error: {}", e)))?
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── generate_token / verify_token ─────────────────────────

    #[test]
    fn test_token_roundtrip() {
        let secret = "test-secret-key";
        let id = Uuid::new_v4();
        let token = generate_token(id, "test@example.com", "pro", secret).unwrap();
        let claims = verify_token(&token, secret).unwrap();
        assert_eq!(claims.sub, id);
        assert_eq!(claims.email, "test@example.com");
        assert_eq!(claims.plan, "pro");
    }

    #[test]
    fn test_token_wrong_secret_fails() {
        let secret = "correct-secret";
        let token = generate_token(Uuid::new_v4(), "a@b.com", "developer", secret).unwrap();
        assert!(verify_token(&token, "wrong-secret").is_err());
    }

    #[test]
    fn test_token_invalid_string_fails() {
        assert!(verify_token("not-a-jwt", "secret").is_err());
    }

    #[test]
    fn test_token_empty_string_fails() {
        assert!(verify_token("", "secret").is_err());
    }

    // ── generate_access_token ─────────────────────────────────

    #[test]
    fn test_access_token_roundtrip() {
        let secret = "access-secret";
        let id = Uuid::new_v4();
        let token = generate_access_token(id, "user@test.com", "pro", secret, false).unwrap();
        let claims = verify_token(&token, secret).unwrap();
        assert_eq!(claims.sub, id);
        assert_eq!(claims.email, "user@test.com");
        assert_eq!(claims.plan, "pro");
    }

    #[test]
    fn test_access_token_has_short_expiry() {
        let secret = "secret";
        let before = Utc::now().timestamp() as usize;
        let token = generate_access_token(Uuid::new_v4(), "a@b.com", "developer", secret, false).unwrap();
        let claims = verify_token(&token, secret).unwrap();
        // 1 hour = 3600s, allow 5s tolerance
        assert!(claims.exp >= before + 3595);
        assert!(claims.exp <= before + 3605);
    }

    // ── generate_token_with_duration ──────────────────────────

    #[test]
    fn test_custom_duration_token() {
        let secret = "secret";
        let id = Uuid::new_v4();
        let token = generate_token_with_duration(id, "a@b.com", "developer", secret, Duration::hours(1), false)
            .unwrap();
        let claims = verify_token(&token, secret).unwrap();
        assert_eq!(claims.sub, id);
    }

    // ── generate_random_token ─────────────────────────────────

    #[test]
    fn test_random_token_is_hex_and_64_chars() {
        let token = generate_random_token();
        assert_eq!(token.len(), 64);
        assert!(token.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn test_random_tokens_are_unique() {
        let t1 = generate_random_token();
        let t2 = generate_random_token();
        assert_ne!(t1, t2);
    }

    // ── hash_token ────────────────────────────────────────────

    #[test]
    fn test_hash_token_deterministic() {
        let token = "my-secret-token";
        let h1 = hash_token(token);
        let h2 = hash_token(token);
        assert_eq!(h1, h2);
    }

    #[test]
    fn test_hash_token_different_inputs_different_hashes() {
        let h1 = hash_token("token-a");
        let h2 = hash_token("token-b");
        assert_ne!(h1, h2);
    }

    #[test]
    fn test_hash_token_is_64_hex_chars() {
        let hash = hash_token("anything");
        assert_eq!(hash.len(), 64);
        assert!(hash.chars().all(|c| c.is_ascii_hexdigit()));
    }

    // ── hash_password / verify_password ───────────────────────

    #[test]
    fn test_password_hashing() {
        let hash = hash_password("secure-password").unwrap();
        assert!(verify_password("secure-password", &hash).unwrap());
        assert!(!verify_password("wrong-password", &hash).unwrap());
    }

    #[test]
    fn test_password_hash_are_unique_per_call() {
        let h1 = hash_password("same-pass").unwrap();
        let h2 = hash_password("same-pass").unwrap();
        assert_ne!(h1, h2); // different salts
        assert!(verify_password("same-pass", &h1).unwrap());
        assert!(verify_password("same-pass", &h2).unwrap());
    }

    #[test]
    fn test_password_empty_string() {
        let hash = hash_password("").unwrap();
        assert!(verify_password("", &hash).unwrap());
        assert!(!verify_password("not-empty", &hash).unwrap());
    }

    #[test]
    fn test_password_unicode() {
        let pass = "şifre_土耳其_🔐";
        let hash = hash_password(pass).unwrap();
        assert!(verify_password(pass, &hash).unwrap());
    }

    #[test]
    fn test_password_long() {
        let pass = "a".repeat(10_000);
        let hash = hash_password(&pass).unwrap();
        assert!(verify_password(&pass, &hash).unwrap());
    }

    #[test]
    fn test_verify_password_invalid_hash_format() {
        assert!(verify_password("pass", "not-a-valid-argon2-hash").is_err());
    }

    // ── Claims serde ──────────────────────────────────────────

    #[test]
    fn test_claims_debug() {
        let claims = Claims {
            sub: Uuid::new_v4(),
            email: "test@test.com".into(),
            plan: "pro".into(),
            exp: 1234567890,
            is_admin: false,
            jti: None,
            iat: None,
        };
        let debug = format!("{:?}", claims);
        assert!(debug.contains("Claims"));
        assert!(debug.contains("test@test.com"));
    }

    // ── RS256 support (Item 260) ─────────────────────────────

    #[test]
    fn test_verify_token_hs256_still_works() {
        // Existing HS256 tokens must continue to verify
        let secret = "my-hs256-secret";
        let id = Uuid::new_v4();
        let token = generate_token(id, "legacy@test.com", "developer", secret).unwrap();
        let claims = verify_token(&token, secret).unwrap();
        assert_eq!(claims.sub, id);
        assert_eq!(claims.email, "legacy@test.com");
    }

    #[test]
    fn test_token_with_admin_claim() {
        let secret = "admin-test-secret";
        let id = Uuid::new_v4();
        let token = generate_admin_token(id, "admin@test.com", "enterprise", secret).unwrap();
        let claims = verify_token(&token, secret).unwrap();
        assert!(claims.is_admin);
        assert_eq!(claims.plan, "enterprise");
    }

    #[test]
    fn test_token_jti_is_unique() {
        let secret = "jti-test-secret";
        let id = Uuid::new_v4();
        let t1 = generate_token(id, "a@b.com", "developer", secret).unwrap();
        let t2 = generate_token(id, "a@b.com", "developer", secret).unwrap();
        let c1 = verify_token(&t1, secret).unwrap();
        let c2 = verify_token(&t2, secret).unwrap();
        assert_ne!(c1.jti, c2.jti, "Each token should have a unique jti");
    }

    #[test]
    fn test_verify_token_rejects_empty() {
        assert!(verify_token("", "secret").is_err());
    }

    #[test]
    fn test_verify_token_rejects_malformed() {
        assert!(verify_token("not.a.jwt", "secret").is_err());
    }
}
