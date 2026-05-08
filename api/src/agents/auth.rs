use axum::{
    body::Body,
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
    Extension,
};
use sqlx::PgPool;
use uuid::Uuid;

use super::models::Agent;

/// Agent API key dogrulama middleware
/// Header: X-Agent-Key: pub_agent_xxxx
pub async fn agent_auth_middleware(
    Extension(pool): Extension<PgPool>,
    mut req: Request<Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    let agent_key = req
        .headers()
        .get("X-Agent-Key")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let agent_key = match agent_key {
        Some(k) => k,
        None => return Err(StatusCode::UNAUTHORIZED),
    };

    // Agent key prefix kontrolu
    if !is_valid_agent_key_format(&agent_key) {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // DB'den agent bul
    let agent = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE agent_key = $1 AND status = 'active'",
    )
    .bind(&agent_key)
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let agent = match agent {
        Some(a) => a,
        None => return Err(StatusCode::UNAUTHORIZED),
    };

    // last_seen_at guncelle
    let _ = sqlx::query("UPDATE agents SET last_seen_at = now() WHERE id = $1")
        .bind(agent.id)
        .execute(&pool)
        .await;

    // Agent'i request'e ekle
    req.extensions_mut().insert(agent);
    Ok(next.run(req).await)
}

/// Agent key format dogrulama
/// Format: pub_agent_<32 hex char> (toplam 42 karakter)
pub fn is_valid_agent_key_format(key: &str) -> bool {
    if !key.starts_with("pub_agent_") {
        return false;
    }
    let suffix = &key[10..];
    if suffix.len() != 32 {
        return false;
    }
    suffix.chars().all(|c| c.is_ascii_hexdigit())
}

/// Agent key uret: pub_agent_<32 hex char>
pub fn generate_agent_key() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let bytes: Vec<u8> = (0..16).map(|_| rng.gen()).collect();
    format!("pub_agent_{}", hex::encode(bytes))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_agent_key_format() {
        let key = generate_agent_key();
        assert!(key.starts_with("pub_agent_"), "Key pub_agent_ ile baslamali");
        assert_eq!(key.len(), 42, "Key 42 karakter olmali (10 prefix + 32 hex)");
    }

    #[test]
    fn test_generate_agent_key_unique() {
        let key1 = generate_agent_key();
        let key2 = generate_agent_key();
        assert_ne!(key1, key2, "Her key benzersiz olmali");
    }

    #[test]
    fn test_generate_agent_key_hex_suffix() {
        let key = generate_agent_key();
        let suffix = &key[10..];
        assert!(
            suffix.chars().all(|c| c.is_ascii_hexdigit()),
            "Suffix sadece hex karakterler icermeli"
        );
    }

    #[test]
    fn test_generate_agent_key_100_uniqueness() {
        let mut keys = std::collections::HashSet::new();
        for _ in 0..100 {
            let key = generate_agent_key();
            assert!(keys.insert(key.clone()), "Cakisan key: {}", key);
        }
        assert_eq!(keys.len(), 100);
    }

    #[test]
    fn test_is_valid_agent_key_format_valid() {
        assert!(is_valid_agent_key_format("pub_agent_0123456789abcdef0123456789abcdef"));
        assert!(is_valid_agent_key_format("pub_agent_abcdef1234567890abcdef1234567890"));
    }

    #[test]
    fn test_is_valid_agent_key_format_invalid() {
        // Yanlis prefix
        assert!(!is_valid_agent_key_format("hr_live_0123456789abcdef0123456789abcdef"));

        // Bos
        assert!(!is_valid_agent_key_format(""));

        // Sadece prefix
        assert!(!is_valid_agent_key_format("pub_agent_"));

        // Kisa suffix
        assert!(!is_valid_agent_key_format("pub_agent_012345"));

        // Uzun suffix
        assert!(!is_valid_agent_key_format("pub_agent_0123456789abcdef0123456789abcdef00"));

        // Hex olmayan karakter
        assert!(!is_valid_agent_key_format("pub_agent_0123456789abcdef0123456789abcdeg"));

        // Bosluk iceriyor
        assert!(!is_valid_agent_key_format("pub_agent_0123456789abcdef 123456789abcde"));
    }

    #[test]
    fn test_is_valid_agent_key_format_generated_keys() {
        // Uretilen tum key'ler gecerli olmali
        for _ in 0..50 {
            let key = generate_agent_key();
            assert!(
                is_valid_agent_key_format(&key),
                "Uretilen key gecersiz: {}",
                key
            );
        }
    }
}
