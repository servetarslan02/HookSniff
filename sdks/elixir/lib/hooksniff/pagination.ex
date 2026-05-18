defmodule HookSniff.Pagination do
  @moduledoc """
  Pagination utilities for HookSniff SDK.
  Iterates through offset-based paginated endpoints.
  """

  @default_limit 50
  @max_pages 100

  @doc """
  Collect all items from a paginated endpoint.

  ## Parameters
    * `fetch_page` — Function that takes (limit, offset) and returns `{:ok, %{data: [...], has_more: bool}}`
    * `opts` — Options: `:limit` (default 50), `:max_pages` (default 100)

  ## Returns
    List of all items.
  """
  def collect_all(fetch_page, opts \\ []) do
    limit = Keyword.get(opts, :limit, @default_limit)
    max_pages = Keyword.get(opts, :max_pages, @max_pages)

    do_collect_all(fetch_page, limit, max_pages, 0, 0, [])
  end

  @doc """
  Returns a Stream for lazy pagination.
  """
  def paginate(fetch_page, opts \\ []) do
    limit = Keyword.get(opts, :limit, @default_limit)
    max_pages = Keyword.get(opts, :max_pages, @max_pages)

    Stream.unfold({0, 0, true, false}, fn
      {_offset, pages, _has_more, _started} when pages >= max_pages ->
        nil

      {offset, pages, has_more, _started} ->
        if !has_more and pages > 0 do
          nil
        else
          case fetch_page.(limit, offset) do
            {:ok, %{data: data, has_more: more}} when is_list(data) ->
              if data == [] do
                nil
              else
                {data, {offset + length(data), pages + 1, more, true}}
              end

            _ ->
              nil
          end
        end
    end)
    |> Stream.flat_map(& &1)
  end

  defp do_collect_all(_fetch, _limit, max_pages, _offset, pages, acc) when pages >= max_pages, do: acc

  defp do_collect_all(fetch_fn, limit, max_pages, offset, pages, acc) do
    case fetch_fn.(limit, offset) do
      {:ok, %{data: data, has_more: has_more}} when is_list(data) ->
        new_acc = acc ++ data

        if !has_more or data == [] do
          new_acc
        else
          do_collect_all(fetch_fn, limit, max_pages, offset + length(data), pages + 1, new_acc)
        end

      _ ->
        acc
    end
  end
end
