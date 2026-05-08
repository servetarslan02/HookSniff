//! FIFO (First-In-First-Out) Sıralı Webhook Teslimatı
//!
//! Bu modül, webhook'ların gönderildiği sırada teslim edilmesini garanti eder.
//!
//! ## Nasıl Çalışır
//!
//! 1. Her endpoint için bir `fifo_queue` tablosu kullanılır
//! 2. Her yeni webhook'a bir `sequence_num` atanır (monotonik artış)
//! 3. Teslimat sadece bir önceki sequence başarılı olduğunda yapılır
//! 4. Başarısız olan webhook sıradakileri bloklar (retry mekanizması ile çözülür)
//! 5. `max_wait_secs` süresi aşılırsa FIFO zinciri kırılır (sonsuz blokaj koruması)
//!
//! ## Veritabanı Şeması
//!
//! ```sql
//! CREATE TABLE fifo_queue (
//!     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//!     endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
//!     event_type TEXT NOT NULL,
//!     payload JSONB NOT NULL,
//!     sequence_num BIGINT NOT NULL,
//!     status TEXT NOT NULL DEFAULT 'pending',
//!     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
//! );
//!
//! CREATE INDEX idx_fifo_queue_endpoint_seq
//!     ON fifo_queue(endpoint_id, sequence_num);
//!
//! CREATE INDEX idx_fifo_queue_status
//!     ON fifo_queue(status) WHERE status = 'pending';
//! ```

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// Types & Models
// ---------------------------------------------------------------------------

/// FIFO kuyruk öğesi — veritabanı satırı
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct FifoQueueItem {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub sequence_num: i64,
    pub status: FifoStatus,
    pub created_at: DateTime<Utc>,
}

/// FIFO öğe durumu
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum FifoStatus {
    /// Sırasını bekliyor
    Pending,
    /// Teslim ediliyor (işleniyor)
    Processing,
    /// Başarıyla teslim edildi
    Delivered,
    /// Başarısız (retry bekliyor)
    Failed,
    /// Max retry aşıldı, dead letter'a taşındı
    DeadLettered,
    /// FIFO timeout — max_wait_secs aşıldı, zincir kırıldı
    TimedOut,
}

impl FifoStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Processing => "processing",
            Self::Delivered => "delivered",
            Self::Failed => "failed",
            Self::DeadLettered => "dead_lettered",
            Self::TimedOut => "timed_out",
        }
    }

    pub fn parse_str(s: &str) -> Self {
        match s {
            "processing" => Self::Processing,
            "delivered" => Self::Delivered,
            "failed" => Self::Failed,
            "dead_lettered" => Self::DeadLettered,
            "timed_out" => Self::TimedOut,
            _ => Self::Pending,
        }
    }
}

impl sqlx::Type<sqlx::Postgres> for FifoStatus {
    fn type_info() -> sqlx::postgres::PgTypeInfo {
        <String as sqlx::Type<sqlx::Postgres>>::type_info()
    }
}

impl<'r> sqlx::Decode<'r, sqlx::Postgres> for FifoStatus {
    fn decode(
        value: sqlx::postgres::PgValueRef<'r>,
    ) -> std::result::Result<Self, sqlx::error::BoxDynError> {
        let s = <String as sqlx::Decode<sqlx::Postgres>>::decode(value)?;
        Ok(Self::parse_str(&s))
    }
}

impl sqlx::Encode<'_, sqlx::Postgres> for FifoStatus {
    fn encode_by_ref(&self, buf: &mut sqlx::postgres::PgArgumentBuffer) -> sqlx::encode::IsNull {
        <String as sqlx::Encode<sqlx::Postgres>>::encode_by_ref(&self.as_str().to_string(), buf)
    }
}

/// FIFO yapılandırması — endpoint başına
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FifoConfig {
    /// FIFO aktif mi?
    pub enabled: bool,
    /// Grup bazlı FIFO (aynı customer'ın tüm webhook'ları sıralı)
    pub group_by_customer: bool,
    /// Maksimum bekleme süresi (saniye) — bu süreden sonra FIFO bozulur
    pub max_wait_secs: i64,
}

impl Default for FifoConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            group_by_customer: false,
            max_wait_secs: 300, // 5 dakika
        }
    }
}

