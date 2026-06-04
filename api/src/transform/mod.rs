//! Payload Transformation Pipeline for HookSniff
//!
//! Webhook payload'ları endpoint'e gönderilmeden önce dönüştürülebilir.
//! Bu modül, gelen payload üzerinde filtreleme, eşleme ve zenginleştirme
//! işlemlerini uygular.
//!
//! ## Pipeline Akışı
//!
//! ```text
//! Gelen Payload → Filter → Map → Enrich → Gönder
//! ```
//!
//! 1. **Filter**: JSON path ile veri çekme / filtreleme
//! 2. **Map**: Field mapping (alan adı değiştirme)
//! 3. **Enrich**: Static field ekleme (metadata, source bilgisi vb.)
//!
//! ## Veritabanı Şeması
//!
//! ```sql
//! CREATE TABLE transform_rules (
//!     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//!     endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
//!     rule_json JSONB NOT NULL,
//!     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
//! );
//! ```

pub mod filter;
pub mod pipeline;
pub mod templates;
mod transform_tests;

// Re-export pipeline types for backward compatibility
pub use pipeline::{TransformPipeline, TransformStep, TransformType};

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::PgPool;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// Database Model
// ---------------------------------------------------------------------------

/// Transform kuralı — veritabanı satırı
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct TransformRule {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub rule_json: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

/// Transform kuralı oluşturma isteği
#[derive(Debug, Deserialize)]
pub struct CreateTransformRuleRequest {
    pub rule: TransformRuleConfig,
}

/// Transform kuralı yapılandırması (JSON formatında saklanır)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransformRuleConfig {
    /// Filtreleme kuralları — hangi alanlar tutulacak/çıkartılacak
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filter: Option<FilterConfig>,
    /// Field mapping kuralları — alan adı değiştirme
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mappings: Option<Vec<FieldMapping>>,
    /// Enrichment — static field ekleme
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enrich: Option<EnrichConfig>,
}

// ---------------------------------------------------------------------------
// Filter Config — JSON Path Extraction
// ---------------------------------------------------------------------------

/// Filtreleme yapılandırması
///
/// `include` belirtilirse sadece bu alanlar tutulur.
/// `exclude` belirtilirse bu alanlar çıkartılır.
/// `include` önceliklidir.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterConfig {
    /// Sadece bu alanları tut (JSON path destekler)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include: Option<Vec<String>>,
    /// Bu alanları çıkart
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exclude: Option<Vec<String>>,
    /// JSON path ile derin çıkartma (nested alanlar)
    /// Örn: `data.order.internal_notes` → bu path çıkartılır
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exclude_paths: Option<Vec<String>>,
}

// ---------------------------------------------------------------------------
// Field Mapping
// ---------------------------------------------------------------------------

/// Alan eşleme kuralı
///
/// Gelen payload'daki bir alanı farklı isimle gönder.
/// Örn: `data.order.id` → `order_id`
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldMapping {
    /// Kaynak JSON path (gelen payload'daki konum)
    pub source: String,
    /// Hedef alan adı (gönderilecek payload'daki isim)
    pub target: String,
}

// ---------------------------------------------------------------------------
// Enrichment Config
// ---------------------------------------------------------------------------

/// Zenginleştirme yapılandırması — static field ekleme
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichConfig {
    /// Eklenecek static alanlar
    /// Örn: `{"source": "hooksniff", "version": "1.0"}`
    pub fields: std::collections::HashMap<String, Value>,
}

// ---------------------------------------------------------------------------
// Transform Engine
// ---------------------------------------------------------------------------

/// Payload dönüşüm motoru
///
/// Gelen payload'ı filter → map → enrich pipeline'ından geçirir.
pub struct TransformEngine;

impl TransformEngine {
    /// Transform pipeline'ını çalıştır
    ///
    /// Gelen payload'ı kural yapılandırmasına göre dönüştürür.
    pub fn apply(input: &Value, config: &TransformRuleConfig) -> Result<Value> {
        let mut current = input.clone();

        // Step 1: Filter
        if let Some(ref filter_config) = config.filter {
            current = Self::apply_filter(&current, filter_config)?;
        }

        // Step 2: Map
        if let Some(ref mappings) = config.mappings {
            current = Self::apply_mappings(&current, mappings)?;
        }

        // Step 3: Enrich
        if let Some(ref enrich_config) = config.enrich {
            current = Self::apply_enrich(&current, enrich_config)?;
        }

        Ok(current)
    }

