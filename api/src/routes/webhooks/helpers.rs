//! Helper functions for webhook routes.

use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

/// Escape a value for safe CSV output.
///
/// - Wraps in double quotes if the value contains commas, quotes, or newlines.
/// - Escapes internal double quotes by doubling them.
/// - Prefixes with a single quote if the first character is a formula-injection
///   vector (`=`, `+`, `-`, `@`, `\t`, `\r`).
pub fn escape_csv_cell(value: &str) -> String {
    let needs_prefix = matches!(
        value.as_bytes().first(),
        Some(b'=') | Some(b'+') | Some(b'-') | Some(b'@') | Some(b'\t') | Some(b'\r')
    );
    let needs_quote = value.contains([',', '"', '\n']);

    let mut out = String::new();
    if needs_prefix {
        out.push('\'');
    }
    if needs_quote {
        out.push('"');
        for ch in value.chars() {
            if ch == '"' {
                out.push_str("\"\"");
            } else {
                out.push(ch);
            }
        }
        out.push('"');
    } else {
        out.push_str(value);
    }
    out
}

/// Parse a date string (ISO datetime or date-only) with configurable time default.
pub fn parse_date_str(s: &str, default_hms: (u32, u32, u32)) -> Option<DateTime<Utc>> {
    if let Ok(dt) = NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(dt, Utc))
    } else if let Ok(d) = NaiveDate::parse_from_str(s, "%Y-%m-%d") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(
            d.and_hms_opt(default_hms.0, default_hms.1, default_hms.2)?,
            Utc,
        ))
    } else {
        None
    }
}

pub fn parse_date_from_str(s: &str) -> Option<DateTime<Utc>> {
    parse_date_str(s, (0, 0, 0))
}

pub fn parse_date_to_str(s: &str) -> Option<DateTime<Utc>> {
    parse_date_str(s, (23, 59, 59))
}

/// Resolve the effective webhook limit and the customer_id to track usage against.
/// When operating within a team, the team owner's plan limit and their webhook_count apply.
/// Returns (tracking_customer_id, webhook_limit, allow_overage).
pub async fn resolve_team_tracking(
    pool: &PgPool,
    customer: &Customer,
    team_id: Option<Uuid>,
) -> (Uuid, i64, bool) {
    if let Some(tid) = team_id {
        let result: Option<(Uuid, String, i64, bool)> = sqlx::query_as(
            "SELECT c.id, c.plan, c.webhook_limit, c.allow_overage FROM teams t JOIN customers c ON c.id = t.owner_id WHERE t.id = $1"
        )
        .bind(tid)
        .fetch_optional(pool)
        .await
        .ok()
        .flatten();

        if let Some((owner_id, _plan, limit, allow_overage)) = result {
            return (owner_id, limit, allow_overage);
        }
    }
    (customer.id, customer.webhook_limit, customer.allow_overage)
}

/// Atomically increment webhook_count with overage support.
/// When team_id is provided, webhook_count is tracked on the team owner's record
/// (team-level counting), and the team owner's plan limit applies.
/// Returns Err if at the limit (and overage is not allowed).
pub async fn reserve_webhook_slot(
    pool: &PgPool,
    customer: &Customer,
    count: i64,
    team_id: Option<Uuid>,
) -> Result<(), AppError> {
    let (tracking_id, effective_limit, allow_overage) =
        resolve_team_tracking(pool, customer, team_id).await;

    let updated: Option<(Uuid, i64)> = if allow_overage {
        sqlx::query_as(
            "UPDATE customers SET webhook_count = webhook_count + $1 WHERE id = $2 RETURNING id, webhook_count"
        )
        .bind(count)
        .bind(tracking_id)
        .fetch_optional(pool)
        .await?
    } else {
        sqlx::query_as(
            "UPDATE customers SET webhook_count = webhook_count + $1 WHERE id = $2 AND webhook_count + $1 <= $3 RETURNING id, webhook_count"
        )
        .bind(count)
        .bind(tracking_id)
        .bind(effective_limit)
        .fetch_optional(pool)
        .await?
    };
    if updated.is_none() {
        Err(AppError::RateLimitExceeded)
    } else {
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── escape_csv_cell tests ──

    #[test]
    fn test_escape_csv_cell_simple() {
        assert_eq!(escape_csv_cell("hello"), "hello");
    }

    #[test]
    fn test_escape_csv_cell_with_comma() {
        assert_eq!(escape_csv_cell("hello, world"), "\"hello, world\"");
    }

    #[test]
    fn test_escape_csv_cell_with_quote() {
        assert_eq!(escape_csv_cell("say \"hi\""), "\"say \"\"hi\"\"\"");
    }

    #[test]
    fn test_escape_csv_cell_with_newline() {
        assert_eq!(escape_csv_cell("line1\nline2"), "\"line1\nline2\"");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_equals() {
        assert_eq!(escape_csv_cell("=cmd"), "'=cmd");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_plus() {
        assert_eq!(escape_csv_cell("+SUM(A1)"), "'+SUM(A1)");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_minus() {
        assert_eq!(escape_csv_cell("-1"), "'-1");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_at() {
        assert_eq!(escape_csv_cell("@ref"), "'@ref");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_tab() {
        assert_eq!(escape_csv_cell("\tvalue"), "'\tvalue");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_cr() {
        assert_eq!(escape_csv_cell("\rvalue"), "'\rvalue");
    }

    #[test]
    fn test_escape_csv_cell_formula_and_comma() {
        assert_eq!(escape_csv_cell("=A1,B2"), "'\"=A1,B2\"");
    }

    #[test]
    fn test_escape_csv_cell_empty() {
        assert_eq!(escape_csv_cell(""), "");
    }

    // ── parse_date_from_str tests ──

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
    }

    // ── parse_date_to_str tests ──

    #[test]
    fn test_parse_date_to_str_datetime() {
        let dt = parse_date_to_str("2024-01-15T10:30:00").unwrap();
        assert_eq!(
            dt.format("%Y-%m-%dT%H:%M:%S").to_string(),
            "2024-01-15T10:30:00"
        );
    }

    #[test]
    fn test_parse_date_to_str_date_only() {
        let dt = parse_date_to_str("2024-01-15").unwrap();
        assert_eq!(
            dt.format("%Y-%m-%dT%H:%M:%S").to_string(),
            "2024-01-15T23:59:59"
        );
    }

    #[test]
    fn test_parse_date_to_str_invalid() {
        assert!(parse_date_to_str("bad-date").is_none());
    }
}
