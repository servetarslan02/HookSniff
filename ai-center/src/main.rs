use anyhow::Result;
use tracing_subscriber::EnvFilter;

mod agents;
mod ai_engine;
mod config;
mod db;
mod defense;
mod fix;
mod http;
pub mod marketplace;
mod monitor;
mod notify;
mod risk;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::from_default_env().add_directive("info".parse()?),
        )
        .init();

    let cfg = config::AiConfig::from_env()?;
    let pool = db::create_pool(&cfg.database_url).await?;

    tracing::info!("🧠 AI Merkezi başlatılıyor...");
    tracing::info!("   İzleme aralığı: {}s", cfg.check_interval_secs);
    tracing::info!("   Risk uyarı eşiği: {}", cfg.risk_threshold_warning);
    tracing::info!("   Risk kritik eşiği: {}", cfg.risk_threshold_critical);
    tracing::info!("   Otomatik fix: {}", cfg.auto_fix_enabled);
    tracing::info!("   Savunma: {}", cfg.defense_enabled);

    let mut system_monitor = monitor::system::SystemMonitor::new();

    // AI Orkestratör — tüm AI'ları koordine eden sistem
    let orchestrator = ai_engine::orchestrator::AiOrchestrator::new();

    // Mevcut AI sağlayıcıları otomatik ekle
    if let Some(mimo) = ai_engine::mimo::MiMoProvider::from_env() {
        orchestrator.add_provider(Box::new(mimo)).await;
    }
    if let Some(openai) = ai_engine::openai::OpenAiProvider::from_env() {
        orchestrator.add_provider(Box::new(openai)).await;
    }

    // Yeni AI sağlayıcıları buraya ekle:
    if let Some(gemini) = ai_engine::gemini::GeminiProvider::from_env() {
        orchestrator.add_provider(Box::new(gemini)).await;
    }
    if let Some(groq) = ai_engine::groq::groq_from_env() {
        orchestrator.add_provider(Box::new(groq)).await;
    }
    if let Some(cerebras) = ai_engine::cerebras::cerebras_from_env() {
        orchestrator.add_provider(Box::new(cerebras)).await;
    }
    if let Some(openrouter) = ai_engine::openrouter::openrouter_from_env() {
        orchestrator.add_provider(Box::new(openrouter)).await;
    }

    let provider_count = orchestrator.all_status().await.len();
    tracing::info!("🤖 {} AI sağlayıcı aktif", provider_count);

    if provider_count == 0 {
        tracing::warn!("⚠️ Hiç AI API key tanımlanmamış — kural tabanlı analiz kullanılacak");
    }

    // Bildirim yöneticisi
    let mut notify_mgr = notify::NotifyManager::new();

    if let Some(slack) = notify::slack::SlackNotifier::from_env() {
        notify_mgr.add_notifier(Box::new(slack));
    }
    if let Some(sendgrid) = notify::email::SendGridNotifier::from_env() {
        notify_mgr.add_notifier(Box::new(sendgrid));
    } else if let Some(email) = notify::email::EmailNotifier::from_env() {
        notify_mgr.add_notifier(Box::new(email));
    }

    // Agent Orkestratör — webhook olaylarını analiz eden AI agent sistemi
    let agent_orchestrator = agents::orchestrator::AgentOrchestrator::new(pool.clone());
    agent_orchestrator.register_builtins().await;
    let agent_count = agent_orchestrator.list_agents().await.len();
    tracing::info!("🤖 {} AI agent yüklendi", agent_count);

    // HTTP sunucusu — worker'dan gelen agent tetikleme isteklerini işler
    let http_pool = pool.clone();

    let http_port = std::env::var("AI_CENTER_PORT")
        .unwrap_or_else(|_| "8081".to_string())
        .parse::<u16>()
        .unwrap_or(8081);

    tokio::spawn(async move {
        let app = http::router()
            .layer(axum::extract::Extension(agent_orchestrator))
            .layer(axum::extract::Extension(http_pool));

        let addr = std::net::SocketAddr::from(([0, 0, 0, 0], http_port));
        tracing::info!("🌐 AI Center HTTP sunucusu: http://{}", addr);

        if let Err(e) = axum::serve(
            tokio::net::TcpListener::bind(addr).await.unwrap(),
            app,
        )
        .await
        {
            tracing::error!("❌ HTTP sunucu hatası: {:?}", e);
        }
    });

    loop {
        tracing::debug!("🔄 Kontrol döngüsü başlıyor...");

        // 1. System health check
        match run_system_check(&mut system_monitor, &pool).await {
            Ok(_) => {}
            Err(e) => tracing::error!("❌ Sistem kontrolü hatası: {:?}", e),
        }

        // 2. Webhook health check + risk analysis + auto-fix
        match run_webhook_check(&pool, &cfg).await {
            Ok(_) => {}
            Err(e) => tracing::error!("❌ Webhook kontrolü hatası: {:?}", e),
        }

        // 3. Defense: threat scanning
        if cfg.defense_enabled {
            match run_defense_scan(&pool).await {
                Ok(_) => {}
                Err(e) => tracing::error!("❌ Savunma taraması hatası: {:?}", e),
            }
        }

        // 4. Auto-fix: circuit breaker checks
        if cfg.auto_fix_enabled {
            match run_auto_fix(&pool).await {
                Ok(_) => {}
                Err(e) => tracing::error!("❌ Otomatik fix hatası: {:?}", e),
            }
        }

        // 5. Clean expired blocklist entries
        match clean_expired_blocklist(&pool).await {
            Ok(_) => {}
            Err(e) => tracing::error!("❌ Blocklist temizleme hatası: {:?}", e),
        }

        tracing::debug!("✅ Kontrol döngüsü tamamlandı");

        tokio::time::sleep(std::time::Duration::from_secs(cfg.check_interval_secs)).await;
    }
}

