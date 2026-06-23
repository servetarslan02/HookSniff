use axum::{
    extract::{Extension, Query},
    http::HeaderMap,
    response::{IntoResponse, Redirect},
};
use sqlx::PgPool;

use crate::config::Config;
use crate::error::ErrorCode;
use crate::error::AppError;
use crate::middleware::{create_auth_cookie, create_refresh_token_cookie};

use super::helpers::*;

pub struct GoogleTokenResponse {
    pub access_token: String,
}

pub struct GoogleUserInfo {
    pub email: String,
    pub name: Option<String>,
    pub picture: Option<String>,
}

/// GET /oauth/google — Redirect to Google OAuth consent screen
pub async fn google_login(
    Extension(_cfg): Extension<Config>,
) -> Result<impl axum::response::IntoResponse, AppError> {
    let client_id = std::env::var("GOOGLE_CLIENT_ID")
        .map_err(|_| AppError::coded(ErrorCode::GoogleOauthNotConfigured))?;

    let redirect_base = std::env::var("OAUTH_REDIRECT_BASE")
        .unwrap_or_else(|_| "https://hooksniff-api-499907444852.europe-west1.run.app".to_string());

    let redirect_uri = format!("{}/v1/oauth/google/callback", redirect_base);
    let state = uuid::Uuid::new_v4().to_string();

    let pkce_verifier = generate_pkce_verifier();
    let pkce_challenge = compute_pkce_challenge(&pkce_verifier);

    let url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=openid%20email%20profile&state={}&access_type=offline&code_challenge={}&code_challenge_method=S256",
        client_id,
        urlencoding::encode(&redirect_uri),
        state,
        pkce_challenge
    );

    let state_cookie = format!(
        "{}={}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age={}",
        OAUTH_STATE_COOKIE, state, OAUTH_STATE_MAX_AGE
    );
    let pkce_cookie = format!(
        "{}={}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age={}",
        OAUTH_PKCE_COOKIE, pkce_verifier, OAUTH_STATE_MAX_AGE
    );
    // Build response manually to guarantee Set-Cookie is included
    let mut response = axum::response::Html(format!(
        "<html><head><meta http-equiv=\"refresh\" content=\"0;url={url}\"></head><body>Redirecting...</body></html>"
    , url = url))
    .into_response();
    response.headers_mut().insert("set-cookie", axum::http::HeaderValue::from_str(&state_cookie).unwrap_or_else(|_| axum::http::HeaderValue::from_static("")));
    response.headers_mut().append("set-cookie", axum::http::HeaderValue::from_str(&pkce_cookie).unwrap_or_else(|_| axum::http::HeaderValue::from_static("")));
    response.headers_mut().insert("location", axum::http::HeaderValue::from_str(&url).unwrap_or_else(|_| axum::http::HeaderValue::from_static("/")));
    *response.status_mut() = axum::http::StatusCode::TEMPORARY_REDIRECT;
    Ok(response)
}

