defmodule HookSniff.TeamsTest do
  use ExUnit.Case, async: true

  alias HookSniff.Teams
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

  describe "list_members/1" do
    test "sends GET to /v1/teams/members" do
      client = mock_client()

      resp_body = %{
        "data" => [
          %{"id" => "mem_1", "email" => "alice@example.com"},
          %{"id" => "mem_2", "email" => "bob@example.com"}
        ],
        "has_more" => false
      }

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/teams/members")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Teams.list_members(client)
      Mox.verify!()
    end
  end

  describe "invite/2" do
    test "sends POST" do
      client = mock_client()
      params = %{"email" => "charlie@example.com", "role" => "member"}
      resp_body = %{"id" => "inv_123", "email" => "charlie@example.com", "status" => "pending"}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, body, _opts ->
        assert method == :post
        assert String.ends_with?(url, "/v1/teams/invite")
        assert Jason.decode!(body) == params
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Teams.invite(client, params)
      Mox.verify!()
    end
  end

  describe "remove_member/2" do
    test "sends DELETE" do
      client = mock_client()
      resp_body = %{"deleted" => true}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :delete
        assert String.ends_with?(url, "/v1/teams/members/mem_1")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Teams.remove_member(client, "mem_1")
      Mox.verify!()
    end
  end
end
