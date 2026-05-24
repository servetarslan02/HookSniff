#!/usr/bin/env python3
"""Fix all sso sub-modules with proper imports and visibility."""
import re

def fix_types():
    """Fix types.rs: remove duplicate imports, make types pub(crate)."""
    with open('api/src/routes/sso/types.rs', 'r') as f:
        content = f.read()
    
    # Remove duplicate HashMap/Arc/Mutex import block (lines 103-105 area)
    content = content.replace(
        '// ── State Storage (in-memory for now, should be Redis) ──────\n\nuse std::collections::HashMap;\nuse std::sync::Arc;\nuse tokio::sync::Mutex;\n',
        '// ── State Storage (in-memory for now, should be Redis) ──────\n'
    )
    
    # Make private types pub(crate)
    content = content.replace('struct OidcDiscovery {', 'pub(crate) struct OidcDiscovery {')
    content = content.replace('struct OidcTokenResponse {', 'pub(crate) struct OidcTokenResponse {')
    content = content.replace('struct SamlAssertion {', 'pub(crate) struct SamlAssertion {')
    content = content.replace('struct SsoLoginState {', 'pub(crate) struct SsoLoginState {')
    
    # Make fields pub(crate) for types used cross-module
    content = content.replace('    authorization_endpoint: String,', '    pub(crate) authorization_endpoint: String,')
    content = content.replace('    token_endpoint: String,', '    pub(crate) token_endpoint: String,')
    content = content.replace('    issuer: String,', '    pub(crate) issuer: String,')
    content = content.replace('    jwks_uri: Option<String>,', '    pub(crate) jwks_uri: Option<String>,')
    content = content.replace('    id_token: Option<String>,', '    pub(crate) id_token: Option<String>,')
    content = content.replace('    name_id: String,', '    pub(crate) name_id: String,')
    content = content.replace('    session_index: Option<String>,', '    pub(crate) session_index: Option<String>,')
    content = content.replace('    attributes: std::collections::HashMap<String, String>,', '    pub(crate) attributes: std::collections::HashMap<String, String>,')
    content = content.replace('    not_on_or_after: Option<DateTime<Utc>>,', '    pub(crate) not_on_or_after: Option<DateTime<Utc>>,')
    content = content.replace('    in_response_to: Option<String>,', '    pub(crate) in_response_to: Option<String>,')
    content = content.replace('    destination: Option<String>,', '    pub(crate) destination: Option<String>,')
    content = content.replace('    audience: Option<String>,', '    pub(crate) audience: Option<String>,')
    content = content.replace('    certificate: Option<String>,', '    pub(crate) certificate: Option<String>,')
    
    # Make SsoLoginState fields pub(crate)
    content = content.replace('    customer_id: Uuid,\n    email: String,\n    provider: String,', 
                              '    pub(crate) customer_id: Uuid,\n    pub(crate) email: String,\n    pub(crate) provider: String,')
    content = content.replace('    redirect: Option<String>,\n    saml_request_id: Option<String>,\n    auto_join_team_id: Option<Uuid>,',
                              '    pub(crate) redirect: Option<String>,\n    pub(crate) saml_request_id: Option<String>,\n    pub(crate) auto_join_team_id: Option<Uuid>,')
    content = content.replace('    default_role: String,\n    nonce: Option<String>,\n    created_at: DateTime<Utc>,',
                              '    pub(crate) default_role: String,\n    pub(crate) nonce: Option<String>,\n    pub(crate) created_at: DateTime<Utc>,')
    content = content.replace('    sso_config_id: Uuid,\n    role_mapping: Option<serde_json::Value>,\n    team_mapping: Option<serde_json::Value>,',
                              '    pub(crate) sso_config_id: Uuid,\n    pub(crate) role_mapping: Option<serde_json::Value>,\n    pub(crate) team_mapping: Option<serde_json::Value>,')
    
    # Make SsoStateStore methods pub(crate)
    content = content.replace('    async fn insert(', '    pub(crate) async fn insert(')
    content = content.replace('    async fn remove(', '    pub(crate) async fn remove(')
    
    # Make SsoStateStore fields pub(crate)
    content = content.replace('    states: Arc<Mutex<HashMap<String, SsoLoginState>>>,', '    pub(crate) states: Arc<Mutex<HashMap<String, SsoLoginState>>>,')
    content = content.replace('    redis: Option<redis::aio::ConnectionManager>,', '    pub(crate) redis: Option<redis::aio::ConnectionManager>,')
    
    # Make const pub(crate)
    content = content.replace('const SSO_STATE_TTL_SECS:', 'pub(crate) const SSO_STATE_TTL_SECS:')
    
    with open('api/src/routes/sso/types.rs', 'w') as f:
        f.write(content)
    print("✅ types.rs fixed")