async fn run_system_check(
    monitor: &mut monitor::system::SystemMonitor,
    pool: &sqlx::PgPool,
) -> Result<()> {
    let metrics = monitor.collect();
    let issues = monitor.check_health();

    if !issues.is_empty() {
        for issue in &issues {
            tracing::warn!("{}", issue);

            // Log to ai_events
            sqlx::query(
                "INSERT INTO ai_events (event_type, severity, title, description, target_type) VALUES ('system', 'warning', $1, $2, 'system')",
            )
            .bind(issue)
            .bind(serde_json::to_string(&metrics).ok())
            .execute(pool)
            .await?;
        }
    } else {
        tracing::debug!(
            "📊 Sistem: CPU {:.1}% | RAM {:.1}% | Disk {:.1}%",
            metrics.cpu_usage_percent,
            metrics.memory_usage_percent,
            metrics.disk_usage_percent
        );
    }

    Ok(())
}

async fn run_webhook_check(
    pool: &sqlx::PgPool,
    cfg: &config::AiConfig,
) -> Result<()> {
    let health = monitor::webhooks::collect_webhook_health(pool).await?;

    // Log summary
    tracing::info!(
        "📡 Webhook: {} teslimat | {:.1}% başarı | {} hata | {} dead letter",
        health.total_deliveries_1h,
        health.success_rate_1h,
        health.failed_1h,
        health.dead_letters_1h,
    );

    // Check for failing endpoints
    if !health.failing_endpoints.is_empty() {
        for ep in &health.failing_endpoints {
            tracing::warn!(
                "⚠️ Endpoint başarısız: {} — {} hata / {} toplam (%{:.1})",
                ep.url,
                ep.failed,
                ep.total,
                ep.failure_rate
            );
        }
    }

    // Check for slow endpoints
    if !health.slow_endpoints.is_empty() {
        for ep in &health.slow_endpoints {
            tracing::warn!(
                "🐌 Endpoint yavaş: {} — ortalama {:.0}ms",
                ep.url,
                ep.avg_response_ms
            );
        }
    }

    // Calculate risk scores
    let risks = risk::scorer::calculate_all_risks(pool, &health).await?;

    for risk in &risks {
        let emoji = risk::scorer::risk_emoji(risk.score);
        let level = risk::scorer::risk_level(risk.score);

        if risk.score >= cfg.risk_threshold_critical {
            tracing::error!(
                "{} KRİTİK RİSK [{}]: Endpoint {} — skor: {}",
                emoji,
                level,
                risk.target_id,
                risk.score
            );

            // Log critical event
            sqlx::query(
                "INSERT INTO ai_events (event_type, severity, title, description, target_type, target_id, metadata) VALUES ('risk', 'critical', $1, $2, 'endpoint', $3, $4)",
            )
            .bind(format!("Kritik risk skoru: {}", risk.score))
            .bind(format!("Faktörler: {:?}", risk.factors))
            .bind(risk.target_id)
            .bind(serde_json::to_value(&risk.factors).ok())
            .execute(pool)
            .await?;
        } else if risk.score >= cfg.risk_threshold_warning {
            tracing::warn!(
                "{} YÜKSEK RİSK [{}]: Endpoint {} — skor: {}",
                emoji,
                level,
                risk.target_id,
                risk.score
            );
        } else if risk.score > 30 {
            tracing::info!(
                "{} RİSK [{}]: Endpoint {} — skor: {}",
                emoji,
                level,
                risk.target_id,
                risk.score
            );
        }
    }

    // Check overall success rate
    if health.success_rate_1h < 90.0 && health.total_deliveries_1h >= 10 {
        tracing::error!(
            "🔴 Genel başarı oranı kritik: %{:.1} (son 1 saat)",
            health.success_rate_1h
        );

        sqlx::query(
            "INSERT INTO ai_events (event_type, severity, title, description) VALUES ('risk', 'critical', 'Genel başarı oranı kritik', $1)",
        )
        .bind(format!(
            "Son 1 saatte başarı oranı %{:.1}, {} teslimat",
            health.success_rate_1h, health.total_deliveries_1h
        ))
        .execute(pool)
        .await?;
    }

    Ok(())
}

