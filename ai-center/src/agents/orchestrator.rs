use anyhow::Result;
use futures::future::join_all;
use sqlx::PgPool;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::context::WebhookContext;
use super::result::AgentResult;
use super::WebhookAgent;

/// Maximum number of agent executions allowed per single webhook delivery.
/// Prevents runaway agent chains from consuming excessive resources.
const MAX_AGENTS_PER_WEBHOOK: usize = 10;

/// Agent Orchestrator — manages all registered agents and coordinates
/// their execution after webhook deliveries.
///
/// ## How it works
///
/// 1. Agents are registered at startup (built-in + custom)
/// 2. After a successful webhook delivery, `trigger_agents` is called
/// 3. The orchestrator checks which agents match the event
/// 4. Matching agents execute in parallel (up to MAX_AGENTS_PER_WEBHOOK)
/// 5. Results are collected, actions aggregated, and everything is persisted
#[derive(Clone)]
pub struct AgentOrchestrator {
    /// Registered agents (wrapped in Arc for cheap cloning)
    agents: Arc<RwLock<Vec<Arc<dyn WebhookAgent>>>>,
    /// Database pool for persisting execution results
    pool: PgPool,
}

impl AgentOrchestrator {
    pub fn new(pool: PgPool) -> Self {
        Self {
            agents: Arc::new(RwLock::new(Vec::new())),
            pool,
        }
    }

    /// Register an agent with the orchestrator.
    pub async fn register(&self, agent: impl WebhookAgent + 'static) {
        let name = agent.name().to_string();
        tracing::info!("🤖 Agent registered: {}", name);
        self.agents.write().await.push(Arc::new(agent));
    }

    /// Register all built-in agents.
    pub async fn register_builtins(&self) {
        for agent in super::builtin::all_builtin_agents() {
            self.register_boxed(agent).await;
        }
    }

    /// Register a boxed agent.
    async fn register_boxed(&self, agent: Box<dyn WebhookAgent>) {
        let name = agent.name().to_string();
        tracing::info!("🤖 Agent registered: {}", name);
        self.agents.write().await.push(Arc::from(agent));
    }

    /// Get list of all registered agent names and descriptions.
    pub async fn list_agents(&self) -> Vec<AgentInfo> {
        self.agents
            .read()
            .await
            .iter()
            .map(|a| AgentInfo {
                name: a.name().to_string(),
                description: a.description().to_string(),
                trigger_count: a.trigger_conditions().len(),
            })
            .collect()
    }

    /// Trigger matching agents for a webhook delivery context.
    ///
    /// This is the main entry point called after a successful delivery.
    /// It runs matching agents in parallel and persists all results.
    pub async fn trigger_agents(&self, context: &WebhookContext) -> Result<Vec<AgentResult>> {
        // Collect matching agent Arc clones (cheap, no lock held during execution)
        let matching: Vec<Arc<dyn WebhookAgent>> = {
            let agents = self.agents.read().await;
            agents
                .iter()
                .filter(|a| a.should_trigger(context))
                .take(MAX_AGENTS_PER_WEBHOOK)
                .cloned()
                .collect()
        };

        if matching.is_empty() {
            tracing::debug!(
                "No agents matched event '{}' for delivery {}",
                context.event_type(),
                context.delivery_id
            );
            return Ok(Vec::new());
        }

        tracing::info!(
            "🎯 {} agent(s) triggered for event '{}' (delivery {})",
            matching.len(),
            context.event_type(),
            context.delivery_id
        );

        // Execute all matching agents in parallel
        let futures: Vec<_> = matching
            .into_iter()
            .map(|agent| {
                let ctx = context.clone();
                async move {
                    let agent_name = agent.name().to_string();
                    let start = std::time::Instant::now();
                    match agent.execute(&ctx).await {
                        Ok(result) => {
                            tracing::debug!(
                                "✅ Agent '{}' completed in {}ms (confidence: {:.2})",
                                agent_name,
                                start.elapsed().as_millis(),
                                result.confidence_score
                            );
                            Some(result)
                        }
                        Err(e) => {
                            tracing::error!(
                                "❌ Agent '{}' failed after {}ms: {:?}",
                                agent_name,
                                start.elapsed().as_millis(),
                                e
                            );
                            None
                        }
                    }
                }
            })
            .collect();

        let results: Vec<AgentResult> = join_all(futures)
            .await
            .into_iter()
            .flatten()
            .collect();

        // Persist results to database
        self.persist_results(context, &results).await?;

        // Log summary
        let total_actions: usize = results.iter().map(|r| r.actions.len()).sum();
        if total_actions > 0 {
            tracing::info!(
                "📋 {} agent(s) produced {} action(s) for delivery {}",
                results.len(),
                total_actions,
                context.delivery_id
            );
        }

        Ok(results)
    }

    /// Persist agent execution results to the database.
    async fn persist_results(
        &self,
        context: &WebhookContext,
        results: &[AgentResult],
    ) -> Result<()> {
        for result in results {
            // Look up or create the agent record
            let agent_id = self.ensure_agent_record(&result.agent_name).await?;

            let actions_json = serde_json::to_value(&result.actions).ok();
            let ai_provider = result.ai_provider_used.clone();

            sqlx::query(
                r#"
                INSERT INTO ai_agent_executions
                    (agent_id, delivery_id, customer_id, trigger_reason, actions_taken, confidence_score, ai_provider, latency_ms)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                "#,
            )
            .bind(agent_id)
            .bind(context.delivery_id)
            .bind(context.customer_id)
            .bind(context.event_type().to_string())
            .bind(actions_json)
            .bind(result.confidence_score)
            .bind(ai_provider)
            .bind(result.latency_ms as i32)
            .execute(&self.pool)
            .await?;
        }

        Ok(())
    }

    /// Ensure an agent record exists in the `ai_agents` table.
    /// Returns the agent's UUID.
    async fn ensure_agent_record(&self, name: &str) -> Result<Uuid> {
        // Try to find existing
        let existing: Option<(Uuid,)> =
            sqlx::query_as("SELECT id FROM ai_agents WHERE name = $1")
                .bind(name)
                .fetch_optional(&self.pool)
                .await?;

        if let Some((id,)) = existing {
            return Ok(id);
        }

        // Insert new
        let row = sqlx::query_as::<_, (Uuid,)>(
            "INSERT INTO ai_agents (name, description) VALUES ($1, $2) RETURNING id",
        )
        .bind(name)
        .bind(format!("Auto-registered agent: {}", name))
        .fetch_one(&self.pool)
        .await?;

        Ok(row.0)
    }
}

/// Summary info about a registered agent.
#[derive(Debug, Clone, serde::Serialize)]
pub struct AgentInfo {
    pub name: String,
    pub description: String,
    pub trigger_count: usize,
}
