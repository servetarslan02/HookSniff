defmodule HookSniff.WebhooksResourceTest do
  use ExUnit.Case, async: true

  alias HookSniff.Webhooks
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

  describe "send_webhook/2" do
    test "sends POST to /v1/webhooks" do
      client = mock_client()
      params = %{"endpoint_id" => "ep_123", "event" => "order.created", "data" => %{"id" => "42"}}
      resp_body = %{"id" => "wh_abc", "status" => "queued"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/webhooks")
        assert Jason.decode!(body) == params
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Webhooks.send_webhook(client, params)
      Mox.verify!()
    end
  end

  describe "send_batch/2" do
    test "sends POST to /v1/webhooks/batch" do
      client = mock_client()

      params = %{
        "batch" => [
          %{"endpoint_id" => "ep_1", "event" => "a"},
          %{"endpoint_id" => "ep_2", "event" => "b"}
        ]
      }

      resp_body = %{"results" => [%{"id" => "wh_1"}, %{"id" => "wh_2"}]}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/webhooks/batch")
        assert Jason.decode!(body) == params
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Webhooks.send_batch(client, params)
      Mox.verify!()
    end
  end

  describe "get/2" do
    test "sends GET with id" do
      client = mock_client()
      resp_body = %{"id" => "wh_abc", "event" => "order.created", "status" => "delivered"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/webhooks/wh_abc")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Webhooks.get(client, "wh_abc")
      Mox.verify!()
    end
  end

  describe "replay/2" do
    test "sends POST" do
      client = mock_client()
      resp_body = %{"id" => "wh_abc", "status" => "queued"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/webhooks/wh_abc/replay")
        assert Jason.decode!(body) == %{}
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Webhooks.replay(client, "wh_abc")
      Mox.verify!()
    end
  end
end
