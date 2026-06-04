//! Batch processing — group webhooks by endpoint for efficient delivery.
//!
//! When multiple webhooks target the same endpoint, they can be processed
//! together to reduce connection overhead and improve throughput.
//!
//! Current implementation: groups messages by endpoint for optimized processing.
//! Future: actual batch HTTP delivery for endpoints that support it.

use std::collections::HashMap;
use uuid::Uuid;

/// Group webhook messages by endpoint_id.
///
/// Returns a HashMap where key = endpoint_id, value = list of (stream_entry_id, message_fields).
/// This allows the consumer to process all messages for the same endpoint together,
/// reusing the same HTTP connection and signing secret.
pub fn group_by_endpoint(
    entries: Vec<(String, std::collections::HashMap<String, String>)>,
) -> HashMap<String, Vec<(String, std::collections::HashMap<String, String>)>> {
    let mut groups: HashMap<String, Vec<(String, std::collections::HashMap<String, String>)>> =
        HashMap::new();

    for (entry_id, fields) in entries {
        let endpoint_id = fields
            .get("endpoint_id")
            .cloned()
            .unwrap_or_default();
        groups.entry(endpoint_id).or_default().push((entry_id, fields));
    }

    groups
}

/// Check if an endpoint supports batch delivery.
///
/// Currently returns false for all endpoints (single delivery mode).
/// Future: check endpoint configuration for batch support.
#[allow(dead_code)]
pub fn supports_batch(_endpoint_id: &Uuid) -> bool {
    // TODO: Check endpoint.batch_enabled field when batch API is implemented
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_group_by_endpoint() {
        let mut entries = Vec::new();

        let mut fields1 = std::collections::HashMap::new();
        fields1.insert("endpoint_id".into(), "ep-1".into());
        fields1.insert("delivery_id".into(), "d-1".into());
        entries.push(("entry-1".into(), fields1));

        let mut fields2 = std::collections::HashMap::new();
        fields2.insert("endpoint_id".into(), "ep-1".into());
        fields2.insert("delivery_id".into(), "d-2".into());
        entries.push(("entry-2".into(), fields2));

        let mut fields3 = std::collections::HashMap::new();
        fields3.insert("endpoint_id".into(), "ep-2".into());
        fields3.insert("delivery_id".into(), "d-3".into());
        entries.push(("entry-3".into(), fields3));

        let groups = group_by_endpoint(entries);
        assert_eq!(groups.len(), 2);
        assert_eq!(groups.get("ep-1").unwrap().len(), 2);
        assert_eq!(groups.get("ep-2").unwrap().len(), 1);
    }
}