def fix_config():
    """Fix config.rs imports."""
    with open('api/src/routes/sso/config.rs', 'r') as f:
        content = f.read()
    
    # Remove the auto-generated header and add proper imports
    new_header = """use axum::{
    extract::{Extension, Query},
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
use super::types::*;
"""
    
    # Find the first actual code line (after the old header)
    # The old header ends with "use super::types::*;\n\n"
    old_header_end = content.find('// ── Query params')
    if old_header_end == -1:
        old_header_end = content.find('// ── GET /sso/config')
    if old_header_end == -1:
        old_header_end = content.find('struct SsoConfigRow')
    
    # Find where the actual handler content starts
    content = new_header + '\n' + content[old_header_end:]
    
    # Make handler functions pub(crate)
    content = content.replace('async fn get_sso_config(', 'pub(crate) async fn get_sso_config(')
    content = content.replace('async fn upsert_sso_config(', 'pub(crate) async fn upsert_sso_config(')
    content = content.replace('async fn delete_sso_config(', 'pub(crate) async fn delete_sso_config(')
    content = content.replace('async fn test_sso_connection(', 'pub(crate) async fn test_sso_connection(')
    content = content.replace('async fn get_login_attempts(', 'pub(crate) async fn get_login_attempts(')
    content = content.replace('async fn initiate_domain_verification(', 'pub(crate) async fn initiate_domain_verification(')
    content = content.replace('async fn check_domain_verification(', 'pub(crate) async fn check_domain_verification(')
    content = content.replace('fn sso_config_to_json(', 'pub(crate) fn sso_config_to_json(')
    
    with open('api/src/routes/sso/config.rs', 'w') as f:
        f.write(content)
    print("✅ config.rs fixed")

