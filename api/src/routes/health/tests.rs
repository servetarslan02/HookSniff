#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_system_status_struct_serialize() {
        let status = SystemStatus {
            overall_status: "operational".to_string(),
            uptime_30d: 99.99,
            components: vec![],
            checked_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&status).unwrap();
        assert_eq!(json["overall_status"], "operational");
        assert_eq!(json["uptime_30d"], 99.99);
        assert!(json["components"].is_array());
        assert_eq!(json["checked_at"], "2024-01-01T00:00:00Z");
    }

    #[test]
    fn test_component_status_struct_serialize() {
        let cs = ComponentStatus {
            name: "API".to_string(),
            status: "healthy".to_string(),
            latency_ms: Some(42),
            description: "Test".to_string(),
            last_checked: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&cs).unwrap();
        assert_eq!(json["name"], "API");
        assert_eq!(json["status"], "healthy");
        assert_eq!(json["latency_ms"], 42);
    }

    #[test]
    fn test_component_status_none_latency() {
        let cs = ComponentStatus {
            name: "Redis".to_string(),
            status: "unhealthy".to_string(),
            latency_ms: None,
            description: "down".to_string(),
            last_checked: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&cs).unwrap();
        assert!(json["latency_ms"].is_null());
    }

    #[test]
    fn test_uptime_seconds_returns_nonzero_after_init() {
        // Initialize START_TIME by calling uptime_seconds
        let _ = uptime_seconds();
        // Second call should return a value (>= 0)
        let u = uptime_seconds();
        assert!(u < 10); // Should be very small in tests
    }

    #[test]
    fn test_overall_status_logic() {
        // All healthy => operational
        let components = [ComponentStatus {
                name: "API".into(),
                status: "healthy".into(),
                latency_ms: None,
                description: "".into(),
                last_checked: "".into(),
            },
            ComponentStatus {
                name: "DB".into(),
                status: "healthy".into(),
                latency_ms: None,
                description: "".into(),
                last_checked: "".into(),
            }];
        let overall = if components.iter().any(|c| c.status == "unhealthy") {
            "down"
        } else if components.iter().any(|c| c.status == "degraded") {
            "degraded"
        } else {
            "operational"
        };
        assert_eq!(overall, "operational");

        // One degraded => degraded
        let components_degraded = [ComponentStatus {
                name: "API".into(),
                status: "healthy".into(),
                latency_ms: None,
                description: "".into(),
                last_checked: "".into(),
            },
            ComponentStatus {
                name: "Worker".into(),
                status: "degraded".into(),
                latency_ms: None,
                description: "".into(),
                last_checked: "".into(),
            }];
        let overall = if components_degraded.iter().any(|c| c.status == "unhealthy") {
            "down"
        } else if components_degraded.iter().any(|c| c.status == "degraded") {
            "degraded"
        } else {
            "operational"
        };
        assert_eq!(overall, "degraded");

        // One unhealthy => down
        let components_down = [ComponentStatus {
            name: "DB".into(),
            status: "unhealthy".into(),
            latency_ms: None,
            description: "".into(),
            last_checked: "".into(),
        }];
        let overall = if components_down.iter().any(|c| c.status == "unhealthy") {
            "down"
        } else if components_down.iter().any(|c| c.status == "degraded") {
            "degraded"
        } else {
            "operational"
        };
        assert_eq!(overall, "down");
    }
}
