//! Shared notification creation helpers.
//!
//! Centralizes all in-app notification creation so every significant
//! event in the system generates a user-visible notification.
//! All notifications support TR/EN based on customer language preference.

use sqlx::PgPool;
use uuid::Uuid;

/// Supported notification languages.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Lang {
    Tr,
    En,
}

impl Lang {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "en" | "english" => Self::En,
            _ => Self::Tr,
        }
    }
}

/// Create a notification for a customer.
/// Deduplication: skips if an identical unread notification exists in the last 24 hours.
pub async fn create(
    pool: &PgPool,
    customer_id: Uuid,
    notif_type: &str,
    title: &str,
    message: &str,
    link: Option<&str>,
) {
    // Check for duplicate unread notification in last 24 hours
    let exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS(\
            SELECT 1 FROM notifications \
            WHERE customer_id = $1 AND type = $2 AND title = $3 AND is_read = false \
            AND created_at > NOW() - INTERVAL '24 hours'\
        )"
    )
    .bind(customer_id)
    .bind(notif_type)
    .bind(title)
    .fetch_one(pool)
    .await
    .unwrap_or((false,));

    if exists.0 {
        return; // Duplicate — skip
    }

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

/// Get customer language from database. Defaults to Turkish.
pub async fn get_customer_lang(pool: &PgPool, customer_id: Uuid) -> Lang {
    let lang: Option<String> = sqlx::query_scalar(
        "SELECT language FROM customers WHERE id = $1"
    )
    .bind(customer_id)
    .fetch_one(pool)
    .await
    .ok()
    .flatten();
    Lang::from_str(lang.as_deref().unwrap_or("tr"))
}

// ── Billing Notifications ──────────────────────────────────

/// Payment failed — grace period started.
pub async fn payment_failed(pool: &PgPool, customer_id: Uuid, provider: &str) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "💳 Ödeme Başarısız",
            format!("{} üzerinden ödeme başarısız oldu. Lütfen ödeme bilgilerinizi güncelleyin. Hizmetiniz geçici olarak durdurulabilir.", provider),
        ),
        Lang::En => (
            "💳 Payment Failed",
            format!("Payment via {} failed. Please update your payment method. Your service may be temporarily suspended.", provider),
        ),
    };
    create(pool, customer_id, "billing", title, &message, Some("/account?tab=billing")).await;
}

/// Payment succeeded after a failure — grace period cleared.
pub async fn payment_recovered(pool: &PgPool, customer_id: Uuid, provider: &str) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "✅ Ödeme Başarılı",
            format!("{} üzerinden ödemeniz alındı. Hizmetiniz normal şekilde devam ediyor.", provider),
        ),
        Lang::En => (
            "✅ Payment Successful",
            format!("Payment via {} received. Your service is operating normally.", provider),
        ),
    };
    create(pool, customer_id, "billing", title, &message, Some("/account?tab=billing")).await;
}

/// Subscription canceled.
pub async fn subscription_canceled(pool: &PgPool, customer_id: Uuid, plan: &str) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "❌ Abonelik İptal Edildi",
            format!("{} plan aboneliğiniz iptal edildi. Dönem sonuna kadar mevcut özelliklerinizi kullanmaya devam edebilirsiniz.", plan),
        ),
        Lang::En => (
            "❌ Subscription Canceled",
            format!("Your {} plan subscription has been canceled. You can continue using your current features until the end of the billing period.", plan),
        ),
    };
    create(pool, customer_id, "billing", title, &message, Some("/billing-section")).await;
}

/// Plan upgraded — deduplicated: same plan upgrade within 24h is ignored.
pub async fn plan_upgraded(pool: &PgPool, customer_id: Uuid, old_plan: &str, new_plan: &str) {
    let lang = get_customer_lang(pool, customer_id).await;

    // Deduplication uses the title, so we need to check with the correct language title
    let title = match lang {
        Lang::Tr => "🚀 Plan Yükseltildi",
        Lang::En => "🚀 Plan Upgraded",
    };

    let exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS(\
            SELECT 1 FROM notifications \
            WHERE customer_id = $1 AND type = 'billing' AND title = $2 \
            AND message LIKE '%' || $3 || '%' \
            AND created_at > NOW() - INTERVAL '24 hours'\
        )"
    )
    .bind(customer_id)
    .bind(title)
    .bind(new_plan)
    .fetch_one(pool)
    .await
    .unwrap_or((false,));

    if exists.0 {
        return; // Already notified about this upgrade
    }

    let message = match lang {
        Lang::Tr => format!("{} planından {} planına yükseltildiniz. Yeni özellikleriniz aktif!", old_plan, new_plan),
        Lang::En => format!("You've been upgraded from {} to {} plan. Your new features are now active!", old_plan, new_plan),
    };
    create(pool, customer_id, "billing", title, &message, Some("/billing-section")).await;
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
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "⚠️ Webhook Teslimat Başarısız",
            format!("{} adresine teslimat başarısız oldu: {}", endpoint_url, error_msg),
        ),
        Lang::En => (
            "⚠️ Webhook Delivery Failed",
            format!("Delivery to {} failed: {}", endpoint_url, error_msg),
        ),
    };
    create(pool, customer_id, "webhook_failed", title, &message, Some(&format!("/deliveries/{}", delivery_id))).await;
}

