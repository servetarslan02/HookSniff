defmodule HookSniff.EndpointsTest do
  use ExUnit.Case, async: true

  alias HookSniff.Endpoints
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

  describe "list/2" do
    test "sends GET to /v1/endpoints" do
      client = mock_client()
      resp_body = %{"data" => [], "has_more" => false}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/endpoints")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Endpoints.list(client)
      Mox.verify!()
    end

    test "with opts sends query params" do
      client = mock_client()
      resp_body = %{"data" => [], "has_more" => false}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.contains?(url, "/v1/endpoints?")
        assert String.contains?(url, "limit=10")
        assert String.contains?(url, "offset=5")
        json_response(resp_body)
      end)

      assert {:ok, _} = Endpoints.list(client, limit: 10, offset: 5)
      Mox.verify!()
    end
  end

  describe "create/2" do
    test "sends POST with body" do
      client = mock_client()
      params = %{"url" => "https://example.com/hook", "events" => ["order.created"]}
      resp_body = %{"id" => "ep_abc123", "url" => "https://example.com/hook"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/endpoints")
        assert Jason.decode!(body) == params
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Endpoints.create(client, params)
      Mox.verify!()
    end
  end

  describe "get/2" do
    test "sends GET with id" do
      client = mock_client()
      resp_body = %{"id" => "ep_abc123", "url" => "https://example.com/hook"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/endpoints/ep_abc123")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Endpoints.get(client, "ep_abc123")
      Mox.verify!()
    end
  end

  describe "delete/2" do
    test "sends DELETE" do
      client = mock_client()
      resp_body = %{"deleted" => true}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :delete
        assert String.ends_with?(url, "/v1/endpoints/ep_abc123")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Endpoints.delete(client, "ep_abc123")
      Mox.verify!()
    end
  end

  describe "rotate_secret/2" do
    test "sends POST" do
      client = mock_client()
      resp_body = %{"id" => "ep_abc123", "secret" => "whsec_new123"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/endpoints/ep_abc123/rotate-secret")
        assert Jason.decode!(body) == %{}
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Endpoints.rotate_secret(client, "ep_abc123")
      Mox.verify!()
    end
  end

  describe "list_all/2" do
    test "paginates across multiple pages" do
      client = mock_client()

      page1 = %{"data" => [%{"id" => "ep_1"}], "has_more" => true}
      page2 = %{"data" => [%{"id" => "ep_2"}], "has_more" => true}
      page3 = %{"data" => [%{"id" => "ep_3"}], "has_more" => false}

      call_count = :atomics.new(1, signed: true)
      :atomics.put(call_count, 1, 1)

      Mox.stub(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.contains?(url, "/v1/endpoints")
        idx = :atomics.get(call_count, 1)
        :atomics.add(call_count, 1, 1)

        case idx do
          1 -> json_response(page1)
          2 -> json_response(page2)
          3 -> json_response(page3)
        end
      end)

      result = Endpoints.list_all(client, limit: 1)
      assert result == [%{"id" => "ep_1"}, %{"id" => "ep_2"}, %{"id" => "ep_3"}]
    end
  end
end
