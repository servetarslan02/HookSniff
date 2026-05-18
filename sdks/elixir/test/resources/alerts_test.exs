defmodule HookSniff.AlertsTest do
  use ExUnit.Case, async: true

  alias HookSniff.Alerts
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

  describe "list_rules/2" do
    test "sends GET to /v1/alerts/rules" do
      client = mock_client()
      resp_body = %{"data" => [%{"id" => "rule_1", "name" => "High failures"}], "has_more" => false}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/alerts/rules")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Alerts.list_rules(client)
      Mox.verify!()
    end

    test "list_rules with pagination opts" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.contains?(url, "limit=5")
        assert String.contains?(url, "offset=10")
        json_response(%{"data" => [], "has_more" => false})
      end)

      assert {:ok, _} = Alerts.list_rules(client, limit: 5, offset: 10)
      Mox.verify!()
    end

    test "list_rules returns empty data" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"data" => [], "has_more" => false})
      end)

      assert {:ok, %{body: %{"data" => []}}} = Alerts.list_rules(client)
    end
  end

  describe "list_all/2" do
    test "paginates across multiple pages" do
      client = mock_client()

      page1 = %{"data" => [%{"id" => "rule_1"}], "has_more" => true}
      page2 = %{"data" => [%{"id" => "rule_2"}], "has_more" => false}

      call_count = :atomics.new(1, signed: true)
      :atomics.put(call_count, 1, 1)

      Mox.stub(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.contains?(url, "/v1/alerts/rules")
        idx = :atomics.get(call_count, 1)
        :atomics.add(call_count, 1, 1)

        case idx do
          1 -> json_response(page1)
          2 -> json_response(page2)
        end
      end)

      result = Alerts.list_all(client, limit: 1)
      assert result == [%{"id" => "rule_1"}, %{"id" => "rule_2"}]
    end
  end

  describe "list_notifications/2" do
    test "sends GET to /v1/alerts/notifications" do
      client = mock_client()
      resp_body = %{"data" => [%{"id" => "notif_1", "rule_id" => "rule_1"}], "has_more" => false}

      Mox.expect(MockHttpAdapter, :request, fn method, url, _headers, _body, _opts ->
        assert method == :get
        assert String.ends_with?(url, "/v1/alerts/notifications")
        json_response(resp_body)
      end)

      assert {:ok, %{body: ^resp_body}} = Alerts.list_notifications(client)
      Mox.verify!()
    end

    test "list_notifications with opts" do
      client = mock_client()

      Mox.expect(MockHttpAdapter, :request, fn _method, url, _headers, _body, _opts ->
        assert String.contains?(url, "limit=20")
        json_response(%{"data" => [], "has_more" => false})
      end)

      assert {:ok, _} = Alerts.list_notifications(client, limit: 20)
      Mox.verify!()
    end
  end

  describe "list_all_notifications/2" do
    test "paginates notifications" do
      client = mock_client()

      page1 = %{"data" => [%{"id" => "n1"}], "has_more" => true}
      page2 = %{"data" => [%{"id" => "n2"}], "has_more" => false}

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

      result = Alerts.list_all_notifications(client, limit: 1)
      assert result == [%{"id" => "n1"}, %{"id" => "n2"}]
    end
  end

  describe "error handling" do
    test "returns 401 for unauthenticated" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "unauthorized"}, 401)
      end)

      assert {:ok, %{status: 401}} = Alerts.list_rules(client)
    end

    test "returns error on connection failure" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        {:error, :econnrefused}
      end)

      assert {:error, :econnrefused} = Alerts.list_rules(client)
    end

    test "returns 500 for server error" do
      client = mock_client()

      Mox.stub(MockHttpAdapter, :request, fn _method, _url, _headers, _body, _opts ->
        json_response(%{"error" => "internal"}, 500)
      end)

      assert {:ok, %{status: 500}} = Alerts.list_notifications(client)
    end
  end
end
