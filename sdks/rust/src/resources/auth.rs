//! HookSniff API Resource: Auth
//!
//! Register, login, 2FA, email verification, password reset, GDPR export, account deletion.

use crate::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterInput {
    pub email: String,
    pub password: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginInput {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthOutput {
    pub token: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TwoFactorInput {
    pub code: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ForgotPasswordInput {
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageOutput {
    pub message: String,
}

#[derive(Debug)]
pub struct Auth {
    ctx: HookSniffRequestContext,
}

impl Auth {
    pub fn new(ctx: HookSniffRequestContext) -> Self {
        Self { ctx }
    }

    /// Register a new account
    pub fn register(&self, input: &RegisterInput) -> Result<AuthOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/auth/register");
        req.set_body(input);
        req.send(&self.ctx)
    }

    /// Login
    pub fn login(&self, input: &LoginInput) -> Result<AuthOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/auth/login");
        req.set_body(input);
        req.send(&self.ctx)
    }

    /// Enable 2FA
    pub fn enable_2fa(&self, input: &TwoFactorInput) -> Result<MessageOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/auth/2fa/enable");
        req.set_body(input);
        req.send(&self.ctx)
    }

    /// Verify email
    pub fn verify_email(&self, token: &str) -> Result<MessageOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/auth/verify-email");
        req.set_query_param("token", token);
        req.send(&self.ctx)
    }

    /// Forgot password
    pub fn forgot_password(&self, input: &ForgotPasswordInput) -> Result<MessageOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/auth/forgot-password");
        req.set_body(input);
        req.send(&self.ctx)
    }

    /// Export account data (GDPR)
    pub fn export(&self) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/v1/auth/export");
        req.send(&self.ctx)
    }

    /// Delete account
    pub fn delete_account(&self) -> Result<(), Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Delete, "/v1/auth/account");
        req.send_void(&self.ctx)
    }
}
