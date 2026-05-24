#!/usr/bin/env python3
"""Split sso.rs into directory module sub-files."""
import os

with open('api/src/routes/sso.rs', 'r') as f:
    lines = f.readlines()

def extract(start, end):
    """Extract lines (1-indexed, inclusive)."""
    return ''.join(lines[start-1:end-1])

def extract_with_imports(start, end, extra_imports=None):
    """Extract lines with optional extra imports at top."""
    body = extract(start, end)
    if extra_imports:
        return extra_imports + '\n\n' + body
    return body

# Create output directory
os.makedirs('api/src/routes/sso', exist_ok=True)

# Common imports for all handler modules
HANDLER_IMPORTS = """use axum::{
    extract::{Extension, Query},
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use super::types::*;
"""

# ── 1. types.rs ──
# Lines 1-29 (imports) + Lines 71-289 (types)
types_imports = """use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;"""

# Extract just the type definitions (lines 71-289)
types_body = extract(71, 290)
# Remove the duplicate imports that are already in types_imports
types_content = types_imports + '\n\n' + types_body

with open('api/src/routes/sso/types.rs', 'w') as f:
    f.write(types_content)

print("✅ types.rs written")

# ── 2. config.rs ──
# Lines 290-656 (config CRUD) + Lines 657-879 (verification) + Lines 880-1029 (test)
config_body = extract(290, 1030)
config_content = HANDLER_IMPORTS + """use axum::http::StatusCode;
use crate::crypto;
use crate::error::ErrorCode;
use crate::middleware::hash_api_key;

""" + config_body

with open('api/src/routes/sso/config.rs', 'w') as f:
    f.write(config_content)

print("✅ config.rs written")

# ── 3. login.rs ──
# Lines 1030-1884 (login flow + callbacks + providers)
login_body = extract(1030, 1885)
login_content = HANDLER_IMPORTS + """use axum::http::HeaderMap;
use axum::response::Redirect;
use crate::auth::jwt;
use crate::crypto;
use crate::error::ErrorCode;
use crate::middleware::{create_auth_cookie, create_refresh_token_cookie, generate_api_key, hash_api_key};

""" + login_body

with open('api/src/routes/sso/login.rs', 'w') as f:
    f.write(login_content)

print("✅ login.rs written")

# ── 4. saml.rs ──
# Lines 1885-2130 (SAML parsing) + Lines 2656-2842 (SAML signature verification)
saml_parsing = extract(1885, 2131)
saml_sig = extract(2656, 2843)
saml_content = """use chrono::{DateTime, Utc};
use serde::Deserialize;
use uuid::Uuid;

use crate::error::AppError;

""" + saml_parsing + '\n' + saml_sig

with open('api/src/routes/sso/saml.rs', 'w') as f:
    f.write(saml_content)

print("✅ saml.rs written")

# ── 5. oidc.rs ──
# Lines 2131-2263 (OIDC helpers)
oidc_body = extract(2131, 2264)
oidc_content = """use crate::error::AppError;

""" + oidc_body

with open('api/src/routes/sso/oidc.rs', 'w') as f:
    f.write(oidc_content)

print("✅ oidc.rs written")

# ── 6. helpers.rs ──
# Lines 2264-2655 (customer helpers + log attempt)
helpers_body = extract(2264, 2656)
helpers_content = HANDLER_IMPORTS + """use crate::error::ErrorCode;
use crate::middleware::{generate_api_key, hash_api_key};

""" + helpers_body

with open('api/src/routes/sso/helpers.rs', 'w') as f:
    f.write(helpers_content)

print("✅ helpers.rs written")

# ── 7. scim.rs ──
# Lines 2843-3540 (SCIM endpoints)
scim_body = extract(2843, 3541)
scim_content = HANDLER_IMPORTS + """use axum::extract::Path;
use crate::error::ErrorCode;
use crate::middleware::hash_api_key;

""" + scim_body

with open('api/src/routes/sso/scim.rs', 'w') as f:
    f.write(scim_content)

print("✅ scim.rs written")

# ── 8. tests.rs ──
# Lines 3541-end
tests_body = extract(3541, len(lines) + 1)
tests_content = """#[cfg(test)]
mod tests {
""" + tests_body.split('mod tests {', 1)[1] if 'mod tests {' in tests_body else tests_body

with open('api/src/routes/sso/tests.rs', 'w') as f:
    f.write(tests_content)

print("✅ tests.rs written")

# ── 9. mod.rs ──
mod_content = """//! SSO/SAML/OIDC Configuration & Login API
//!
//! Split into sub-modules for maintainability.

mod types;
mod config;
mod login;
mod saml;
mod oidc;
mod helpers;
mod scim;
#[cfg(test)]
mod tests;

// Re-export types used by other modules
pub use types::{SsoConfigResponse, SsoLoginQuery, SsoProviderQuery, SsoStateStore, TeamQuery, UpsertSsoRequest};

use axum::{
    routing::{delete, get, post},
    Router,
};

pub fn router() -> Router {
    Router::new()
        // Config CRUD (authenticated)
        .route("/config", get(config::get_sso_config))
        .route("/config", post(config::upsert_sso_config))
        .route("/config", delete(config::delete_sso_config))
        // Test (authenticated)
        .route("/test", post(config::test_sso_connection))
        // Domain verification
        .route("/verify-domain", post(config::initiate_domain_verification))
        .route("/verify-domain/check", post(config::check_domain_verification))
        // Login attempts
        .route("/login-attempts", get(config::get_login_attempts))
        // SCIM endpoints (authenticated with SCIM token)
        .route("/scim/v2/Users", get(scim::scim_list_users).post(scim::scim_create_user))
        .route("/scim/v2/Users/{id}", get(scim::scim_get_user).put(scim::scim_update_user).patch(scim::scim_patch_user).delete(scim::scim_delete_user))
        .route("/scim/v2/Groups", get(scim::scim_list_groups))
        .route("/scim/v2/ServiceProviderConfig", get(scim::scim_service_provider_config))
        .route("/scim/v2/ResourceTypes", get(scim::scim_resource_types))
        .route("/scim/v2/Schemas", get(scim::scim_schemas))
}

/// Public SSO routes (login + callbacks) — no auth required
pub fn public_router() -> Router {
    Router::new()
        .route("/login", get(login::initiate_sso_login))
        .route("/saml/callback", post(login::saml_callback))
        .route("/oidc/callback", get(login::oidc_callback))
        .route("/providers", get(login::list_sso_providers))
}
"""

with open('api/src/routes/sso/mod.rs', 'w') as f:
    f.write(mod_content)

print("✅ mod.rs written")
print("\nDone! Now run: cargo check")
