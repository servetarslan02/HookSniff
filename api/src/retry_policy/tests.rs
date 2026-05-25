#[cfg(test)]
mod tests {
    use super::*;

    fn test_policy() -> RetryPolicy {
        RetryPolicy {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            max_attempts: 5,
            base_delay_ms: 1_000,
            max_delay_ms: 3_600_000,
            multiplier: 2.0,
            created_at: Utc::now(),
        }
    }

    #[test]
    fn test_default_policy() {
        let p = RetryPolicy::default_for_endpoint(Uuid::new_v4());
        assert_eq!(p.max_attempts, 5);
        assert_eq!(p.base_delay_ms, 1_000);
        assert_eq!(p.max_delay_ms, 3_600_000);
        assert_eq!(p.multiplier, 2.0);
    }

    #[test]
    fn test_exponential_backoff() {
        let p = test_policy();

        // Attempt 1: base_delay_ms (1000ms) + jitter
        let d1 = p.next_retry_delay(1).unwrap();
        assert!((1_000..=1_250).contains(&d1), "attempt 1: {}", d1);

        // Attempt 2: ~2000ms + jitter
        let d2 = p.next_retry_delay(2).unwrap();
        assert!((2_000..=2_500).contains(&d2), "attempt 2: {}", d2);

        // Attempt 3: ~4000ms + jitter
        let d3 = p.next_retry_delay(3).unwrap();
        assert!((4_000..=5_000).contains(&d3), "attempt 3: {}", d3);

        // Attempt 4: ~8000ms + jitter
        let d4 = p.next_retry_delay(4).unwrap();
        assert!((8_000..=10_000).contains(&d4), "attempt 4: {}", d4);

        // Attempt 5: max_attempts aşıldı
        assert!(p.next_retry_delay(5).is_none());
    }

    #[test]
    fn test_max_delay_cap() {
        let p = RetryPolicy {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            max_attempts: 20,
            base_delay_ms: 1_000,
            max_delay_ms: 10_000, // 10 saniye üst sınır
            multiplier: 2.0,
            created_at: Utc::now(),
        };

        // Attempt 10: exponential olarak çok büyük olmalı ama max_delay ile capped
        let delay = p.next_retry_delay(10).unwrap();
        assert!(
            delay <= 12_500, // 10_000 + %25 jitter
            "delay should be capped: {}",
            delay
        );
    }

    #[test]
    fn test_is_exhausted() {
        let p = test_policy();
        assert!(!p.is_exhausted(1));
        assert!(!p.is_exhausted(4));
        assert!(p.is_exhausted(5));
        assert!(p.is_exhausted(10));
    }

    #[test]
    fn test_evaluate_attempt_success() {
        let p = test_policy();
        let decision = p.evaluate_attempt(3, true);
        assert!(matches!(decision, RetryDecision::Success));
    }

    #[test]
    fn test_evaluate_attempt_retry() {
        let p = test_policy();
        let decision = p.evaluate_attempt(2, false);
        match decision {
            RetryDecision::Retry {
                attempt, delay_ms, ..
            } => {
                assert_eq!(attempt, 3);
                assert!(delay_ms >= 4_000);
            }
            _ => panic!("Expected Retry decision"),
        }
    }

    #[test]
    fn test_evaluate_attempt_exhausted() {
        let p = test_policy();
        let decision = p.evaluate_attempt(5, false);
        match decision {
            RetryDecision::Exhausted { total_attempts } => {
                assert_eq!(total_attempts, 5);
            }
            _ => panic!("Expected Exhausted decision"),
        }
    }

    #[test]
    fn test_compute_schedule() {
        let p = test_policy();
        let schedule = p.compute_schedule();

        // max_attempts = 5 ama attempt 5'te None döner, o yüzden 4 entry olmalı
        assert_eq!(schedule.len(), 4);

        // Attempt'ler sıralı olmalı
        for i in 1..schedule.len() {
            assert!(schedule[i].delay_ms >= schedule[i - 1].delay_ms);
        }
    }

    #[test]
    fn test_to_response() {
        let p = test_policy();
        let resp = p.to_response();

        assert_eq!(resp.max_attempts, 5);
        assert_eq!(resp.base_delay_ms, 1_000);
        assert!(!resp.schedule.is_empty());
    }

    #[test]
    fn test_format_duration() {
        assert_eq!(format_duration(500), "500ms");
        assert_eq!(format_duration(1_500), "1.5s");
        assert_eq!(format_duration(90_000), "1.5m");
        assert_eq!(format_duration(7_200_000), "2.0h");
    }

    #[test]
    fn test_jitter_factor_range() {
        // Birden fazla çağrı yaparak jitter'in 0.0-0.25 aralığında olduğunu doğrula
        for _ in 0..100 {
            let jitter = random_jitter_factor();
            assert!(
                (0.0..=0.25).contains(&jitter),
                "jitter out of range: {}",
                jitter
            );
        }
    }

    #[test]
    fn test_request_defaults() {
        let req = UpsertRetryPolicyRequest {
            max_attempts: None,
            base_delay_ms: None,
            max_delay_ms: None,
            multiplier: None,
        };

        // create_policy'de clamp uygulanır
        assert_eq!(req.max_attempts.unwrap_or(5), 5);
        assert_eq!(req.base_delay_ms.unwrap_or(1_000), 1_000);
    }

    #[test]
    fn test_linear_multiplier() {
        let p = RetryPolicy {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            max_attempts: 5,
            base_delay_ms: 1_000,
            max_delay_ms: 100_000,
            multiplier: 1.0, // Linear (sabit artış)
            created_at: Utc::now(),
        };

        // multiplier=1.0 → her attempt'te aynı delay
        let d1 = p.next_retry_delay(1).unwrap();
        let d2 = p.next_retry_delay(2).unwrap();
        let d3 = p.next_retry_delay(3).unwrap();

        // Jitter nedeniyle tam eşitlik yok ama yakın olmalı
        assert!((1_000..=1_250).contains(&d1));
        assert!((1_000..=1_250).contains(&d2));
        assert!((1_000..=1_250).contains(&d3));
    }
}
