#!/usr/bin/env python3
"""Split sso.rs into directory module following admin pattern.
Strategy: mod.rs has types+router, sub-modules have pub async fn handlers."""
import os, re

SRC = 'api/src/routes/sso.rs'
DST = 'api/src/routes/sso'

with open(SRC) as f:
    lines = f.readlines()

def get(start, end):
    return ''.join(lines[start-1:end-1])

os.makedirs(DST, exist_ok=True)

# ═══════════════════════════════════════════════════════════
# mod.rs — router + shared types + state store + tests
# ═══════════════════════════════════════════════════════════

# Lines 71-289: types (ConfigResponse, UpsertSsoRequest, OidcDiscovery, OidcTokenResponse, 
#   SamlAssertion, SsoLoginQuery, OidcCallbackQuery, SsoProviderQuery, SsoStateStore, TeamQuery)
# Lines 3541-end: tests

mod_header = """//! SSO/SAML/OIDC Configuration & Login API

pub mod config;
pub mod helpers;
pub mod login;
pub mod oidc;
pub mod saml;
pub mod scim;

use axum::{
    routing::{delete, get, post},
    Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

// ── Router ──────────────────────────────────────────────────

pub fn router() -> Router {
    Router::new()
        .route("/config", get(config::get_sso_config))
        .route("/config", post(config::upsert_sso_config))
        .route("/config", delete(config::delete_sso_config))
        .route("/test", post(config::test_sso_connection))
        .route("/verify-domain", post(config::initiate_domain_verification))
        .route("/verify-domain/check", post(config::check_domain_verification))
        .route("/login-attempts", get(config::get_login_attempts))
        .route("/scim/v2/Users", get(scim::scim_list_users).post(scim::scim_create_user))
        .route("/scim/v2/Users/{id}", get(scim::scim_get_user).put(scim::scim_update_user).patch(scim::scim_patch_user).delete(scim::scim_delete_user))
        .route("/scim/v2/Groups", get(scim::scim_list_groups))
        .route("/scim/v2/ServiceProviderConfig", get(scim::scim_service_provider_config))
        .route("/scim/v2/ResourceTypes", get(scim::scim_resource_types))
        .route("/scim/v2/Schemas", get(scim::scim_schemas))
}

pub fn public_router() -> Router {
    Router::new()
        .route("/login", get(login::initiate_sso_login))
        .route("/saml/callback", post(login::saml_callback))
        .route("/oidc/callback", get(login::oidc_callback))
        .route("/providers", get(login::list_sso_providers))
}

"""

# Extract types (lines 71-289)
types_section = get(71, 290)

# Extract tests (lines 3541-end)
tests_raw = get(3541, len(lines)+1)
# The test section starts with #[cfg(test)] mod tests {
# We need to keep it as mod tests in mod.rs
tests_section = tests_raw  # Already has #[cfg(test)] mod tests { ... }

mod_content = mod_header + types_section + "\n" + tests_section

with open(f'{DST}/mod.rs', 'w') as f:
    f.write(mod_content)
print("✅ mod.rs")

# ═══════════════════════════════════════════════════════════
# config.rs — config CRUD + verification + test + login attempts
# Lines 290-1029
# ═══════════════════════════════════════════════════════════

config_body = get(290, 1030)

config_content = """use axum::{
    extract::{Extension, Query},
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use std::collections::HashMap;

use crate::crypto;
use crate::error::{AppError, ErrorCode};
use crate::middleware::hash_api_key;
use crate::models::customer::Customer;
use super::TeamQuery;

""" + config_body

# Make functions pub
for fn_name in ['get_sso_config', 'upsert_sso_config', 'delete_sso_config', 
                'test_sso_connection', 'get_login_attempts', 
                'initiate_domain_verification', 'check_domain_verification']:
    config_content = config_content.replace(f'async fn {fn_name}(', f'pub async fn {fn_name}(')
# Also make helper fn pub
config_content = config_content.replace('fn sso_config_to_json(', 'pub fn sso_config_to_json(')

with open(f'{DST}/config.rs', 'w') as f:
    f.write(config_content)
print("✅ config.rs")

# ═══════════════════════════════════════════════════════════
# login.rs — login flow + callbacks + providers
# Lines 1030-1884
# ═══════════════════════════════════════════════════════════

login_body = get(1030, 1885)

login_content = """use axum::{
    extract::{Extension, Query},
    http::HeaderMap,
    response::Redirect,
    Json,
};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::crypto;
use crate::error::{AppError, ErrorCode};
use crate::middleware::{create_auth_cookie, create_refresh_token_cookie, generate_api_key, hash_api_key};
use crate::models::customer::Customer;
use super::{SsoLoginQuery, OidcCallbackQuery, SsoProviderQuery, SsoStateStore, SsoLoginState};
use super::saml;
use super::oidc;
use super::helpers;

""" + login_body

# Make functions pub
for fn_name in ['initiate_sso_login', 'initiate_saml_login', 'initiate_oidc_login',
                'saml_callback', 'oidc_callback', 'list_sso_providers']:
    login_content = login_content.replace(f'async fn {fn_name}(', f'pub async fn {fn_name}(')