/// FIFO kuyruğuna ekleme sonucu
#[derive(Debug, Serialize)]
pub struct EnqueueResult {
    pub queue_item_id: Uuid,
    pub sequence_num: i64,
    pub is_head: bool,
}

// ---------------------------------------------------------------------------
// Core FIFO Operations
// ---------------------------------------------------------------------------

/// Endpoint için sonraki sıra numarasını üret (atomik artış)
pub async fn next_sequence_num(pool: &PgPool, endpoint_id: Uuid) -> Result<i64> {
    let row: (i64,) = sqlx::query_as(
        r#"
        UPDATE endpoints
        SET fifo_sequence = COALESCE(fifo_sequence, 0) + 1
        WHERE id = $1
        RETURNING fifo_sequence
        "#,
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await
    .context("Failed to increment FIFO sequence")?;

    Ok(row.0)
}

/// Yeni bir webhook'ı FIFO kuyruğuna ekle
///
/// Sıra numarası atanır ve kuyruğa yerleştirilir.
/// Eğer bu, kuyruğun başındaysa (sequence_num = 1 veya bir önceki delivered)
/// `is_head = true` döner — hemen teslim edilebilir.
pub async fn enqueue(
    pool: &PgPool,
    endpoint_id: Uuid,
    event_type: &str,
    payload: &serde_json::Value,
) -> Result<EnqueueResult> {
    let seq = next_sequence_num(pool, endpoint_id).await?;

    let item_id: Uuid = sqlx::query_scalar(
        r#"
        INSERT INTO fifo_queue (endpoint_id, event_type, payload, sequence_num, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING id
        "#,
    )
    .bind(endpoint_id)
    .bind(event_type)
    .bind(payload)
    .bind(seq)
    .fetch_one(pool)
    .await
    .context("Failed to enqueue FIFO item")?;

    // Kuyruğun başı mı? Bir önceki delivered/timed_out/dead_lettered mi?
    let is_head = can_deliver_head(pool, endpoint_id, seq).await?;

    tracing::debug!(
        endpoint_id = %endpoint_id,
        sequence_num = seq,
        is_head = is_head,
        "FIFO item enqueued"
    );

    Ok(EnqueueResult {
        queue_item_id: item_id,
        sequence_num: seq,
        is_head,
    })
}

/// Bir öğenin teslim edilip edilemeyeceğini kontrol et
///
/// Kurallar:
/// 1. Bu öğe kuyruğun başındaysa (en küçük pending sequence_num)
/// 2. Bir önceki öğe delivered/timed_out/dead_lettered ise
/// 3. FIFO timeout aşılmamışsa
async fn can_deliver_head(pool: &PgPool, endpoint_id: Uuid, sequence_num: i64) -> Result<bool> {
    // İlk öğe her zaman teslim edilebilir
    if sequence_num <= 1 {
        return Ok(true);
    }

    // Bir önceki öğenin durumunu kontrol et
    let prev_status: Option<String> = sqlx::query_scalar(
        r#"
        SELECT status FROM fifo_queue
        WHERE endpoint_id = $1 AND sequence_num = $2
        "#,
    )
    .bind(endpoint_id)
    .bind(sequence_num - 1)
    .fetch_optional(pool)
    .await
    .context("Failed to check previous FIFO item status")?;

    match prev_status.as_deref() {
        // Bir önceki tamamlanmış → teslim edilebilir
        Some("delivered") | Some("timed_out") | Some("dead_lettered") => Ok(true),
        // Bir önceki yok (silinmiş) → teslim edilebilir
        None => Ok(true),
        // Bir önceki hâlâ pending/processing/failed → bekle
        _ => Ok(false),
    }
}

/// FIFO kuyruğundan teslim edilecek bir sonraki öğeyi al
///
/// endpoint_id'ye ait, pending durumunda, en küçük sequence_num'a sahip
/// ve bir önceki öğesi tamamlanmış öğeyi döner.
pub async fn dequeue_next(pool: &PgPool, endpoint_id: Uuid) -> Result<Option<FifoQueueItem>> {
    // Kuyruğun başındaki pending öğeyi bul
    let head: Option<FifoQueueItem> = sqlx::query_as(
        r#"
        SELECT id, endpoint_id, event_type, payload, sequence_num, status, created_at
        FROM fifo_queue
        WHERE endpoint_id = $1 AND status = 'pending'
        ORDER BY sequence_num ASC
        LIMIT 1
        "#,
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await
    .context("Failed to fetch FIFO head")?;

    let item = match head {
        Some(item) => item,
        None => return Ok(None),
    };

    // Bir önceki tamamlanmış mı kontrol et
    if can_deliver_head(pool, endpoint_id, item.sequence_num).await? {
        // Processing durumuna geçir
        sqlx::query("UPDATE fifo_queue SET status = 'processing' WHERE id = $1")
            .bind(item.id)
            .execute(pool)
            .await
            .context("Failed to update FIFO item to processing")?;

        let mut item = item;
        item.status = FifoStatus::Processing;
        Ok(Some(item))
    } else {
        Ok(None) // Henüz sırası gelmedi
    }
}

/// FIFO öğesinin teslimatını başarılı olarak işaretle
///
/// Sıradaki öğelerin teslim edilebilmesini sağlar.
pub async fn mark_delivered(pool: &PgPool, item_id: Uuid) -> Result<()> {
    sqlx::query("UPDATE fifo_queue SET status = 'delivered' WHERE id = $1")
        .bind(item_id)
        .execute(pool)
        .await
        .context("Failed to mark FIFO item as delivered")?;

    tracing::debug!(item_id = %item_id, "FIFO item marked as delivered");
    Ok(())
}

/// FIFO öğesinin teslimatını başarısız olarak işaretle
///
/// Sıradaki öğelerin beklemesini sağlar.
/// Retry mekanizması bu öğeyi tekrar deneyecektir.
pub async fn mark_failed(pool: &PgPool, item_id: Uuid) -> Result<()> {
    sqlx::query("UPDATE fifo_queue SET status = 'failed' WHERE id = $1")
        .bind(item_id)
        .execute(pool)
        .await
        .context("Failed to mark FIFO item as failed")?;

    tracing::warn!(item_id = %item_id, "FIFO item marked as failed — blocking subsequent items");
    Ok(())
}

/// FIFO öğesini dead letter olarak işaretle (max retry aşıldı)
pub async fn mark_dead_lettered(pool: &PgPool, item_id: Uuid) -> Result<()> {
    sqlx::query("UPDATE fifo_queue SET status = 'dead_lettered' WHERE id = $1")
        .bind(item_id)
        .execute(pool)
        .await
        .context("Failed to mark FIFO item as dead-lettered")?;

    tracing::error!(item_id = %item_id, "FIFO item dead-lettered — breaking FIFO chain");
    Ok(())
}

// ---------------------------------------------------------------------------
// Timeout & Recovery
// ---------------------------------------------------------------------------

/// FIFO timeout kontrolü — max_wait_secs aşan pending öğeleri işaretle
///
/// Bu, sonsuz blokajı önler. Bir öğe çok uzun süredir bekliyorsa
/// (örneğin bir önceki öğe hiç tamamlanamıyorsa), timeout ile zincir kırılır.
pub async fn check_timeouts(pool: &PgPool) -> Result<u64> {
    let result = sqlx::query(
        r#"
        UPDATE fifo_queue fq
        SET status = 'timed_out'
        FROM endpoints ep
        WHERE fq.endpoint_id = ep.id
          AND fq.status = 'pending'
          AND fq.created_at < now() - make_interval(secs => COALESCE(ep.fifo_max_wait_secs, 300))
        "#,
    )
    .execute(pool)
    .await
    .context("Failed to check FIFO timeouts")?;

    let count = result.rows_affected();
    if count > 0 {
        tracing::info!(count = count, "FIFO items timed out — chains broken");
    }
    Ok(count)
}

/// Failed öğeleri retry için tekrar pending yap
///
/// Retry mekanizması tarafından çağrılır. Exponential backoff
/// süresi dolmuş failed öğeleri tekrar deneme için hazırlar.
pub async fn reset_failed_for_retry(pool: &PgPool, endpoint_id: Uuid, item_id: Uuid) -> Result<()> {
    // Sadece bu endpoint'in failed öğelerini kontrol et
    let status: Option<String> =
        sqlx::query_scalar("SELECT status FROM fifo_queue WHERE id = $1 AND endpoint_id = $2")
            .bind(item_id)
            .bind(endpoint_id)
            .fetch_optional(pool)
            .await
            .context("Failed to check FIFO item for retry")?;

    match status.as_deref() {
        Some("failed") => {
            sqlx::query("UPDATE fifo_queue SET status = 'pending' WHERE id = $1")
                .bind(item_id)
                .execute(pool)
                .await
                .context("Failed to reset FIFO item for retry")?;

            tracing::debug!(item_id = %item_id, "FIFO item reset to pending for retry");
            Ok(())
        }
        _ => {
            tracing::warn!(
                item_id = %item_id,
                status = ?status,
                "Cannot reset FIFO item — not in failed state"
            );
            Ok(())
        }
    }
}

// ---------------------------------------------------------------------------
// Queries & Stats
// ---------------------------------------------------------------------------

/// Endpoint'in FIFO kuyruk istatistiklerini al
pub async fn get_queue_stats(pool: &PgPool, endpoint_id: Uuid) -> Result<FifoQueueStats> {
    let stats: (i64, i64, i64, i64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) FILTER (WHERE status = 'pending'),
            COUNT(*) FILTER (WHERE status = 'processing'),
            COUNT(*) FILTER (WHERE status = 'delivered'),
            COUNT(*) FILTER (WHERE status = 'failed'),
            COUNT(*) FILTER (WHERE status = 'dead_lettered'),
            COUNT(*) FILTER (WHERE status = 'timed_out')
        FROM fifo_queue
        WHERE endpoint_id = $1
        "#,
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await
    .context("Failed to fetch FIFO queue stats")?;

    Ok(FifoQueueStats {
        endpoint_id,
        pending: stats.0,
        processing: stats.1,
        delivered: stats.2,
        failed: stats.3,
        dead_lettered: stats.4,
        timed_out: stats.5,
    })
}

#[derive(Debug, Serialize)]
pub struct FifoQueueStats {
    pub endpoint_id: Uuid,
    pub pending: i64,
    pub processing: i64,
    pub delivered: i64,
    pub failed: i64,
    pub dead_lettered: i64,
    pub timed_out: i64,
}

/// Endpoint'in FIFO kuyruğundaki öğeleri listele
pub async fn list_queue_items(
    pool: &PgPool,
    endpoint_id: Uuid,
    status_filter: Option<&str>,
    limit: i64,
    offset: i64,
) -> Result<Vec<FifoQueueItem>> {
    let items = if let Some(status) = status_filter {
        sqlx::query_as(
            r#"
            SELECT id, endpoint_id, event_type, payload, sequence_num, status, created_at
            FROM fifo_queue
            WHERE endpoint_id = $1 AND status = $2
            ORDER BY sequence_num ASC
            LIMIT $3 OFFSET $4
            "#,
        )
        .bind(endpoint_id)
        .bind(status)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    } else {
        sqlx::query_as(
            r#"
            SELECT id, endpoint_id, event_type, payload, sequence_num, status, created_at
            FROM fifo_queue
            WHERE endpoint_id = $1
            ORDER BY sequence_num ASC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(endpoint_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    }
    .context("Failed to list FIFO queue items")?;

    Ok(items)
}

/// Endpoint'in FIFO kuyruğundaki bloke olmuş öğeleri bul
///
/// Bir önceki öğe failed/timed_out olduğu için bekleyen öğeleri döner.
pub async fn find_blocked_items(pool: &PgPool, endpoint_id: Uuid) -> Result<Vec<FifoQueueItem>> {
    let items: Vec<FifoQueueItem> = sqlx::query_as(
        r#"
        SELECT fq.id, fq.endpoint_id, fq.event_type, fq.payload,
               fq.sequence_num, fq.status, fq.created_at
        FROM fifo_queue fq
        WHERE fq.endpoint_id = $1
          AND fq.status = 'pending'
          AND EXISTS (
              SELECT 1 FROM fifo_queue prev
              WHERE prev.endpoint_id = fq.endpoint_id
                AND prev.sequence_num = fq.sequence_num - 1
                AND prev.status IN ('failed', 'processing')
          )
        ORDER BY fq.sequence_num ASC
        "#,
    )
    .bind(endpoint_id)
    .fetch_all(pool)
    .await
    .context("Failed to find blocked FIFO items")?;

    Ok(items)
}

/// FIFO kuyruğundaki eski tamamlanmış öğeleri temizle
pub async fn cleanup_completed(
    pool: &PgPool,
    endpoint_id: Uuid,
    older_than_hours: i64,
) -> Result<u64> {
    let result = sqlx::query(
        r#"
        DELETE FROM fifo_queue
        WHERE endpoint_id = $1
          AND status IN ('delivered', 'timed_out', 'dead_lettered')
          AND created_at < now() - make_interval(hours => $2)
        "#,
    )
    .bind(endpoint_id)
    .bind(older_than_hours)
    .execute(pool)
    .await
    .context("Failed to cleanup completed FIFO items")?;

    Ok(result.rows_affected())
}

// ---------------------------------------------------------------------------
// FIFO Integration Helper — Delivery Pipeline
// ---------------------------------------------------------------------------

/// FIFO-aware teslimat kontrolü
///
/// Teslimat yapmadan önce bu fonksiyonu çağır.
/// `true` dönerse teslimat yapılabilir, `false` dönerse FIFO kuyruğunda bekliyor.
pub async fn should_deliver_now(
    pool: &PgPool,
    endpoint_id: Uuid,
    sequence_num: Option<i64>,
) -> Result<bool> {
    // Endpoint'in FIFO yapılandırmasını kontrol et
    let fifo_enabled: bool =
        sqlx::query_scalar("SELECT COALESCE(fifo_enabled, false) FROM endpoints WHERE id = $1")
            .bind(endpoint_id)
            .fetch_one(pool)
            .await
            .context("Failed to check FIFO config")?;

    if !fifo_enabled {
        return Ok(true); // FIFO devre dışı, hemen teslim et
    }

    let seq = match sequence_num {
        Some(s) => s,
        None => return Ok(true), // Sıra numarası yok, hemen teslim et
    };

    // İlk öğe her zaman teslim edilebilir
    if seq <= 1 {
        return Ok(true);
    }

    // Bir önceki öğenin durumunu kontrol et
    can_deliver_head(pool, endpoint_id, seq).await
}

// ---------------------------------------------------------------------------
// Migration SQL (exported for db.rs)
// ---------------------------------------------------------------------------

/// FIFO migration SQL — db.rs tarafından çağrılabilir
pub const FIFO_MIGRATION_SQL: &str = r#"
-- FIFO kuyruk tablosu
CREATE TABLE IF NOT EXISTS fifo_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    sequence_num BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Endpoint FIFO ayarları (eğer yoksa)
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_enabled BOOL DEFAULT false;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_sequence BIGINT DEFAULT 0;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_group_by_customer BOOL DEFAULT false;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_max_wait_secs INT DEFAULT 300;

-- Teslimat tablosuna FIFO alanları (eğer yoksa)
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS sequence_num BIGINT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS fifo_group_id STRING;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_fifo_queue_endpoint_seq
    ON fifo_queue(endpoint_id, sequence_num);

CREATE INDEX IF NOT EXISTS idx_fifo_queue_status
    ON fifo_queue(status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_fifo_queue_pending_head
    ON fifo_queue(endpoint_id, sequence_num)
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_deliveries_fifo
    ON deliveries(endpoint_id, sequence_num)
    WHERE status = 'pending' AND sequence_num IS NOT NULL;
"#;

/// FIFO migration'ını çalıştır
pub async fn run_fifo_migration(pool: &PgPool) -> Result<()> {
    sqlx::query(FIFO_MIGRATION_SQL)
        .execute(pool)
        .await
        .context("Failed to run FIFO migration")?;
    tracing::info!("✅ FIFO migration completed");
    Ok(())
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fifo_status_roundtrip() {
        let statuses = vec![
            FifoStatus::Pending,
            FifoStatus::Processing,
            FifoStatus::Delivered,
            FifoStatus::Failed,
            FifoStatus::DeadLettered,
            FifoStatus::TimedOut,
        ];

        for status in statuses {
            let s = status.as_str();
            let back = FifoStatus::parse_str(s);
            assert_eq!(status, back, "Roundtrip failed for {:?}", s);
        }
    }

    #[test]
    fn test_fifo_config_default() {
        let cfg = FifoConfig::default();
        assert!(!cfg.enabled);
        assert!(!cfg.group_by_customer);
        assert_eq!(cfg.max_wait_secs, 300);
    }

    #[test]
    fn test_enqueue_result_serialization() {
        let result = EnqueueResult {
            queue_item_id: Uuid::new_v4(),
            sequence_num: 42,
            is_head: true,
        };
        let json = serde_json::to_string(&result).unwrap();
        assert!(json.contains("\"sequence_num\":42"));
        assert!(json.contains("\"is_head\":true"));
    }
}
