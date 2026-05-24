use axum::{
    http::HeaderMap,
    response::Redirect,
};
use chrono::{Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::error::{AppError, ErrorCode};
use crate::middleware::{create_auth_cookie, create_refresh_token_cookie, generate_api_key, hash_api_key};
use crate::models::customer::Customer;

pub async fn find_or_create_sso_customer(
    pool: &PgPool,
    email: &str,
    attributes: &std::collections::HashMap<String, String>,
    provider: &str,
    domain_verified: bool,
) -> Result<Customer, AppError> {
    // Try to find existing customer
    let existing = sqlx::query_as::<_, Customer>(
        "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, current_period_end, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at, paused_at, paused_until, pause_plan, billing_interval, has_used_startup_trial, avatar_url FROM customers WHERE email = $1"
    )
    .bind(email)
    .fetch_optional(pool)
    .await?;

    if let Some(customer) = existing {
        if !customer.is_active {
            return Err(AppError::coded(ErrorCode::AccountDisabled));
        }
        tracing::info!("SSO login ({}): {}", provider, email);
        return Ok(customer);
    }

    // Auto-provision new customer
    let name: Option<String> = attributes.get("name")
        .or_else(|| attributes.get("displayName"))
        .map(|s| s.clone())
        .or_else(|| {
            let first = attributes.get("given_name").or_else(|| attributes.get("firstName"));
            let last = attributes.get("family_name").or_else(|| attributes.get("lastName"));
            match (first, last) {
                (Some(f), Some(l)) => Some(format!("{} {}", f, l)),
                (Some(f), None) => Some(f.clone()),
                _ => None,
            }
        });

    let api_key = generate_api_key();
    let api_key_hash = hash_api_key(&api_key);
    let api_key_prefix = api_key[..15].to_string();

    let customer = sqlx::query_as::<_, Customer>(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, name, is_active, email_verified)
         VALUES ($1, $2, $3, $4, true, $5)
         RETURNING *"
    )
    .bind(email)
    .bind(&api_key_hash)
    .bind(&api_key_prefix)
    .bind(&name)
    .bind(domain_verified)
    .fetch_one(pool)
    .await?;

    tracing::info!("New SSO customer created ({}): {} — API key prefix: {} — email_verified: {}", provider, email, api_key_prefix, domain_verified);

    Ok(customer)
}

// ── Helper: Auto-join SSO user to default team ──────────────
// ── Helper: Auto-join SSO user to a specific team (direct) ──
//
// Used by the new team-scoped SSO flow.
// `sso_user_id` — the SSO user who just logged in
// `team_id` — the team to join
// `default_role` — role to assign (from SSO config)

pub async fn auto_join_team_direct(
    pool: &PgPool,
    sso_user_id: Uuid,
    team_id: Uuid,
    default_role: &str,
) -> Result<(), AppError> {
    // Check if already a member
    let already_member: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM team_members WHERE team_id = $1 AND customer_id = $2"
    )
    .bind(team_id)
    .bind(sso_user_id)
    .fetch_optional(pool)
    .await?;

    if already_member.is_some() {
        return Ok(()); // Already a member
    }

    // Add to team
    sqlx::query(
        "INSERT INTO team_members (team_id, customer_id, role, joined_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING"
    )
    .bind(team_id)
    .bind(sso_user_id)
    .bind(default_role)
    .execute(pool)
    .await?;

    tracing::info!("✅ SSO auto-join: customer {} added to team {} as {}", sso_user_id, team_id, default_role);

    // Audit log
    let _ = crate::audit::log_action(pool, sso_user_id, "SSO_AUTO_JOIN_TEAM", "team",
        Some(&team_id.to_string()),
        Some(serde_json::json!({"role": default_role})),
        None, None).await;

    Ok(())
}

// ── Helper: Resolve role from IdP attributes using role_mapping ──
//
// role_mapping format:
// {
//   "Engineering": "developer",
//   "Management": "admin",
//   "Sales": "analyst",
//   "default": "viewer"
// }
//
// Checks IdP groups and roles attributes against the mapping.
// Returns the mapped role or the default_role fallback.

