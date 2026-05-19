//! Dunning job — pre-expiry payment reminders.
//!
//! Runs daily. Checks customers whose billing period ends within 3 days.
//! Sends email + in-app notification at 3, 2, 1 days before period end.
//!
//! Payment failure → immediate downgrade to free (no grace period).
//! Dunning emails are PRE-EXPIRY warnings, not post-failure reminders.

use anyhow::Result;
use chrono::Utc;
use sqlx::PgPool;

use crate::email::Language;
use crate::resend_email::ResendEmailClient;

/// Days before period end to send dunning emails (3, 2, 1 days remaining).
const DUNNING_EMAIL_DAYS: [i64; 3] = [3, 2, 1];

/// Run the dunning job. Call this daily.
///
/// For each paid customer whose `current_period_end` is within 3 days:
/// 1. Calculate days remaining until period end
/// 2. Send email + in-app notification
/// 3. Track which reminders have been sent to avoid duplicates
pub async fn run_dunning(pool: &PgPool, email_client: &ResendEmailClient) -> Result<u64> {
    tracing::info!("🔔 Running dunning job...");

    let now = Utc::now();

    // Find paid customers whose billing period ends within 3 days
    let customers: Vec<(uuid::Uuid, String, String, chrono::DateTime<Utc>, String)> = sqlx::query_as(
        "SELECT id, email, plan, current_period_end, COALESCE(language, 'tr') as language \
         FROM customers \
         WHERE current_period_end IS NOT NULL \
         AND current_period_end > NOW() \
         AND current_period_end <= NOW() + INTERVAL '3 days' \
         AND plan NOT IN ('free', 'developer')"
    )
    .fetch_all(pool)
    .await?;

    let mut emails_sent = 0u64;

    for (customer_id, email, plan, period_end, lang_raw) in &customers {
        let days_remaining = (*period_end - now).num_days().max(0);

        let lang = Language::parse_lang(lang_raw);
        let plan_display = crate::billing::Plan::parse_str(plan).as_str();

        // Only send emails for specific days (3, 2, 1)
        if !DUNNING_EMAIL_DAYS.contains(&days_remaining) {
            continue;
        }

        // Check if we already sent a reminder for this day
        let already_sent: bool = sqlx::query_scalar(
            "SELECT EXISTS(\
                SELECT 1 FROM dunning_reminders \
                WHERE customer_id = $1 AND days_remaining = $2\
            )"
        )
        .bind(customer_id)
        .bind(days_remaining as i32)
        .fetch_one(pool)
        .await
        .unwrap_or(false);

        if already_sent {
            continue;
        }

        // Send dunning email
        let (subject, html) = tpl_dunning_reminder(
            plan_display,
            days_remaining,
            lang,
        );

        match email_client.send_contact_email(&email, &subject, &html).await {
            Ok(_) => {
                tracing::info!(
                    "📧 Dunning email sent: customer={}, days_remaining={}, plan={}",
                    customer_id, days_remaining, plan
                );
                emails_sent += 1;
            }
            Err(e) => {
                tracing::warn!(
                    "⚠️ Dunning email failed for customer {}: {:?}",
                    customer_id, e
                );
            }
        }

        // Create in-app notification
        let notif = dunning_notification(days_remaining, plan_display, lang);
        sqlx::query(
            "INSERT INTO notifications (customer_id, type, title, message, is_read, link) \
             VALUES ($1, 'billing', $2, $3, false, '/billing-section')"
        )
        .bind(customer_id)
        .bind(&notif.title)
        .bind(&notif.message)
        .execute(pool)
        .await?;

        // Record that we sent this reminder
        sqlx::query(
            "INSERT INTO dunning_reminders (customer_id, days_remaining, sent_at) \
             VALUES ($1, $2, NOW()) \
             ON CONFLICT (customer_id, days_remaining) DO NOTHING"
        )
        .bind(customer_id)
        .bind(days_remaining as i32)
        .execute(pool)
        .await?;
    }

    tracing::info!("✅ Dunning job completed: {} emails sent", emails_sent);
    Ok(emails_sent)
}

/// Payment retry is no longer needed — payment failure results in immediate downgrade.
/// This function is kept as a no-op for backward compatibility.
pub async fn retry_failed_payments(_pool: &PgPool) -> Result<u64> {
    // No-op: payments are handled by Polar.sh.
    // If payment fails, customer is downgraded immediately.
    Ok(0)
}

// ── Dunning email templates ─────────────────────────────────

