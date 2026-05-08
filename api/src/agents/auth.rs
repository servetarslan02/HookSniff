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
    if !agent_key.starts_with("pub_agent_") {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // DB'den agent bul
    let agent = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE agent_key = $1 AND status = 'active'"
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

/// Agent key uret: pub_agent_<32 hex char>
pub fn generate_agent_key() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let bytes: Vec<u8> = (0..16).map(|_| rng.gen()).collect();
    format!("pub_agent_{}", hex::encode(bytes))
}