    /// Filtreleme uygula
    ///
    /// JSON path ile veri çekme ve filtreleme.
    fn apply_filter(input: &Value, config: &FilterConfig) -> Result<Value> {
        let Some(obj) = input.as_object() else {
            return Ok(input.clone());
        };

        // Include modu: sadece belirtilen alanları tut
        if let Some(ref include) = config.include {
            let mut result = serde_json::Map::new();
            for path in include {
                if let Some(value) = resolve_json_path(input, path) {
                    // Flat extraction: "data.order.id" → "id" olarak çıkar
                    let key = path.rsplit('.').next().unwrap_or(path);
                    result.insert(key.to_string(), value.clone());
                }
            }
            return Ok(Value::Object(result));
        }

        // Exclude modu: belirtilen alanları çıkart
        let mut result = obj.clone();

        if let Some(ref exclude) = config.exclude {
            for key in exclude {
                result.remove(key.as_str());
            }
        }

        // Exclude paths: nested alanları çıkart
        if let Some(ref exclude_paths) = config.exclude_paths {
            for path in exclude_paths {
                remove_json_path(&mut Value::Object(result.clone()), path);
                // Re-read after modification
                if let Value::Object(ref mut map) = Value::Object(result.clone()) {
                    result = map.clone();
                }
            }
            // Daha temiz bir yaklaşım:
            let mut val = Value::Object(result);
            for path in exclude_paths {
                remove_json_path(&mut val, path);
            }
            return Ok(val);
        }

        Ok(Value::Object(result))
    }

    /// Field mapping uygula
    ///
    /// Kaynak path'teki değeri hedef alana kopyalar.
    fn apply_mappings(input: &Value, mappings: &[FieldMapping]) -> Result<Value> {
        let mut output = input.clone();

        for mapping in mappings {
            // Kaynak path'ten değeri çek
            if let Some(value) = resolve_json_path(input, &mapping.source) {
                // Flat veya nested hedefe yaz
                set_json_path(&mut output, &mapping.target, value.clone());
                // Kaynak alanı sil (source != target ise)
                if mapping.source != mapping.target {
                    remove_json_path(&mut output, &mapping.source);
                }
            }
        }

        Ok(output)
    }

    /// Enrichment uygula — static field ekleme
    fn apply_enrich(input: &Value, config: &EnrichConfig) -> Result<Value> {
        let mut output = input.clone();

        if let Some(obj) = output.as_object_mut() {
            for (key, value) in &config.fields {
                obj.insert(key.clone(), value.clone());
            }
        }

        Ok(output)
    }
}

// ---------------------------------------------------------------------------
// Database Operations
// ---------------------------------------------------------------------------

/// Endpoint için transform kuralı oluştur
pub async fn create_rule(
    pool: &PgPool,
    endpoint_id: Uuid,
    config: &TransformRuleConfig,
) -> Result<TransformRule> {
    let rule_json = serde_json::to_value(config).context("Failed to serialize transform rule")?;

    let rule: TransformRule = sqlx::query_as(
        r#"
        INSERT INTO transform_rules (endpoint_id, rule_json)
        VALUES ($1, $2)
        RETURNING id, endpoint_id, rule_json, created_at
        "#,
    )
    .bind(endpoint_id)
    .bind(&rule_json)
    .fetch_one(pool)
    .await
    .context("Failed to create transform rule")?;

    tracing::info!(
        endpoint_id = %endpoint_id,
        rule_id = %rule.id,
        "Transform rule created"
    );

    Ok(rule)
}

/// Endpoint için transform kurallarını listele
pub async fn list_rules(pool: &PgPool, endpoint_id: Uuid) -> Result<Vec<TransformRule>> {
    let rules: Vec<TransformRule> = sqlx::query_as(
        r#"
        SELECT id, endpoint_id, rule_json, created_at
        FROM transform_rules
        WHERE endpoint_id = $1
        ORDER BY created_at ASC
        "#,
    )
    .bind(endpoint_id)
    .fetch_all(pool)
    .await
    .context("Failed to list transform rules")?;

    Ok(rules)
}

/// Transform kuralını sil
pub async fn delete_rule(pool: &PgPool, rule_id: Uuid) -> Result<bool> {
    let result = sqlx::query("DELETE FROM transform_rules WHERE id = $1")
        .bind(rule_id)
        .execute(pool)
        .await
        .context("Failed to delete transform rule")?;

    Ok(result.rows_affected() > 0)
}

/// Endpoint için tüm transform kurallarını sil
pub async fn delete_all_rules(pool: &PgPool, endpoint_id: Uuid) -> Result<u64> {
    let result = sqlx::query("DELETE FROM transform_rules WHERE endpoint_id = $1")
        .bind(endpoint_id)
        .execute(pool)
        .await
        .context("Failed to delete transform rules")?;

    Ok(result.rows_affected())
}

/// Endpoint için transform kuralını güncelle
pub async fn update_rule(
    pool: &PgPool,
    rule_id: Uuid,
    config: &TransformRuleConfig,
) -> Result<TransformRule> {
    let rule_json = serde_json::to_value(config).context("Failed to serialize transform rule")?;

    let rule: TransformRule = sqlx::query_as(
        r#"
        UPDATE transform_rules
        SET rule_json = $2
        WHERE id = $1
        RETURNING id, endpoint_id, rule_json, created_at
        "#,
    )
    .bind(rule_id)
    .bind(&rule_json)
    .fetch_one(pool)
    .await
    .context("Failed to update transform rule")?;

    Ok(rule)
}

