//! Tests for template library.

#[cfg(test)]
mod tests {
    use super::super::*;

    #[test]
    fn test_all_templates_count() {
        let templates = all_templates();
        assert_eq!(templates.len(), 10);
    }

    #[test]
    fn test_all_templates_unique_ids() {
        let templates = all_templates();
        let ids: Vec<&str> = templates.iter().map(|t| t.id.as_str()).collect();
        let mut unique_ids = ids.clone();
        unique_ids.sort();
        unique_ids.dedup();
        assert_eq!(ids.len(), unique_ids.len(), "Template IDs should be unique");
    }

    #[test]
    fn test_stripe_template() {
        let templates = all_templates();
        let stripe = templates
            .iter()
            .find(|t| t.id == "stripe-like-payments")
            .unwrap();
        assert_eq!(stripe.name, "Stripe-like Payments Webhooks");
        assert_eq!(stripe.industry, "fintech");
        assert!(!stripe.event_types.is_empty());
        assert!(stripe.event_types.contains(&"payment_intent.succeeded".to_string()));
        assert!(stripe.event_types.contains(&"charge.refunded".to_string()));
        assert_eq!(stripe.endpoint_config.signing_algorithm, "hmac-sha256");
        assert_eq!(stripe.retry_policy.max_attempts, 5);
        assert_eq!(stripe.agents.len(), 2);
    }

    #[test]
    fn test_shopify_template() {
        let templates = all_templates();
        let shopify = templates
            .iter()
            .find(|t| t.id == "shopify-like-orders")
            .unwrap();
        assert_eq!(shopify.industry, "ecommerce");
        assert!(shopify.event_types.contains(&"orders/create".to_string()));
        assert!(shopify.event_types.contains(&"fulfillments/create".to_string()));
        assert_eq!(shopify.agents.len(), 3);
    }

    #[test]
    fn test_github_template() {
        let templates = all_templates();
        let github = templates
            .iter()
            .find(|t| t.id == "github-like-repos")
            .unwrap();
        assert_eq!(github.industry, "devtools");
        assert!(github.event_types.contains(&"push".to_string()));
        assert!(github.event_types.contains(&"pull_request.opened".to_string()));
        assert_eq!(github.retry_policy.max_attempts, 3);
    }

    #[test]
    fn test_discord_template() {
        let templates = all_templates();
        let discord = templates
            .iter()
            .find(|t| t.id == "discord-interactions")
            .unwrap();
        assert_eq!(discord.industry, "community");
        assert_eq!(discord.endpoint_config.signing_algorithm, "ed25519");
        assert!(discord.event_types.contains(&"INTERACTION_CREATE".to_string()));
    }

    #[test]
    fn test_healthcare_template() {
        let templates = all_templates();
        let hc = templates
            .iter()
            .find(|t| t.id == "healthcare-events")
            .unwrap();
        assert_eq!(hc.industry, "healthcare");
        assert!(hc.event_types.contains(&"patient.admitted".to_string()));
        assert!(hc.event_types.contains(&"lab.result.critical".to_string()));
        assert_eq!(hc.agents.len(), 3);
    }

    #[test]
    fn test_all_templates_have_valid_config() {
        let templates = all_templates();
        for tmpl in &templates {
            assert!(!tmpl.id.is_empty(), "Template ID should not be empty");
            assert!(!tmpl.name.is_empty(), "Template name should not be empty");
            assert!(!tmpl.event_types.is_empty(), "Template should have at least one event type");
            assert!(tmpl.retry_policy.max_attempts >= 1, "Max attempts should be >= 1");
            assert!(tmpl.retry_policy.initial_delay_secs >= 1, "Initial delay should be >= 1");
            assert!(tmpl.estimated_daily_volume > 0, "Daily volume should be > 0");
            assert!(!tmpl.tags.is_empty(), "Template should have at least one tag");
        }
    }

    #[test]
    fn test_template_agents_have_names() {
        let templates = all_templates();
        for tmpl in &templates {
            for agent in &tmpl.agents {
                assert!(!agent.agent_name.is_empty(), "Agent name should not be empty");
                assert!(!agent.description.is_empty(), "Agent description should not be empty");
            }
        }
    }

    #[test]
    fn test_all_templates_use_hmac_except_discord() {
        let templates = all_templates();
        for tmpl in &templates {
            if tmpl.id == "discord-interactions" {
                assert_eq!(tmpl.endpoint_config.signing_algorithm, "ed25519");
            } else {
                assert_eq!(tmpl.endpoint_config.signing_algorithm, "hmac-sha256");
            }
        }
    }
}