/// GET /oauth/google/callback — Handle Google OAuth callback
pub async fn google_callback(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Query(params): Query<OAuthCallback>,
    req: axum::extract::Request,
) -> Result<impl axum::response::IntoResponse, AppError> {
    if let Some(_error) = params.error {
        let url = "/login?error=oauth_denied";
        return Ok((HeaderMap::new(), Redirect::temporary(url)));
    }

    let code = params
        .code
        .ok_or_else(|| AppError::coded(ErrorCode::OidcMissingCode))?;

    let expected_state = params
        .state
        .ok_or_else(|| AppError::coded(ErrorCode::OidcMissingState))?;
    verify_oauth_state(&req, &expected_state)?;

    let pkce_verifier = extract_pkce_verifier(&req);

    let client_id = std::env::var("GOOGLE_CLIENT_ID")
        .map_err(|_| AppError::coded(ErrorCode::GoogleOauthNotConfigured))?;

    let client_secret = std::env::var("GOOGLE_CLIENT_SECRET")
        .map_err(|_| AppError::coded(ErrorCode::GoogleOauthNotConfigured))?;

    let redirect_base = std::env::var("OAUTH_REDIRECT_BASE")
        .unwrap_or_else(|_| "https://hooksniff-api-499907444852.europe-west1.run.app".to_string());
    let redirect_uri = format!("{}/v1/oauth/google/callback", redirect_base);

    let token_response =
        exchange_google_code(&code, &client_id, &client_secret, &redirect_uri, pkce_verifier.as_deref()).await?;

    let user_info = get_google_user_info(&token_response.access_token).await?;

    let customer =
        find_or_create_oauth_customer(&pool, &user_info.email, &user_info.name, "google", user_info.picture.as_deref()).await?;

    let token = crate::auth::jwt::generate_access_token(
        customer.id,
        &customer.email,
        &customer.plan,
        &cfg.jwt_secret,
        customer.is_admin,
    )?;
    let refresh_token_value = create_refresh_token(&pool, customer.id).await?;

    let app_url = cfg.app_url.as_deref().unwrap_or("https://hooksniff.vercel.app");
    let auth_cookie = create_auth_cookie(&token, 3600);
    let refresh_cookie = create_refresh_token_cookie(&refresh_token_value, 90 * 86400);
    let state_clear = clear_oauth_state_cookie();
    let pkce_clear = clear_pkce_cookie();

    let mut headers = HeaderMap::new();
    headers.insert("set-cookie", axum::http::HeaderValue::from_str(&auth_cookie).unwrap_or_else(|_| axum::http::HeaderValue::from_static("")));
    headers.append("set-cookie", axum::http::HeaderValue::from_str(&refresh_cookie).unwrap_or_else(|_| axum::http::HeaderValue::from_static("")));
    headers.append("set-cookie", axum::http::HeaderValue::from_str(&state_clear).unwrap_or_else(|_| axum::http::HeaderValue::from_static("")));
    headers.append("set-cookie", axum::http::HeaderValue::from_str(&pkce_clear).unwrap_or_else(|_| axum::http::HeaderValue::from_static("")));

    let redirect_url = format!("{}/auth/callback?token={}&refresh={}", app_url, urlencoding::encode(&token), urlencoding::encode(&refresh_token_value));
    headers.insert("location", axum::http::HeaderValue::from_str(&redirect_url).unwrap_or_else(|_| axum::http::HeaderValue::from_static("/")));
    Ok((headers, axum::response::Redirect::temporary(&redirect_url)))
}

/// Exchange Google OAuth code for access token
pub async fn exchange_google_code(
    code: &str,
    client_id: &str,
    client_secret: &str,
    redirect_uri: &str,
    code_verifier: Option<&str>,
) -> Result<GoogleTokenResponse, AppError> {
    let client = crate::http_client::get_client().clone();

    let mut params = vec![
        ("code", code.to_string()),
        ("client_id", client_id.to_string()),
        ("client_secret", client_secret.to_string()),
        ("redirect_uri", redirect_uri.to_string()),
        ("grant_type", "authorization_code".to_string()),
    ];
    if let Some(verifier) = code_verifier {
        params.push(("code_verifier", verifier.to_string()));
    }

    let resp = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Google token exchange failed: {}", e)))?;

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        return Err(AppError::Internal(anyhow::anyhow!("Google token exchange failed: {}", body)));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| {
        AppError::Internal(anyhow::anyhow!("Failed to parse Google response: {}", e))
    })?;

    let access_token = json["access_token"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("No access_token in Google response")))?
        .to_string();

    Ok(GoogleTokenResponse { access_token })
}

/// Get user info from Google
pub async fn get_google_user_info(access_token: &str) -> Result<GoogleUserInfo, AppError> {
    let client = crate::http_client::get_client().clone();

    let resp = client
        .get("https://www.googleapis.com/oauth2/v2/userinfo")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Google userinfo failed: {}", e)))?;

    if !resp.status().is_success() {
        return Err(AppError::Internal(anyhow::anyhow!("Google userinfo request failed")));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| {
        AppError::Internal(anyhow::anyhow!("Failed to parse Google userinfo: {}", e))
    })?;

    let email = json["email"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("No email in Google userinfo")))?
        .to_string();

    let name = json["name"].as_str().map(|s| s.to_string());
    let picture = json["picture"].as_str().map(|s| s.to_string());

    Ok(GoogleUserInfo { email, name, picture })
}
