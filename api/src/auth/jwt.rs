use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::AppError;

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
pub fn generate_access_token(
    customer_id: Uuid,
    email: &str,
    plan: &str,
    secret: &str,
    is_admin: bool,
) -> Result<String, AppError> {
    generate_token_with_duration(customer_id, email, plan, secret, Duration::minutes(15), is_admin)
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

    let claims = Claims {
        sub: customer_id,
        email: email.to_string(),
        plan: plan.to_string(),
        exp: expiration,
        is_admin,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(e.into()))
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
        let token = generate_token(Uuid::new_v4(), "a@b.com", "free", secret).unwrap();
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
        let token = generate_access_token(Uuid::new_v4(), "a@b.com", "free", secret, false).unwrap();
        let claims = verify_token(&token, secret).unwrap();
        // 15 min = 900s, allow 5s tolerance
        assert!(claims.exp >= before + 895);
        assert!(claims.exp <= before + 905);
    }

    // ── generate_token_with_duration ──────────────────────────

    #[test]
    fn test_custom_duration_token() {
        let secret = "secret";
        let id = Uuid::new_v4();
        let token = generate_token_with_duration(id, "a@b.com", "free", secret, Duration::hours(1), false)
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
        };
        let debug = format!("{:?}", claims);
        assert!(debug.contains("Claims"));
        assert!(debug.contains("test@test.com"));
    }
}
