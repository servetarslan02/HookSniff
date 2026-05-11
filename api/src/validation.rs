use once_cell::sync::Lazy;
use regex::Regex;

/// Maximum nesting depth for JSON payloads
const MAX_JSON_DEPTH: usize = 10;


/// Validate email format: must have exactly one @, non-empty local and domain parts,
/// domain must contain at least one dot, no spaces, reasonable length.
pub fn validate_email(email: &str) -> Result<(), String> {
    let email = email.trim();
    if email.is_empty() || email.len() > 254 {
        return Err("Email must be between 1 and 254 characters".into());
    }
    if email.contains(' ') || email.contains('\t') {
        return Err("Email must not contain whitespace".into());
    }
    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() != 2 {
        return Err("Email must contain exactly one @".into());
    }
    let (local, domain) = (parts[0], parts[1]);
    if local.is_empty() || local.len() > 64 {
        return Err("Email local part must be between 1 and 64 characters".into());
    }
    if domain.is_empty() || !domain.contains('.') {
        return Err("Email domain must contain at least one dot".into());
    }
    if domain.starts_with('.') || domain.ends_with('.') {
        return Err("Email domain must not start or end with a dot".into());
    }
    Ok(())
}

/// Validate event_type: alphanumeric + dots + underscores, max 100 chars
pub fn validate_event_type(event: &str) -> Result<(), String> {
    static RE: Lazy<Regex> =
        Lazy::new(|| Regex::new(r"^[a-zA-Z0-9._]{1,100}$").expect("invalid regex"));

    if !RE.is_match(event) {
        return Err(
            "event_type must be alphanumeric with dots/underscores, max 100 characters".into(),
        );
    }
    Ok(())
}

/// Validate description: max 500 chars, strip HTML tags
pub fn sanitize_description(desc: &str) -> String {
    // Strip HTML tags
    static HTML_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"<[^>]*>").expect("invalid regex"));

    let cleaned = HTML_RE.replace_all(desc, "");
    // Truncate to 500 chars (UTF-8 safe)
    let char_count = cleaned.chars().count();
    if char_count > 500 {
        cleaned.chars().take(500).collect()
    } else {
        cleaned.to_string()
    }
}

/// Validate URL format strictly: must be https:// or http://, valid host, no internal IPs.
/// Delegates to the comprehensive SSRF protection module.
pub fn validate_url(url: &str) -> Result<(), String> {
    crate::ssrf::validate_url(url).map_err(|e| e.to_string())
}