pub fn resolve_role_from_mapping(
    role_mapping: &Option<serde_json::Value>,
    idp_groups: &[String],
    idp_roles: &[String],
    default_role: &str,
) -> String {
    let mapping = match role_mapping {
        Some(m) => m,
        None => return default_role.to_string(),
    };

    let obj = match mapping.as_object() {
        Some(o) => o,
        None => return default_role.to_string(),
    };

    // Check IdP groups first
    for group in idp_groups {
        if let Some(role) = obj.get(group.as_str()) {
            if let Some(r) = role.as_str() {
                tracing::debug!("Role mapping: group '{}' → role '{}'", group, r);
                return r.to_string();
            }
        }
    }

    // Check IdP roles
    for role in idp_roles {
        if let Some(mapped_role) = obj.get(role.as_str()) {
            if let Some(r) = mapped_role.as_str() {
                tracing::debug!("Role mapping: role '{}' → mapped '{}'", role, r);
                return r.to_string();
            }
        }
    }

    // Return default from mapping or fallback
    obj.get("default")
        .and_then(|v| v.as_str())
        .unwrap_or(default_role)
        .to_string()
}

// ── Helper: Resolve team from email domain using team_mapping ──
//
// team_mapping format:
// {
//   "engineering.company.com": "team-uuid-1",
//   "sales.company.com": "team-uuid-2",
//   "default": "default-team-uuid"
// }
//
// Extracts domain from email, looks up in mapping.
// Returns the mapped team_id or None.

pub fn resolve_team_from_mapping(
    team_mapping: &Option<serde_json::Value>,
    email: &str,
    default_team_id: &Option<Uuid>,
) -> Option<Uuid> {
    let mapping = match team_mapping {
        Some(m) => m,
        None => return *default_team_id,
    };

    let obj = match mapping.as_object() {
        Some(o) => o,
        None => return *default_team_id,
    };

    // Extract domain from email
    let domain = email.split('@').nth(1).unwrap_or("");

    // Check domain mapping
    if let Some(team_id_str) = obj.get(domain) {
        if let Some(s) = team_id_str.as_str() {
            if let Ok(tid) = Uuid::parse_str(s) {
                tracing::debug!("Team mapping: domain '{}' → team '{}'", domain, tid);
                return Some(tid);
            }
        }
    }

    // Return default from mapping or fallback
    obj.get("default")
        .and_then(|v| v.as_str())
        .and_then(|s| Uuid::parse_str(s).ok())
        .or(*default_team_id)
}

// ── Helper: Store SSO user attributes ───────────────────────

pub async fn store_sso_user_attributes(
    pool: &PgPool,
    customer_id: Uuid,
    sso_config_id: Uuid,
    idp_user_id: Option<&str>,
    idp_groups: &[String],
    idp_roles: &[String],
    raw_attributes: &std::collections::HashMap<String, String>,
) -> Result<(), AppError> {
    sqlx::query(
        r#"INSERT INTO sso_user_attributes (customer_id, sso_config_id, idp_user_id, idp_groups, idp_roles, raw_attributes, last_synced_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (customer_id, sso_config_id) DO UPDATE SET
             idp_user_id = EXCLUDED.idp_user_id,
             idp_groups = EXCLUDED.idp_groups,
             idp_roles = EXCLUDED.idp_roles,
             raw_attributes = EXCLUDED.raw_attributes,
             last_synced_at = NOW()"#
    )
    .bind(customer_id)
    .bind(sso_config_id)
    .bind(idp_user_id)
    .bind(idp_groups)
    .bind(idp_roles)
    .bind(serde_json::to_value(raw_attributes).unwrap_or_default())
    .execute(pool)
    .await?;

    Ok(())
}

// ── Helper: Sync team membership based on IdP groups ────────
//
// If team_mapping maps a group to a team, ensure the user is a member.
// If the user was previously in a team but is no longer in the mapped group,
// they are NOT automatically removed (safety — manual removal required).

