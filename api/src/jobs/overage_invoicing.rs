//! Monthly overage invoice generation job.
//!
//! Runs daily. At the start of each month, generates overage invoices for the previous month
//! by summing `daily_event_usage.overage_count` and multiplying by the plan's overage price.
//!
//! Only generates invoices for customers with:
//! - `allow_overage = true`
//! - A paid plan (startup, pro, enterprise)
//! - Actual overage_count > 0 in the previous month

use anyhow::Result;
use chrono::{Datelike, NaiveDate, Utc};
use sqlx::PgPool;

use crate::billing::Plan;
use crate::email::Language;
use crate::resend_email::ResendEmailClient;

/// Run the monthly overage invoice generation job.
///
/// Called daily. Only runs on the 1st of each month (or if the previous month
/// has unbilled overage). Generates one invoice per qualifying customer.
pub async fn run_overage_invoicing(pool: &PgPool, email_client: &ResendEmailClient) -> Result<u64> {
    let now = Utc::now();

    // Calculate previous month's date range
    let (prev_year, prev_month) = if now.month() == 1 {
        (now.year() - 1, 12)
    } else {
        (now.year(), now.month() - 1)
    };
    let prev_month_start = NaiveDate::from_ymd_opt(prev_year, prev_month, 1).unwrap();
    // Last day of previous month = day before the 1st of current month
    let prev_month_end = NaiveDate::from_ymd_opt(now.year(), now.month(), 1)
        .unwrap()
        .pred_opt()
        .unwrap();

    tracing::info!(
        "💰 Running overage invoicing for {} to {}",
        prev_month_start,
        prev_month_end
    );

    // Find customers with overage in the previous month
    let overage_customers: Vec<(uuid::Uuid, String, String, i64, String)> = sqlx::query_as(
        "SELECT \
            c.id, \
            c.email, \
            c.plan, \
            COALESCE(SUM(d.overage_count), 0) as total_overage, \
            COALESCE(c.language, 'tr') as language \
         FROM customers c \
         JOIN daily_event_usage d ON d.customer_id = c.id \
         WHERE d.event_date >= $1 \
         AND d.event_date <= $2 \
         AND d.overage_count > 0 \
         AND c.allow_overage = true \
         AND c.plan NOT IN ('free', 'developer') \
         AND c.is_active = true \
         GROUP BY c.id, c.email, c.plan, c.language \
         HAVING COALESCE(SUM(d.overage_count), 0) > 0",
    )
    .bind(prev_month_start)
    .bind(prev_month_end)
    .fetch_all(pool)
    .await?;

    let mut invoices_created = 0u64;

    for (customer_id, email, plan_str, total_overage, lang_raw) in &overage_customers {
        let plan = Plan::parse_str(plan_str);
        let overage_price = plan.overage_price_per_event();

        // Skip if price is 0 (developer/enterprise with custom pricing)
        if overage_price <= 0.0 {
            continue;
        }

        let total_amount = *total_overage as f64 * overage_price;
        let amount_cents = (total_amount * 100.0).round() as i64;

        if amount_cents <= 0 {
            continue;
        }

        // Check if we already generated an invoice for this month
        let existing: Option<(uuid::Uuid,)> = sqlx::query_as(
            "SELECT id FROM invoices \
             WHERE customer_id = $1 \
             AND plan = $2 \
             AND provider = 'overage' \
             AND created_at >= $3 \
             AND created_at <= $4",
        )
        .bind(customer_id)
        .bind(plan_str)
        .bind(prev_month_start.and_hms_opt(0, 0, 0))
        .bind(prev_month_end.and_hms_opt(23, 59, 59))
        .fetch_optional(pool)
        .await?;

        if existing.is_some() {
            tracing::info!(
                "⏭️ Overage invoice already exists for {} ({} {})",
                email, prev_month_start, plan_str
            );
            continue;
        }

        // Create the overage invoice
        sqlx::query(
            "INSERT INTO invoices (customer_id, amount_cents, currency, plan, status, provider, paid_at) \
             VALUES ($1, $2, 'usd', $3, 'pending', 'overage', NULL)",
        )
        .bind(customer_id)
        .bind(amount_cents)
        .bind(plan_str)
        .execute(pool)
        .await?;

        invoices_created += 1;

        // Send overage invoice email
        let lang = Language::parse_lang(lang_raw);
        let (subject, body) = match lang {
            Language::En => {
            (
                format!(
                    "💰 HookSniff: Overage Invoice — ${:.2}",
                    total_amount
                ),
                format!(
                    "Hello,\n\n\
                     Your overage invoice for {} {} is ready.\n\n\
                     Plan: {}\n\
                     Overage events: {}\n\
                     Price per event: ${:.6}\n\
                     Total: ${:.2}\n\n\
                     This amount will be charged with your next billing cycle.\n\n\
                     View your billing: https://hooksniff.vercel.app/billing",
                    prev_month_start.format("%B %Y"),
                    "",
                    plan_str,
                    total_overage,
                    overage_price,
                    total_amount
                ),
            )
            }
            Language::Tr => {
            (
                format!(
                    "💰 HookSniff: Aşım Faturası — ${:.2}",
                    total_amount
                ),
                format!(
                    "Merhaba,\n\n\
                     {} {} ayına ait aşım faturanız hazır.\n\n\
                     Plan: {}\n\
                     Aşım event sayısı: {}\n\
                     Event başı fiyat: ${:.6}\n\
                     Toplam: ${:.2}\n\n\
                     Bu tutar bir sonraki fatura döneminizde tahsil edilecektir.\n\n\
                     Faturanızı görüntüleyin: https://hooksniff.vercel.app/billing",
                    prev_month_start.format("%B %Y"),
                    "",
                    plan_str,
                    total_overage,
                    overage_price,
                    total_amount
                ),
            )
            }
        };

        let _ = email_client.send_contact_email(&email, &subject, &body).await;

        tracing::info!(
            "💰 Overage invoice created for {}: {} events × ${:.6} = ${:.2} ({} cents)",
            email, total_overage, overage_price, total_amount, amount_cents
        );
    }

    tracing::info!(
        "💰 Overage invoicing complete: {} invoices created",
        invoices_created
    );

    Ok(invoices_created)
}
