defmodule HookSniff.AuthTest do
  use ExUnit.Case, async: true

  alias HookSniff.Auth
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

  describe "register/2" do
    test "sends POST to /v1/auth/register" do
      client = mock_client()
      params = %{"email" => "user@example.com", "password" => "secure123"}
      resp_body = %{"id" => "usr_1", "email" => "user@example.com", "token" => "jwt_abc"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/auth/register")
        assert Jason.decode!(body) == params
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Auth.register(client, params)
      Mox.verify!()
    end

    test "register with empty params" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert Jason.decode!(body) == %{}
        json_response(%{"error" => "validation_error"}, 422)
      end)

      assert {:ok, %{status: 422}} = Auth.register(client, %{})
      Mox.verify!()
    end
  end

  describe "login/2" do
    test "sends POST to /v1/auth/login" do
      client = mock_client()
      params = %{"email" => "user@example.com", "password" => "secure123"}
      resp_body = %{"token" => "jwt_xyz", "user" => %{"id" => "usr_1"}}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/auth/login")
        assert Jason.decode!(body) == params
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Auth.login(client, params)
      Mox.verify!()
    end

    test "login with invalid credentials returns 401" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "invalid_credentials"}, 401)
      end)

      assert {:ok, %{status: 401}} = Auth.login(client, %{"email" => "bad", "password" => "bad"})
      Mox.verify!()
    end
  end

  describe "enable_2fa/2" do
    test "sends POST to /v1/auth/2fa/enable" do
      client = mock_client()
      params = %{"method" => "totp"}
      resp_body = %{"secret" => "JBSWY3DPEHPK3PXP", "qr_code" => "data:image/png;base64,..."}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/auth/2fa/enable")
        assert Jason.decode!(body) == params
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Auth.enable_2fa(client, params)
      Mox.verify!()
    end
  end

  describe "verify_email/1" do
    test "sends GET to /v1/auth/verify-email" do
      client = mock_client()
      resp_body = %{"status" => "sent"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/auth/verify-email")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Auth.verify_email(client)
      Mox.verify!()
    end
  end

  describe "forgot_password/2" do
    test "sends POST to /v1/auth/forgot-password" do
      client = mock_client()
      params = %{"email" => "user@example.com"}
      resp_body = %{"status" => "email_sent"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/auth/forgot-password")
        assert Jason.decode!(body) == params
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Auth.forgot_password(client, params)
      Mox.verify!()
    end

    test "forgot_password with unknown email still returns success" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"status" => "email_sent"})
      end)

      assert {:ok, %{body: %{"status" => "email_sent"}}} =
        Auth.forgot_password(client, %{"email" => "unknown@example.com"})
      Mox.verify!()
    end
  end

  describe "export_data/1" do
    test "sends GET to /v1/auth/export" do
      client = mock_client()
      resp_body = %{"download_url" => "https://exports.example.com/data.json"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/auth/export")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Auth.export_data(client)
      Mox.verify!()
    end
  end

  describe "delete_account/1" do
    test "sends DELETE to /v1/auth/account" do
      client = mock_client()
      resp_body = %{"deleted" => true}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :delete
        assert String.ends_with?(url, "/v1/auth/account")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Auth.delete_account(client)
      Mox.verify!()
    end
  end

  describe "error handling" do
    test "register returns 409 for duplicate email" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "email_already_exists"}, 409)
      end)

      assert {:ok, %{status: 409}} = Auth.register(client, %{"email" => "dup@example.com"})
      Mox.verify!()
    end

    test "login returns 429 for rate limiting" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "rate_limited"}, 429)
      end)

      assert {:ok, %{status: 429}} = Auth.login(client, %{"email" => "x", "password" => "x"})
      Mox.verify!()
    end

    test "returns error on connection failure" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:error, :econnrefused}
      end)

      assert {:error, :econnrefused} = Auth.login(client, %{"email" => "x", "password" => "x"})
    end
  end
end
