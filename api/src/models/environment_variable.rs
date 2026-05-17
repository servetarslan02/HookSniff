use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Environment variable: key-value pair scoped to an environment.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct EnvironmentVariable {
    pub id: Uuid,
    pub environment_id: Uuid,
    pub key: String,
    pub value: String,
    pub is_secret: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Request body for creating/updating a variable.
#[derive(Debug, Deserialize)]
pub struct CreateVariableRequest {
    pub key: String,
    pub value: String,
    pub is_secret: Option<bool>,
}

/// Request body for bulk upsert.
#[derive(Debug, Deserialize)]
pub struct BulkUpsertVariablesRequest {
    pub variables: Vec<CreateVariableRequest>,
}

/// API response shape — masks secret values.
#[derive(Debug, Serialize)]
pub struct VariableResponse {
    pub id: Uuid,
    pub environment_id: Uuid,
    pub key: String,
    pub value: String,
    pub is_secret: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl EnvironmentVariable {
    pub fn to_response(self) -> VariableResponse {
        VariableResponse {
            id: self.id,
            environment_id: self.environment_id,
            key: self.key,
            value: if self.is_secret {
                "••••••••".to_string()
            } else {
                self.value
            },
            is_secret: self.is_secret,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }

    /// Return raw value (for internal use, e.g. webhook delivery).
    pub fn to_response_raw(self) -> VariableResponse {
        VariableResponse {
            id: self.id,
            environment_id: self.environment_id,
            key: self.key,
            value: self.value,
            is_secret: self.is_secret,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

impl CreateVariableRequest {
    pub fn validate(&self) -> Result<(), String> {
        if self.key.trim().is_empty() {
            return Err("Variable key cannot be empty".into());
        }
        if self.key.len() > 255 {
            return Err("Variable key must be 255 characters or less".into());
        }
        if !self
            .key
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '.')
        {
            return Err(
                "Variable key can only contain alphanumeric, underscore, and dot characters".into(),
            );
        }
        Ok(())
    }
}
