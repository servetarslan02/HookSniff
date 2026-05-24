use axum::http::HeaderMap;

use super::Provider;

// ── Signature Verification ──

pub fn verify_stripe(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("stripe-signature")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing stripe-signature header")?;

    // Parse: t=timestamp,v1=signature
    let mut timestamp = "";
    let mut signature = "";
    for part in sig_header.split(',') {
        if let Some(v) = part.strip_prefix("t=") {
            timestamp = v;
        } else if let Some(v) = part.strip_prefix("v1=") {
            signature = v;
        }
    }

    if timestamp.is_empty() || signature.is_empty() {
        return Err("Invalid stripe-signature format");
    }

    let payload = format!("{}.{}", timestamp, String::from_utf8_lossy(body));
    let expected = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());

    if constant_time_eq(&expected, signature) {
        Ok(())
    } else {
        Err("Stripe signature mismatch")
    }
}

pub fn verify_github(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("x-hub-signature-256")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-hub-signature-256 header")?;

    let signature = sig_header.strip_prefix("sha256=").ok_or("Invalid format")?;
    let expected = compute_hmac_hex(secret.as_bytes(), body);

    if constant_time_eq(&expected, signature) {
        Ok(())
    } else {
        Err("GitHub signature mismatch")
    }
}

pub fn verify_shopify(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("x-shopify-hmac-sha256")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-shopify-hmac-sha256 header")?;

    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
    let expected_bytes = compute_hmac_raw(secret.as_bytes(), body);
    let expected = BASE64.encode(&expected_bytes);

    if constant_time_eq(&expected, sig_header) {
        Ok(())
    } else {
        Err("Shopify signature mismatch")
    }
}

pub fn verify_generic(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    let sig_header = headers
        .get("x-hooksniff-signature")
        .and_then(|v| v.to_str().ok());

    let Some(sig) = sig_header else {
        // No signature header — reject if secret is configured
        if secret.is_empty() {
            return Err("No secret configured — cannot verify webhook authenticity");
        }
        return Err("No signature header found");
    };

    let signature = sig
        .strip_prefix("sha256=")
        .or_else(|| sig.strip_prefix("v1,"))
        .unwrap_or(sig);

    let expected = compute_hmac_hex(secret.as_bytes(), body);

    if constant_time_eq(&expected, signature) {
        Ok(())
    } else {
        Err("Signature mismatch")
    }
}

/// Slack webhook signature verification (v0).
/// Header: X-Slack-Signature: v0=<hex>
/// Payload: v0:<timestamp>:<body>
pub fn verify_slack(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("x-slack-signature")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-slack-signature header")?;

    let timestamp = headers
        .get("x-slack-request-timestamp")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-slack-request-timestamp header")?;

    let signature = sig_header.strip_prefix("v0=").ok_or("Invalid Slack signature format")?;

    let payload = format!("v0:{}:{}", timestamp, String::from_utf8_lossy(body));
    let expected = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());

    if constant_time_eq(&expected, signature) {
        Ok(())
    } else {
        Err("Slack signature mismatch")
    }
}

