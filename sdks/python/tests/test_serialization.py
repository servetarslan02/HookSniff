"""
HookSniff Python SDK — Serialization Tests
"""

import pytest
from uuid import uuid4
from datetime import datetime

from hooksniff.models.endpoint import Endpoint
from hooksniff.models.delivery import Delivery
from hooksniff.models.delivery_list_response import DeliveryListResponse
from hooksniff.models.alert_rule import AlertRule
from hooksniff.models.notification import Notification
from hooksniff.models.api_key_info import ApiKeyInfo
from hooksniff.models.auth_response import AuthResponse
from hooksniff.models.success_rate_response import SuccessRateResponse
from hooksniff.models.latency_response import LatencyResponse
from hooksniff.models.subscription_response import SubscriptionResponse
from hooksniff.models.billing_portal_response import BillingPortalResponse
from hooksniff.models.search_result import SearchResult
from hooksniff.models.team import Team
from hooksniff.models.batch_response import BatchResponse
from hooksniff.serialization import SerializationError


NOW = datetime.now().isoformat()
UUID1 = str(uuid4())


class TestEndpointSerialization:
    def test_from_json_basic(self):
        data = {
            "id": UUID1, "url": "https://example.com", "is_active": True,
            "retry_policy": {"max_attempts": 3, "backoff": "exponential", "initial_delay_secs": 1, "max_delay_secs": 60},
            "created_at": NOW, "routing_strategy": "round-robin",
            "avg_response_ms": 150, "failure_streak": 0, "format": "standard"
        }
        result = Endpoint._from_json(data)
        assert str(result.id) == UUID1
        assert result.url == "https://example.com"
        assert result.is_active is True

    def test_from_json_missing_required(self):
        with pytest.raises(SerializationError):
            Endpoint._from_json({"url": "https://example.com"})

    def test_to_json_strips_extra(self):
        data = {
            "id": UUID1, "url": "https://example.com", "is_active": True,
            "retry_policy": {"max_attempts": 3, "backoff": "exponential", "initial_delay_secs": 1, "max_delay_secs": 60},
            "created_at": NOW, "routing_strategy": "round-robin",
            "avg_response_ms": 150, "failure_streak": 0, "format": "standard",
            "unknown_field": "should_be_stripped"
        }
        result = Endpoint._to_json(data)
        assert "unknown_field" not in result


class TestDeliverySerialization:
    def test_from_json_basic(self):
        data = {
            "id": UUID1, "endpoint_id": str(uuid4()), "status": "delivered",
            "attempt_count": 1, "replay_count": 0, "created_at": NOW
        }
        result = Delivery._from_json(data)
        assert str(result.id) == UUID1
        assert result.status == "delivered"


class TestDeliveryListSerialization:
    def test_from_json_with_data(self):
        data = {
            "deliveries": [
                {"id": str(uuid4()), "endpoint_id": str(uuid4()), "status": "delivered", "attempt_count": 1, "replay_count": 0, "created_at": NOW},
            ],
            "total": 1, "page": 1, "per_page": 20
        }
        result = DeliveryListResponse._from_json(data)
        assert result.total == 1
        assert len(result.deliveries) == 1


class TestAlertRuleSerialization:
    def test_from_json(self):
        data = {
            "id": UUID1, "name": "High Error Rate", "condition": "failure_rate",
            "threshold": 5, "channels": ["email"], "is_active": True, "created_at": NOW
        }
        result = AlertRule._from_json(data)
        assert result.name == "High Error Rate"


class TestNotificationSerialization:
    def test_from_json(self):
        data = {
            "id": UUID1, "title": "Alert", "body": "Error rate exceeded",
            "is_read": False, "created_at": NOW
        }
        result = Notification._from_json(data)
        assert result.title == "Alert"
        assert result.is_read is False


class TestApiKeySerialization:
    def test_from_json(self):
        data = {"id": UUID1, "prefix": "sk_abc", "created_at": NOW, "is_active": True}
        result = ApiKeyInfo._from_json(data)
        assert str(result.id) == UUID1


class TestAuthSerialization:
    def test_from_json(self):
        data = {
            "token": "jwt_123",
            "customer": {
                "id": UUID1, "email": "test@test.com", "plan": "pro",
                "webhook_limit": 1000, "webhook_count": 0, "is_admin": False, "created_at": NOW
            }
        }
        result = AuthResponse._from_json(data)
        assert result.token == "jwt_123"


class TestAnalyticsSerialization:
    def test_success_rate(self):
        data = {"range": "7d", "successful": 95, "failed": 5, "pending": 0, "success_rate": 0.95}
        result = SuccessRateResponse._from_json(data)
        assert result.success_rate == 0.95

    def test_latency(self):
        data = {"p50": 100, "p90": 150, "p95": 200, "p99": 500, "period": "7d"}
        result = LatencyResponse._from_json(data)
        assert result.p99 == 500


class TestBillingSerialization:
    def test_subscription(self):
        data = {
            "plan": "pro", "status": "active", "payment_provider": "polar",
            "webhook_limit": 10000, "endpoint_limit": 50, "retention_days": 30, "monthly_price_cents": 4900
        }
        result = SubscriptionResponse._from_json(data)
        assert result.plan == "pro"

    def test_portal(self):
        data = {"url": "https://billing.polar.sh/portal"}
        result = BillingPortalResponse._from_json(data)
        assert "polar.sh" in result.url


class TestSearchSerialization:
    def test_from_json(self):
        data = {"deliveries": [], "total": 0}
        result = SearchResult._from_json(data)
        assert result.total == 0


class TestTeamSerialization:
    def test_from_json(self):
        data = {"id": UUID1, "name": "Engineering", "created_at": NOW}
        result = Team._from_json(data)
        assert result.name == "Engineering"


class TestBatchSerialization:
    def test_from_json(self):
        data = {"deliveries": [], "errors": []}
        result = BatchResponse._from_json(data)
        assert result.deliveries == []


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