# Fix cross-module calls
login_content = login_content.replace('find_or_create_sso_customer(', 'helpers::find_or_create_sso_customer(')
login_content = login_content.replace('generate_sso_response(', 'helpers::generate_sso_response(')
login_content = login_content.replace('log_sso_attempt(', 'helpers::log_sso_attempt(')
login_content = login_content.replace('auto_join_team_direct(', 'helpers::auto_join_team_direct(')
login_content = login_content.replace('resolve_role_from_mapping(', 'helpers::resolve_role_from_mapping(')
login_content = login_content.replace('resolve_team_from_mapping(', 'helpers::resolve_team_from_mapping(')
login_content = login_content.replace('store_sso_user_attributes(', 'helpers::store_sso_user_attributes(')
login_content = login_content.replace('sync_team_memberships(', 'helpers::sync_team_memberships(')
login_content = login_content.replace('parse_saml_response(', 'saml::parse_saml_response(')
login_content = login_content.replace('verify_saml_signature(', 'saml::verify_saml_signature(')
login_content = login_content.replace('decode_oidc_id_token(', 'oidc::decode_oidc_id_token(')
login_content = login_content.replace('verify_jwt_signature(', 'oidc::verify_jwt_signature(')

with open(f'{DST}/login.rs', 'w') as f:
    f.write(login_content)
print("✅ login.rs")

# ═══════════════════════════════════════════════════════════
# helpers.rs — customer/team helper functions
# Lines 2264-2655
# ═══════════════════════════════════════════════════════════

helpers_body = get(2264, 2656)

helpers_content = """use axum::extract::Extension;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::crypto;
use crate::error::{AppError, ErrorCode};
use crate::middleware::{create_auth_cookie, create_refresh_token_cookie, generate_api_key, hash_api_key};
use crate::models::customer::Customer;
use super::SsoLoginState;

""" + helpers_body

# Make functions pub
for fn_name in ['find_or_create_sso_customer', 'auto_join_team_direct',
                'resolve_role_from_mapping', 'resolve_team_from_mapping',
                'store_sso_user_attributes', 'sync_team_memberships',
                'generate_sso_response', 'log_sso_attempt']:
    helpers_content = helpers_content.replace(f'async fn {fn_name}(', f'pub async fn {fn_name}(')
# Also non-async fns
helpers_content = helpers_content.replace('fn resolve_role_from_mapping(', 'pub fn resolve_role_from_mapping(')
helpers_content = helpers_content.replace('fn resolve_team_from_mapping(', 'pub fn resolve_team_from_mapping(')

with open(f'{DST}/helpers.rs', 'w') as f:
    f.write(helpers_content)
print("✅ helpers.rs")

# ═══════════════════════════════════════════════════════════
# saml.rs — SAML parsing + signature verification
# Lines 1885-2130 + 2656-2842
# ═══════════════════════════════════════════════════════════

saml_parsing = get(1885, 2131)
saml_sig = get(2656, 2843)

saml_content = """use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::error::AppError;
use super::SamlAssertion;

""" + saml_parsing + "\n" + saml_sig

# Make functions pub
for fn_name in ['parse_saml_response', 'extract_xml_text', 'extract_xml_attribute',
                'extract_saml_attribute', 'local_name_matches', 'xml_has_element',
                'verify_saml_signature', 'extract_signed_info_xml', 'extract_certificate_der',
                'extract_rsa_public_key_from_der', 'find_byte_sequence', 'read_asn1_length',
                '_vec_identity']:
    saml_content = saml_content.replace(f'fn {fn_name}(', f'pub fn {fn_name}(')

with open(f'{DST}/saml.rs', 'w') as f:
    f.write(saml_content)
print("✅ saml.rs")

# ═══════════════════════════════════════════════════════════
# oidc.rs — OIDC helpers
# Lines 2131-2263
# ═══════════════════════════════════════════════════════════

oidc_body = get(2131, 2264)

oidc_content = """use chrono::{DateTime, Duration, Utc};

use crate::error::AppError;

""" + oidc_body

oidc_content = oidc_content.replace('fn decode_oidc_id_token(', 'pub fn decode_oidc_id_token(')
oidc_content = oidc_content.replace('async fn verify_jwt_signature(', 'pub async fn verify_jwt_signature(')

with open(f'{DST}/oidc.rs', 'w') as f:
    f.write(oidc_content)
print("✅ oidc.rs")

# ═══════════════════════════════════════════════════════════
# scim.rs — SCIM 2.0 endpoints
# Lines 2843-3540
# ═══════════════════════════════════════════════════════════

scim_body = get(2843, 3541)

scim_content = """use axum::{
    extract::{Extension, Path, Query},
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use std::collections::HashMap;

use crate::error::{AppError, ErrorCode};
use crate::middleware::hash_api_key;
use crate::models::customer::Customer;
use super::SsoUserAttributesRow;

""" + scim_body

# Make functions pub
for fn_name in ['validate_scim_token', 'scim_user_response',
                'scim_list_users', 'scim_get_user', 'scim_create_user',
                'scim_update_user', 'scim_patch_user', 'scim_delete_user',
                'scim_list_groups', 'scim_service_provider_config',
                'scim_resource_types', 'scim_schemas']:
    scim_content = scim_content.replace(f'async fn {fn_name}(', f'pub async fn {fn_name}(')
# Also non-async
scim_content = scim_content.replace('fn scim_user_response(', 'pub fn scim_user_response(')

with open(f'{DST}/scim.rs', 'w') as f:
    f.write(scim_content)
print("✅ scim.rs")

# Delete old file
os.remove(SRC)
print(f"\n✅ Deleted {SRC}")
print("Run: cargo check")
