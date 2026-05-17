use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Application groups endpoints under a customer account.
/// Hierarchy: Customer → Application → Endpoint
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Application {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Request body for creating a new application.
#[derive(Debug, Deserialize)]
pub struct CreateApplicationRequest {
    pub name: String,
    pub description: Option<String>,
}

/// Request body for updating an application.
#[derive(Debug, Deserialize)]
pub struct UpdateApplicationRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub is_active: Option<bool>,
}

/// Row type for queries that JOIN endpoint counts in a single query.
#[derive(Debug, sqlx::FromRow)]
pub struct ApplicationWithCount {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub endpoint_count: i64,
}

impl ApplicationWithCount {
    pub fn to_response(self) -> ApplicationResponse {
        ApplicationResponse {
            id: self.id,
            name: self.name,
            description: self.description,
            is_active: self.is_active,
            created_at: self.created_at,
            updated_at: self.updated_at,
            endpoint_count: self.endpoint_count,
        }
    }
}

/// API response shape for an application.
#[derive(Debug, Serialize)]
pub struct ApplicationResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    /// Number of endpoints belonging to this application.
    pub endpoint_count: i64,
}

impl Application {
    pub fn to_response(self, endpoint_count: i64) -> ApplicationResponse {
        ApplicationResponse {
            id: self.id,
            name: self.name,
            description: self.description,
            is_active: self.is_active,
            created_at: self.created_at,
            updated_at: self.updated_at,
            endpoint_count,
        }
    }
}

impl CreateApplicationRequest {
    /// Validate the request fields.
    pub fn validate(&self) -> Result<(), String> {
        if self.name.trim().is_empty() {
            return Err("Application name cannot be empty".into());
        }
        if self.name.len() > 255 {
            return Err("Application name must be 255 characters or less".into());
        }
        Ok(())
    }
}

impl UpdateApplicationRequest {
    /// Validate the request fields.
    pub fn validate(&self) -> Result<(), String> {
        if let Some(ref name) = self.name {
            if name.trim().is_empty() {
                return Err("Application name cannot be empty".into());
            }
            if name.len() > 255 {
                return Err("Application name must be 255 characters or less".into());
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_request_validate_empty_name() {
        let req = CreateApplicationRequest {
            name: "".into(),
            description: None,
        };
        assert!(req.validate().is_err());
    }

    #[test]
    fn test_create_request_validate_whitespace_name() {
        let req = CreateApplicationRequest {
            name: "   ".into(),
            description: None,
        };
        assert!(req.validate().is_err());
    }

    #[test]
    fn test_create_request_validate_long_name() {
        let req = CreateApplicationRequest {
            name: "a".repeat(256),
            description: None,
        };
        assert!(req.validate().is_err());
    }

    #[test]
    fn test_create_request_validate_ok() {
        let req = CreateApplicationRequest {
            name: "My App".into(),
            description: Some("A test app".into()),
        };
        assert!(req.validate().is_ok());
    }

    #[test]
    fn test_update_request_validate_empty_name() {
        let req = UpdateApplicationRequest {
            name: Some("".into()),
            description: None,
            is_active: None,
        };
        assert!(req.validate().is_err());
    }

    #[test]
    fn test_update_request_validate_none_name() {
        let req = UpdateApplicationRequest {
            name: None,
            description: Some("updated".into()),
            is_active: None,
        };
        assert!(req.validate().is_ok());
    }

    #[test]
    fn test_to_response() {
        let app = Application {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            name: "Test App".into(),
            description: Some("desc".into()),
            is_active: true,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let resp = app.to_response(5);
        assert_eq!(resp.name, "Test App");
        assert_eq!(resp.endpoint_count, 5);
        assert!(resp.is_active);
    }
}