def fix_login():
    """Fix login.rs imports."""
    with open('api/src/routes/sso/login.rs', 'r') as f:
        content = f.read()
    
    new_header = """use axum::{
    extract::{Extension, Query},
    http::HeaderMap,
    response::Redirect,
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::crypto;
use crate::error::{AppError, ErrorCode};
use crate::middleware::{create_auth_cookie, create_refresh_token_cookie, generate_api_key, hash_api_key};
use crate::models::customer::Customer;
use super::types::*;
use super::saml;
use super::oidc;
use super::helpers;
"""
    
    # Find where actual code starts
    first_fn = content.find('pub(crate) async fn')
    if first_fn == -1:
        first_fn = content.find('async fn initiate_sso_login')
    if first_fn == -1:
        first_fn = content.find('// ── GET /sso/login')
    
    # Find the section marker
    section_start = content.find('// ── GET /sso/login')
    if section_start == -1:
        section_start = content.find('async fn initiate_sso_login')
    
    content = new_header + '\n' + content[section_start:]
    
    # Make handler functions pub(crate)
    content = content.replace('async fn initiate_sso_login(', 'pub(crate) async fn initiate_sso_login(')
    content = content.replace('async fn initiate_saml_login(', 'pub(crate) async fn initiate_saml_login(')
    content = content.replace('async fn initiate_oidc_login(', 'pub(crate) async fn initiate_oidc_login(')
    content = content.replace('async fn saml_callback(', 'pub(crate) async fn saml_callback(')
    content = content.replace('async fn oidc_callback(', 'pub(crate) async fn oidc_callback(')
    content = content.replace('async fn list_sso_providers(', 'pub(crate) async fn list_sso_providers(')
    
    # Fix cross-module function calls: add module prefixes
    # These functions are in helpers module
    content = content.replace('find_or_create_sso_customer(', 'helpers::find_or_create_sso_customer(')
    content = content.replace('generate_sso_response(', 'helpers::generate_sso_response(')
    content = content.replace('log_sso_attempt(', 'helpers::log_sso_attempt(')
    content = content.replace('auto_join_team_direct(', 'helpers::auto_join_team_direct(')
    content = content.replace('resolve_role_from_mapping(', 'helpers::resolve_role_from_mapping(')
    content = content.replace('resolve_team_from_mapping(', 'helpers::resolve_team_from_mapping(')
    content = content.replace('store_sso_user_attributes(', 'helpers::store_sso_user_attributes(')
    content = content.replace('sync_team_memberships(', 'helpers::sync_team_memberships(')
    
    # These functions are in saml module
    content = content.replace('parse_saml_response(', 'saml::parse_saml_response(')
    content = content.replace('verify_saml_signature(', 'saml::verify_saml_signature(')
    
    # These functions are in oidc module
    content = content.replace('decode_oidc_id_token(', 'oidc::decode_oidc_id_token(')
    content = content.replace('verify_jwt_signature(', 'oidc::verify_jwt_signature(')
    
    with open('api/src/routes/sso/login.rs', 'w') as f:
        f.write(content)
    print("✅ login.rs fixed")

def fix_helpers():
    """Fix helpers.rs imports and visibility."""
    with open('api/src/routes/sso/helpers.rs', 'r') as f:
        content = f.read()
    
    new_header = """use axum::{
    extract::Extension,
    Json,
};
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::crypto;
use crate::error::{AppError, ErrorCode};
use crate::middleware::{create_auth_cookie, create_refresh_token_cookie, generate_api_key, hash_api_key};
use crate::models::customer::Customer;
use super::types::*;
"""
    
    section_start = content.find('// ── Helper: Find or Create')
    if section_start == -1:
        section_start = content.find('async fn find_or_create_sso_customer')
    
    content = new_header + '\n' + content[section_start:]
    
    # Make all functions pub(crate)
    content = content.replace('async fn find_or_create_sso_customer(', 'pub(crate) async fn find_or_create_sso_customer(')
    content = content.replace('async fn auto_join_team_direct(', 'pub(crate) async fn auto_join_team_direct(')
    content = content.replace('fn resolve_role_from_mapping(', 'pub(crate) fn resolve_role_from_mapping(')
    content = content.replace('fn resolve_team_from_mapping(', 'pub(crate) fn resolve_team_from_mapping(')
    content = content.replace('async fn store_sso_user_attributes(', 'pub(crate) async fn store_sso_user_attributes(')
    content = content.replace('async fn sync_team_memberships(', 'pub(crate) async fn sync_team_memberships(')
    content = content.replace('async fn generate_sso_response(', 'pub(crate) async fn generate_sso_response(')
    content = content.replace('async fn log_sso_attempt(', 'pub(crate) async fn log_sso_attempt(')
    
    with open('api/src/routes/sso/helpers.rs', 'w') as f:
        f.write(content)
    print("✅ helpers.rs fixed")

