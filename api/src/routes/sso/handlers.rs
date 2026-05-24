//! SSO Handlers — Re-export layer
//!
//! All handler functions are split into sub-modules:
//! - `config` — SSO config CRUD, domain verification, test connection
//! - `login` — Login flow, SAML/OIDC callbacks, provider listing
//! - `scim` — SCIM 2.0 user provisioning
//! - `saml` — SAML parsing & signature verification
//! - `oidc` — OIDC token decoding & JWT verification
//! - `helpers` — Customer/team helper functions

// Re-export all handler functions for use in router
pub use super::config::*;
pub use super::login::*;
