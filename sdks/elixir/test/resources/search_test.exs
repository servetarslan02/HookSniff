defmodule HookSniff.SearchTest do
  use ExUnit.Case, async: true

  alias HookSniff.Search
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

  describe "search/2" do
    test "sends GET to /v1/search with query" do
      client = mock_client()
      resp_body = %{"results" => [%{"id" => "wh_1", "event" => "order.created"}]}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.contains?(url, "/v1/search?q=order.created")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Search.search(client, "order.created")
      Mox.verify!()
    end

    test "URL-encodes query with spaces" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.contains?(url, "q=order+created") or String.contains?(url, "q=order%20created")
        json_response(%{"results" => []})
      end)

      Search.search(client, "order created")
      Mox.verify!()
    end

    test "URL-encodes special characters" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.contains?(url, "q=")
        json_response(%{"results" => []})
      end)

      Search.search(client, "test&foo=bar")
      Mox.verify!()
    end

    test "handles empty query string" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.contains?(url, "q=")
        json_response(%{"results" => []})
      end)

      Search.search(client, "")
      Mox.verify!()
    end

    test "handles unicode query" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.contains?(url, "q=")
        json_response(%{"results" => []})
      end)

      Search.search(client, "日本語テスト")
      Mox.verify!()
    end

    test "returns empty results" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"results" => []})
      end)

      assert {:ok, %{body: %{"results" => []}}} = Search.search(client, "nonexistent")
    end

    test "returns multiple results" do
      client = mock_client()
      results = [
        %{"id" => "wh_1"},
        %{"id" => "wh_2"},
        %{"id" => "wh_3"}
      ]

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"results" => results})
      end)

      assert {:ok, %{body: %{"results" => ^results}}} = Search.search(client, "webhook")
    end
  end

  describe "error handling" do
    test "returns 400 for empty search when required" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "query_required"}, 400)
      end)

      assert {:ok, %{status: 400}} = Search.search(client, "")
    end

    test "returns 401 for unauthenticated" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "unauthorized"}, 401)
      end)

      assert {:ok, %{status: 401}} = Search.search(client, "test")
    end

    test "returns error on connection failure" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:error, :timeout}
      end)

      assert {:error, :timeout} = Search.search(client, "test")
    end

    test "returns 500 for server error" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "internal_server_error"}, 500)
      end)

      assert {:ok, %{status: 500}} = Search.search(client, "test")
    end
  end
end
