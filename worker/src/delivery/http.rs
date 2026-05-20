//! HTTP webhook delivery — the original and default delivery method.
//!
//! Delivers events via HTTP POST with Standard Webhooks headers
//! (webhook-id, webhook-timestamp, webhook-signature) and HMAC-SHA256
//! signature. Falls back to legacy `X-HookSniff-Signature` header for
//! backward compatibility.

use anyhow::Result;
use reqwest::Client;
use tracing::{info, warn};

use hooksniff_common::signing;
use crate::WebhookMessage;

use super::DeliveryResult;

/// Maximum response body size to read (1 MB).
/// Prevents memory exhaustion from malicious or buggy endpoints returning huge responses.
const MAX_RESPONSE_BODY_BYTES: usize = 1_048_576;

/// Deliver a webhook via HTTP POST.
///
/// Generates a Standard Webhooks HMAC-SHA256 signature, attaches
/// standard headers (`webhook-id`, `webhook-timestamp`,
/// `webhook-signature`), and sends the request. Also attaches
/// legacy `X-HookSniff-Signature` for backward compatibility.
pub async fn deliver_http(
    http_client: &Client,
    webhook: &WebhookMessage,
    attempt: i32,
) -> Result<DeliveryResult> {
    let timestamp = chrono::Utc::now().timestamp().to_string();

    // Standard Webhooks signature: v1,<base64(hmac)>
    let standard_sig = signing::compute_standard_signature(
        &webhook.signing_secret,
        &webhook.delivery_id,
        &timestamp,
        &webhook.payload,
    );

    // Legacy hex signature for backward compat
    let legacy_sig = signing::compute_hmac(&webhook.signing_secret, &webhook.payload);

    let start = std::time::Instant::now();

    // HS-042: SSRF protection — resolve DNS and validate IP before delivery.
    // Prevents DNS rebinding attacks where a domain resolves to a public IP during
    // endpoint creation but to a private IP during actual delivery.
    if let Err(e) = validate_delivery_url(&webhook.endpoint_url).await {
        warn!("🚫 SSRF blocked delivery {} to {}: {}", webhook.delivery_id, webhook.endpoint_url, e);
        return Ok(DeliveryResult {
            success: false,
            status_code: 0,
            response_body: String::new(),
            response_headers: serde_json::json!({}),
            duration_ms: 0,
            error: format!("SSRF blocked: {}", e),
        });
    }

    let mut req_builder = http_client
        .post(&webhook.endpoint_url)
        .header("Content-Type", "application/json")
        // Standard Webhooks headers
        .header("webhook-id", &webhook.delivery_id)
        .header("webhook-timestamp", &timestamp)
        .header("webhook-signature", &standard_sig)
        // Legacy headers (backward compat)
        .header("X-HookSniff-Signature", format!("sha256={}", legacy_sig))
        .header("X-HookSniff-Delivery-Id", &webhook.delivery_id)
        .header("X-HookSniff-Attempt", attempt.to_string())
        .body(webhook.payload.clone());

    // Attach custom headers if configured
    // Item 343: Validate header names per RFC 7230 token rules
    if let Some(ref headers) = webhook.custom_headers {
        if let Some(obj) = headers.as_object() {
            for (key, value) in obj {
                if !is_valid_header_name(key) {
                    warn!(
                        "⚠️ Skipping invalid custom header name '{}' for delivery {}",
                        key, webhook.delivery_id
                    );
                    continue;
                }
                if let Some(val) = value.as_str() {
                    req_builder = req_builder.header(key.as_str(), val);
                }
            }
        }
    }

    let result = req_builder.send().await;
    let duration_ms = start.elapsed().as_millis() as i32;

    match result {
        Ok(mut response) => {
            let status_code = response.status().as_u16() as i32;
            let resp_headers: serde_json::Value = serde_json::json!(response
                .headers()
                .iter()
                .map(|(k, v)| (k.as_str().to_string(), v.to_str().unwrap_or("").to_string()))
                .collect::<std::collections::HashMap<String, String>>());

            // Read only first chunk of response body (faster than reading full body)
            // Most webhook endpoints return small JSON, but some return huge payloads
            let body = match response.chunk().await {
                Ok(Some(chunk)) => {
                    let bytes = if chunk.len() > MAX_RESPONSE_BODY_BYTES {
                        &chunk[..MAX_RESPONSE_BODY_BYTES]
                    } else {
                        &chunk
                    };
                    String::from_utf8_lossy(bytes).to_string()
                }
                Ok(None) => String::new(),
                Err(e) => format!("[Failed to read body: {}]", e),
            };
            let response_body = truncate_str(&body, 1000);
            let success = (200..300).contains(&status_code);

            if success {
                info!("✅ HTTP delivery {} succeeded", webhook.delivery_id);
            } else {
                warn!(
                    "⚠️ HTTP delivery {} got status {}",
                    webhook.delivery_id, status_code
                );
            }

            Ok(DeliveryResult {
                success,
                status_code,
                response_body,
                response_headers: resp_headers,
                duration_ms,
                error: String::new(),
            })
        }
        Err(e) => {
            warn!("❌ HTTP delivery {} failed: {:?}", webhook.delivery_id, e);
            Ok(DeliveryResult {
                success: false,
                status_code: 0,
                response_body: String::new(),
                response_headers: serde_json::json!({}),
                duration_ms,
                error: e.to_string(),
            })
        }
    }
}