def fix_saml():
    """Fix saml.rs visibility."""
    with open('api/src/routes/sso/saml.rs', 'r') as f:
        content = f.read()
    
    # Make all functions pub(crate)
    content = content.replace('fn parse_saml_response(', 'pub(crate) fn parse_saml_response(')
    content = content.replace('fn extract_xml_text(', 'pub(crate) fn extract_xml_text(')
    content = content.replace('fn extract_xml_attribute(', 'pub(crate) fn extract_xml_attribute(')
    content = content.replace('fn extract_saml_attribute(', 'pub(crate) fn extract_saml_attribute(')
    content = content.replace('fn local_name_matches(', 'pub(crate) fn local_name_matches(')
    content = content.replace('fn xml_has_element(', 'pub(crate) fn xml_has_element(')
    content = content.replace('fn verify_saml_signature(', 'pub(crate) fn verify_saml_signature(')
    content = content.replace('fn extract_signed_info_xml(', 'pub(crate) fn extract_signed_info_xml(')
    content = content.replace('fn extract_certificate_der(', 'pub(crate) fn extract_certificate_der(')
    content = content.replace('fn extract_rsa_public_key_from_der(', 'pub(crate) fn extract_rsa_public_key_from_der(')
    content = content.replace('fn find_byte_sequence(', 'pub(crate) fn find_byte_sequence(')
    content = content.replace('fn read_asn1_length(', 'pub(crate) fn read_asn1_length(')
    content = content.replace('fn _vec_identity(', 'pub(crate) fn _vec_identity(')
    
    with open('api/src/routes/sso/saml.rs', 'w') as f:
        f.write(content)
    print("✅ saml.rs fixed")

def fix_oidc():
    """Fix oidc.rs visibility."""
    with open('api/src/routes/sso/oidc.rs', 'r') as f:
        content = f.read()
    
    content = content.replace('fn decode_oidc_id_token(', 'pub(crate) fn decode_oidc_id_token(')
    content = content.replace('async fn verify_jwt_signature(', 'pub(crate) async fn verify_jwt_signature(')
    
    with open('api/src/routes/sso/oidc.rs', 'w') as f:
        f.write(content)
    print("✅ oidc.rs fixed")

def fix_scim():
    """Fix scim.rs imports and visibility."""
    with open('api/src/routes/sso/scim.rs', 'r') as f:
        content = f.read()
    
    new_header = """use axum::{
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
use super::types::*;
"""
    
    section_start = content.find('// ── SCIM 2.0')
    if section_start == -1:
        section_start = content.find('async fn validate_scim_token')
    
    content = new_header + '\n' + content[section_start:]
    
    # Make all functions pub(crate)
    content = content.replace('async fn validate_scim_token(', 'pub(crate) async fn validate_scim_token(')
    content = content.replace('fn scim_user_response(', 'pub(crate) fn scim_user_response(')
    content = content.replace('async fn scim_list_users(', 'pub(crate) async fn scim_list_users(')
    content = content.replace('async fn scim_get_user(', 'pub(crate) async fn scim_get_user(')
    content = content.replace('async fn scim_create_user(', 'pub(crate) async fn scim_create_user(')
    content = content.replace('async fn scim_update_user(', 'pub(crate) async fn scim_update_user(')
    content = content.replace('async fn scim_patch_user(', 'pub(crate) async fn scim_patch_user(')
    content = content.replace('async fn scim_delete_user(', 'pub(crate) async fn scim_delete_user(')
    content = content.replace('async fn scim_list_groups(', 'pub(crate) async fn scim_list_groups(')
    content = content.replace('async fn scim_service_provider_config(', 'pub(crate) async fn scim_service_provider_config(')
    content = content.replace('async fn scim_resource_types(', 'pub(crate) async fn scim_resource_types(')
    content = content.replace('async fn scim_schemas(', 'pub(crate) async fn scim_schemas(')
    
    with open('api/src/routes/sso/scim.rs', 'w') as f:
        f.write(content)
    print("✅ scim.rs fixed")

# Run all fixes
fix_types()
fix_config()
fix_login()
fix_helpers()
fix_saml()
fix_oidc()
fix_scim()
print("\nAll files fixed. Run: cargo check")
