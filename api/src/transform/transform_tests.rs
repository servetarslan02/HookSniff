//! Tests for transform engine.

#[cfg(test)]
mod transform_tests {
    use super::super::*;
    use serde_json::json;

    // -- TransformEngine tests --

    #[test]
    fn test_filter_include() {
        let input = json!({
            "order_id": "123",
            "amount": 100,
            "internal_secret": "abc"
        });

        let config = TransformRuleConfig {
            filter: Some(FilterConfig {
                include: Some(vec!["order_id".into(), "amount".into()]),
                exclude: None,
                exclude_paths: None,
            }),
            mappings: None,
            enrich: None,
        };

        let output = TransformEngine::apply(&input, &config).unwrap();
        assert_eq!(output["order_id"], "123");
        assert_eq!(output["amount"], 100);
        assert!(output.get("internal_secret").is_none());
    }

    #[test]
    fn test_filter_exclude() {
        let input = json!({
            "order_id": "123",
            "amount": 100,
            "password": "secret123"
        });

        let config = TransformRuleConfig {
            filter: Some(FilterConfig {
                include: None,
                exclude: Some(vec!["password".into()]),
                exclude_paths: None,
            }),
            mappings: None,
            enrich: None,
        };

        let output = TransformEngine::apply(&input, &config).unwrap();
        assert_eq!(output["order_id"], "123");
        assert_eq!(output["amount"], 100);
        assert!(output.get("password").is_none());
    }

    #[test]
    fn test_filter_exclude_paths() {
        let input = json!({
            "order_id": "123",
            "metadata": {
                "internal_id": "abc",
                "debug_info": "verbose",
                "public_note": "visible"
            }
        });

        let config = TransformRuleConfig {
            filter: Some(FilterConfig {
                include: None,
                exclude: None,
                exclude_paths: Some(vec!["metadata.internal_id".into(), "metadata.debug_info".into()]),
            }),
            mappings: None,
            enrich: None,
        };

        let output = TransformEngine::apply(&input, &config).unwrap();
        assert_eq!(output["order_id"], "123");
        assert_eq!(output["metadata"]["public_note"], "visible");
        assert!(output["metadata"].get("internal_id").is_none());
        assert!(output["metadata"].get("debug_info").is_none());
    }

    #[test]
    fn test_field_mapping() {
        let input = json!({
            "order_id": "123",
            "total": 100
        });

        let config = TransformRuleConfig {
            filter: None,
            mappings: Some(vec![
                FieldMapping {
                    source: "order_id".into(),
                    target: "id".into(),
                },
                FieldMapping {
                    source: "total".into(),
                    target: "amount".into(),
                },
            ]),
            enrich: None,
        };

        let output = TransformEngine::apply(&input, &config).unwrap();
        assert_eq!(output["id"], "123");
        assert_eq!(output["amount"], 100);
        assert!(output.get("order_id").is_none());
        assert!(output.get("total").is_none());
    }

    #[test]
    fn test_enrich() {
        let input = json!({
            "order_id": "123"
        });

        let config = TransformRuleConfig {
            filter: None,
            mappings: None,
            enrich: Some(EnrichConfig {
                fields: vec![
                    ("source".into(), "hooksniff".into()),
                    ("version".into(), "1.0".into()),
                ],
            }),
        };

        let output = TransformEngine::apply(&input, &config).unwrap();
        assert_eq!(output["order_id"], "123");
        assert_eq!(output["source"], "hooksniff");
        assert_eq!(output["version"], "1.0");
    }

    #[test]
    fn test_combined_transform() {
        let input = json!({
            "order_id": "123",
            "amount": 100,
            "internal_note": "debug",
            "password": "secret"
        });

        let config = TransformRuleConfig {
            filter: Some(FilterConfig {
                include: Some(vec!["order_id".into(), "amount".into()]),
                exclude: None,
                exclude_paths: None,
            }),
            mappings: Some(vec![
                FieldMapping {
                    source: "order_id".into(),
                    target: "id".into(),
                },
            ]),
            enrich: Some(EnrichConfig {
                fields: vec![("source".into(), "hooksniff".into())],
            }),
        };

        let output = TransformEngine::apply(&input, &config).unwrap();
        assert_eq!(output["id"], "123");
        assert_eq!(output["amount"], 100);
        assert_eq!(output["source"], "hooksniff");
        assert!(output.get("internal_note").is_none());
        assert!(output.get("password").is_none());
    }

    #[test]
    fn test_empty_config() {
        let input = json!({"key": "value"});
        let config = TransformRuleConfig {
            filter: None,
            mappings: None,
            enrich: None,
        };

        let output = TransformEngine::apply(&input, &config).unwrap();
        assert_eq!(output["key"], "value");
    }

    // -- resolve_json_path tests --

    #[test]
    fn test_resolve_simple_path() {
        let input = json!({"key": "value"});
        assert_eq!(resolve_json_path(&input, "key"), Some(&json!("value")));
    }

    #[test]
    fn test_resolve_nested_path() {
        let input = json!({"user": {"name": "Alice"}});
        assert_eq!(resolve_json_path(&input, "user.name"), Some(&json!("Alice")));
    }

    #[test]
    fn test_resolve_missing_path() {
        let input = json!({"key": "value"});
        assert_eq!(resolve_json_path(&input, "missing"), None);
    }

    #[test]
    fn test_resolve_deeply_nested() {
        let input = json!({"a": {"b": {"c": {"d": "deep"}}}});
        assert_eq!(resolve_json_path(&input, "a.b.c.d"), Some(&json!("deep")));
    }

    // -- set_json_path tests --

    #[test]
    fn test_set_simple_path() {
        let mut output = json!({});
        set_json_path(&mut output, "key", json!("value"));
        assert_eq!(output["key"], "value");
    }

    #[test]
    fn test_set_nested_path() {
        let mut output = json!({});
        set_json_path(&mut output, "user.name", json!("Alice"));
        assert_eq!(output["user"]["name"], "Alice");
    }

    // -- remove_json_path tests --

    #[test]
    fn test_remove_simple_path() {
        let mut input = json!({"key": "value", "keep": "yes"});
        remove_json_path(&mut input, "key");
        assert!(input.get("key").is_none());
        assert_eq!(input["keep"], "yes");
    }

    #[test]
    fn test_remove_nested_path() {
        let mut input = json!({"user": {"name": "Alice", "email": "a@b.com"}});
        remove_json_path(&mut input, "user.name");
        assert!(input["user"].get("name").is_none());
        assert_eq!(input["user"]["email"], "a@b.com");
    }

    #[test]
    fn test_remove_missing_path() {
        let mut input = json!({"key": "value"});
        remove_json_path(&mut input, "missing");
        assert_eq!(input["key"], "value");
    }
}
