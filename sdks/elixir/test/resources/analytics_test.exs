defmodule HookSniff.AnalyticsTest do
  use ExUnit.Case, async: true

  alias HookSniff.Analytics
  alias HookSniff.MockHttpAdapter

  defp mock_client do
    HookSniff.new(
      api_key: "test-api-key",
      base_url: "https://api.test.hooksniff.com",
      num_retries: 0,
      http_adapter: MockHttpAdapter
    )
  end

  defp json_response(body, status \\ 200) do
    {:ok, %{status: status, body: Jason.encode!(body)}}
  end

  describe "deliveries/2" do
    test "sends GET to /v1/analytics/deliveries" do
      client = mock_client()
      resp_body = %{"total" => 1000, "successful" => 950, "failed" => 50}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/analytics/deliveries")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Analytics.deliveries(client)
      Mox.verify!()
    end

    test "sends query params for date range" do
      client = mock_client()
      params = %{"from" => "2024-01-01", "to" => "2024-01-31"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.contains?(url, "/v1/analytics/deliveries?")
        assert String.contains?(url, "from=")
        assert String.contains?(url, "to=")
        json_response(%{"total" => 500})
      end)

      assert {:ok, _} = Analytics.deliveries(client, params)
      Mox.verify!()
    end

    test "deliveries with empty params sends no query string" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        refute String.contains?(url, "?")
        json_response(%{"total" => 0})
      end)

      assert {:ok, _} = Analytics.deliveries(client, %{})
      Mox.verify!()
    end
  end

  describe "success_rate/2" do
    test "sends GET to /v1/analytics/success-rate" do
      client = mock_client()
      resp_body = %{"rate" => 0.95, "period" => "7d"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/analytics/success-rate")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Analytics.success_rate(client)
      Mox.verify!()
    end

    test "success_rate with period param" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.contains?(url, "period=30d")
        json_response(%{"rate" => 0.98})
      end)

      assert {:ok, _} = Analytics.success_rate(client, %{"period" => "30d"})
      Mox.verify!()
    end
  end

  describe "latency/2" do
    test "sends GET to /v1/analytics/latency" do
      client = mock_client()
      resp_body = %{"p50" => 120, "p95" => 350, "p99" => 800}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/analytics/latency")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Analytics.latency(client)
      Mox.verify!()
    end

    test "latency with endpoint filter" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.contains?(url, "endpoint_id=ep_123")
        json_response(%{"p50" => 50})
      end)

      assert {:ok, _} = Analytics.latency(client, %{"endpoint_id" => "ep_123"})
      Mox.verify!()
    end
  end

  describe "error handling" do
    test "analytics returns 403 for unauthorized" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "forbidden"}, 403)
      end)

      assert {:ok, %{status: 403}} = Analytics.deliveries(client)
    end

    test "analytics returns error on connection failure" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:error, :timeout}
      end)

      assert {:error, :timeout} = Analytics.success_rate(client)
    end

    test "analytics returns 500 for server error" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "internal"}, 500)
      end)

      assert {:ok, %{status: 500}} = Analytics.latency(client)
    end
  end

  describe "query param encoding" do
    test "URL-encodes special characters in params" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        # The value "hello world" should be URL-encoded
        assert String.contains?(url, "name=hello+world") or String.contains?(url, "name=hello%20world")
        json_response(%{})
      end)

      Analytics.deliveries(client, %{"name" => "hello world"})
      Mox.verify!()
    end

    test "handles multiple query params" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.contains?(url, "from=")
        assert String.contains?(url, "to=")
        assert String.contains?(url, "endpoint=")
        json_response(%{})
      end)

      Analytics.deliveries(client, %{"from" => "2024-01-01", "to" => "2024-01-31", "endpoint" => "ep_1"})
      Mox.verify!()
    end
  end
end
