//! Agent input validation

use crate::error::AppError;

/// Agent adini dogrula
pub fn validate_agent_name(name: &str) -> Result<(), AppError> {
    if name.is_empty() {
        return Err(AppError::BadRequest("Agent adi bos olamaz".to_string()));
    }
    if name.len() > 100 {
        return Err(AppError::BadRequest(
            "Agent adi 100 karakterden uzun olamaz".to_string(),
        ));
    }
    if name.chars().any(|c| c.is_control()) {
        return Err(AppError::BadRequest(
            "Agent adi kontrol karakteri iceremez".to_string(),
        ));
    }
    Ok(())
}

/// Opsiyonel agent adini dogrula (update icin)
pub fn validate_optional_agent_name(name: &Option<String>) -> Result<(), AppError> {
    if let Some(ref n) = name {
        validate_agent_name(n)?;
    }
    Ok(())
}

/// Event type dogrula
pub fn validate_event_type(event_type: &str) -> Result<(), AppError> {
    if event_type.is_empty() {
        return Err(AppError::BadRequest("Event type bos olamaz".to_string()));
    }
    if event_type.len() > 200 {
        return Err(AppError::BadRequest(
            "Event type 200 karakterden uzun olamaz".to_string(),
        ));
    }
    // Sadece harf, rakam, nokta, tire, alt tire
    if !event_type
        .chars()
        .all(|c| c.is_alphanumeric() || c == '.' || c == '-' || c == '_')
    {
        return Err(AppError::BadRequest(
            "Event type sadece harf, rakam, nokta, tire ve alt tire icerebilir".to_string(),
        ));
    }
    // Nokta ile başlayamaz veya bitemez
    if event_type.starts_with('.') || event_type.ends_with('.') {
        return Err(AppError::BadRequest(
            "Event type nokta ile baslayamaz veya bitemez".to_string(),
        ));
    }
    Ok(())
}

/// Payload boyut kontrolu
pub fn validate_payload(payload: &serde_json::Value) -> Result<(), AppError> {
    let size = serde_json::to_string(payload).map(|s| s.len()).unwrap_or(0);

    if size > 1_000_000 {
        return Err(AppError::BadRequest(
            "Payload 1MB'dan buyuk olamaz".to_string(),
        ));
    }
    Ok(())
}

/// Agent description dogrula
pub fn validate_description(desc: &str) -> Result<(), AppError> {
    if desc.len() > 500 {
        return Err(AppError::BadRequest(
            "Aciklama 500 karakterden uzun olamaz".to_string(),
        ));
    }
    Ok(())
}

/// Opsiyonel description dogrula (update icin)
pub fn validate_optional_description(desc: &Option<String>) -> Result<(), AppError> {
    if let Some(ref d) = desc {
        validate_description(d)?;
    }
    Ok(())
}

/// Agent status dogrula
pub fn validate_agent_status(status: &str) -> Result<(), AppError> {
    match status {
        "active" | "inactive" | "suspended" => Ok(()),
        _ => Err(AppError::BadRequest(
            "Status sadece 'active', 'inactive' veya 'suspended' olabilir".to_string(),
        )),
    }
}