/// Twilio webhook signature verification.
/// Header: X-Twilio-Signature (Base64 of HMAC-SHA1)
/// Signed data: URL + sorted POST params
pub fn verify_twilio(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("x-twilio-signature")
        .or_else(|| headers.get("x-twilio-signature-env"))
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-twilio-signature header")?;

    // Twilio uses SHA1 for signature (not SHA256)
    use hmac::{Hmac, KeyInit, Mac};
    use sha1::Sha1;
    type HmacSha1 = Hmac<Sha1>;

    // Parse form body and build sorted signature base
    let body_str = String::from_utf8_lossy(body);
    let url = headers
        .get("x-forwarded-uri")
        .or_else(|| headers.get("x-original-uri"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    // Build signed data: URL + sorted params
    let mut params: Vec<(&str, &str)> = body_str
        .split('&')
        .filter_map(|pair| {
            let mut parts = pair.splitn(2, '=');
            Some((parts.next()?, parts.next().unwrap_or("")))
        })
        .collect();
    params.sort_by_key(|(k, _)| *k);

    let mut signed_data = url.to_string();
    for (k, v) in &params {
        signed_data.push_str(k);
        signed_data.push_str(v);
    }

    let mut mac =
        HmacSha1::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
    mac.update(signed_data.as_bytes());
    let expected_bytes = mac.finalize().into_bytes();

    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
    let expected = BASE64.encode(&expected_bytes);

    if constant_time_eq(&expected, sig_header) {
        Ok(())
    } else {
        Err("Twilio signature mismatch")
    }
}

/// Discord webhook signature verification (Ed25519).
/// Header: X-Signature-Ed25519 (hex), X-Signature-Timestamp
/// Signed data: timestamp + body
pub fn verify_discord(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let signature_hex = headers
        .get("x-signature-ed25519")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-signature-ed25519 header")?;

    let timestamp = headers
        .get("x-signature-timestamp")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-signature-timestamp header")?;

    // Discord uses Ed25519 — the "secret" is the hex-encoded public key
    // Parse public key from hex (32 bytes)
    let public_key_bytes = hex::decode(secret).map_err(|_| "Invalid Discord public key hex")?;
    if public_key_bytes.len() != 32 {
        return Err("Discord public key must be 32 bytes (64 hex chars)");
    }

    // Parse signature from hex (64 bytes)
    let signature_bytes = hex::decode(signature_hex).map_err(|_| "Invalid Discord signature hex")?;
    if signature_bytes.len() != 64 {
        return Err("Discord signature must be 64 bytes (128 hex chars)");
    }

    // Build signed message: timestamp + body
    let mut message = timestamp.as_bytes().to_vec();
    message.extend_from_slice(body);

    // Verify Ed25519 signature
    use ed25519_dalek::{Signature, Verifier, VerifyingKey};
    let verifying_key =
        VerifyingKey::from_bytes(&public_key_bytes.try_into().map_err(|_| "Invalid key length")?)
            .map_err(|_| "Invalid Discord public key")?;
    let signature = Signature::from_bytes(&signature_bytes.try_into().map_err(|_| "Invalid signature length")?);

    verifying_key
        .verify(&message, &signature)
        .map_err(|_| "Discord signature mismatch")
}

/// Linear webhook signature verification.
/// Header: Linear-Signature (hex HMAC-SHA256)
/// Signed data: raw body
pub fn verify_linear(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("linear-signature")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing linear-signature header")?;

    let expected = compute_hmac_hex(secret.as_bytes(), body);

    if constant_time_eq(&expected, sig_header) {
        Ok(())
    } else {
        Err("Linear signature mismatch")
    }
}

/// Notion webhook signature verification.
/// Header: X-Notion-Signature (hex HMAC-SHA256 with timestamp prefix)
/// Signed data: timestamp.body
pub fn verify_notion(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("x-notion-signature")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-notion-signature header")?;

    let timestamp = headers
        .get("x-notion-timestamp")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-notion-timestamp header")?;

    // Notion signature: HMAC-SHA256(secret, "timestamp.body")
    let payload = format!("{}.{}", timestamp, String::from_utf8_lossy(body));
    let expected = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());

    // Notion may prefix with sha256=
    let signature = sig_header
        .strip_prefix("sha256=")
        .unwrap_or(sig_header);

    if constant_time_eq(&expected, signature) {
        Ok(())
    } else {
        Err("Notion signature mismatch")
    }
}

fn compute_hmac_raw(key: &[u8], data: &[u8]) -> Vec<u8> {
    use hmac::{Hmac, KeyInit, Mac};
    use sha2::Sha256;
    type HmacSha256 = Hmac<Sha256>;

    let mut mac = HmacSha256::new_from_slice(key).expect("HMAC can take key of any size");
    mac.update(data);
    mac.finalize().into_bytes().to_vec()
}

fn compute_hmac_hex(key: &[u8], data: &[u8]) -> String {
    hex::encode(compute_hmac_raw(key, data))
}

/// Constant-time hex string comparison to prevent timing attacks.
fn constant_time_eq(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut diff = 0u8;
    for (x, y) in a.bytes().zip(b.bytes()) {
        diff |= x ^ y;
    }
    diff == 0
}

