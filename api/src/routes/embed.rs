//! Embeddable portal widget endpoint.
//!
//! GET /v1/embed/portal — Returns an HTML snippet that can be embedded
//! in any website via iframe or script tag. Shows the customer's webhook
//! status, recent deliveries, and a mini dashboard.

use axum::extract::Extension;
use axum::http::StatusCode;
use axum::response::Html;
use axum::routing::get;
use axum::Router;
use sqlx::PgPool;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(embed_portal))
        .route("/script", get(embed_script))
}

/// GET /v1/embed/portal — Embeddable portal HTML page.
async fn embed_portal(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Html<String>, AppError> {
    // Get basic stats
    let stats: (i64, i64, i64) = sqlx::query_as(
        "SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'delivered'), COUNT(*) FILTER (WHERE status = 'failed') FROM deliveries WHERE customer_id = $1",
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await
    .unwrap_or((0, 0, 0));

    let total = stats.0;
    let delivered = stats.1;
    let failed = stats.2;
    let success_rate = if total > 0 {
        (delivered as f64 / total as f64 * 100.0).round()
    } else {
        100.0
    };

    let endpoints_count: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")
            .bind(customer.id)
            .fetch_one(&pool)
            .await
            .unwrap_or((0,));

    let html = format!(
        r#"<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>HookSniff Portal</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; }}
    .card {{ background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 16px; }}
    .stat {{ display: inline-block; margin-right: 32px; }}
    .stat-value {{ font-size: 28px; font-weight: 700; color: #a78bfa; }}
    .stat-label {{ font-size: 13px; color: #94a3b8; margin-top: 4px; }}
    .badge {{ display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }}
    .badge-green {{ background: #064e3b; color: #6ee7b7; }}
    .badge-red {{ background: #7f1d1d; color: #fca5a5; }}
    h2 {{ font-size: 18px; margin-bottom: 16px; color: #f1f5f9; }}
    .footer {{ margin-top: 24px; font-size: 12px; color: #64748b; text-align: center; }}
    .footer a {{ color: #818cf8; text-decoration: none; }}
  </style>
</head>
<body>
  <div class="card">
    <h2>🪝 HookSniff — Webhook Status</h2>
    <div style="margin-top: 16px;">
      <div class="stat">
        <div class="stat-value">{total}</div>
        <div class="stat-label">Total Deliveries</div>
      </div>
      <div class="stat">
        <div class="stat-value">{delivered}</div>
        <div class="stat-label">Delivered</div>
      </div>
      <div class="stat">
        <div class="stat-value">{failed}</div>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat">
        <div class="stat-value">{success_rate}%</div>
        <div class="stat-label">Success Rate</div>
      </div>
    </div>
  </div>
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span>{endpoints} endpoint(s) configured</span>
      <span class="badge badge-green">Active</span>
    </div>
  </div>
  <div class="footer">
    Powered by <a href="https://hooksniff.vercel.app">HookSniff</a>
  </div>
</body>
</html>"#,
        total = total,
        delivered = delivered,
        failed = failed,
        success_rate = success_rate,
        endpoints = endpoints_count.0,
    );

    Ok(Html(html))
}

/// GET /v1/embed/script — Returns a JavaScript snippet for embedding.
async fn embed_script() -> Html<String> {
    let script = r#"(function() {
  var iframe = document.createElement('iframe');
  iframe.src = 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/embed/portal';
  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.minHeight = '300px';
  iframe.style.borderRadius = '12px';
  iframe.loading = 'lazy';
  var container = document.getElementById('hooksniff-portal');
  if (container) { container.appendChild(iframe); }
})();"#;
    Html(format!(
        r#"<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><pre>{}</pre></body></html>"#,
        script
    ))
}
