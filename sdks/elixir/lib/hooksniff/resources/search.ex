defmodule HookSniff.Search do
  @moduledoc "Search webhook deliveries."

  alias HookSniff.Client

  @doc "Search deliveries"
  @spec search(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def search(client, query) do
    path = "/v1/search?q=#{URI.encode_www_form(query)}"
    Client.request(:get, path, nil, client)
  end
end
