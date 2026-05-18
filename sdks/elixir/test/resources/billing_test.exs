defmodule HookSniff.BillingTest do
  use ExUnit.Case, async: true

  alias HookSniff.Billing
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

  describe "plan/1" do
    test "sends GET to /v1/billing/plan" do
      client = mock_client()
      resp_body = %{"plan" => "pro", "webhook_limit" => 10000, "price" => 49}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/billing/plan")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Billing.plan(client)
      Mox.verify!()
    end

    test "plan returns free tier" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"plan" => "free", "webhook_limit" => 100})
      end)

      assert {:ok, %{body: %{"plan" => "free"}}} = Billing.plan(client)
    end
  end

  describe "upgrade/2" do
    test "sends POST to /v1/billing/upgrade" do
      client = mock_client()
      params = %{"plan" => "enterprise"}
      resp_body = %{"plan" => "enterprise", "status" => "upgraded", "webhook_limit" => 100_000}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/billing/upgrade")
        assert Jason.decode!(body) == params
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Billing.upgrade(client, params)
      Mox.verify!()
    end

    test "upgrade to same plan returns unchanged" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"plan" => "pro", "status" => "unchanged"})
      end)

      assert {:ok, %{body: %{"status" => "unchanged"}}} =
        Billing.upgrade(client, %{"plan" => "pro"})
    end
  end

  describe "portal/1" do
    test "sends POST to /v1/billing/portal" do
      client = mock_client()
      resp_body = %{"url" => "https://billing.stripe.com/session/abc123"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/billing/portal")
        assert Jason.decode!(body) == %{}
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Billing.portal(client)
      Mox.verify!()
    end

    test "portal sends empty JSON body" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, _headers, body, _opts ->
        # Body should be an empty JSON object, not empty string
        assert body == Jason.encode!(%{})
        json_response(%{"url" => "https://portal.example.com"})
      end)

      Billing.portal(client)
      Mox.verify!()
    end
  end

  describe "error handling" do
    test "plan returns 401 for unauthenticated" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "unauthorized"}, 401)
      end)

      assert {:ok, %{status: 401}} = Billing.plan(client)
    end

    test "upgrade returns 400 for invalid plan" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "invalid_plan"}, 400)
      end)

      assert {:ok, %{status: 400}} = Billing.upgrade(client, %{"plan" => "nonexistent"})
    end

    test "portal returns error on connection failure" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:error, :econnrefused}
      end)

      assert {:error, :econnrefused} = Billing.portal(client)
    end

    test "upgrade returns 402 for payment required" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "payment_required"}, 402)
      end)

      assert {:ok, %{status: 402}} = Billing.upgrade(client, %{"plan" => "enterprise"})
    end
  end
end