pub fn truncate_str(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        let mut end = max_len;
        while end > 0 && !s.is_char_boundary(end) {
            end -= 1;
        }
        format!("{}...", &s[..end])
    }
}

/// Item 343: Validate HTTP header name per RFC 7230, Section 3.2.6.
///
/// Delegates to common::header_validation to avoid duplication with api.
fn is_valid_header_name(name: &str) -> bool {
    hooksniff_common::header_validation::is_valid_header_name(name)
}

/// SSRF protection for webhook delivery.
/// Resolves DNS and validates that the target IP is not private/internal.
/// Prevents DNS rebinding attacks.
async fn validate_delivery_url(url: &str) -> Result<(), String> {
    use std::net::IpAddr;

    // Normalize to lowercase to prevent scheme bypass (e.g. HTTP://)
    let url_lower = url.to_lowercase();

    // Simple URL parsing without `url` crate
    let rest = if let Some(r) = url_lower.strip_prefix("https://") {
        r
    } else if let Some(r) = url_lower.strip_prefix("http://") {
        r
    } else {
        return Err("URL scheme must be http or https".into());
    };

    // Extract host — handle userinfo (@), port (:), IPv6 brackets ([)
    let host_str = if rest.starts_with('[') {
        // IPv6: extract until closing bracket
        match rest.find(']') {
            Some(end) => &rest[1..end],
            None => return Err("Invalid IPv6 URL: missing closing bracket".into()),
        }
    } else {
        // IPv4/hostname: strip userinfo (user@host), then port (:port)
        let without_at = rest.split('@').next_back().unwrap_or(rest);
        let host_end = without_at.find(['/', ':', '?', '#'])
            .unwrap_or(without_at.len());
        &without_at[..host_end]
    };

    if host_str.is_empty() {
        return Err("No host in URL".into());
    }

    // Block localhost
    if host_str == "localhost" || host_str == "0.0.0.0" || host_str == "[::1]" || host_str == "::1" {
        return Err("Blocked localhost/loopback".into());
    }

    // Block metadata endpoints
    for metadata_host in &["metadata.google.internal", "metadata.goog"] {
        if host_str == *metadata_host || host_str.ends_with(&format!(".{}", metadata_host)) {
            return Err(format!("Blocked metadata endpoint: {}", host_str));
        }
    }

    // If it's a direct IP, validate it
    if let Ok(ip) = host_str.parse::<IpAddr>() {
        return check_ip_not_private(ip);
    }

    // Block hex/octal/decimal IP representations that bypass parse::<IpAddr>
    // These would go to DNS which might resolve to private IPs
    if host_str.starts_with("0x") || host_str.starts_with("0X") {
        return Err(format!("Blocked hex IP representation: {}", host_str));
    }
    // Pure numeric (decimal IP like 2130706433)
    if host_str.chars().all(|c| c.is_ascii_digit()) && host_str.len() > 9 {
        return Err(format!("Blocked decimal IP representation: {}", host_str));
    }

    // DNS resolution and IP validation (async via tokio)
    let addrs: Vec<IpAddr> = tokio::net::lookup_host((host_str, 0))
        .await
        .map_err(|_| format!("DNS resolution failed: {}", host_str))?
        .map(|addr| addr.ip())
        .collect();

    if addrs.is_empty() {
        return Err(format!("DNS resolution returned no addresses: {}", host_str));
    }

    for ip in &addrs {
        check_ip_not_private(*ip)?;
    }

    Ok(())
}

