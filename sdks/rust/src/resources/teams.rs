//! HookSniff API Resource: Teams
//!
//! Team management — list members, invite, remove.

use crate::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TeamMember {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: String,
    pub joined_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InviteInput {
    pub email: String,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InviteOutput {
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub invite_id: Option<String>,
}

#[derive(Debug)]
pub struct Teams {
    ctx: HookSniffRequestContext,
}

impl Teams {
    pub fn new(ctx: HookSniffRequestContext) -> Self {
        Self { ctx }
    }

    /// List team members
    pub fn members(&self) -> Result<Vec<TeamMember>, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/v1/teams/members");
        req.send(&self.ctx)
    }

    /// Invite a team member
    pub fn invite(&self, input: &InviteInput) -> Result<InviteOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/teams/invite");
        req.set_body(input);
        req.send(&self.ctx)
    }

    /// Remove a team member
    pub fn remove_member(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Delete, "/v1/teams/members/{id}");
        req.set_path_param("id", id);
        req.send_void(&self.ctx)
    }
}
