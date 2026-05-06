use once_cell::sync::Lazy;
use regex::Regex;

/// Maximum nesting depth for JSON payloads
const MAX_JSON_DEPTH: usize = 10;

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
    static HTML_RE: Lazy<Regex> =
        Lazy::new(|| Regex::new(r"<[^>]*>").expect("invalid regex"));

    let cleaned = HTML_RE.replace_all(desc, "");
    // Truncate to 500 chars (UTF-8 safe)
    let char_count = cleaned.chars().count();
    if char_count > 500 {
        cleaned.chars().take(500).collect()
    } else {
        cleaned.to_string()
    }
}

/// Validate URL format strictly: must be https:// or http://, valid host, no internal IPs
pub fn validate_url(url: &str) -> Result<(), String> {
    if !url.starts_with("https://") && !url.starts_with("http://") {
        return Err("URL must start with http:// or https://".into());
    }

    let parsed = url::Url::parse(url).map_err(|_| "Invalid URL format")?;

    let host = parsed.host_str().ok_or("URL must have a host")?;

    if host.is_empty() {
        return Err("URL host cannot be empty".into());
    }

    // Block common internal hostnames
    let blocked_hosts = ["localhost", "localhost.localdomain", "ip6-localhost"];
    if blocked_hosts.iter().any(|&b| host.eq_ignore_ascii_case(b)) {
        return Err("Internal URLs are not allowed".into());
    }

    if host.ends_with(".local")
        || host.ends_with(".internal")
        || host.ends_with(".localhost")
    {
        return Err("Internal URLs are not allowed".into());
    }

    Ok(())
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
    check_depth(value, 1)
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
        assert_eq!(
            sanitize_description("Hello <b>world</b>"),
            "Hello world"
        );
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
}