/// Check that an IP is not private/internal/loopback.
fn check_ip_not_private(ip: std::net::IpAddr) -> Result<(), String> {
    match ip {
        std::net::IpAddr::V4(v4) => {
            if v4.is_loopback() || v4.is_unspecified() {
                return Err(format!("Blocked loopback IP: {}", ip));
            }
            if v4.octets()[0] == 10 {
                return Err(format!("Blocked private IP: {}", ip));
            }
            if v4.octets()[0] == 172 && (v4.octets()[1] & 0xF0) == 16 {
                return Err(format!("Blocked private IP: {}", ip));
            }
            if v4.octets()[0] == 192 && v4.octets()[1] == 168 {
                return Err(format!("Blocked private IP: {}", ip));
            }
            if v4.octets()[0] == 169 && v4.octets()[1] == 254 {
                return Err(format!("Blocked link-local IP: {}", ip));
            }
            // Metadata IP
            if v4.to_string() == "169.254.169.254" {
                return Err(format!("Blocked metadata IP: {}", ip));
            }
        }
        std::net::IpAddr::V6(v6) => {
            if v6.is_loopback() || v6.is_unspecified() {
                return Err(format!("Blocked loopback IP: {}", ip));
            }
            // Link-local: fe80::/10
            if (v6.segments()[0] & 0xFFC0) == 0xFE80 {
                return Err(format!("Blocked link-local IP: {}", ip));
            }
            // Unique local: fc00::/7
            if (v6.segments()[0] & 0xFE00) == 0xFC00 {
                return Err(format!("Blocked unique-local IP: {}", ip));
            }
            // IPv4-mapped IPv6: ::ffff:0:0/96 (e.g. ::ffff:127.0.0.1)
            if v6.segments()[0] == 0
                && v6.segments()[1] == 0
                && v6.segments()[2] == 0
                && v6.segments()[3] == 0
                && v6.segments()[4] == 0
                && v6.segments()[5] == 0xffff
            {
                // Extract embedded IPv4 and validate it
                let embedded_v4 = std::net::Ipv4Addr::new(
                    (v6.segments()[6] >> 8) as u8,
                    (v6.segments()[6] & 0xff) as u8,
                    (v6.segments()[7] >> 8) as u8,
                    (v6.segments()[7] & 0xff) as u8,
                );
                return check_ip_not_private(std::net::IpAddr::V4(embedded_v4));
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── truncate_str ──────────────────────────────────────────

    #[test]
    fn truncate_short_string_unchanged() {
        assert_eq!(truncate_str("hello", 10), "hello");
    }

    #[test]
    fn truncate_exact_length_unchanged() {
        assert_eq!(truncate_str("hello", 5), "hello");
    }

    #[test]
    fn truncate_long_string_adds_ellipsis() {
        assert_eq!(truncate_str("hello world", 5), "hello...");
    }

    #[test]
    fn truncate_empty_string() {
        assert_eq!(truncate_str("", 10), "");
    }

    #[test]
    fn truncate_zero_max_len() {
        assert_eq!(truncate_str("hello", 0), "...");
    }

    #[test]
    fn truncate_utf8_multibyte_chars() {
        // Turkish: "merhaba" (7 bytes), emoji: "🪝" (4 bytes)
        let s = "merhaba dünya 🪝";
        let result = truncate_str(s, 10);
        // Should not panic on char boundary
        assert!(result.ends_with("..."));
        assert!(result.len() <= 13); // 10 + "..."
    }

    #[test]
    fn truncate_unicode_emoji() {
        let s = "🪝🪝🪝🪝🪝";
        let result = truncate_str(s, 8);
        // Each emoji is 4 bytes, so 8 bytes = 2 emojis
        assert!(result.ends_with("..."));
    }

    #[test]
    fn truncate_one_byte_over() {
        assert_eq!(truncate_str("abcdef", 5), "abcde...");
    }

    #[test]
    fn truncate_preserves_utf8_validity() {
        let s = "ğüşöçı"; // Turkish chars, 2 bytes each
        let result = truncate_str(s, 3);
        // Should be valid UTF-8
        assert!(std::str::from_utf8(result.as_bytes()).is_ok());
    }

    // ── is_valid_header_name (Item 343) ─────────────────────

    #[test]
    fn test_valid_header_names() {
        assert!(is_valid_header_name("X-Custom-Header"));
        assert!(is_valid_header_name("Content-Type"));
        assert!(is_valid_header_name("Authorization"));
        assert!(is_valid_header_name("X-Request-Id"));
        assert!(is_valid_header_name("X")); // single char
        assert!(is_valid_header_name("x")); // lowercase
        assert!(is_valid_header_name("X-Custom_Header.Test"));
        assert!(is_valid_header_name("Accept"));
        assert!(is_valid_header_name("X-Api-Key"));
    }

    #[test]
    fn test_invalid_header_names() {
        assert!(!is_valid_header_name("")); // empty
        assert!(!is_valid_header_name("Content-Type: value")); // colon
        assert!(!is_valid_header_name("Header with space")); // space
        assert!(!is_valid_header_name("Header\tTab")); // tab
        assert!(!is_valid_header_name("Header\nNewline")); // newline
        assert!(!is_valid_header_name("Header\rCarriage")); // carriage return
        assert!(!is_valid_header_name("X-Header(value)")); // parens
        assert!(!is_valid_header_name("X-Header<angle>")); // angle brackets
        assert!(!is_valid_header_name("X-Header@at")); // @
        assert!(!is_valid_header_name("X-Header,comma")); // comma
        assert!(!is_valid_header_name("X-Header;semi")); // semicolon
        assert!(!is_valid_header_name("X-Header\"quote")); // double quote
        assert!(!is_valid_header_name("X-Header/slash")); // slash
        assert!(!is_valid_header_name("X-Header[bracket]")); // brackets
        assert!(!is_valid_header_name("X-Header?query")); // question mark
        assert!(!is_valid_header_name("X-Header=equals")); // equals
        assert!(!is_valid_header_name("X-Header{brace}")); // braces
    }

    #[test]
    fn test_header_name_edge_cases() {
        // All valid special chars
        assert!(is_valid_header_name("!#$%&'*+-.^_`|~"));
        // Digits
        assert!(is_valid_header_name("X-123"));
        // Mixed
        assert!(is_valid_header_name("X-Custom-Header-2024_v1"));
    }
}
