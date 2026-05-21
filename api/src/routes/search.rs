use axum::extract::Extension;
use axum::routing::get;
use axum::{Json, Router};
use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new().route("/", get(search_deliveries))
}

#[derive(Deserialize)]
struct SearchParams {
    q: Option<String>,
    event: Option<String>,
    status: Option<String>,
    endpoint_id: Option<Uuid>,
    date_from: Option<String>,
    date_to: Option<String>,
    page: Option<i64>,
    per_page: Option<i64>,
}

#[derive(serde::Serialize)]
struct SearchResult {
    deliveries: Vec<serde_json::Value>,
    total: i64,
    page: i64,
    per_page: i64,
    query: String,
}

async fn search_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    axum::extract::Query(params): axum::extract::Query<SearchParams>,
) -> Result<Json<SearchResult>, AppError> {
    // RBAC: analyst or higher required to search deliveries
    super::teams::check_user_team_role(&pool, customer.id, "analyst").await?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(200);
    let offset = (page - 1) * per_page;

    // Build dynamic WHERE clause based on filters
    let mut conditions: Vec<String> = vec!["d.customer_id = $1".to_string()];
    let mut param_idx: i32 = 2;

    if params.q.is_some() {
        conditions.push(format!(
            "(d.event_type ILIKE ${} OR d.id::text ILIKE ${} OR e.url ILIKE ${})",
            param_idx, param_idx, param_idx
        ));
        param_idx += 1;
    }
    if params.event.is_some() {
        conditions.push(format!("d.event_type = ${}", param_idx));
        param_idx += 1;
    }
    if params.status.is_some() {
        conditions.push(format!("d.status = ${}", param_idx));
        param_idx += 1;
    }
    if params.endpoint_id.is_some() {
        conditions.push(format!("d.endpoint_id = ${}", param_idx));
        param_idx += 1;
    }
    if params.date_from.is_some() {
        conditions.push(format!("d.created_at >= ${}", param_idx));
        param_idx += 1;
    }
    if params.date_to.is_some() {
        conditions.push(format!("d.created_at <= ${}", param_idx));
        // param_idx += 1; // unused after this
    }

    let where_clause = conditions.join(" AND ");
    let query_sql = format!(
        "SELECT d.id, d.event_type, d.status, d.attempt_count, d.response_status, d.created_at, e.url \
         FROM deliveries d JOIN endpoints e ON d.endpoint_id = e.id \
         WHERE {} ORDER BY d.created_at DESC LIMIT {} OFFSET {}",
        where_clause, per_page, offset
    );
    let count_sql = format!(
        "SELECT COUNT(*) FROM deliveries d JOIN endpoints e ON d.endpoint_id = e.id WHERE {}",
        where_clause
    );

    // Build queries dynamically
    let mut query = sqlx::query_as::<
        _,
        (
            Uuid,
            Option<String>,
            String,
            i32,
            Option<i32>,
            chrono::DateTime<chrono::Utc>,
            String,
        ),
    >(&query_sql)
    .bind(customer.id);
    let mut count_query = sqlx::query_as::<_, (i64,)>(&count_sql).bind(customer.id);

    // Bind filter parameters in the same order
    // pattern must live until queries are executed
    let search_pattern = params.q.as_ref().map(|q| {
        let escaped = q
            .replace('\\', "\\\\")
            .replace('%', "\\%")
            .replace('_', "\\_");
        format!("%{}%", escaped)
    });
    if let Some(ref pattern) = search_pattern {
        query = query.bind(pattern);
        count_query = count_query.bind(pattern);
    }
    if let Some(ref event) = params.event {
        query = query.bind(event);
        count_query = count_query.bind(event);
    }
    if let Some(ref status) = params.status {
        query = query.bind(status);
        count_query = count_query.bind(status);
    }
    if let Some(endpoint_id) = params.endpoint_id {
        query = query.bind(endpoint_id);
        count_query = count_query.bind(endpoint_id);
    }
    if let Some(ref from) = params.date_from {
        if let Some(from_dt) = parse_date_from_str(from) {
            query = query.bind(from_dt);
            count_query = count_query.bind(from_dt);
        }
    }
    if let Some(ref to) = params.date_to {
        if let Some(to_dt) = parse_date_to_str(to) {
            query = query.bind(to_dt);
            count_query = count_query.bind(to_dt);
        }
    }

    let deliveries = query.fetch_all(&pool).await?;
    let total = count_query.fetch_one(&pool).await?;

    Ok(Json(SearchResult {
        deliveries: deliveries
            .into_iter()
            .map(|(id, event, status, attempts, resp_status, created, url)| {
                serde_json::json!({
                    "id": id,
                    "event": event,
                    "status": status,
                    "attempt_count": attempts,
                    "response_status": resp_status,
                    "created_at": created.to_rfc3339(),
                    "endpoint_url": url
                })
            })
            .collect(),
        total: total.0,
        page,
        per_page,
        query: params.q.unwrap_or_default(),
    }))
}

