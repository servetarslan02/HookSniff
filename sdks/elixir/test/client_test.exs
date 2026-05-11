defmodule HookSniff.ClientTest do
  use ExUnit.Case, async: true

  alias HookSniff

  describe "new/1" do
    test "creates client with required api_key" do
      client = HookSniff.new(api_key: "test-key")
      assert client.api_key == "test-key"
    end

    test "sets default base_url" do
      client = HookSniff.new(api_key: "test-key")
      assert client.base_url == "https://hooksniff-api-1046140057667.europe-west1.run.app"
    end

    test "allows custom base_url" do
      client = HookSniff.new(api_key: "test-key", base_url: "https://custom.api.com")
      assert client.base_url == "https://custom.api.com"
    end

    test "sets default timeout to 30000" do
      client = HookSniff.new(api_key: "test-key")
      assert client.timeout == 30_000
    end

    test "allows custom timeout" do
      client = HookSniff.new(api_key: "test-key", timeout: 5000)
      assert client.timeout == 5000
    end

    test "sets default num_retries to 2" do
      client = HookSniff.new(api_key: "test-key")
      assert client.num_retries == 2
    end

    test "allows custom num_retries" do
      client = HookSniff.new(api_key: "test-key", num_retries: 5)
      assert client.num_retries == 5
    end

    test "sets default http_adapter" do
      client = HookSniff.new(api_key: "test-key")
      assert client.http_adapter == HookSniff.DefaultHttpAdapter
    end

    test "allows custom http_adapter" do
      client = HookSniff.new(api_key: "test-key", http_adapter: MyAdapter)
      assert client.http_adapter == MyAdapter
    end

    test "raises when api_key is missing" do
      assert_raise KeyError, fn ->
        HookSniff.new([])
      end
    end

    test "creates client with all options" do
      client = HookSniff.new(
        api_key: "full-key",
        base_url: "https://full.example.com",
        timeout: 10_000,
        num_retries: 3,
        http_adapter: SomeAdapter
      )

      assert client.api_key == "full-key"
      assert client.base_url == "https://full.example.com"
      assert client.timeout == 10_000
      assert client.num_retries == 3
      assert client.http_adapter == SomeAdapter
    end

    test "struct fields are accessible" do
      client = HookSniff.new(api_key: "key")
      assert Map.has_key?(client, :api_key)
      assert Map.has_key?(client, :base_url)
      assert Map.has_key?(client, :timeout)
      assert Map.has_key?(client, :num_retries)
      assert Map.has_key?(client, :http_adapter)
    end
  end

  describe "HookSniff.Client.request/4" do
    alias HookSniff.Client
    alias HookSniff.MockHttpAdapter

    defp mock_client(opts \\ []) do
      HookSniff.new(
        [api_key: "test-api-key",
         base_url: "https://api.test.hooksniff.com",
         num_retries: 0,
         http_adapter: MockHttpAdapter] ++ opts
      )
    end

    test "sends correct method, url, headers, and body" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn method, url, headers, body, _opts ->
        assert method == :post
        assert url == "https://api.test.hooksniff.com/v1/test"
        assert {"accept", "application/json"} in headers
        assert {"authorization", "Bearer test-api-key"} in headers
        assert {"user-agent", "hooksniff-sdk/1.0.0/elixir"} in headers
        assert Jason.decode!(body) == %{"key" => "value"}
        {:ok, %{status: 200, body: Jason.encode!(%{"ok" => true})}}
      end)

      assert {:ok, %{status: 200, body: %{"ok" => true}}} =
        Client.request(:post, "/v1/test", %{"key" => "value"}, client)
      Mox.verify!()
    end

    test "parses JSON response body" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:ok, %{status: 200, body: Jason.encode!(%{"parsed" => true})}}
      end)

      assert {:ok, %{body: %{"parsed" => true}}} =
        Client.request(:get, "/v1/test", nil, client)
    end

    test "returns raw body when response is not JSON" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:ok, %{status: 200, body: "not json"}}
      end)

      assert {:ok, %{body: "not json"}} =
        Client.request(:get, "/v1/test", nil, client)
    end

    test "includes idempotency-key header" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, headers, _body, _opts ->
        key = List.keyfind(headers, "idempotency-key", 0)
        assert key != nil
        assert {"idempotency-key", val} = key
        assert String.starts_with?(val, "auto_")
        assert String.length(val) == 37  # "auto_" (5) + 32 hex chars
        {:ok, %{status: 200, body: Jason.encode!(%{})}}
      end)

      Client.request(:get, "/v1/test", nil, client)
      Mox.verify!()
    end

    test "sends empty string body when body is nil" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, _headers, body, _opts ->
        assert body == ""
        {:ok, %{status: 200, body: Jason.encode!(%{})}}
      end)

      Client.request(:get, "/v1/test", nil, client)
      Mox.verify!()
    end

    test "does not include content-type header when body is nil" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, headers, _body, _opts ->
        refute List.keyfind(headers, "content-type", 0)
        {:ok, %{status: 200, body: Jason.encode!(%{})}}
      end)

      Client.request(:get, "/v1/test", nil, client)
      Mox.verify!()
    end

    test "includes content-type header when body is present" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, headers, _body, _opts ->
        assert {"content-type", "application/json"} in headers
        {:ok, %{status: 200, body: Jason.encode!(%{})}}
      end)

      Client.request(:post, "/v1/test", %{"a" => 1}, client)
      Mox.verify!()
    end

    test "returns error from adapter" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:error, :timeout}
      end)

      assert {:error, :timeout} = Client.request(:get, "/v1/test", nil, client)
    end

    test "constructs URL by concatenating base_url and path" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert url == "https://api.test.hooksniff.com/v1/endpoints"
        {:ok, %{status: 200, body: Jason.encode!(%{})}}
      end)

      Client.request(:get, "/v1/endpoints", nil, client)
      Mox.verify!()
    end

    test "passes timeout to adapter options" do
      client = mock_client(timeout: 5000)

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, _headers, _body, opts ->
        assert opts[:timeout] == 5000
        assert opts[:recv_timeout] == 5000
        {:ok, %{status: 200, body: Jason.encode!(%{})}}
      end)

      Client.request(:get, "/v1/test", nil, client)
      Mox.verify!()
    end
  end

  describe "HookSniff.Client.request!/4" do
    alias HookSniff.Client
    alias HookSniff.MockHttpAdapter

    defp mock_client_bang do
      HookSniff.new(
        api_key: "test-api-key",
        base_url: "https://api.test.hooksniff.com",
        num_retries: 0,
        http_adapter: MockHttpAdapter
      )
    end

    test "returns body on success" do
      client = mock_client_bang()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:ok, %{status: 200, body: Jason.encode!(%{"id" => "123"})}}
      end)

      assert %{"id" => "123"} = Client.request!(:get, "/v1/test", nil, client)
    end

    test "raises ApiError on non-2xx status" do
      client = mock_client_bang()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:ok, %{status: 404, body: Jason.encode!(%{"error" => "not found"})}}
      end)

      assert_raise HookSniff.ApiError, fn ->
        Client.request!(:get, "/v1/test", nil, client)
      end
    end

    test "raises ApiError on connection error" do
      client = mock_client_bang()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:error, :econnrefused}
      end)

      assert_raise HookSniff.ApiError, fn ->
        Client.request!(:get, "/v1/test", nil, client)
      end
    end
  end

  describe "HookSniff.ApiError" do
    test "message includes status and body" do
      error = %HookSniff.ApiError{status: 404, body: %{"error" => "not found"}}
      msg = Exception.message(error)
      assert msg =~ "404"
      assert msg =~ "not found"
    end

    test "message with status 0 (connection error)" do
      error = %HookSniff.ApiError{status: 0, body: ":timeout"}
      msg = Exception.message(error)
      assert msg =~ "0"
      assert msg =~ "timeout"
    end
  end

  describe "HookSniff.DefaultHttpAdapter" do
    test "implements the HttpAdapter behaviour" do
      # Verify the module exists and has the request function
      # Use Code.ensure_loaded? + :functions check since function_exported? can be
      # unreliable in test compilation contexts
      assert {:module, _} = Code.ensure_loaded(HookSniff.DefaultHttpAdapter)
      functions = HookSniff.DefaultHttpAdapter.module_info(:functions)
      assert {:request, 5} in functions
    end
  end

  describe "HookSniff.HttpAdapter" do
    test "defines the request callback" do
      callbacks = HookSniff.HttpAdapter.behaviour_info(:callbacks)
      assert {:request, 5} in callbacks
    end
  end
end