/// Endpoint is down (failure_streak >= 5).
pub async fn endpoint_down(pool: &PgPool, customer_id: Uuid, endpoint_id: Uuid, endpoint_url: &str, streak: i32) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "🔴 Endpoint Çöktü",
            format!("{} adresinde {} ardışık başarısızlık tespit edildi. Endpoint devre dışı olabilir.", endpoint_url, streak),
        ),
        Lang::En => (
            "🔴 Endpoint Down",
            format!("{} consecutive failures detected at {}. The endpoint may be down.", streak, endpoint_url),
        ),
    };
    create(pool, customer_id, "alert", title, &message, Some(&format!("/applications?endpoint={}", endpoint_id))).await;
}

/// Endpoint recovered (failure_streak reset to 0).
pub async fn endpoint_recovered(pool: &PgPool, customer_id: Uuid, endpoint_id: Uuid, endpoint_url: &str) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "🟢 Endpoint Kurtarıldı",
            format!("{} adresindeki endpoint tekrar sağlıklı durumda.", endpoint_url),
        ),
        Lang::En => (
            "🟢 Endpoint Recovered",
            format!("Endpoint at {} is healthy again.", endpoint_url),
        ),
    };
    create(pool, customer_id, "alert", title, &message, Some(&format!("/applications?endpoint={}", endpoint_id))).await;
}

// ── Security Notifications ────────────────────────────────────

/// Password changed — important security event.
pub async fn password_changed(pool: &PgPool, customer_id: Uuid) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "🔒 Şifre Değiştirildi",
            "Hesap şifreniz değiştirildi. Bu işlemi siz yapmadıysanız hemen şifrenizi sıfırlayın.".to_string(),
        ),
        Lang::En => (
            "🔒 Password Changed",
            "Your account password has been changed. If you didn't do this, reset your password immediately.".to_string(),
        ),
    };
    create(pool, customer_id, "security", title, &message, Some("/account?tab=security")).await;
}

/// Email address changed — important security event.
pub async fn email_changed(pool: &PgPool, customer_id: Uuid, new_email: &str) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "📧 E-posta Adresi Değiştirildi",
            format!("Hesap e-posta adresiniz {} olarak güncellendi. Bu işlemi siz yapmadıysanız hemen destek ile iletişime geçin.", new_email),
        ),
        Lang::En => (
            "📧 Email Address Changed",
            format!("Your account email has been updated to {}. If you didn't do this, contact support immediately.", new_email),
        ),
    };
    create(pool, customer_id, "security", title, &message, Some("/account?tab=security")).await;
}

/// Two-factor authentication enabled.
pub async fn two_factor_enabled(pool: &PgPool, customer_id: Uuid) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "🔐 İki Faktörlü Doğrulama Aktif",
            "Hesabınız için iki faktörlü doğrulama (2FA) etkinleştirildi. Hesabınız artık daha güvende.".to_string(),
        ),
        Lang::En => (
            "🔐 Two-Factor Authentication Enabled",
            "Two-factor authentication (2FA) has been enabled for your account. Your account is now more secure.".to_string(),
        ),
    };
    create(pool, customer_id, "security", title, &message, Some("/account?tab=security")).await;
}

/// Two-factor authentication disabled.
pub async fn two_factor_disabled(pool: &PgPool, customer_id: Uuid) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "⚠️ İki Faktörlü Doğrulama Kapatıldı",
            "Hesabınız için iki faktörlü doğrulama (2FA) devre dışı bırakıldı. Güvenliğiniz için tekrar açmanız önerilir.".to_string(),
        ),
        Lang::En => (
            "⚠️ Two-Factor Authentication Disabled",
            "Two-factor authentication (2FA) has been disabled for your account. We recommend re-enabling it for security.".to_string(),
        ),
    };
    create(pool, customer_id, "security", title, &message, Some("/account?tab=security")).await;
}

/// New API key created.
pub async fn api_key_created(pool: &PgPool, customer_id: Uuid, key_name: &str) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "🔑 Yeni API Key Oluşturuldu",
            format!("\"{}\" adında yeni bir API key oluşturuldu. Bu işlemi siz yapmadıysanız hemen iptal edin.", key_name),
        ),
        Lang::En => (
            "🔑 New API Key Created",
            format!("A new API key \"{}\" has been created. If you didn't do this, revoke it immediately.", key_name),
        ),
    };
    create(pool, customer_id, "security", title, &message, Some("/core")).await;
}

