use anyhow::Result;
use sqlx::PgPool;
use uuid::Uuid;

use super::*;

/// Marketplace registry — manages agent CRUD, versioning, and installation
pub struct MarketplaceRegistry {
    pool: PgPool,
}

impl MarketplaceRegistry {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// List all marketplace agents with pagination and optional search
    pub async fn list(
        &self,
        page: i64,
        per_page: i64,
        search: Option<&str>,
        author: Option<&str>,
    ) -> Result<AgentListResponse> {
        let page = page.max(1);
        let per_page = per_page.min(100).max(1);
        let offset = (page - 1) * per_page;

        let (agents, total) = if let Some(q) = search {
            let pattern = format!("%{}%", q);
            let agents = sqlx::query_as::<_, MarketplaceAgent>(
                "SELECT * FROM marketplace_agents WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY downloads DESC LIMIT $2 OFFSET $3",
            )
            .bind(&pattern)
            .bind(per_page)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?;

            let total: (i64,) = sqlx::query_as(
                "SELECT COUNT(*) FROM marketplace_agents WHERE name ILIKE $1 OR description ILIKE $1",
            )
            .bind(&pattern)
            .fetch_one(&self.pool)
            .await?;

            (agents, total.0)
        } else if let Some(a) = author {
            let agents = sqlx::query_as::<_, MarketplaceAgent>(
                "SELECT * FROM marketplace_agents WHERE author = $1 ORDER BY downloads DESC LIMIT $2 OFFSET $3",
            )
            .bind(a)
            .bind(per_page)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?;

            let total: (i64,) = sqlx::query_as(
                "SELECT COUNT(*) FROM marketplace_agents WHERE author = $1",
            )
            .bind(a)
            .fetch_one(&self.pool)
            .await?;

            (agents, total.0)
        } else {
            let agents = sqlx::query_as::<_, MarketplaceAgent>(
                "SELECT * FROM marketplace_agents ORDER BY downloads DESC LIMIT $1 OFFSET $2",
            )
            .bind(per_page)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?;

            let total: (i64,) =
                sqlx::query_as("SELECT COUNT(*) FROM marketplace_agents")
                    .fetch_one(&self.pool)
                    .await?;

            (agents, total.0)
        };

        Ok(AgentListResponse {
            agents: agents.iter().map(|a| a.to_summary()).collect(),
            total,
            page,
            per_page,
        })
    }

