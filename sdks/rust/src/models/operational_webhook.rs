use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OperationalWebhookEndpointOut {
    pub id: String,
    #[serde(rename = "customerId")]
    pub customer_id: String,
    pub url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<Option<String>>,
    #[serde(rename = "isActive")]
    pub is_active: bool,
    #[serde(rename = "eventTypes", skip_serializing_if = "Option::is_none")]
    pub event_types: Option<Option<Vec<String>>>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OperationalWebhookEndpointIn {
    pub url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<Option<String>>,
    #[serde(rename = "isActive", skip_serializing_if = "Option::is_none")]
    pub is_active: Option<bool>,
    #[serde(rename = "eventTypes", skip_serializing_if = "Option::is_none")]
    pub event_types: Option<Option<Vec<String>>>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OperationalWebhookDeliveryOut {
    pub id: String,
    #[serde(rename = "endpointId")]
    pub endpoint_id: String,
    #[serde(rename = "eventType")]
    pub event_type: String,
    pub payload: HashMap<String, serde_json::Value>,
    #[serde(rename = "responseStatus", skip_serializing_if = "Option::is_none")]
    pub response_status: Option<Option<i16>>,
    #[serde(rename = "attemptCount")]
    pub attempt_count: i16,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "deliveredAt", skip_serializing_if = "Option::is_none")]
    pub delivered_at: Option<Option<String>>,
}