async fn clean_expired_blocklist(pool: &sqlx::PgPool) -> Result<()> {
    let result = sqlx::query("DELETE FROM ai_blocklist WHERE expires_at IS NOT NULL AND expires_at < now()")
        .execute(pool)
        .await?;

    if result.rows_affected() > 0 {
        tracing::info!(
            "🧹 {} süresi dolmuş blocklist kaydı temizlendi",
            result.rows_affected()
        );
    }

    Ok(())
}

async fn run_defense_scan(pool: &sqlx::PgPool) -> Result<()> {
    let threats = defense::detector::scan_threats(pool).await?;

    for threat in &threats {
        match threat.severity.as_str() {
            "high" | "critical" => {
                tracing::error!(
                    "🛡️ TEHDIT [{}]: {} — {}",
                    threat.threat_type,
                    threat.description,
                    threat.recommended_action
                );

                sqlx::query(
                    "INSERT INTO ai_events (event_type, severity, title, description, action_taken, metadata) VALUES ('defense', $1, $2, $3, $4, $5)"
                )
                .bind(&threat.severity)
                .bind(format!("Tehdit tespit: {}", threat.threat_type))
                .bind(&threat.description)
                .bind(&threat.recommended_action)
                .bind(serde_json::to_value(threat).ok())
                .execute(pool)
                .await?;
            }
            _ => {
                tracing::warn!(
                    "🛡️ Tehdit [{}]: {}",
                    threat.threat_type,
                    threat.description
                );
            }
        }
    }

    Ok(())
}

async fn run_auto_fix(pool: &sqlx::PgPool) -> Result<()> {
    // Check for endpoints that need circuit breaking
    let failing_endpoints = sqlx::query_as::<_, (uuid::Uuid,)>(
        r#"
        SELECT DISTINCT d.endpoint_id
        FROM deliveries d
        WHERE d.created_at > now() - INTERVAL '15 minutes'
        GROUP BY d.endpoint_id
        HAVING COUNT(*) FILTER (WHERE d.status = 'failed')::FLOAT / COUNT(*)::FLOAT > 0.5
           AND COUNT(*) >= 10
        "#,
    )
    .fetch_all(pool)
    .await?;

    for (endpoint_id,) in failing_endpoints {
        // Check circuit state
        let state = fix::circuit::get_circuit_state(pool, endpoint_id).await?;

        match state {
            fix::circuit::CircuitState::Closed => {
                // Apply circuit break
                fix::circuit::circuit_break(
                    pool,
                    endpoint_id,
                    "Otomatik: >%50 hata oranı tespit edildi",
                )
                .await?;
            }
            fix::circuit::CircuitState::Open => {
                // Check if we should test
                // (handled by half-open transition in get_circuit_state)
            }
            fix::circuit::CircuitState::HalfOpen => {
                // Test circuit
                if fix::circuit::test_circuit(pool, endpoint_id).await? {
                    tracing::info!("✅ Endpoint {} circuit test başarılı", endpoint_id);
                }
            }
        }
    }

    // Auto-adjust retry policies for at-risk endpoints
    let risk_scores = sqlx::query_as::<_, (uuid::Uuid, i32)>(
        r#"
        SELECT target_id, score
        FROM risk_scores
        WHERE target_type = 'endpoint'
          AND created_at > now() - INTERVAL '5 minutes'
          AND score > 30
        ORDER BY score DESC
        LIMIT 20
        "#,
    )
    .fetch_all(pool)
    .await?;

    for (endpoint_id, score) in risk_scores {
        if let Some(action) = fix::retry::adjust_retry_policy(pool, endpoint_id, score).await? {
            tracing::info!("🔧 {}", action);
        }
    }

    Ok(())
}