// ---------------------------------------------------------------------------
// Pipeline Execution with DB Rules
// ---------------------------------------------------------------------------

/// Endpoint'in tüm transform kurallarını yükle ve payload'ı dönüştür
///
/// Veritabanından kuralları çeker, pipeline'ı oluşturur ve uygular.
pub async fn transform_payload(pool: &PgPool, endpoint_id: Uuid, input: &Value) -> Result<Value> {
    let rules = list_rules(pool, endpoint_id).await?;

    if rules.is_empty() {
        return Ok(input.clone());
    }

    let mut current = input.clone();

    // Her kuralı sırayla uygula (pipeline)
    for rule in &rules {
        let config: TransformRuleConfig = serde_json::from_value(rule.rule_json.clone())
            .context("Failed to parse transform rule config")?;
        current = TransformEngine::apply(&current, &config)?;
    }

    Ok(current)
}

// ---------------------------------------------------------------------------
// JSON Path Utilities
// ---------------------------------------------------------------------------

/// JSON path ile değeri çözümle
///
/// Dot notation destekler: `data.order.id` → `input["data"]["order"]["id"]`
/// Array indexing destekler: `items.0.name` → `input["items"][0]["name"]`
pub fn resolve_json_path<'a>(input: &'a Value, path: &str) -> Option<&'a Value> {
    let parts: Vec<&str> = path.split('.').collect();
    let mut current = input;

    for part in parts {
        current = match current {
            Value::Object(obj) => obj.get(part),
            Value::Array(arr) => {
                if let Ok(index) = part.parse::<usize>() {
                    arr.get(index)
                } else {
                    return None;
                }
            }
            _ => return None,
        }?;
    }

    Some(current)
}

/// JSON path ile değer yaz
///
/// Nested olmayan path'ler için: `order_id` → `output["order_id"] = value`
/// Nested path'ler için: `data.order.id` → `output["data"]["order"]["id"] = value`
fn set_json_path(output: &mut Value, path: &str, value: Value) {
    let parts: Vec<&str> = path.split('.').collect();

    if parts.len() == 1 {
        // Flat: doğrudan yaz
        if let Some(obj) = output.as_object_mut() {
            obj.insert(parts[0].to_string(), value);
        }
        return;
    }

    // Nested: parent'ı bul veya oluştur
    let mut current = output;
    for (i, part) in parts.iter().enumerate() {
        if i == parts.len() - 1 {
            // Son parça: değeri yaz
            if let Some(obj) = current.as_object_mut() {
                obj.insert(part.to_string(), value.clone());
            }
        } else {
            // Orta parça: child objeyi bul veya oluştur
            if current.get(*part).is_none() {
                if let Some(obj) = current.as_object_mut() {
                    obj.insert(part.to_string(), Value::Object(serde_json::Map::new()));
                }
            }
            if let Some(child) = current.get_mut(*part) {
                current = child;
            } else {
                break;
            }
        }
    }
}

/// JSON path ile nested alanı kaldır
fn remove_json_path(input: &mut Value, path: &str) {
    let parts: Vec<&str> = path.split('.').collect();

    if parts.len() == 1 {
        if let Some(obj) = input.as_object_mut() {
            obj.remove(parts[0]);
        }
        return;
    }

    // Parent'ı bul ve son alanı kaldır
    let mut current = input;
    for (i, part) in parts.iter().enumerate() {
        if i == parts.len() - 1 {
            if let Some(obj) = current.as_object_mut() {
                obj.remove(*part);
            }
        } else {
            match current.get_mut(*part) {
                Some(child) => current = child,
                None => return, // Path mevcut değil
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Migration SQL
// ---------------------------------------------------------------------------

/// Transform migration SQL — db.rs tarafından çağrılabilir
pub const TRANSFORM_MIGRATION_SQL: &str = r#"
-- Transform kuralları tablosu
CREATE TABLE IF NOT EXISTS transform_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    rule_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transform_rules_endpoint
    ON transform_rules(endpoint_id);
"#;

/// Transform migration'ını çalıştır
pub async fn run_transform_migration(pool: &PgPool) -> Result<()> {
    sqlx::query(TRANSFORM_MIGRATION_SQL)
        .execute(pool)
        .await
        .context("Failed to run transform migration")?;
 tracing::info!(" Transform migration completed");
    Ok(())
}


// ---------------------------------------------------------------------------
// EventTransformer Trait
// ---------------------------------------------------------------------------

/// Trait for event transformers.
pub trait EventTransformer: Send + Sync {
    /// Transform an input event into an output event.
    fn transform(&self, input: &Value) -> Result<Value>;

    /// Human-readable name for this transformer.
    fn name(&self) -> &str;
}
