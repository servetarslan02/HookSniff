defmodule HookSniff.ApiKeysTest do
  use ExUnit.Case, async: true

  alias HookSniff.ApiKeys
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
    test "sends GET to /v1/api-keys" do
      client = mock_client()
      resp_body = %{"data" => [%{"id" => "key_1", "prefix" => "sk_live_"}], "has_more" => false}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/api-keys")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = ApiKeys.list(client)
      Mox.verify!()
    end

    test "list with pagination opts" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.contains?(url, "limit=5")
        assert String.contains?(url, "offset=0")
        json_response(%{"data" => [], "has_more" => false})
      end)

      assert {:ok, _} = ApiKeys.list(client, limit: 5, offset: 0)
      Mox.verify!()
    end

    test "list returns empty data" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"data" => [], "has_more" => false})
      end)

      assert {:ok, %{body: %{"data" => []}}} = ApiKeys.list(client)
    end

    test "list returns multiple keys" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{
          "data" => [
            %{"id" => "key_1", "prefix" => "sk_live_abc"},
            %{"id" => "key_2", "prefix" => "sk_live_def"}
          ],
          "has_more" => false
        })
      end)

      assert {:ok, %{body: %{"data" => keys}}} = ApiKeys.list(client)
      assert length(keys) == 2
    end
  end

  describe "list_all/2" do
    test "paginates across multiple pages" do
      client = mock_client()

      page1 = %{"data" => [%{"id" => "key_1"}], "has_more" => true}
      page2 = %{"data" => [%{"id" => "key_2"}], "has_more" => false}

      call_count = :atomics.new(1, signed: true)
      :atomics.put(call_count, 1, 1)

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        idx = :atomics.get(call_count, 1)
        :atomics.add(call_count, 1, 1)

        case idx do
          1 -> json_response(page1)
          2 -> json_response(page2)
        end
      end)

      result = ApiKeys.list_all(client, limit: 1)
      assert result == [%{"id" => "key_1"}, %{"id" => "key_2"}]
    end
  end

  describe "create/2" do
    test "sends POST to /v1/api-keys" do
      client = mock_client()
      params = %{"name" => "Production Key"}
      resp_body = %{"id" => "key_new", "prefix" => "sk_live_xyz", "secret" => "sk_live_xyz_full_secret"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/api-keys")
        assert Jason.decode!(body) == params
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = ApiKeys.create(client, params)
      Mox.verify!()
    end

    test "create with empty name" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, _headers, body, _opts ->
        assert Jason.decode!(body) == %{"name" => ""}
        json_response(%{"id" => "key_anon", "prefix" => "sk_live_"})
      end)

      assert {:ok, _} = ApiKeys.create(client, %{"name" => ""})
      Mox.verify!()
    end
  end

  describe "delete/2" do
    test "sends DELETE to /v1/api-keys/:id" do
      client = mock_client()
      resp_body = %{"deleted" => true}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :delete
        assert String.ends_with?(url, "/v1/api-keys/key_abc")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = ApiKeys.delete(client, "key_abc")
      Mox.verify!()
    end

    test "delete nonexistent key returns 404" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "not_found"}, 404)
      end)

      assert {:ok, %{status: 404}} = ApiKeys.delete(client, "key_nonexistent")
    end
  end

  describe "error handling" do
    test "returns 401 for unauthenticated" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "unauthorized"}, 401)
      end)

      assert {:ok, %{status: 401}} = ApiKeys.list(client)
    end

    test "returns 403 for forbidden" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "forbidden"}, 403)
      end)

      assert {:ok, %{status: 403}} = ApiKeys.create(client, %{"name" => "test"})
    end

    test "returns error on connection failure" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:error, :econnrefused}
      end)

      assert {:error, :econnrefused} = ApiKeys.list(client)
    end

    test "returns 500 for server error" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "internal"}, 500)
      end)

      assert {:ok, %{status: 500}} = ApiKeys.delete(client, "key_1")
    end
  end
end