struct DunningNotif {
    title: String,
    message: String,
}

fn dunning_notification(days_remaining: i64, plan: &str, lang: Language) -> DunningNotif {
    match lang {
        Language::Tr => match days_remaining {
            3 => DunningNotif {
                title: "⚠️ Abonelik Bitiyor — 3 Gün Kaldı".into(),
                message: format!(
                    "{} plan aboneliğiniz 3 gün sonra sona erecek. Ödeme yönteminizin güncel olduğundan emin olun. Ödeme alınamazsa hesabınız ücretsiz plana düşürülecek.",
                    plan
                ),
            },
            2 => DunningNotif {
                title: "🔴 Abonelik Bitiyor — 2 Gün Kaldı".into(),
                message: format!(
                    "{} plan aboneliğiniz 2 gün sonra sona erecek. Ödeme yönteminizi kontrol edin, aksi halde hesabınız ücretsiz plana düşürülecek.",
                    plan
                ),
            },
            1 => DunningNotif {
                title: "🚨 Son Uyarı — Yarın Sona Eriyor".into(),
                message: format!(
                    "Yarın {} plan aboneliğiniz sona erecek. Ödeme yönteminizi şimdi güncelleyerek hizmetinizi koruyun.",
                    plan
                ),
            },
            _ => DunningNotif {
                title: "💳 Abonelik Hatırlatması".into(),
                message: format!(
                    "{} plan aboneliğiniz yakında sona erecek. Ödeme yönteminizi kontrol edin.",
                    plan
                ),
            },
        },
        Language::En => match days_remaining {
            3 => DunningNotif {
                title: "⚠️ Subscription Expiring — 3 Days Left".into(),
                message: format!(
                    "Your {} plan subscription expires in 3 days. Make sure your payment method is up to date. If payment fails, your account will be downgraded to the free plan.",
                    plan
                ),
            },
            2 => DunningNotif {
                title: "🔴 Subscription Expiring — 2 Days Left".into(),
                message: format!(
                    "Your {} plan subscription expires in 2 days. Check your payment method or your account will be downgraded to the free plan.",
                    plan
                ),
            },
            1 => DunningNotif {
                title: "🚨 Final Warning — Expires Tomorrow".into(),
                message: format!(
                    "Your {} plan subscription expires tomorrow. Update your payment method now to keep your service running.",
                    plan
                ),
            },
            _ => DunningNotif {
                title: "💳 Subscription Reminder".into(),
                message: format!(
                    "Your {} plan subscription is expiring soon. Check your payment method.",
                    plan
                ),
            },
        },
    }
}

fn tpl_dunning_reminder(plan: &str, days_remaining: i64, lang: Language) -> (String, String) {
    match lang {
        Language::Tr => tpl_dunning_tr(plan, days_remaining),
        Language::En => tpl_dunning_en(plan, days_remaining),
    }
}

fn tpl_dunning_tr(plan: &str, days_remaining: i64) -> (String, String) {
    let (urgency_color, urgency_text) = match days_remaining {
        1 => ("#dc2626", "🚨 Son Uyarı"),
        2 => ("#ea580c", "🔴 Acil"),
        _ => ("#d97706", "⚠️ Dikkat"),
    };

    let subject = format!(
        "{} — {} plan aboneliğiniz {} gün sonra sona erecek",
        urgency_text, plan, days_remaining
    );

    let html = format!(
        r#"<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">

    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background: {urgency_color}; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
        {days_remaining} gün kaldı
      </div>
    </div>

    <h1 style="color: #111827; font-size: 24px; text-align: center; margin-bottom: 8px;">
      Abonelik Sona Eriyor
    </h1>
    <p style="color: #6b7280; text-align: center; font-size: 16px; margin-bottom: 32px;">
      <strong>{plan}</strong> plan aboneliğiniz <strong>{days_remaining} gün</strong> sonra sona erecek.
    </p>

    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <p style="color: #92400e; margin: 0; font-size: 14px;">
        💳 Ödeme yönteminizin güncel olduğundan emin olun. Ödeme alınamazsa hesabınız <strong>ücretsiz plana düşürülecek</strong> ve webhook limitleriniz sınırlandırılacaktır.
      </p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://hooksniff.vercel.app/billing-section"
         style="display: inline-block; background: #6d28d9; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        💳 Ödeme Yöntemini Kontrol Et
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <p style="color: #9ca3af; font-size: 13px; text-align: center;">
      Bu e-postayı yanlışlıkla aldıysanız görmezden gelebilirsiniz.<br>
      Sorularınız için <a href="mailto:support@hooksniff.dev" style="color: #6d28d9;">support@hooksniff.dev</a>
    </p>
  </div>
  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
    — HookSniff Ekibi
  </p>
</body>
</html>"#,
        urgency_color = urgency_color,
        days_remaining = days_remaining,
        plan = plan,
    );

    (subject, html)
}

