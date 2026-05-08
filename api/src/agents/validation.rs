//! Agent input validation

use crate::error::AppError;

/// Agent adini dogrula
pub fn validate_agent_name(name: &str) -> Result<(), AppError> {
    if name.is_empty() {
        return Err(AppError::BadRequest("Agent adi bos olamaz".to_string()));
    }
    if name.len() > 100 {
        return Err(AppError::BadRequest("Agent adi 100 karakterden uzun olamaz".to_string()));
    }
    if name.chars().any(|c| c.is_control()) {
        return Err(AppError::BadRequest("Agent adi kontrol karakteri iceremez".to_string()));
    }
    Ok(())
}

/// Event type dogrula
pub fn validate_event_type(event_type: &str) -> Result<(), AppError> {
    if event_type.is_empty() {
        return Err(AppError::BadRequest("Event type bos olamaz".to_string()));
    }
    if event_type.len() > 200 {
        return Err(AppError::BadRequest("Event type 200 karakterden uzun olamaz".to_string()));
    }
    // Sadece harf, rakam, nokta, tire, alt tire
    if !event_type.chars().all(|c| c.is_alphanumeric() || c == '.' || c == '-' || c == '_') {
        return Err(AppError::BadRequest(
            "Event type sadece harf, rakam, nokta, tire ve alt tire icerebilir".to_string()
        ));
    }
    Ok(())
}

/// Payload boyut kontrolu
pub fn validate_payload(payload: &serde_json::Value) -> Result<(), AppError> {
    let size = serde_json::to_string(payload)
        .map(|s| s.len())
        .unwrap_or(0);

    if size > 1_000_000 {
        return Err(AppError::BadRequest(
            "Payload 1MB'dan buyuk olamaz".to_string()
        ));
    }
    Ok(())
}

/// Agent description dogrula
pub fn validate_description(desc: &str) -> Result<(), AppError> {
    if desc.len() > 500 {
        return Err(AppError::BadRequest(
            "Aciklama 500 karakterden uzun olamaz".to_string()
        ));
    }
    Ok(())
}
