use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[derive(Debug, Serialize, Deserialize)]
pub struct ThreatDetection {
    pub threat_type: String,
    pub severity: String,
    pub source: String,
    pub description: String,
    pub recommended_action: String,
    pub auto_block: bool,
}

/// Detect DDoS patterns: too many requests from single IP
pub async fn detect_ddos(pool: &PgPool) -> anyhow::Result<Vec<ThreatDetection>> {
    let mut threats = Vec::new();

    // Check for IPs with >100 requests in last 5 minutes via auth logs
    // Since we don't have IP logging in current schema, we check webhook volume spikes
    let volume_spike: (i64,) = sqlx::query_as(
        r#"
        SELECT COUNT(*) FROM deliveries
        WHERE created_at > now() - INTERVAL '5 minutes'
        "#,
    )
    .fetch_one(pool)
    .await?;

    // Compare with 5-minute average over last hour
    let avg_volume: (Option<f64>,) = sqlx::query_as(
        r#"
        SELECT AVG(cnt)::FLOAT FROM (
            SELECT COUNT(*) as cnt
            FROM deliveries
            WHERE created_at > now() - INTERVAL '1 hour'
            GROUP BY date_trunc('5 minutes', created_at)
        ) sub
        "#,
    )
    .fetch_one(pool)
    .await?;

    let avg = avg_volume.0.unwrap_or(0.0);
    let current = volume_spike.0 as f64;

    if avg > 10.0 && current > avg * 5.0 {
        threats.push(ThreatDetection {
            threat_type: "ddos_spike".to_string(),
            severity: "high".to_string(),
            source: "traffic_analysis".to_string(),
            description: format!(
                "Trafik anomalisi: Son 5 dakikada {} istek (ortalama: {:.0})",
                volume_spike.0, avg
            ),
            recommended_action: "Rate limit sıkılaştır, şüpheli IP'leri engelle".to_string(),
            auto_block: false, // Needs human judgment
        });
    }

    Ok(threats)
}

/// Detect credential stuffing: many failed auth attempts
pub async fn detect_credential_stuffing(pool: &PgPool) -> anyhow::Result<Vec<ThreatDetection>> {
    let mut threats = Vec::new();

    // Check for high failure rate in last 10 minutes
    let stats: (i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM deliveries
        WHERE created_at > now() - INTERVAL '10 minutes'
        "#,
    )
    .fetch_one(pool)
    .await?;

    if stats.0 >= 50 {
        let failure_rate = stats.1 as f64 / stats.0 as f64;
        if failure_rate > 0.8 {
            threats.push(ThreatDetection {
                threat_type: "credential_stuffing".to_string(),
                severity: "high".to_string(),
                source: "auth_analysis".to_string(),
                description: format!(
                    "Yüksek hata oranı: Son 10 dakikada {} deneme, %{:.1} başarısız",
                    stats.0,
                    failure_rate * 100.0
                ),
                recommended_action: "Hesap kilitleme + CAPTCHA uygula".to_string(),
                auto_block: true,
            });
        }
    }

    Ok(threats)
}

/// Detect webhook spam: too many webhooks to same endpoint in short time
pub async fn detect_webhook_spam(pool: &PgPool) -> anyhow::Result<Vec<ThreatDetection>> {
    let mut threats = Vec::new();

    // Find endpoints receiving >500 webhooks in last 5 minutes
    let spammy = sqlx::query_as::<_, (uuid::Uuid, String, i64)>(
        r#"
        SELECT d.endpoint_id, e.url, COUNT(*) as cnt
        FROM deliveries d
        JOIN endpoints e ON d.endpoint_id = e.id
        WHERE d.created_at > now() - INTERVAL '5 minutes'
        GROUP BY d.endpoint_id, e.url
        HAVING COUNT(*) > 500
        ORDER BY cnt DESC
        "#,
    )
    .fetch_all(pool)
    .await?;

    for (endpoint_id, url, count) in spammy {
        threats.push(ThreatDetection {
            threat_type: "webhook_spam".to_string(),
            severity: "medium".to_string(),
            source: "volume_analysis".to_string(),
            description: format!(
                "Webhook spam: Endpoint {} son 5 dakikada {} webhook aldı",
                url, count
            ),
            recommended_action: "Rate limit sıkılaştır, müşteriye bildir".to_string(),
            auto_block: false,
        });
    }

    Ok(threats)
}

/// Detect payload injection: suspicious JSON patterns
pub fn detect_payload_injection(payload: &serde_json::Value) -> Option<ThreatDetection> {
    let payload_str = serde_json::to_string(payload).unwrap_or_default();

    // Check for common injection patterns
    let suspicious_patterns = [
        "<script",
        "javascript:",
        "onerror=",
        "onload=",
        "${",           // Template injection
        "{{",           // Template injection
        "eval(",
        "exec(",
        "system(",
        "../",          // Path traversal
        "..\\",
        "DROP TABLE",
        "DELETE FROM",
        "INSERT INTO",
        "UNION SELECT",
        "1=1",
        "OR 1=1",
    ];

    let lower = payload_str.to_lowercase();
    for pattern in &suspicious_patterns {
        if lower.contains(&pattern.to_lowercase()) {
            return Some(ThreatDetection {
                threat_type: "payload_injection".to_string(),
                severity: "high".to_string(),
                source: "payload_analysis".to_string(),
                description: format!(
                    "Şüpheli payload tespit edildi: '{}' pattern bulundu",
                    pattern
                ),
                recommended_action: "İsteği reddet + logla".to_string(),
                auto_block: true,
            });
        }
    }

    None
}

/// Run all threat detections
pub async fn scan_threats(pool: &PgPool) -> anyhow::Result<Vec<ThreatDetection>> {
    let mut all_threats = Vec::new();

    match detect_ddos(pool).await {
        Ok(mut threats) => all_threats.append(&mut threats),
        Err(e) => tracing::warn!("DDoS tespiti hatası: {:?}", e),
    }

    match detect_credential_stuffing(pool).await {
        Ok(mut threats) => all_threats.append(&mut threats),
        Err(e) => tracing::warn!("Credential stuffing tespiti hatası: {:?}", e),
    }

    match detect_webhook_spam(pool).await {
        Ok(mut threats) => all_threats.append(&mut threats),
        Err(e) => tracing::warn!("Webhook spam tespiti hatası: {:?}", e),
    }

    Ok(all_threats)
}
