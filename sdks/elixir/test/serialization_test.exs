defmodule HookSniff.SerializationTest do
  use ExUnit.Case, async: true

  alias HookSniffAPI.Deserializer
  alias HookSniffAPI.Model.{
    AlertRule,
    ApiKeyInfo,
    StatsResponse,
    AnalyticsTrendPoint,
    AnalyticsTrendResponse,
    EndpointListResponse
  }

  describe "Deserializer.json_decode/1" do
    test "decodes valid JSON" do
      json = ~s({"key": "value"})
      assert {:ok, %{"key" => "value"}} = Deserializer.json_decode(json)
    end

    test "decodes JSON array" do
      json = ~s([1, 2, 3])
      assert {:ok, [1, 2, 3]} = Deserializer.json_decode(json)
    end

    test "returns error for invalid JSON" do
      assert {:error, _} = Deserializer.json_decode("not json")
    end

    test "decodes empty object" do
      assert {:ok, %{}} = Deserializer.json_decode("{}")
    end

    test "decodes empty array" do
      assert {:ok, []} = Deserializer.json_decode("[]")
    end

    test "decodes nested JSON" do
      json = ~s({"a": {"b": {"c": 1}}})
      assert {:ok, %{"a" => %{"b" => %{"c" => 1}}}} = Deserializer.json_decode(json)
    end

    test "handles null values" do
      json = ~s({"key": null})
      assert {:ok, %{"key" => nil}} = Deserializer.json_decode(json)
    end
  end

  describe "Deserializer.json_decode/2 with module" do
    test "decodes into AlertRule struct" do
      json = Jason.encode!(%{
        "id" => "rule_123",
        "name" => "High failure rate",
        "condition" => "failure_rate > 0.1",
        "threshold" => 10,
        "channels" => ["email", "slack"],
        "is_active" => true,
        "created_at" => "2024-01-15T10:30:00Z"
      })

      assert {:ok, %AlertRule{} = rule} = Deserializer.json_decode(json, AlertRule)
      assert rule.id == "rule_123"
      assert rule.name == "High failure rate"
      assert rule.condition == "failure_rate > 0.1"
      assert rule.threshold == 10
      assert rule.channels == ["email", "slack"]
      assert rule.is_active == true
    end

    test "decodes into ApiKeyInfo struct" do
      json = Jason.encode!(%{
        "id" => "key_abc",
        "prefix" => "sk_live_",
        "created_at" => "2024-01-01T00:00:00Z",
        "last_used_at" => nil,
        "is_active" => true
      })

      assert {:ok, %ApiKeyInfo{} = key} = Deserializer.json_decode(json, ApiKeyInfo)
      assert key.id == "key_abc"
      assert key.prefix == "sk_live_"
      assert key.is_active == true
    end

    test "decodes into StatsResponse struct" do
      json = Jason.encode!(%{
        "total_deliveries" => 1000,
        "successful_deliveries" => 950,
        "failed_deliveries" => 50,
        "total_endpoints" => 10,
        "active_endpoints" => 8,
        "plan" => "pro",
        "webhook_limit" => 10000,
        "webhook_count" => 1000
      })

      assert {:ok, %StatsResponse{} = stats} = Deserializer.json_decode(json, StatsResponse)
      assert stats.total_deliveries == 1000
      assert stats.successful_deliveries == 950
      assert stats.plan == "pro"
    end

    test "returns error for invalid JSON with module" do
      assert {:error, _} = Deserializer.json_decode("not json", AlertRule)
    end
  end

  describe "model struct defaults" do
    test "AlertRule has nil defaults" do
      rule = %AlertRule{}
      assert rule.id == nil
      assert rule.name == nil
      assert rule.condition == nil
      assert rule.threshold == nil
      assert rule.channels == nil
      assert rule.is_active == nil
      assert rule.created_at == nil
    end

    test "ApiKeyInfo has nil defaults" do
      key = %ApiKeyInfo{}
      assert key.id == nil
      assert key.prefix == nil
      assert key.created_at == nil
      assert key.last_used_at == nil
      assert key.is_active == nil
    end

    test "StatsResponse has nil defaults" do
      stats = %StatsResponse{}
      assert stats.total_deliveries == nil
      assert stats.successful_deliveries == nil
      assert stats.failed_deliveries == nil
      assert stats.plan == nil
    end
  end

  describe "JSON.Encoder derivation" do
    test "AlertRule encodes to JSON" do
      rule = %AlertRule{id: "r1", name: "test", is_active: true}
      encoded = Jason.encode!(rule)
      decoded = Jason.decode!(encoded)
      assert decoded["id"] == "r1"
      assert decoded["name"] == "test"
      assert decoded["is_active"] == true
    end

    test "ApiKeyInfo encodes to JSON" do
      key = %ApiKeyInfo{id: "k1", prefix: "sk_", is_active: false}
      encoded = Jason.encode!(key)
      decoded = Jason.decode!(encoded)
      assert decoded["id"] == "k1"
      assert decoded["is_active"] == false
    end

    test "StatsResponse encodes to JSON" do
      stats = %StatsResponse{total_deliveries: 42, plan: "free"}
      encoded = Jason.encode!(stats)
      decoded = Jason.decode!(encoded)
      assert decoded["total_deliveries"] == 42
      assert decoded["plan"] == "free"
    end

    test "nil fields are included in JSON output" do
      stats = %StatsResponse{plan: "pro"}
      encoded = Jason.encode!(stats)
      decoded = Jason.decode!(encoded)
      assert Map.has_key?(decoded, "total_deliveries")
      assert decoded["total_deliveries"] == nil
    end
  end

  describe "Deserializer.deserialize/4" do
    test "deserialize list field with module" do
      model = %EndpointListResponse{
        data: [%{"id" => "ep_1"}, %{"id" => "ep_2"}],
        has_more: false
      }

      result = Deserializer.deserialize(model, :data, :list, HookSniffAPI.Model.Endpoint)
      assert is_list(result.data)
      assert length(result.data) == 2
    end

    test "deserialize nil list field stays nil" do
      model = %EndpointListResponse{data: nil}
      result = Deserializer.deserialize(model, :data, :list, HookSniffAPI.Model.Endpoint)
      assert result.data == nil
    end

    test "deserialize date field" do
      model = %{created_at: "2024-01-15"}
      result = Deserializer.deserialize(model, :created_at, :date, nil)
      assert %Date{} = result.created_at
      assert result.created_at.year == 2024
    end

    test "deserialize invalid date field leaves original" do
      model = %{created_at: "not-a-date"}
      result = Deserializer.deserialize(model, :created_at, :date, nil)
      assert result.created_at == "not-a-date"
    end

    test "deserialize datetime field" do
      model = %{created_at: "2024-01-15T10:30:00Z"}
      result = Deserializer.deserialize(model, :created_at, :datetime, nil)
      assert %DateTime{} = result.created_at
      assert result.created_at.year == 2024
    end

    test "deserialize non-string date field leaves original" do
      model = %{created_at: 12345}
      result = Deserializer.deserialize(model, :created_at, :date, nil)
      assert result.created_at == 12345
    end
  end

  describe "round-trip encoding/decoding" do
    test "AlertRule round-trip" do
      original = %AlertRule{
        id: "rule_1",
        name: "Test Rule",
        condition: "failures > 5",
        threshold: 5,
        channels: ["email"],
        is_active: true
      }

      encoded = Jason.encode!(original)
      {:ok, decoded} = Deserializer.json_decode(encoded, AlertRule)

      assert decoded.id == original.id
      assert decoded.name == original.name
      assert decoded.condition == original.condition
      assert decoded.threshold == original.threshold
      assert decoded.channels == original.channels
      assert decoded.is_active == original.is_active
    end

    test "StatsResponse round-trip" do
      original = %StatsResponse{
        total_deliveries: 500,
        successful_deliveries: 490,
        failed_deliveries: 10,
        plan: "enterprise"
      }

      encoded = Jason.encode!(original)
      {:ok, decoded} = Deserializer.json_decode(encoded, StatsResponse)

      assert decoded.total_deliveries == original.total_deliveries
      assert decoded.successful_deliveries == original.successful_deliveries
      assert decoded.plan == original.plan
    end
  end
end
