//! Tests for rate limiting.

#[cfg(test)]
mod rate_limit_tests {
mod tests {
    use crate::rate_limit::*;

    // ── InMemoryRateLimiter::check ─────────────────────────────

    #[tokio::test]
    async fn in_memory_check_allows_within_limit() {
        let limiter = InMemoryRateLimiter::new();
        let result = limiter.check("key1", 5, 60).await;
        assert!(result.allowed);
        assert_eq!(result.remaining, 4);
        assert_eq!(result.limit, 5);
    }

    #[tokio::test]
    async fn in_memory_check_blocks_at_limit() {
        let limiter = InMemoryRateLimiter::new();
        for _ in 0..3 {
            assert!(limiter.check("key2", 3, 60).await.allowed);
        }
        let result = limiter.check("key2", 3, 60).await;
        assert!(!result.allowed);
        assert_eq!(result.remaining, 0);
    }

    #[tokio::test]
    async fn in_memory_check_different_keys_independent() {
        let limiter = InMemoryRateLimiter::new();
        for _ in 0..3 {
            limiter.check("key_a", 3, 60).await;
        }
        // key_a is at limit, key_b should be fine
        let result = limiter.check("key_b", 3, 60).await;
        assert!(result.allowed);
    }

    #[tokio::test]
    async fn in_memory_check_remaining_decrements() {
        let limiter = InMemoryRateLimiter::new();
        let r1 = limiter.check("key3", 5, 60).await;
        assert_eq!(r1.remaining, 4);
        let r2 = limiter.check("key3", 5, 60).await;
        assert_eq!(r2.remaining, 3);
        let r3 = limiter.check("key3", 5, 60).await;
        assert_eq!(r3.remaining, 2);
    }

    #[tokio::test]
    async fn in_memory_check_limit_of_one() {
        let limiter = InMemoryRateLimiter::new();
        assert!(limiter.check("key4", 1, 60).await.allowed);
        let result = limiter.check("key4", 1, 60).await;
        assert!(!result.allowed);
        assert_eq!(result.remaining, 0);
    }

    #[tokio::test]
    async fn in_memory_check_window_expires() {
        let limiter = InMemoryRateLimiter::new();
        // Use a very short window
        assert!(limiter.check("key5", 2, 1).await.allowed);
        assert!(limiter.check("key5", 2, 1).await.allowed);
        assert!(!limiter.check("key5", 2, 1).await.allowed);
        // Wait for window to expire
        tokio::time::sleep(Duration::from_secs(2)).await;
        let result = limiter.check("key5", 2, 1).await;
        assert!(result.allowed);
    }

    // ── InMemoryRateLimiter plan caching ───────────────────────

    #[tokio::test]
    async fn get_plan_returns_none_initially() {
        let limiter = InMemoryRateLimiter::new();
        assert!(limiter.get_plan("prefix_123").await.is_none());
    }

    #[tokio::test]
    async fn set_plan_and_get_plan() {
        let limiter = InMemoryRateLimiter::new();
        limiter.set_plan("prefix_abc", Plan::Pro).await;
        let plan = limiter.get_plan("prefix_abc").await;
        assert_eq!(plan, Some(Plan::Pro));
    }

    #[tokio::test]
    async fn set_plan_overwrites() {
        let limiter = InMemoryRateLimiter::new();
        limiter.set_plan("prefix_xyz", Plan::Developer).await;
        limiter.set_plan("prefix_xyz", Plan::Enterprise).await;
        assert_eq!(limiter.get_plan("prefix_xyz").await, Some(Plan::Enterprise));
    }

    // ── RateLimiter wrapper ────────────────────────────────────

    #[tokio::test]
    async fn rate_limiter_check_returns_bool() {
        let store = Arc::new(InMemoryRateLimiter::new());
        let limiter = RateLimiter::new(store);
        assert!(limiter.check("wrap_key", 10).await);
    }

    #[tokio::test]
    async fn rate_limiter_check_with_headers() {
        let store = Arc::new(InMemoryRateLimiter::new());
        let limiter = RateLimiter::new(store);
        let result = limiter.check_with_headers("wrap_key2", 10).await;
        assert!(result.allowed);
        assert_eq!(result.limit, 10);
    }

    #[tokio::test]
    async fn rate_limiter_plan_roundtrip() {
        let store = Arc::new(InMemoryRateLimiter::new());
        let limiter = RateLimiter::new(store);
        limiter.set_plan("apikey_prefix", Plan::Enterprise).await;
        assert_eq!(
            limiter.get_plan("apikey_prefix").await,
            Some(Plan::Enterprise)
        );
    }

