#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rate_limiter_allows_within_limit() {
        let mut limiter = ConnectionRateLimiter::new(5, 60);
        for _ in 0..5 {
            assert!(limiter.allow());
        }
    }

    #[test]
    fn test_rate_limiter_blocks_over_limit() {
        let mut limiter = ConnectionRateLimiter::new(3, 60);
        assert!(limiter.allow());
        assert!(limiter.allow());
        assert!(limiter.allow());
        assert!(!limiter.allow());
        assert!(!limiter.allow());
    }

    #[test]
    fn test_rate_limiter_zero_capacity() {
        let mut limiter = ConnectionRateLimiter::new(0, 60);
        assert!(!limiter.allow());
    }

    #[test]
    fn test_rate_limiter_capacity_one() {
        let mut limiter = ConnectionRateLimiter::new(1, 60);
        assert!(limiter.allow());
        assert!(!limiter.allow());
    }

    #[test]
    fn test_rate_limiter_large_capacity() {
        let mut limiter = ConnectionRateLimiter::new(1000, 60);
        for _ in 0..1000 {
            assert!(limiter.allow());
        }
        assert!(!limiter.allow());
    }

    #[test]
    fn test_ws_handler_config_default() {
        let config = WsHandlerConfig::default();
        assert_eq!(config.rate_limit_per_minute, 100);
        assert_eq!(config.ping_interval_secs, 30);
        assert_eq!(config.pong_timeout_secs, 10);
        assert_eq!(config.max_message_size, 64 * 1024);
    }

    #[test]
    fn test_ws_handler_config_serialization_roundtrip() {
        let config = WsHandlerConfig {
            rate_limit_per_minute: 200,
            ping_interval_secs: 60,
            pong_timeout_secs: 20,
            max_message_size: 128 * 1024,
        };
        let json = serde_json::to_string(&config).unwrap();
        let deserialized: WsHandlerConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.rate_limit_per_minute, 200);
        assert_eq!(deserialized.ping_interval_secs, 60);
        assert_eq!(deserialized.pong_timeout_secs, 20);
        assert_eq!(deserialized.max_message_size, 128 * 1024);
    }

    #[test]
    fn test_ws_handler_config_deserialization_with_defaults() {
        let json = r#"{}"#;
        let config: WsHandlerConfig = serde_json::from_str(json).unwrap();
        assert_eq!(config.rate_limit_per_minute, 100);
        assert_eq!(config.ping_interval_secs, 30);
        assert_eq!(config.pong_timeout_secs, 10);
        assert_eq!(config.max_message_size, 64 * 1024);
    }

    #[test]
    fn test_ws_handler_config_partial_override() {
        let json = r#"{"rate_limit_per_minute": 500}"#;
        let config: WsHandlerConfig = serde_json::from_str(json).unwrap();
        assert_eq!(config.rate_limit_per_minute, 500);
        assert_eq!(config.ping_interval_secs, 30); // default
        assert_eq!(config.pong_timeout_secs, 10); // default
    }

    #[test]
    fn test_client_message_subscribe_deserialization() {
        let json =
            r#"{"type": "subscribe", "event_types": ["order.created", "payment.completed"]}"#;
        let msg: ClientMessage = serde_json::from_str(json).unwrap();
        match msg {
            ClientMessage::Subscribe { event_types } => {
                assert_eq!(event_types.len(), 2);
                assert!(event_types.contains(&"order.created".to_string()));
                assert!(event_types.contains(&"payment.completed".to_string()));
            }
            _ => panic!("Expected Subscribe variant"),
        }
    }

    #[test]
    fn test_client_message_unsubscribe_deserialization() {
        let json = r#"{"type": "unsubscribe", "event_types": ["order.created"]}"#;
        let msg: ClientMessage = serde_json::from_str(json).unwrap();
        match msg {
            ClientMessage::Unsubscribe { event_types } => {
                assert_eq!(event_types, vec!["order.created"]);
            }
            _ => panic!("Expected Unsubscribe variant"),
        }
    }

    #[test]
    fn test_client_message_ping_deserialization() {
        let json = r#"{"type": "ping"}"#;
        let msg: ClientMessage = serde_json::from_str(json).unwrap();
        match msg {
            ClientMessage::Ping => {}
            _ => panic!("Expected Ping variant"),
        }
    }

    #[test]
    fn test_client_message_invalid_type() {
        let json = r#"{"type": "invalid"}"#;
        let result = serde_json::from_str::<ClientMessage>(json);
        assert!(result.is_err());
    }

    #[test]
    fn test_client_message_subscribe_empty_events() {
        let json = r#"{"type": "subscribe", "event_types": []}"#;
        let msg: ClientMessage = serde_json::from_str(json).unwrap();
        match msg {
            ClientMessage::Subscribe { event_types } => {
                assert!(event_types.is_empty());
            }
            _ => panic!("Expected Subscribe variant"),
        }
    }

    #[test]
    fn test_default_rate_limit() {
        assert_eq!(default_rate_limit(), 100);
    }

    #[test]
    fn test_default_ping_interval() {
        assert_eq!(default_ping_interval(), 30);
    }

    #[test]
    fn test_default_pong_timeout() {
        assert_eq!(default_pong_timeout(), 10);
    }

    #[test]
    fn test_default_max_message_size() {
        assert_eq!(default_max_message_size(), 64 * 1024);
    }

    #[test]
    fn test_authenticate_ws_token_invalid_token() {
        let result = authenticate_ws_token("not.a.valid.token", "secret");
        assert!(result.is_err());
    }

    #[test]
    fn test_authenticate_ws_token_valid_token() {
        use jsonwebtoken::{encode, EncodingKey, Header};

        let customer_id = Uuid::new_v4();
        // Build the JWT payload manually to include both `exp` (for validation)
        // and `_exp` (for deserialization into the function's Claims struct).
        let far_future = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
            + 3600;
        let payload = serde_json::json!({
            "sub": customer_id.to_string(),
            "_exp": far_future,
            "exp": far_future,
        });
        let token = encode(
            &Header::default(),
            &payload,
            &EncodingKey::from_secret("test_secret".as_bytes()),
        )
        .unwrap();

        let result = authenticate_ws_token(&token, "test_secret");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), customer_id);
    }

    #[test]
    fn test_authenticate_ws_token_wrong_secret() {
        use jsonwebtoken::{encode, EncodingKey, Header};

        #[derive(serde::Serialize)]
        struct Claims {
            sub: String,
            exp: usize,
        }

        let claims = Claims {
            sub: Uuid::new_v4().to_string(),
            exp: 9999999999,
        };
        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret("correct_secret".as_bytes()),
        )
        .unwrap();

        let result = authenticate_ws_token(&token, "wrong_secret");
        assert!(result.is_err());
    }

    #[test]
    fn test_authenticate_ws_token_invalid_uuid() {
        use jsonwebtoken::{encode, EncodingKey, Header};

        #[derive(serde::Serialize)]
        struct Claims {
            sub: String,
            exp: usize,
        }

        let claims = Claims {
            sub: "not-a-valid-uuid".to_string(),
            exp: 9999999999,
        };
        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret("secret".as_bytes()),
        )
        .unwrap();

        let result = authenticate_ws_token(&token, "secret");
        assert!(result.is_err());
    }

    #[test]
    fn test_rate_limiter_with_short_window() {
        let mut limiter = ConnectionRateLimiter::new(2, 1);
        assert!(limiter.allow());
        assert!(limiter.allow());
        assert!(!limiter.allow());
    }

    #[test]
    fn test_ws_handler_config_clone() {
        let config = WsHandlerConfig::default();
        let cloned = config.clone();
        assert_eq!(cloned.rate_limit_per_minute, config.rate_limit_per_minute);
        assert_eq!(cloned.ping_interval_secs, config.ping_interval_secs);
    }
}