fn tpl_dunning_en(plan: &str, days_remaining: i64) -> (String, String) {
    let (urgency_color, urgency_text) = match days_remaining {
        1 => ("#dc2626", "🚨 Final Warning"),
        2 => ("#ea580c", "🔴 Urgent"),
        _ => ("#d97706", "⚠️ Action Required"),
    };

    let subject = format!(
        "{} — Your {} plan expires in {} day{}",
        urgency_text, plan, days_remaining, if days_remaining > 1 { "s" } else { "" }
    );

    let html = format!(
        r#"<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">

    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background: {urgency_color}; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
        {days_remaining} day{} left
      </div>
    </div>

    <h1 style="color: #111827; font-size: 24px; text-align: center; margin-bottom: 8px;">
      Subscription Expiring
    </h1>
    <p style="color: #6b7280; text-align: center; font-size: 16px; margin-bottom: 32px;">
      Your <strong>{plan}</strong> plan expires in <strong>{days_remaining} day{}</strong>.
    </p>

    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <p style="color: #92400e; margin: 0; font-size: 14px;">
        💳 Make sure your payment method is up to date. If payment cannot be processed, your account will be <strong>downgraded to the free plan</strong> and webhook limits will be restricted.
      </p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://hooksniff.vercel.app/billing-section"
         style="display: inline-block; background: #6d28d9; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        💳 Check Payment Method
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <p style="color: #9ca3af; font-size: 13px; text-align: center;">
      If you received this email by mistake, you can ignore it.<br>
      Questions? <a href="mailto:support@hooksniff.dev" style="color: #6d28d9;">support@hooksniff.dev</a>
    </p>
  </div>
  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
    — The HookSniff Team
  </p>
</body>
</html>"#,
        urgency_color = urgency_color,
        days_remaining = days_remaining,
        plan = plan,
        s = if days_remaining > 1 { "s" } else { "" },
    );

    (subject, html)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dunning_email_days() {
        assert!(DUNNING_EMAIL_DAYS.contains(&3));
        assert!(DUNNING_EMAIL_DAYS.contains(&2));
        assert!(DUNNING_EMAIL_DAYS.contains(&1));
        assert!(!DUNNING_EMAIL_DAYS.contains(&0));
        assert!(!DUNNING_EMAIL_DAYS.contains(&4));
    }

    #[test]
    fn test_dunning_notification_tr_day3() {
        let notif = dunning_notification(3, "pro", Language::Tr);
        assert!(notif.title.contains("3 Gün"));
        assert!(notif.message.contains("pro"));
    }

    #[test]
    fn test_dunning_notification_tr_day1() {
        let notif = dunning_notification(1, "startup", Language::Tr);
        assert!(notif.title.contains("Son Uyarı"));
        assert!(notif.message.contains("startup"));
    }

    #[test]
    fn test_dunning_notification_en_day2() {
        let notif = dunning_notification(2, "pro", Language::En);
        assert!(notif.title.contains("2 Days"));
        assert!(notif.message.contains("pro"));
    }

    #[test]
    fn test_tpl_dunning_tr_day1() {
        let (subject, html) = tpl_dunning_tr("pro", 1);
        assert!(subject.contains("Son Uyarı"));
        assert!(subject.contains("1 gün"));
        assert!(html.contains("pro"));
        assert!(html.contains("hooksniff.vercel.app"));
    }

    #[test]
    fn test_tpl_dunning_en_day3() {
        let (subject, html) = tpl_dunning_en("startup", 3);
        assert!(subject.contains("3 days"));
        assert!(subject.contains("startup"));
        assert!(html.contains("Check Payment Method"));
    }

    #[test]
    fn test_tpl_dunning_urgency_colors() {
        let (_, html1) = tpl_dunning_tr("pro", 1);
        assert!(html1.contains("#dc2626"));

        let (_, html2) = tpl_dunning_tr("pro", 2);
        assert!(html2.contains("#ea580c"));

        let (_, html3) = tpl_dunning_tr("pro", 3);
        assert!(html3.contains("#d97706"));
    }
}