/// Validate JSON nesting depth. Returns error if depth exceeds MAX_JSON_DEPTH.
pub fn validate_json_depth(value: &serde_json::Value) -> Result<(), String> {
    fn check_depth(value: &serde_json::Value, current: usize) -> Result<(), String> {
        if current > MAX_JSON_DEPTH {
            return Err(format!(
                "JSON nesting depth exceeds maximum of {} levels",
                MAX_JSON_DEPTH
            ));
        }
        match value {
            serde_json::Value::Object(map) => {
                for v in map.values() {
                    check_depth(v, current + 1)?;
                }
            }
            serde_json::Value::Array(arr) => {
                for v in arr {
                    check_depth(v, current + 1)?;
                }
            }
            _ => {}
        }
        Ok(())
    }
    check_depth(value, 0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_event_type() {
        assert!(validate_event_type("order.created").is_ok());
        assert!(validate_event_type("payment_completed").is_ok());
        assert!(validate_event_type("a1b2c3").is_ok());
        assert!(validate_event_type("").is_err()); // empty
        assert!(validate_event_type("has space").is_err());
        assert!(validate_event_type("has-dash").is_err());
        assert!(validate_event_type(&"a".repeat(101)).is_err()); // too long
        assert!(validate_event_type(&"a".repeat(100)).is_ok());
    }

    #[test]
    fn test_sanitize_description() {
        assert_eq!(sanitize_description("Hello <b>world</b>"), "Hello world");
        assert_eq!(
            sanitize_description("<script>alert('xss')</script>Safe text"),
            "alert('xss')Safe text"
        );
        let long = "a".repeat(600);
        assert_eq!(sanitize_description(&long).len(), 500);
    }

    #[test]
    fn test_validate_url() {
        assert!(validate_url("https://example.com/webhook").is_ok());
        assert!(validate_url("http://example.com/webhook").is_ok());
        assert!(validate_url("ftp://example.com").is_err());
        assert!(validate_url("not-a-url").is_err());
        assert!(validate_url("http://localhost/test").is_err());
        assert!(validate_url("http://192.168.1.1/test").is_err());
    }

    #[test]
    fn test_validate_json_depth() {
        // Valid: shallow
        assert!(validate_json_depth(&serde_json::json!({"a": 1})).is_ok());

        // Valid: 10 levels deep
        let mut deep = serde_json::json!(1);
        for _ in 0..10 {
            deep = serde_json::json!({"inner": deep});
        }
        assert!(validate_json_depth(&deep).is_ok());

        // Invalid: 11 levels deep
        let mut too_deep = serde_json::json!(1);
        for _ in 0..11 {
            too_deep = serde_json::json!({"inner": too_deep});
        }
        assert!(validate_json_depth(&too_deep).is_err());
    }


    #[test]
    fn test_validate_email() {
        assert!(validate_email("user@example.com").is_ok());
        assert!(validate_email("test+tag@domain.co").is_ok());
        assert!(validate_email("").is_err()); // empty
        assert!(validate_email("no-at-sign").is_err());
        assert!(validate_email("@no-local").is_err());
        assert!(validate_email("no-domain@").is_err());
        assert!(validate_email("no@dotindomain").is_err());
        assert!(validate_email(" spaces@ex.com").is_err());
        assert!(validate_email("a@.starts-with-dot").is_err());
        assert!(validate_email("a@ends-with-dot.").is_err());
        assert!(validate_email(&format!("{}@example.com", "a".repeat(65))).is_err()); // local too long
    }

    // ── Additional edge cases ────────────────────────────────

    #[test]
    fn test_validate_event_type_underscore_ok() {
        assert!(validate_event_type("user_signed_up").is_ok());
        assert!(validate_event_type("a_b_c_d").is_ok());
    }

    #[test]
    fn test_validate_event_type_dot_ok() {
        assert!(validate_event_type("com.example.event").is_ok());
    }

    #[test]
    fn test_validate_event_type_special_chars_fail() {
        assert!(validate_event_type("event@type").is_err());
        assert!(validate_event_type("event#type").is_err());
        assert!(validate_event_type("event/type").is_err());
    }

    #[test]
    fn test_sanitize_description_empty() {
        assert_eq!(sanitize_description(""), "");
    }

    #[test]
    fn test_sanitize_description_no_html() {
        assert_eq!(sanitize_description("plain text"), "plain text");
    }

    #[test]
    fn test_sanitize_description_multiple_tags() {
        assert_eq!(
            sanitize_description("<b>bold</b> and <i>italic</i>"),
            "bold and italic"
        );
    }

    #[test]
    fn test_validate_url_empty() {
        assert!(validate_url("").is_err());
    }

    #[test]
    fn test_validate_url_with_port() {
        assert!(validate_url("https://example.com:8080/webhook").is_ok());
    }

    #[test]
    fn test_validate_json_depth_empty_object() {
        assert!(validate_json_depth(&serde_json::json!({})).is_ok());
    }

    #[test]
    fn test_validate_json_depth_array() {
        assert!(validate_json_depth(&serde_json::json!([1, 2, 3])).is_ok());
    }

    #[test]
    fn test_validate_json_depth_nested_array() {
        let val = serde_json::json!({"items": [1, {"nested": true}]});
        assert!(validate_json_depth(&val).is_ok());
    }
}
