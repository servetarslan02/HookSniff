//! FIFO (First-In-First-Out) Sıralı Webhook Teslimatı
//!
//! Bu modül, webhook'ların gönderildiği sırada teslim edilmesini garanti eder.
//! Svix'in en büyük rekabet avantajı bu feature'dır.
//!
//! ## Nasıl Çalışır
//!
//! 1. Her endpoint için bir sıra kuyruğu (sequence counter) tutulur
//! 2. Her yeni webhook'a bir sıra numarası atanır
//! 3. Teslimat sadece bir önceki webhook başarılı olduğunda yapılır
//! 4. Başarısız olan webhook kuyruğu bloklar (retry ile)
//!
//! ## Veritabanı Şeması
//!
//! ```sql
//! ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS sequence_num BIGINT;
//! ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS fifo_group_id STRING;
//! ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_enabled BOOL DEFAULT false;
//! ```

use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

/// FIFO teslimat yapılandırması
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FifoConfig {
    /// FIFO aktif mi?
    pub enabled: bool,
    /// Grup bazlı FIFO (aynı customer'ın tüm webhook'ları sıralı)
    /// yoksa sadece aynı endpoint'e gidenler sıralı
    pub group_by_customer: bool,
    /// Maksimum bekleme süresi (saniye) — bu süreden sonra FIFO bozulur
    /// (sonsuz blokajı önlemek için)
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

/// Endpoint için sonraki sıra numarasını al ve ata
pub async fn assign_sequence_num(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> anyhow::Result<i64> {
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
    .await?;

    Ok(row.0)
}

/// FIFO migration SQL
pub const FIFO_MIGRATION: &str = r#"
-- FIFO (First-In-First-Out) sıralı teslimat desteği
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_enabled BOOL DEFAULT false;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_sequence BIGINT DEFAULT 0;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_group_by_customer BOOL DEFAULT false;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_max_wait_secs INT DEFAULT 300;

ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS sequence_num BIGINT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS fifo_group_id STRING;

-- FIFO kuyruk görünümü: bloke olmuş teslimatları bulmak için
CREATE INDEX IF NOT EXISTS idx_deliveries_fifo
    ON deliveries(endpoint_id, sequence_num)
    WHERE status = 'pending' AND sequence_num IS NOT NULL;
"#;

/// Bir teslimatın FIFO'ya uygun olup olmadığını kontrol et
///
/// Eğer endpoint'te FIFO aktifse ve bu teslimat sırası gelmemişse,
/// teslimat ertelenir.
pub async fn should_deliver_now(
    pool: &PgPool,
    delivery_id: Uuid,
    endpoint_id: Uuid,
) -> anyhow::Result<bool> {
    // Endpoint'in FIFO yapılandırmasını al
    let config: (bool, Option<i64>) = sqlx::query_as(
        "SELECT fifo_enabled, fifo_sequence FROM endpoints WHERE id = $1"
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await?;

    let (fifo_enabled, _current_seq) = config;
    if !fifo_enabled {
        return Ok(true); // FIFO devre dışı, hemen teslim et
    }

    // Bu teslimatın sıra numarasını al
    let delivery_seq: Option<i64> = sqlx::query_scalar(
        "SELECT sequence_num FROM deliveries WHERE id = $1"
    )
    .bind(delivery_id)
    .fetch_one(pool)
    .await?;

    let seq = match delivery_seq {
        Some(s) => s,
        None => return Ok(true), // Sıra numarası yok, hemen teslim et
    };

    // Eğer sıra numarası 1 ise (ilk teslimat), hemen teslim et
    if seq <= 1 {
        return Ok(true);
    }

    // Bir önceki teslimatın durumunu kontrol et
    let prev_status: Option<String> = sqlx::query_as(
        r#"
        SELECT status FROM deliveries
        WHERE endpoint_id = $1 AND sequence_num = $2
        "#,
    )
    .bind(endpoint_id)
    .bind(seq - 1)
    .fetch_optional(pool)
    .await?
    .map(|(s,)| s);

    match prev_status {
        Some(ref s) if s == "delivered" || s == "failed" => Ok(true), // Önceki tamamlandı
        None => Ok(true), // Önceki yok (silinmiş veya ilk)
        _ => Ok(false),   // Önceki hâlâ pending, bekle
    }
}

/// FIFO migration'ını çalıştır
pub async fn run_fifo_migration(pool: &PgPool) -> anyhow::Result<()> {
    sqlx::query(FIFO_MIGRATION).execute(pool).await?;
    tracing::info!("✅ FIFO migration completed");
    Ok(())
}
