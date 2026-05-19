//! Shared notification creation helpers.
//!
//! Centralizes all in-app notification creation so every significant
//! event in the system generates a user-visible notification.

use sqlx::PgPool;
use uuid::Uuid;

/// Create a notification for a customer.
pub async fn create(
    pool: &PgPool,
    customer_id: Uuid,
    notif_type: &str,
    title: &str,
    message: &str,
    link: Option<&str>,
) {
    let _ = sqlx::query(
        "INSERT INTO notifications (customer_id, type, title, message, is_read, link) VALUES ($1, $2, $3, $4, false, $5)"
    )
    .bind(customer_id)
    .bind(notif_type)
    .bind(title)
    .bind(message)
    .bind(link)
    .execute(pool)
    .await;
}

// ── Billing Notifications ──────────────────────────────────

/// Payment failed — grace period started.
pub async fn payment_failed(pool: &PgPool, customer_id: Uuid, provider: &str) {
    create(
        pool,
        customer_id,
        "billing",
        "💳 Ödeme Başarısız",
        &format!("{} üzerinden ödeme başarısız oldu. Lütfen ödeme bilgilerinizi güncelleyin. Hizmetiniz geçici olarak durdurulabilir.", provider),
        Some("/account?tab=billing"),
    ).await;
}

/// Payment succeeded after a failure — grace period cleared.
pub async fn payment_recovered(pool: &PgPool, customer_id: Uuid, provider: &str) {
    create(
        pool,
        customer_id,
        "billing",
        "✅ Ödeme Başarılı",
        &format!("{} üzerinden ödemeniz alındı. Hizmetiniz normal şekilde devam ediyor.", provider),
        Some("/account?tab=billing"),
    ).await;
}

/// Subscription canceled.
pub async fn subscription_canceled(pool: &PgPool, customer_id: Uuid, plan: &str) {
    create(
        pool,
        customer_id,
        "billing",
        "❌ Abonelik İptal Edildi",
        &format!("{} plan aboneliğiniz iptal edildi. Dönem sonuna kadar mevcut özelliklerinizi kullanmaya devam edebilirsiniz.", plan),
        Some("/billing-section"),
    ).await;
}

/// Plan upgraded.
pub async fn plan_upgraded(pool: &PgPool, customer_id: Uuid, old_plan: &str, new_plan: &str) {
    create(
        pool,
        customer_id,
        "billing",
        "🚀 Plan Yükseltildi",
        &format!("{} planından {} planına yükseltildiniz. Yeni özellikleriniz aktif!", old_plan, new_plan),
        Some("/billing-section"),
    ).await;
}

// ── Webhook / Delivery Notifications ───────────────────────

/// Delivery dead-lettered (called from worker).
pub async fn delivery_failed(
    pool: &PgPool,
    customer_id: Uuid,
    delivery_id: Uuid,
    endpoint_url: &str,
    error_msg: &str,
) {
    create(
        pool,
        customer_id,
        "webhook_failed",
        "⚠️ Webhook Teslimat Başarısız",
        &format!("{} adresine teslimat başarısız oldu: {}", endpoint_url, error_msg),
        Some(&format!("/deliveries/{}", delivery_id)),
    ).await;
}

/// Endpoint is down (failure_streak >= 5).
pub async fn endpoint_down(pool: &PgPool, customer_id: Uuid, endpoint_id: Uuid, endpoint_url: &str, streak: i32) {
    create(
        pool,
        customer_id,
        "alert",
        "🔴 Endpoint Çöktü",
        &format!("{} adresinde {} ardışık başarısızlık tespit edildi. Endpoint devre dışı olabilir.", endpoint_url, streak),
        Some(&format!("/applications?endpoint={}", endpoint_id)),
    ).await;
}

/// Endpoint recovered (failure_streak reset to 0).
pub async fn endpoint_recovered(pool: &PgPool, customer_id: Uuid, endpoint_id: Uuid, endpoint_url: &str) {
    create(
        pool,
        customer_id,
        "alert",
        "🟢 Endpoint Kurtarıldı",
        &format!("{} adresindeki endpoint tekrar sağlıklı durumda.", endpoint_url),
        Some(&format!("/applications?endpoint={}", endpoint_id)),
    ).await;
}

// ── Team Notifications ─────────────────────────────────────

/// Member joined a team.
pub async fn member_joined(pool: &PgPool, customer_id: Uuid, member_name: &str, team_name: &str) {
    create(
        pool,
        customer_id,
        "system",
        "👥 Yeni Üye Katıldı",
        &format!("{} ekibine katıldı: {}", member_name, team_name),
        Some("/organization"),
    ).await;
}

/// Member removed from team.
pub async fn member_removed(pool: &PgPool, customer_id: Uuid, member_name: &str, team_name: &str) {
    create(
        pool,
        customer_id,
        "system",
        "👤 Üye Çıkarıldı",
        &format!("{} ekibinden çıkarıldı: {}", member_name, team_name),
        Some("/organization"),
    ).await;
}

/// Ownership transferred.
pub async fn ownership_transferred(pool: &PgPool, customer_id: Uuid, team_name: &str, new_owner: &str) {
    create(
        pool,
        customer_id,
        "system",
        "🔄 Sahiplik Devredildi",
        &format!("{} ekibinin sahipliği {} kullanıcısına devredildi.", team_name, new_owner),
        Some("/organization"),
    ).await;
}

// ── System Notifications ───────────────────────────────────

/// Webhook limit approaching (80%+ usage).
pub async fn limit_approaching(pool: &PgPool, customer_id: Uuid, current: i64, limit: i64) {
    let pct = (current as f64 / limit as f64 * 100.0) as i32;
    create(
        pool,
        customer_id,
        "alert",
        "⚠️ Webhook Limiti Yaklaşıyor",
        &format!("Webhook kullanımınız %{} seviyesinde ({}/{}). Limiti aşarsınızsanız hizmetiniz durabilir.", pct, current, limit),
        Some("/billing-section"),
    ).await;
}

/// Webhook limit exceeded.
pub async fn limit_exceeded(pool: &PgPool, customer_id: Uuid, current: i64, limit: i64) {
    create(
        pool,
        customer_id,
        "alert",
        "🚫 Webhook Limiti Aşıldı",
        &format!("Webhook limitiniz aşıldı ({}/{}). Yeni webhook'lar reddedilebilir. Planınızı yükseltmeyi düşünün.", current, limit),
        Some("/billing-section"),
    ).await;
}
