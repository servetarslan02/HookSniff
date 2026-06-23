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

pub struct GitHubUserInfo {
    pub email: String,
    pub name: Option<String>,
    pub avatar_url: Option<String>,
}

/// GET /oauth/github — Redirect to GitHub OAuth consent screen
pub async fn github_login() -> Result<impl axum::response::IntoResponse, AppError> {
    let client_id = std::env::var("GITHUB_CLIENT_ID")
        .map_err(|_| AppError::coded(ErrorCode::GithubOauthNotConfigured))?;

    let redirect_base = std::env::var("OAUTH_REDIRECT_BASE")
        .unwrap_or_else(|_| "https://hooksniff-api-499907444852.europe-west1.run.app".to_string());
    let redirect_uri = format!("{}/v1/oauth/github/callback", redirect_base);
    let state = uuid::Uuid::new_v4().to_string();

    let url = format!(
        "https://github.com/login/oauth/authorize?client_id={}&redirect_uri={}&scope=user:email&state={}",
        client_id,
        urlencoding::encode(&redirect_uri),
        state,
    );

    let state_cookie = format!(
        "{}={}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age={}",
        OAUTH_STATE_COOKIE, state, OAUTH_STATE_MAX_AGE
    );
    // Build response manually to guarantee Set-Cookie is included
    let mut response = axum::response::Html(format!(
        "<html><head><meta http-equiv=\"refresh\" content=\"0;url={url}\"></head><body>Redirecting...</body></html>"
    , url = url))
    .into_response();
    response.headers_mut().insert("set-cookie", axum::http::HeaderValue::from_str(&state_cookie).unwrap_or_else(|_| axum::http::HeaderValue::from_static("")));
    response.headers_mut().insert("location", axum::http::HeaderValue::from_str(&url).unwrap_or_else(|_| axum::http::HeaderValue::from_static("/")));
    *response.status_mut() = axum::http::StatusCode::TEMPORARY_REDIRECT;
    Ok(response)
}

/// GET /oauth/github/callback — Handle GitHub OAuth callback
pub async fn github_callback(
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

    let client_id = std::env::var("GITHUB_CLIENT_ID")
        .map_err(|_| AppError::coded(ErrorCode::GithubOauthNotConfigured))?;

    let client_secret = std::env::var("GITHUB_CLIENT_SECRET")
        .map_err(|_| AppError::coded(ErrorCode::GithubOauthNotConfigured))?;

    let redirect_base = std::env::var("OAUTH_REDIRECT_BASE")
        .unwrap_or_else(|_| "https://hooksniff-api-499907444852.europe-west1.run.app".to_string());
    let redirect_uri = format!("{}/v1/oauth/github/callback", redirect_base);

    let access_token = exchange_github_code(&code, &client_id, &client_secret, &redirect_uri, None).await?;

    let user_info = get_github_user_info(&access_token).await?;

    let customer =
        find_or_create_oauth_customer(&pool, &user_info.email, &user_info.name, "github", user_info.avatar_url.as_deref()).await?;

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
pub async fn exchange_github_code(
    code: &str,
    client_id: &str,
    client_secret: &str,
    redirect_uri: &str,
    code_verifier: Option<&str>,
) -> Result<String, AppError> {
    let client = crate::http_client::get_client().clone();

    let mut params = vec![
        ("code", code.to_string()),
        ("client_id", client_id.to_string()),
        ("client_secret", client_secret.to_string()),
        ("redirect_uri", redirect_uri.to_string()),
    ];
    if let Some(verifier) = code_verifier {
        params.push(("code_verifier", verifier.to_string()));
    }

    let resp = client
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .form(&params)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("GitHub token exchange failed: {}", e)))?;

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        return Err(AppError::Internal(anyhow::anyhow!("GitHub token exchange failed: {}", body)));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| {
        AppError::Internal(anyhow::anyhow!("Failed to parse GitHub response: {}", e))
    })?;

    if let Some(error) = json["error"].as_str() {
        let desc = json["error_description"].as_str().unwrap_or("unknown");
        return Err(AppError::Internal(anyhow::anyhow!("GitHub OAuth error: {} - {}", error, desc)));
    }

    json["access_token"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("No access_token in GitHub response")))
        .map(|s| s.to_string())
}

/// Get user info from GitHub
pub async fn get_github_user_info(access_token: &str) -> Result<GitHubUserInfo, AppError> {
    let client = crate::http_client::get_client().clone();

    let resp = client
        .get("https://api.github.com/user")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("User-Agent", "HookSniff")
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("GitHub user info failed: {}", e)))?;

    if !resp.status().is_success() {
        return Err(AppError::Internal(anyhow::anyhow!("GitHub user info request failed")));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| {
        AppError::Internal(anyhow::anyhow!("Failed to parse GitHub user info: {}", e))
    })?;

    let mut email = json["email"].as_str().map(|s| s.to_string());
    let name = json["name"].as_str().map(|s| s.to_string());
    let avatar_url = json["avatar_url"].as_str().map(|s| s.to_string());

    // If email is null, try /user/emails
    if email.is_none() {
        let emails_resp = client
            .get("https://api.github.com/user/emails")
            .header("Authorization", format!("Bearer {}", access_token))
            .header("User-Agent", "HookSniff")
            .send()
            .await;

        if let Ok(resp) = emails_resp {
            if let Ok(emails) = resp.json::<serde_json::Value>().await {
                if let Some(arr) = emails.as_array() {
                    for e in arr {
                        if e["primary"].as_bool().unwrap_or(false) {
                            email = e["email"].as_str().map(|s| s.to_string());
                            break;
                        }
                    }
                    if email.is_none() {
                        for e in arr {
                            if e["verified"].as_bool().unwrap_or(false) {
                                email = e["email"].as_str().map(|s| s.to_string());
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    let email = email.ok_or_else(|| {
        AppError::BadRequest(
            "Could not get email from GitHub. Make sure your email is public or grant email permission.".into(),
        )
    })?;

    Ok(GitHubUserInfo { email, name, avatar_url })
}