/// Opsiyonel status dogrula (update icin)
pub fn validate_optional_status(status: &Option<String>) -> Result<(), AppError> {
    if let Some(ref s) = status {
        validate_agent_status(s)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─── Agent Name Validation ───

    #[test]
    fn test_validate_agent_name_valid() {
        assert!(validate_agent_name("Test Agent").is_ok());
        assert!(validate_agent_name("My-Agent_123").is_ok());
        assert!(validate_agent_name("A").is_ok());
    }

    #[test]
    fn test_validate_agent_name_empty() {
        let err = validate_agent_name("").unwrap_err();
        match err {
            AppError::BadRequest(msg) => assert!(msg.contains("bos olamaz")),
            _ => panic!("Expected BadRequest"),
        }
    }

    #[test]
    fn test_validate_agent_name_too_long() {
        let long_name = "a".repeat(101);
        let err = validate_agent_name(&long_name).unwrap_err();
        match err {
            AppError::BadRequest(msg) => assert!(msg.contains("100 karakter")),
            _ => panic!("Expected BadRequest"),
        }
    }

    #[test]
    fn test_validate_agent_name_exactly_100_chars() {
        let name = "a".repeat(100);
        assert!(validate_agent_name(&name).is_ok());
    }

    #[test]
    fn test_validate_agent_name_control_chars() {
        let name = "test\x00agent";
        let err = validate_agent_name(name).unwrap_err();
        match err {
            AppError::BadRequest(msg) => assert!(msg.contains("kontrol karakteri")),
            _ => panic!("Expected BadRequest"),
        }
    }

    #[test]
    fn test_validate_agent_name_newline() {
        let name = "test\nagent";
        let err = validate_agent_name(name).unwrap_err();
        match err {
            AppError::BadRequest(msg) => assert!(msg.contains("kontrol karakteri")),
            _ => panic!("Expected BadRequest"),
        }
    }

    // ─── Optional Agent Name (Update) ───

    #[test]
    fn test_validate_optional_agent_name_none() {
        assert!(validate_optional_agent_name(&None).is_ok());
    }

    #[test]
    fn test_validate_optional_agent_name_some_valid() {
        assert!(validate_optional_agent_name(&Some("Valid Name".to_string())).is_ok());
    }

    #[test]
    fn test_validate_optional_agent_name_some_invalid() {
        assert!(validate_optional_agent_name(&Some("".to_string())).is_err());
    }

    // ─── Event Type Validation ───

    #[test]
    fn test_validate_event_type_valid() {
        assert!(validate_event_type("order.created").is_ok());
        assert!(validate_event_type("user_signup").is_ok());
        assert!(validate_event_type("payment-refunded").is_ok());
        assert!(validate_event_type("test123").is_ok());
        assert!(validate_event_type("a.b.c.d").is_ok());
    }

    #[test]
    fn test_validate_event_type_empty() {
        let err = validate_event_type("").unwrap_err();
        match err {
            AppError::BadRequest(msg) => assert!(msg.contains("bos olamaz")),
            _ => panic!("Expected BadRequest"),
        }
    }

    #[test]
    fn test_validate_event_type_too_long() {
        let long_type = "a".repeat(201);
        let err = validate_event_type(&long_type).unwrap_err();
        match err {
            AppError::BadRequest(msg) => assert!(msg.contains("200 karakter")),
            _ => panic!("Expected BadRequest"),
        }
    }

    #[test]
    fn test_validate_event_type_exactly_200_chars() {
        let event_type = "a".repeat(200);
        assert!(validate_event_type(&event_type).is_ok());
    }

    #[test]
    fn test_validate_event_type_invalid_chars() {
        assert!(validate_event_type("order created").is_err()); // space
        assert!(validate_event_type("order@created").is_err()); // @
        assert!(validate_event_type("order#created").is_err()); // #
        assert!(validate_event_type("order/created").is_err()); // /
        assert!(validate_event_type("order!created").is_err()); // !
    }

    #[test]
    fn test_validate_event_type_starts_with_dot() {
        assert!(validate_event_type(".order.created").is_err());
    }

    #[test]
    fn test_validate_event_type_ends_with_dot() {
        assert!(validate_event_type("order.created.").is_err());
    }

    // ─── Payload Validation ───

    #[test]
    fn test_validate_payload_valid() {
        let payload = serde_json::json!({"key": "value", "count": 42});
        assert!(validate_payload(&payload).is_ok());
    }

    #[test]
    fn test_validate_payload_empty() {
        let payload = serde_json::json!({});
        assert!(validate_payload(&payload).is_ok());
    }

    #[test]
    fn test_validate_payload_nested() {
        let payload = serde_json::json!({
            "order": {
                "id": 123,
                "items": [{"name": "Laptop", "qty": 1}]
            }
        });
        assert!(validate_payload(&payload).is_ok());
    }

    // ─── Description Validation ───

    #[test]
    fn test_validate_description_valid() {
        assert!(validate_description("").is_ok());
        assert!(validate_description("Short description").is_ok());
    }

    #[test]
    fn test_validate_description_too_long() {
        let long_desc = "a".repeat(501);
        assert!(validate_description(&long_desc).is_err());
    }

    #[test]
    fn test_validate_description_exactly_500_chars() {
        let desc = "a".repeat(500);
        assert!(validate_description(&desc).is_ok());
    }

    // ─── Optional Description (Update) ───

    #[test]
    fn test_validate_optional_description_none() {
        assert!(validate_optional_description(&None).is_ok());
    }

    #[test]
    fn test_validate_optional_description_some_valid() {
        assert!(validate_optional_description(&Some("Valid desc".to_string())).is_ok());
    }

    #[test]
    fn test_validate_optional_description_some_invalid() {
        let long_desc = "a".repeat(501);
        assert!(validate_optional_description(&Some(long_desc)).is_err());
    }

    // ─── Status Validation ───

    #[test]
    fn test_validate_agent_status_valid() {
        assert!(validate_agent_status("active").is_ok());
        assert!(validate_agent_status("inactive").is_ok());
        assert!(validate_agent_status("suspended").is_ok());
    }

    #[test]
    fn test_validate_agent_status_invalid() {
        assert!(validate_agent_status("deleted").is_err());
        assert!(validate_agent_status("banned").is_err());
        assert!(validate_agent_status("").is_err());
        assert!(validate_agent_status("ACTIVE").is_err());
    }

    #[test]
    fn test_validate_optional_status_none() {
        assert!(validate_optional_status(&None).is_ok());
    }

    #[test]
    fn test_validate_optional_status_some_valid() {
        assert!(validate_optional_status(&Some("active".to_string())).is_ok());
    }

    #[test]
    fn test_validate_optional_status_some_invalid() {
        assert!(validate_optional_status(&Some("invalid".to_string())).is_err());
    }
}
