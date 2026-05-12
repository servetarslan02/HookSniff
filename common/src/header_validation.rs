/// HTTP header name validation per RFC 7230, Section 3.2.6.
///
/// Header field names must be tokens: ASCII letters, digits, and
/// `!#$%&'*+-.^_` ` ` |~`. No whitespace, colons, or control chars.
///
/// Shared between api and worker to avoid duplication (Item 343).

/// Validate HTTP header name per RFC 7230 token rules.
/// Returns Ok(()) if valid, Err with message if invalid.
pub fn validate_header_name(name: &str) -> Result<(), String> {
    if name.is_empty() {
        return Err("Header name must not be empty".into());
    }
    if !is_valid_header_name(name) {
        return Err(format!(
            "Header name '{}' contains invalid characters (RFC 7230)",
            name
        ));
    }
    Ok(())
}

/// Check if a string is a valid HTTP header name per RFC 7230.
///
/// Returns true if the name consists only of valid token characters.
pub fn is_valid_header_name(name: &str) -> bool {
    if name.is_empty() {
        return false;
    }
    name.bytes().all(|b| {
        matches!(
            b,
            b'A'..=b'Z'
                | b'a'..=b'z'
                | b'0'..=b'9'
                | b'!' | b'#' | b'$' | b'%' | b'&'
                | b'\'' | b'*' | b'+' | b'-' | b'.'
                | b'^' | b'_' | b'`' | b'|' | b'~'
        )
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_header_names() {
        assert!(is_valid_header_name("X-Custom-Header"));
        assert!(is_valid_header_name("Content-Type"));
        assert!(is_valid_header_name("Authorization"));
        assert!(is_valid_header_name("X-Request-Id"));
        assert!(is_valid_header_name("X"));
        assert!(is_valid_header_name("!#$%&'*+-.^_`|~"));
        assert!(is_valid_header_name("X-123"));
    }

    #[test]
    fn test_invalid_header_names() {
        assert!(!is_valid_header_name(""));
        assert!(!is_valid_header_name("Header:Value"));
        assert!(!is_valid_header_name("Header With Space"));
        assert!(!is_valid_header_name("Header\tTab"));
        assert!(!is_valid_header_name("Header\nNewline"));
        assert!(!is_valid_header_name("Header\rCarriage"));
        assert!(!is_valid_header_name("X-Header(value)"));
        assert!(!is_valid_header_name("X-Header<angle>"));
        assert!(!is_valid_header_name("X-Header@at"));
        assert!(!is_valid_header_name("X-Header,comma"));
        assert!(!is_valid_header_name("X-Header;semi"));
        assert!(!is_valid_header_name("X-Header\"quote"));
        assert!(!is_valid_header_name("X-Header/slash"));
        assert!(!is_valid_header_name("X-Header[bracket]"));
        assert!(!is_valid_header_name("X-Header?query"));
        assert!(!is_valid_header_name("X-Header=equals"));
        assert!(!is_valid_header_name("X-Header{brace}"));
    }

    #[test]
    fn test_validate_header_name_ok() {
        assert!(validate_header_name("Content-Type").is_ok());
    }

    #[test]
    fn test_validate_header_name_err() {
        assert!(validate_header_name("").is_err());
        assert!(validate_header_name("Bad Name").is_err());
    }
}
