defmodule HookSniff.Analytics do
  @moduledoc "Delivery analytics — deliveries, success rate, latency."

  alias HookSniff.Client

  @doc "Get delivery analytics"
  @spec deliveries(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def deliveries(client, params \\ %{}) do
    path = build_query("/v1/analytics/deliveries", params)
    Client.request(:get, path, nil, client)
  end

  @doc "Get success rate analytics"
  @spec success_rate(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def success_rate(client, params \\ %{}) do
    path = build_query("/v1/analytics/success-rate", params)
    Client.request(:get, path, nil, client)
  end

  @doc "Get latency analytics"
  @spec latency(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def latency(client, params \\ %{}) do
    path = build_query("/v1/analytics/latency", params)
    Client.request(:get, path, nil, client)
  end

  defp build_query(path, params) when params == %{}, do: path
  defp build_query(path, params) do
    query = params
    |> Enum.map(fn {k, v} -> "#{k}=#{URI.encode_www_form(to_string(v))}" end)
    |> Enum.join("&")
    "#{path}?#{query}"
  end
end
