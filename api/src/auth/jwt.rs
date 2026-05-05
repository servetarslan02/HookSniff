use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,        // customer_id
    pub email: String,
    pub plan: String,
    pub exp: usize,
}

pub fn generate_token(
    customer_id: Uuid,
    email: &str,
    plan: &str,
    secret: &str,
) -> Result<String, AppError> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: customer_id,
        email: email.to_string(),
        plan: plan.to_string(),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(e.into()))
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

/// Hash password using Argon2id
pub fn hash_password(password: &str) -> Result<String, AppError> {
    use argon2::password_hash::rand_core::OsRng;
    use argon2::password_hash::SaltString;
    use argon2::{Argon2, PasswordHasher};

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Password hashing failed: {}", e)))
}

/// Verify password against Argon2 hash
pub fn verify_password(password: &str, hash: &str) -> Result<bool, AppError> {
    use argon2::password_hash::PasswordHash;
    use argon2::{Argon2, PasswordVerifier};

    let parsed_hash =
        PasswordHash::new(hash).map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid hash: {}", e)))?;

    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

#[cfg(test)]
mod tests {
    use super::*;

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
    fn test_password_hashing() {
        let hash = hash_password("secure-password").unwrap();
        assert!(verify_password("secure-password", &hash).unwrap());
        assert!(!verify_password("wrong-password", &hash).unwrap());
    }
}
