//! Built-in webhook template library.
//!
//! Returns all available templates for the template marketplace.

mod template_defs;
mod library_tests;

use super::*;
use template_defs::*;

/// Returns all built-in webhook templates
pub fn all_templates() -> Vec<WebhookTemplate> {
    vec![
        stripe_like_template(),
        shopify_like_template(),
        github_like_template(),
        twilio_like_template(),
        saas_platform_template(),
        healthcare_template(),
        slack_like_template(),
        discord_template(),
        linear_template(),
        notion_template(),
    ]
}
