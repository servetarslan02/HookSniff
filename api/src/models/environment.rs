use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Environment groups endpoints and variables under a customer account.
/// Typical: development, staging, production
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Environment {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub is_default: bool,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Request body for creating a new environment.
#[derive(Debug, Deserialize)]
pub struct CreateEnvironmentRequest {
    pub name: String,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub is_default: Option<bool>,
    pub color: Option<String>,
}

/// Request body for updating an environment.
#[derive(Debug, Deserialize)]
pub struct UpdateEnvironmentRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub is_default: Option<bool>,
    pub color: Option<String>,
}

/// API response shape for an environment.
#[derive(Debug, Serialize)]
pub struct EnvironmentResponse {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub is_default: bool,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub variable_count: Option<i64>,
}

impl Environment {
    pub fn to_response(self, variable_count: i64) -> EnvironmentResponse {
        EnvironmentResponse {
            id: self.id,
            customer_id: self.customer_id,
            name: self.name,
            slug: self.slug,
            description: self.description,
            is_default: self.is_default,
            color: self.color,
            created_at: self.created_at,
            updated_at: self.updated_at,
            variable_count: Some(variable_count),
        }
    }

    pub fn to_response_simple(self) -> EnvironmentResponse {
        EnvironmentResponse {
            id: self.id,
            customer_id: self.customer_id,
            name: self.name,
            slug: self.slug,
            description: self.description,
            is_default: self.is_default,
            color: self.color,
            created_at: self.created_at,
            updated_at: self.updated_at,
            variable_count: None,
        }
    }
}

impl CreateEnvironmentRequest {
    pub fn validate(&self) -> Result<(), String> {
        if self.name.trim().is_empty() {
            return Err("Environment name cannot be empty".into());
        }
        if self.name.len() > 50 {
            return Err("Environment name must be 50 characters or less".into());
        }
        if let Some(slug) = &self.slug {
            if slug.len() > 50 {
                return Err("Slug must be 50 characters or less".into());
            }
            if !slug.chars().all(|c| c.is_ascii_lowercase() || c == '-') {
                return Err("Slug can only contain lowercase letters and hyphens".into());
            }
        }
        if let Some(color) = &self.color {
            if !color.starts_with('#') || color.len() != 7 {
                return Err("Color must be a hex code (e.g. #22c55e)".into());
            }
        }
        Ok(())
    }

    /// Generate slug from name if not provided.
    pub fn resolve_slug(&self) -> String {
        if let Some(slug) = &self.slug {
            slug.clone()
        } else {
            self.name
                .to_lowercase()
                .chars()
                .map(|c| if c.is_ascii_alphanumeric() { c } else { '-' })
                .collect::<String>()
                .split('-')
                .filter(|s| !s.is_empty())
                .collect::<Vec<_>>()
                .join("-")
        }
    }
}