fn parse_date_from_str(s: &str) -> Option<DateTime<Utc>> {
    if let Ok(dt) = NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(dt, Utc))
    } else if let Ok(d) = NaiveDate::parse_from_str(s, "%Y-%m-%d") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(
            d.and_hms_opt(0, 0, 0)?,
            Utc,
        ))
    } else {
        None
    }
}

fn parse_date_to_str(s: &str) -> Option<DateTime<Utc>> {
    if let Ok(dt) = NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(dt, Utc))
    } else if let Ok(d) = NaiveDate::parse_from_str(s, "%Y-%m-%d") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(
            d.and_hms_opt(23, 59, 59)?,
            Utc,
        ))
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── SearchParams ────────────────────────────────────────

    #[test]
    fn test_search_params_all_none() {
        let json = r#"{}"#;
        let params: SearchParams = serde_json::from_str(json).unwrap();
        assert!(params.q.is_none());
        assert!(params.event.is_none());
        assert!(params.status.is_none());
        assert!(params.endpoint_id.is_none());
        assert!(params.date_from.is_none());
        assert!(params.date_to.is_none());
        assert!(params.page.is_none());
        assert!(params.per_page.is_none());
    }

    #[test]
    fn test_search_params_all_some() {
        let json = r#"{
            "q":"test",
            "event":"order.created",
            "status":"delivered",
            "endpoint_id":"11111111-1111-1111-1111-111111111111",
            "date_from":"2024-01-01",
            "date_to":"2024-01-31",
            "page":2,
            "per_page":50
        }"#;
        let params: SearchParams = serde_json::from_str(json).unwrap();
        assert_eq!(params.q, Some("test".to_string()));
        assert_eq!(params.event, Some("order.created".to_string()));
        assert_eq!(params.status, Some("delivered".to_string()));
        assert!(params.endpoint_id.is_some());
        assert_eq!(params.date_from, Some("2024-01-01".to_string()));
        assert_eq!(params.date_to, Some("2024-01-31".to_string()));
        assert_eq!(params.page, Some(2));
        assert_eq!(params.per_page, Some(50));
    }

    // ── SearchResult ────────────────────────────────────────

    #[test]
    fn test_search_result_serialization() {
        let result = SearchResult {
            deliveries: vec![],
            total: 0,
            page: 1,
            per_page: 20,
            query: "test".to_string(),
        };
        let json = serde_json::to_value(&result).unwrap();
        assert_eq!(json["total"], 0);
        assert_eq!(json["page"], 1);
        assert_eq!(json["query"], "test");
        assert!(json["deliveries"].as_array().unwrap().is_empty());
    }

    // ── parse_date_from_str ─────────────────────────────────

    #[test]
    fn test_parse_date_from_str_datetime() {
        let dt = parse_date_from_str("2024-01-15T10:30:00").unwrap();
        assert_eq!(
            dt.format("%Y-%m-%dT%H:%M:%S").to_string(),
            "2024-01-15T10:30:00"
        );
    }

    #[test]
    fn test_parse_date_from_str_date_only() {
        let dt = parse_date_from_str("2024-01-15").unwrap();
        assert_eq!(
            dt.format("%Y-%m-%dT%H:%M:%S").to_string(),
            "2024-01-15T00:00:00"
        );
    }

    #[test]
    fn test_parse_date_from_str_invalid() {
        assert!(parse_date_from_str("not-a-date").is_none());
        assert!(parse_date_from_str("").is_none());
    }

    // ── parse_date_to_str ───────────────────────────────────

    #[test]
    fn test_parse_date_to_str_datetime() {
        let dt = parse_date_to_str("2024-01-15T10:30:00").unwrap();
        assert_eq!(
            dt.format("%Y-%m-%dT%H:%M:%S").to_string(),
            "2024-01-15T10:30:00"
        );
    }

    #[test]
    fn test_parse_date_to_str_date_only_sets_end_of_day() {
        let dt = parse_date_to_str("2024-01-15").unwrap();
        assert_eq!(
            dt.format("%Y-%m-%dT%H:%M:%S").to_string(),
            "2024-01-15T23:59:59"
        );
    }

    #[test]
    fn test_parse_date_to_str_invalid() {
        assert!(parse_date_to_str("invalid").is_none());
        assert!(parse_date_to_str("").is_none());
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_search_router_construction() {
        let _router = router();
    }
}