/// API key revoked.
pub async fn api_key_revoked(pool: &PgPool, customer_id: Uuid, key_name: &str) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "🗑️ API Key İptal Edildi",
            format!("\"{}\" adındaki API key iptal edildi.", key_name),
        ),
        Lang::En => (
            "🗑️ API Key Revoked",
            format!("API key \"{}\" has been revoked.", key_name),
        ),
    };
    create(pool, customer_id, "security", title, &message, Some("/core")).await;
}

// ── Team Notifications ─────────────────────────────────────

/// Member joined a team.
pub async fn member_joined(pool: &PgPool, customer_id: Uuid, member_name: &str, team_name: &str) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "👥 Yeni Üye Katıldı",
            format!("{} ekibine katıldı: {}", member_name, team_name),
        ),
        Lang::En => (
            "👥 New Member Joined",
            format!("{} joined team: {}", member_name, team_name),
        ),
    };
    create(pool, customer_id, "system", title, &message, Some("/organization")).await;
}

/// Member removed from team.
pub async fn member_removed(pool: &PgPool, customer_id: Uuid, member_name: &str, team_name: &str) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "👤 Üye Çıkarıldı",
            format!("{} ekibinden çıkarıldı: {}", member_name, team_name),
        ),
        Lang::En => (
            "👤 Member Removed",
            format!("{} has been removed from team: {}", member_name, team_name),
        ),
    };
    create(pool, customer_id, "system", title, &message, Some("/organization")).await;
}

/// Ownership transferred.
pub async fn ownership_transferred(pool: &PgPool, customer_id: Uuid, team_name: &str, new_owner: &str) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "🔄 Sahiplik Devredildi",
            format!("{} ekibinin sahipliği {} kullanıcısına devredildi.", team_name, new_owner),
        ),
        Lang::En => (
            "🔄 Ownership Transferred",
            format!("Ownership of team {} has been transferred to {}.", team_name, new_owner),
        ),
    };
    create(pool, customer_id, "system", title, &message, Some("/organization")).await;
}

// ── System Notifications ───────────────────────────────────

/// Webhook limit approaching (80%+ usage).
pub async fn limit_approaching(pool: &PgPool, customer_id: Uuid, current: i64, limit: i64) {
    let lang = get_customer_lang(pool, customer_id).await;
    let pct = (current as f64 / limit as f64 * 100.0) as i32;
    let (title, message) = match lang {
        Lang::Tr => (
            "⚠️ Webhook Limiti Yaklaşıyor",
            format!("Webhook kullanımınız %{} seviyesinde ({}/{}). Limiti aşarsınızsanız hizmetiniz durabilir.", pct, current, limit),
        ),
        Lang::En => (
            "⚠️ Webhook Limit Approaching",
            format!("Your webhook usage is at {}% ({}/{}). Exceeding the limit may suspend your service.", pct, current, limit),
        ),
    };
    create(pool, customer_id, "alert", title, &message, Some("/billing-section")).await;
}

/// Webhook limit exceeded.
pub async fn limit_exceeded(pool: &PgPool, customer_id: Uuid, current: i64, limit: i64) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "🚫 Webhook Limiti Aşıldı",
            format!("Webhook limitiniz aşıldı ({}/{}). Yeni webhook'lar reddedilebilir. Planınızı yükseltmeyi düşünün.", current, limit),
        ),
        Lang::En => (
            "🚫 Webhook Limit Exceeded",
            format!("Your webhook limit has been exceeded ({}/{}). New webhooks may be rejected. Consider upgrading your plan.", current, limit),
        ),
    };
    create(pool, customer_id, "alert", title, &message, Some("/billing-section")).await;
}

/// Notify customer that their refund was processed.
pub async fn refund_processed(pool: &PgPool, customer_id: Uuid, amount_cents: i64) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "💰 İade İşlendi",
            format!("${:.2} tutarındaki iade talebiniz onaylandı ve işlendi. Planınız Free'ye düşürüldü.", amount_cents as f64 / 100.0),
        ),
        Lang::En => (
            "💰 Refund Processed",
            format!("Your refund request for ${:.2} has been approved and processed. Your plan has been downgraded to Free.", amount_cents as f64 / 100.0),
        ),
    };
    create(pool, customer_id, "billing", title, &message, Some("/billing")).await;
}

/// Notify customer that their refund request was denied.
pub async fn refund_denied(pool: &PgPool, customer_id: Uuid, reason: &str) {
    let lang = get_customer_lang(pool, customer_id).await;
    let (title, message) = match lang {
        Lang::Tr => (
            "❌ İade Talebi Reddedildi",
            if reason.is_empty() {
                "İade talebiniz reddedildi. Daha fazla bilgi için destek ekibiyle iletişime geçin.".to_string()
            } else {
                format!("İade talebiniz reddedildi. Sebep: {}", reason)
            },
        ),
        Lang::En => (
            "❌ Refund Request Denied",
            if reason.is_empty() {
                "Your refund request has been denied. Contact support for more information.".to_string()
            } else {
                format!("Your refund request has been denied. Reason: {}", reason)
            },
        ),
    };
    create(pool, customer_id, "billing", title, &message, Some("/billing")).await;
}
