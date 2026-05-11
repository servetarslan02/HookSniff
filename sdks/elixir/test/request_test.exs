defmodule HookSniff.RequestTest do
  use ExUnit.Case, async: true

  alias HookSniffAPI.RequestBuilder

  describe "method/2" do
    test "sets method on empty request" do
      request = RequestBuilder.method(%{}, :get)
      assert request.method == :get
    end

    test "does not override existing method" do
      request = %{method: :post}
      result = RequestBuilder.method(request, :get)
      assert result.method == :post
    end

    test "sets various HTTP methods" do
      for m <- [:get, :post, :put, :delete, :patch] do
        request = RequestBuilder.method(%{}, m)
        assert request.method == m
      end
    end
  end

  describe "url/2" do
    test "sets URL on empty request" do
      request = RequestBuilder.url(%{}, "https://api.example.com/v1/test")
      assert request.url == "https://api.example.com/v1/test"
    end

    test "does not override existing URL" do
      request = %{url: "https://original.com"}
      result = RequestBuilder.url(request, "https://new.com")
      assert result.url == "https://original.com"
    end

    test "handles URL with query params" do
      request = RequestBuilder.url(%{}, "https://api.example.com/v1/test?limit=10&offset=0")
      assert request.url == "https://api.example.com/v1/test?limit=10&offset=0"
    end
  end

  describe "add_optional_params/3" do
    test "adds optional params to request" do
      definitions = %{limit: :query, offset: :query}
      opts = [limit: 10, offset: 5]

      request = RequestBuilder.add_optional_params(%{}, definitions, opts)
      assert request[:query] != nil
    end

    test "ignores unknown optional params" do
      definitions = %{limit: :query}
      opts = [limit: 10, unknown: "value"]

      request = RequestBuilder.add_optional_params(%{}, definitions, opts)
      refute Keyword.has_key?(request[:query] || [], :unknown)
    end

    test "handles empty options" do
      request = RequestBuilder.add_optional_params(%{}, %{limit: :query}, [])
      assert request == %{}
    end

    test "handles empty definitions" do
      request = RequestBuilder.add_optional_params(%{}, %{}, [limit: 10])
      assert request == %{}
    end
  end

  describe "add_param/4" do
    test "adds body param" do
      request = RequestBuilder.add_param(%{}, :body, :body, %{key: "value"})
      assert request.body == %{key: "value"}
    end

    test "adds header param" do
      request = RequestBuilder.add_param(%{}, :headers, :content_type, "application/json")
      assert {"content-type", "application/json"} in request.headers
    end

    test "adds query param" do
      request = RequestBuilder.add_param(%{}, :query, :limit, 10)
      assert {:limit, 10} in request.query
    end

    test "header param converts atom keys to strings" do
      request = RequestBuilder.add_param(%{}, :headers, :authorization, "Bearer token")
      assert {"authorization", "Bearer token"} in request.headers
    end

    test "header param converts values to strings" do
      request = RequestBuilder.add_param(%{}, :headers, :content_length, 42)
      assert {"content-length", "42"} in request.headers
    end

    test "body param with :body key replaces body" do
      request = %{body: "old"}
      result = RequestBuilder.add_param(request, :body, :body, "new")
      assert result.body == "new"
    end

    test "header param updates existing header with same key" do
      request = %{headers: [{"content-type", "text/plain"}]}
      result = RequestBuilder.add_param(request, :headers, :content_type, "application/json")
      assert {"content-type", "application/json"} in result.headers
      refute {"content-type", "text/plain"} in result.headers
    end
  end

  describe "ensure_body/1" do
    test "sets empty string when body is nil" do
      request = %{body: nil}
      result = RequestBuilder.ensure_body(request)
      assert result.body == ""
    end

    test "adds body key when missing" do
      request = %{}
      result = RequestBuilder.ensure_body(request)
      assert result.body == ""
    end

    test "preserves existing non-nil body" do
      request = %{body: "existing"}
      result = RequestBuilder.ensure_body(request)
      assert result.body == "existing"
    end

    test "preserves existing map body" do
      request = %{body: %{key: "value"}}
      result = RequestBuilder.ensure_body(request)
      assert result.body == %{key: "value"}
    end
  end

  describe "evaluate_response/2" do
    test "returns ok for matching status code" do
      env = %Tesla.Env{status: 200, body: Jason.encode!(%{"ok" => true})}
      assert {:ok, decoded} = RequestBuilder.evaluate_response({:ok, env}, [{200, false}])
      assert decoded == env
    end

    test "decodes body for matching module mapping" do
      body = Jason.encode!(%{"id" => "123", "name" => "test"})
      env = %Tesla.Env{status: 200, body: body}
      mapping = [{200, HookSniffAPI.Model.AlertRule}]

      assert {:ok, %HookSniffAPI.Model.AlertRule{}} =
        RequestBuilder.evaluate_response({:ok, env}, mapping)
    end

    test "returns error for unmatched status" do
      env = %Tesla.Env{status: 404, body: "not found"}
      assert {:error, ^env} = RequestBuilder.evaluate_response({:ok, env}, [{200, false}])
    end

    test "uses default mapping for unmatched status" do
      env = %Tesla.Env{status: 500, body: Jason.encode!(%{"error" => "server error"})}
      mapping = [{200, false}, {:default, false}]

      assert {:ok, ^env} = RequestBuilder.evaluate_response({:ok, env}, mapping)
    end

    test "passes through Tesla errors" do
      assert {:error, :timeout} =
        RequestBuilder.evaluate_response({:error, :timeout}, [{200, false}])
    end

    test "default mapping with module decodes body" do
      body = Jason.encode!(%{"id" => "k1", "prefix" => "sk_"})
      env = %Tesla.Env{status: 201, body: body}
      mapping = [{200, false}, {:default, HookSniffAPI.Model.ApiKeyInfo}]

      assert {:ok, %HookSniffAPI.Model.ApiKeyInfo{}} =
        RequestBuilder.evaluate_response({:ok, env}, mapping)
    end
  end
end