    // ── extract_key ────────────────────────────────────────────

    #[test]
    fn extract_key_from_bearer_token() {
        let req = Request::builder()
            .header("authorization", "Bearer sk_1234567890abcdef")
            .body(axum::body::Body::empty())
            .unwrap();
        let key = extract_key(&req);
        // "sk_1234567890abcdef" first 15 chars = "sk_1234567890ab"
        assert_eq!(key, "sk_1234567890ab");
    }

    #[test]
    fn extract_key_from_forwarded_for_when_trusted() {
        // X-Forwarded-For is always trusted in current implementation
        let req = Request::builder()
            .header("x-forwarded-for", "192.168.1.1")
            .body(axum::body::Body::empty())
            .unwrap();
        let key = extract_key(&req);
        assert_eq!(key, "192.168.1.1:/");
    }

    #[test]
    fn extract_key_no_auth_no_forwarded_for() {
        let req = Request::builder().body(axum::body::Body::empty()).unwrap();
        let key = extract_key(&req);
        assert_eq!(key, "unknown:/");
    }

    #[test]
    fn extract_key_short_token() {
        let req = Request::builder()
            .header("authorization", "Bearer abc")
            .body(axum::body::Body::empty())
            .unwrap();
        let key = extract_key(&req);
        assert_eq!(key, "abc"); // shorter than 15 chars
    }

    #[test]
    fn extract_key_prefers_bearer_over_forwarded() {
        let req = Request::builder()
            .header("authorization", "Bearer sk_1234567890abcdef")
            .header("x-forwarded-for", "10.0.0.1")
            .body(axum::body::Body::empty())
            .unwrap();
        let key = extract_key(&req);
        assert_eq!(key, "sk_1234567890ab");
    }

    #[test]
    fn extract_key_non_bearer_auth() {
        let req = Request::builder()
            .header("authorization", "Basic dXNlcjpwYXNz")
            .body(axum::body::Body::empty())
            .unwrap();
        let key = extract_key(&req);
        // No "Bearer " prefix, falls back to "unknown:/" (no proxy trust)
        assert_eq!(key, "unknown:/");
    }

    // ── extract_api_key_prefix ─────────────────────────────────

    #[test]
    fn extract_api_key_prefix_from_bearer() {
        let req = Request::builder()
            .header("authorization", "Bearer sk_1234567890abcdef")
            .body(axum::body::Body::empty())
            .unwrap();
        let prefix = extract_api_key_prefix(&req);
        assert_eq!(prefix, Some("sk_1234567890ab".to_string()));
    }

    #[test]
    fn extract_api_key_prefix_no_auth() {
        let req = Request::builder().body(axum::body::Body::empty()).unwrap();
        assert!(extract_api_key_prefix(&req).is_none());
    }

    #[test]
    fn extract_api_key_prefix_short_key() {
        let req = Request::builder()
            .header("authorization", "Bearer short")
            .body(axum::body::Body::empty())
            .unwrap();
        let prefix = extract_api_key_prefix(&req);
        assert_eq!(prefix, Some("short".to_string()));
    }

    // ── RateLimitResult ────────────────────────────────────────

    #[test]
    fn rate_limit_result_debug() {
        let result = RateLimitResult {
            allowed: true,
            remaining: 5,
            limit: 10,
            reset_seconds: 60,
        };
        let debug = format!("{:?}", result);
        assert!(debug.contains("allowed: true"));
        assert!(debug.contains("remaining: 5"));
    }

    // ── InMemoryRateLimiter default ────────────────────────────

    #[tokio::test]
    async fn in_memory_default_creates_limiter() {
        let limiter = InMemoryRateLimiter::default();
        // Just verify it doesn't panic
        drop(limiter);
    }

    // ── Edge cases ─────────────────────────────────────────────

    #[tokio::test]
    async fn check_with_zero_limit_blocks_immediately() {
        let limiter = InMemoryRateLimiter::new();
        let result = limiter.check("zero_key", 0, 60).await;
        // limit=0 means current_count (0) >= limit (0), so blocked
        assert!(!result.allowed);
    }

    #[tokio::test]
    async fn check_with_large_limit() {
        let limiter = InMemoryRateLimiter::new();
        let result = limiter.check("large_key", u32::MAX, 60).await;
        assert!(result.allowed);
        assert_eq!(result.limit, u32::MAX);
    }
}
}