    /// Get a single agent by ID
    pub async fn get(&self, id: Uuid) -> Result<Option<MarketplaceAgent>> {
        let agent = sqlx::query_as::<_, MarketplaceAgent>(
            "SELECT * FROM marketplace_agents WHERE id = $1",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(agent)
    }

    /// Publish a new agent to the marketplace
    pub async fn publish(
        &self,
        req: PublishAgentRequest,
        author: &str,
    ) -> Result<MarketplaceAgent> {
        let version = req.version.unwrap_or_else(|| "1.0.0".to_string());

        // Build the full config with triggers, actions, and AI config
        let mut config = req.config.clone();
        config["triggers"] = serde_json::to_value(&req.triggers)?;
        config["actions"] = serde_json::to_value(&req.actions)?;
        if let Some(ref ai) = req.ai_config {
            config["ai_config"] = serde_json::to_value(ai)?;
        }
        if let Some(ref tags) = req.tags {
            config["tags"] = serde_json::to_value(tags)?;
        }

        let agent = sqlx::query_as::<_, MarketplaceAgent>(
            "INSERT INTO marketplace_agents (name, description, author, version, config) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        )
        .bind(&req.name)
        .bind(&req.description)
        .bind(author)
        .bind(&version)
        .bind(&config)
        .fetch_one(&self.pool)
        .await?;

        tracing::info!("📦 Published marketplace agent: {} v{} by {}", agent.name, agent.version, author);

        Ok(agent)
    }

    /// Install an agent to a customer's account
    pub async fn install(
        &self,
        agent_id: Uuid,
        customer_id: Uuid,
        config_override: Option<serde_json::Value>,
    ) -> Result<InstalledAgent> {
        // Verify agent exists
        let _agent = self
            .get(agent_id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Agent not found: {}", agent_id))?;

        // Check if already installed
        let existing = sqlx::query_as::<_, InstalledAgent>(
            "SELECT * FROM installed_agents WHERE customer_id = $1 AND agent_id = $2",
        )
        .bind(customer_id)
        .bind(agent_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(installation) = existing {
            tracing::info!(
                "♻️ Agent {} already installed for customer {}",
                agent_id,
                customer_id
            );
            return Ok(installation);
        }

        let installed = sqlx::query_as::<_, InstalledAgent>(
            "INSERT INTO installed_agents (customer_id, agent_id, config) VALUES ($1, $2, $3) RETURNING *",
        )
        .bind(customer_id)
        .bind(agent_id)
        .bind(&config_override)
        .fetch_one(&self.pool)
        .await?;

        // Increment download count
        sqlx::query("UPDATE marketplace_agents SET downloads = downloads + 1 WHERE id = $1")
            .bind(agent_id)
            .execute(&self.pool)
            .await?;

        tracing::info!(
            "📥 Installed agent {} for customer {}",
            agent_id,
            customer_id
        );

        Ok(installed)
    }

    /// Update configuration of an installed agent
    pub async fn configure(
        &self,
        installation_id: Uuid,
        customer_id: Uuid,
        req: ConfigureAgentRequest,
    ) -> Result<InstalledAgent> {
        let mut installed = sqlx::query_as::<_, InstalledAgent>(
            "SELECT * FROM installed_agents WHERE id = $1 AND customer_id = $2",
        )
        .bind(installation_id)
        .bind(customer_id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Installation not found"))?;

        if let Some(enabled) = req.enabled {
            sqlx::query("UPDATE installed_agents SET enabled = $1 WHERE id = $2")
                .bind(enabled)
                .bind(installation_id)
                .execute(&self.pool)
                .await?;
            installed.enabled = enabled;
        }

        if let Some(config) = req.config {
            sqlx::query("UPDATE installed_agents SET config = $1 WHERE id = $2")
                .bind(&config)
                .bind(installation_id)
                .execute(&self.pool)
                .await?;
            installed.config = Some(config);
        }

        tracing::info!(
            "⚙️ Updated installed agent {} for customer {}",
            installation_id,
            customer_id
        );

        Ok(installed)
    }

    /// Uninstall an agent from a customer's account
    pub async fn uninstall(
        &self,
        installation_id: Uuid,
        customer_id: Uuid,
    ) -> Result<()> {
        let result = sqlx::query(
            "DELETE FROM installed_agents WHERE id = $1 AND customer_id = $2",
        )
        .bind(installation_id)
        .bind(customer_id)
        .execute(&self.pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(anyhow::anyhow!("Installation not found"));
        }

        tracing::info!(
            "🗑️ Uninstalled agent {} for customer {}",
            installation_id,
            customer_id
        );

        Ok(())
    }

    /// List installed agents for a customer
    pub async fn list_installed(&self, customer_id: Uuid) -> Result<Vec<InstalledAgent>> {
        let installed = sqlx::query_as::<_, InstalledAgent>(
            "SELECT * FROM installed_agents WHERE customer_id = $1 ORDER BY installed_at DESC",
        )
        .bind(customer_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(installed)
    }

    /// Get all enabled agents for a customer (used during webhook processing)
    pub async fn get_enabled_agents(&self, customer_id: Uuid) -> Result<Vec<(InstalledAgent, MarketplaceAgent)>> {
        let rows = sqlx::query_as::<_, (InstalledAgent, MarketplaceAgent)>(
            "SELECT ia.*, ma.* FROM installed_agents ia \
             JOIN marketplace_agents ma ON ia.agent_id = ma.id \
             WHERE ia.customer_id = $1 AND ia.enabled = true",
        )
        .bind(customer_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows)
    }

    /// Resolve agent dependencies — check if all required agents are installed
    pub async fn resolve_dependencies(
        &self,
        customer_id: Uuid,
        agent_id: Uuid,
    ) -> Result<Vec<String>> {
        let agent = self
            .get(agent_id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Agent not found"))?;

        let deps = agent
            .config
            .get("dependencies")
            .and_then(|v| serde_json::from_value::<Vec<String>>(v.clone()).ok())
            .unwrap_or_default();

        if deps.is_empty() {
            return Ok(vec![]);
        }

        let installed = self.list_installed(customer_id).await?;
        let installed_ids: Vec<String> = installed.iter().map(|i| i.agent_id.to_string()).collect();

        let missing: Vec<String> = deps
            .iter()
            .filter(|dep| !installed_ids.contains(dep))
            .cloned()
            .collect();

        Ok(missing)
    }

    /// Sandbox execution config — ensures agent can't access resources outside its scope
    pub fn sandbox_config(agent_config: &serde_json::Value) -> serde_json::Value {
        serde_json::json!({
            "sandboxed": true,
            "max_execution_time_ms": 5000,
            "max_memory_mb": 128,
            "network_access": false,
            "filesystem_access": false,
            "allowed_event_types": agent_config.get("triggers")
                .and_then(|t| t.as_array())
                .map(|triggers| {
                    triggers.iter()
                        .filter_map(|t| t.get("event_pattern").and_then(|v| v.as_str()).map(String::from))
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default(),
            "agent_config": agent_config,
        })
    }
}