pub async fn sync_team_memberships(
    pool: &PgPool,
    customer_id: Uuid,
    idp_groups: &[String],
    team_mapping: &Option<serde_json::Value>,
    default_role: &str,
) -> Result<(), AppError> {
    let mapping = match team_mapping {
        Some(m) => m,
        None => return Ok(()),
    };

    let obj = match mapping.as_object() {
        Some(o) => o,
        None => return Ok(()),
    };

    // Check each IdP group against team mapping
    for group in idp_groups {
        if let Some(team_id_str) = obj.get(group.as_str()) {
            if let Some(s) = team_id_str.as_str() {
                if let Ok(team_id) = Uuid::parse_str(s) {
                    // Check if already a member
                    let existing: Option<(Uuid,)> = sqlx::query_as(
                        "SELECT id FROM team_members WHERE team_id = $1 AND customer_id = $2"
                    )
                    .bind(team_id)
                    .bind(customer_id)
                    .fetch_optional(pool)
                    .await?;

                    if existing.is_none() {
                        // Add to team
                        sqlx::query(
                            "INSERT INTO team_members (team_id, customer_id, role, joined_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING"
                        )
                        .bind(team_id)
                        .bind(customer_id)
                        .bind(default_role)
                        .execute(pool)
                        .await?;

                        tracing::info!("✅ Group sync: customer {} added to team {} (group '{}')", customer_id, team_id, group);

                        // Audit log
                        let _ = crate::audit::log_action(pool, customer_id, "SSO_GROUP_SYNC_JOIN", "team",
                            Some(&team_id.to_string()),
                            Some(serde_json::json!({"group": group, "role": default_role})),
                            None, None).await;
                    }
                }
            }
        }
    }

    Ok(())
}

// ── Helper: Generate SSO Login Response ─────────────────────

pub async fn generate_sso_response(
    pool: &PgPool,
    customer: &Customer,
    cfg: &crate::config::Config,
    redirect: Option<String>,
) -> Result<impl axum::response::IntoResponse, AppError> {

    let token = jwt::generate_access_token(
        customer.id,
        &customer.email,
        &customer.plan,
        &cfg.jwt_secret,
        customer.is_admin,
    )?;

    let refresh_token = jwt::generate_random_token();
    let refresh_hash = jwt::hash_token(&refresh_token);
    let expires_at = Utc::now() + Duration::days(30);

    sqlx::query(
        "INSERT INTO refresh_tokens (customer_id, token_hash, expires_at) VALUES ($1, $2, $3)"
    )
    .bind(customer.id)
    .bind(&refresh_hash)
    .bind(expires_at)
    .execute(pool)
    .await?;

    let app_url = cfg.app_url.as_deref().unwrap_or("https://hooksniff.vercel.app");
    let redirect_url = redirect.unwrap_or_else(|| format!("{}/dashboard", app_url));

    let auth_cookie = create_auth_cookie(&token, 3600); // 1 hour (matches JWT expiry)
    let refresh_cookie = create_refresh_token_cookie(&refresh_token, 30 * 86400);

    let mut headers = HeaderMap::new();
    let auth_val = axum::http::HeaderValue::from_str(&auth_cookie)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid auth cookie: {}", e)))?;
    let refresh_val = axum::http::HeaderValue::from_str(&refresh_cookie)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid refresh cookie: {}", e)))?;
    let redirect_val = axum::http::HeaderValue::from_str(&redirect_url)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid redirect URL: {}", e)))?;
    headers.insert("set-cookie", auth_val);
    headers.append("set-cookie", refresh_val);
    headers.insert("location", redirect_val);

    Ok((headers, Redirect::temporary(&redirect_url)))
}

// ── Helper: Log SSO Attempt ─────────────────────────────────

pub async fn log_sso_attempt(
    pool: &PgPool,
    customer_id: Option<Uuid>,
    email: &str,
    provider: &str,
    success: bool,
    error: Option<&str>,
    headers: &HeaderMap,
) {
    let ip = headers.get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");
    let ua = headers.get("user-agent")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");

    let _ = sqlx::query(
        "INSERT INTO sso_login_attempts (customer_id, email, provider, success, error_message, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)"
    )
    .bind(customer_id)
    .bind(email)
    .bind(provider)
    .bind(success)
    .bind(error)
    .bind(ip)
    .bind(ua)
    .execute(pool)
    .await;
}

