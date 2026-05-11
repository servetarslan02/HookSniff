defmodule HookSniff.HealthTest do
  use ExUnit.Case, async: true

  alias HookSniff.Health
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

  describe "check/1" do
    test "sends GET to /health" do
      client = mock_client()
      resp_body = %{"status" => "ok", "version" => "1.0.0"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/health")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Health.check(client)
      Mox.verify!()
    end

    test "check does not send request body" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, _headers, body, _opts ->
        assert body == ""
        json_response(%{"status" => "ok"})
      end)

      Health.check(client)
      Mox.verify!()
    end

    test "check includes authorization header" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, headers, _body, _opts ->
        assert {"authorization", "Bearer test-api-key"} in headers
        json_response(%{"status" => "ok"})
      end)

      Health.check(client)
      Mox.verify!()
    end

    test "check returns healthy status" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"status" => "ok", "uptime" => 86400})
      end)

      assert {:ok, %{body: %{"status" => "ok", "uptime" => 86400}}} = Health.check(client)
    end

    test "check returns degraded status" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"status" => "degraded", "issues" => ["high_latency"]})
      end)

      assert {:ok, %{body: %{"status" => "degraded"}}} = Health.check(client)
    end

    test "check returns 503 for unhealthy" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"status" => "unhealthy"}, 503)
      end)

      assert {:ok, %{status: 503}} = Health.check(client)
    end

    test "check returns error on connection failure" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:error, :econnrefused}
      end)

      assert {:error, :econnrefused} = Health.check(client)
    end

    test "check returns error on timeout" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:error, :timeout}
      end)

      assert {:error, :timeout} = Health.check(client)
    end

    test "check works with different base URLs" do
      client = HookSniff.new(
        api_key: "key",
        base_url: "https://custom.api.io",
        num_retries: 0,
        http_adapter: MockHttpAdapter
      )

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.starts_with?(url, "https://custom.api.io/health")
        json_response(%{"status" => "ok"})
      end)

      Health.check(client)
      Mox.verify!()
    end

    test "check returns version info" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{
          "status" => "ok",
          "version" => "2.1.0",
          "build" => "abc123",
          "uptime_seconds" => 12345
        })
      end)

      assert {:ok, %{body: body}} = Health.check(client)
      assert body["version"] == "2.1.0"
      assert body["build"] == "abc123"
      assert body["uptime_seconds"] == 12345
    end
  end
end
