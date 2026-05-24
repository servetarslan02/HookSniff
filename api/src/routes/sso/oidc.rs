//! OIDC Token Decoding & JWT Verification
//!
//! Helpers for decoding OIDC ID tokens and verifying JWT signatures
//! against JWKS public keys.

use chrono::Utc;
use crate::error::ErrorCode;
use crate::error::AppError;

// ── Decode OIDC ID Token ────────────────────────────────────

pub fn decode_oidc_id_token(token: &str) -> Result<serde_json::Value, AppError> {
    // Split JWT into parts
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err(AppError::coded(ErrorCode::OidcInvalidTokenFormat));
    }

    // Decode header to get kid and alg
    use base64::Engine;
    let header_bytes = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(parts[0])
        .map_err(|_| AppError::coded(ErrorCode::OidcInvalidTokenHeader))?;
    let header: serde_json::Value = serde_json::from_slice(&header_bytes)
        .map_err(|_| AppError::coded(ErrorCode::OidcInvalidTokenHeader))?;

    let _kid = header.get("kid").and_then(|v| v.as_str()).unwrap_or("");
    let alg = header.get("alg").and_then(|v| v.as_str()).unwrap_or("RS256");

    // Decode payload (second part)
    let payload = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(parts[1])
        .map_err(|_| AppError::coded(ErrorCode::OidcInvalidTokenPayload))?;

    let claims: serde_json::Value = serde_json::from_slice(&payload)
        .map_err(|_| AppError::coded(ErrorCode::OidcInvalidTokenPayload))?;

    // Validate basic claims
    if let Some(exp) = claims.get("exp").and_then(|v| v.as_i64()) {
        if Utc::now().timestamp() > exp {
            return Err(AppError::coded(ErrorCode::OidcTokenExpired));
        }
    }

    // Signature verification note:
    // For RS256/RS384/RS512: verify against JWKS public key (done in oidc_callback with jwks_uri)
    // For ES256: verify against EC public key
    // For none/HS256 with shared secret: verify against client_secret
    //
    // The actual signature verification happens in the OIDC callback where we have access to JWKS URI.
    // This function only decodes and validates claims (exp, iat, etc).
    // Full JWKS verification is done before calling this function in oidc_callback.
    if alg == "none" {
        return Err(AppError::coded(ErrorCode::OidcAlgorithmNone));
    }

    Ok(claims)
}

// ── Verify JWT Signature against JWKS ───────────────────────

/// Verify JWT signature against JWKS public key
pub async fn verify_jwt_signature(
    token: &str,
    jwks_uri: &str,
) -> Result<(), AppError> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err(AppError::coded(ErrorCode::InvalidJwt));
    }

    // Decode header
    use base64::Engine;
    let header_bytes = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(parts[0])
        .map_err(|_| AppError::coded(ErrorCode::InvalidJwt))?;
    let header: serde_json::Value = serde_json::from_slice(&header_bytes)
        .map_err(|_| AppError::coded(ErrorCode::InvalidJwt))?;

    let kid = header.get("kid").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let alg = header.get("alg").and_then(|v| v.as_str()).unwrap_or("RS256").to_string();

    // Reject 'none' algorithm
    if alg == "none" {
        return Err(AppError::BadRequest("JWT algorithm 'none' is not allowed".into()));
    }

    // Fetch JWKS
    let http_client = crate::http_client::get_client().clone();
    let jwks: serde_json::Value = http_client
        .get(jwks_uri)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to fetch JWKS: {}", e)))?
        .json()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid JWKS response: {}", e)))?;

    // Find the key matching our kid
    let keys = jwks.get("keys")
        .and_then(|k| k.as_array())
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("No keys in JWKS")))?;

    let matching_key = keys.iter().find(|k| {
        k.get("kid").and_then(|v| v.as_str()).unwrap_or("") == kid
    }).or_else(|| keys.first()); // Fallback to first key if kid not found

    let jwk_value = matching_key.ok_or_else(|| AppError::BadRequest("No matching key found in JWKS".into()))?;

    // Use jsonwebtoken crate for verification
    let jwk: jsonwebtoken::jwk::Jwk = serde_json::from_value(jwk_value.clone())
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse JWK: {}", e)))?;
    let decoding_key = jsonwebtoken::DecodingKey::from_jwk(&jwk)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create DecodingKey from JWK: {}", e)))?;

    let algorithm = match alg.as_str() {
        "RS256" => jsonwebtoken::Algorithm::RS256,
        "RS384" => jsonwebtoken::Algorithm::RS384,
        "RS512" => jsonwebtoken::Algorithm::RS512,
        "ES256" => jsonwebtoken::Algorithm::ES256,
        "ES384" => jsonwebtoken::Algorithm::ES384,
        "PS256" => jsonwebtoken::Algorithm::PS256,
        "PS384" => jsonwebtoken::Algorithm::PS384,
        "PS512" => jsonwebtoken::Algorithm::PS512,
        _ => return Err(AppError::BadRequest(format!("Unsupported JWT algorithm: {}", alg))),
    };

    let mut validation = jsonwebtoken::Validation::new(algorithm);
    validation.validate_exp = true;
    validation.validate_nbf = false;
    // Don't validate audience/issuer here — they're checked separately

    let token_data = jsonwebtoken::decode::<serde_json::Value>(token, &decoding_key, &validation)
        .map_err(|e| {
            tracing::warn!("JWT signature verification failed: {}", e);
            AppError::BadRequest(format!("JWT signature verification failed: {}", e))
        })?;

    tracing::debug!("JWT signature verified successfully for kid={}", kid);
    let _ = token_data; // Claims available if needed

    Ok(())
}
