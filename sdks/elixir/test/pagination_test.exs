defmodule HookSniff.PaginationTest do
  use ExUnit.Case, async: true

  alias HookSniff.Pagination

  # Test 1: collect_all with single page
  test "collect_all with single page returns all items" do
    items = ["a", "b", "c"]
    fetch_page = fn _limit, _offset -> {:ok, %{data: items, has_more: false}} end

    assert Pagination.collect_all(fetch_page) == items
  end

  # Test 2: collect_all with multiple pages
  test "collect_all with multiple pages collects all items" do
    pages = [
      {:ok, %{data: [1, 2], has_more: true}},
      {:ok, %{data: [3, 4], has_more: true}},
      {:ok, %{data: [5], has_more: false}}
    ]

    call_count = :atomics.new(1, signed: true)
    :atomics.put(call_count, 1, 1)

    fetch_page = fn _limit, _offset ->
      idx = :atomics.get(call_count, 1)
      :atomics.add(call_count, 1, 1)
      Enum.at(pages, idx - 1)
    end

    assert Pagination.collect_all(fetch_page, limit: 2) == [1, 2, 3, 4, 5]
  end

  # Test 3: collect_all with empty result
  test "collect_all with empty result returns empty list" do
    fetch_page = fn _limit, _offset -> {:ok, %{data: [], has_more: false}} end
    assert Pagination.collect_all(fetch_page) == []
  end

  # Test 4: collect_all passes limit option
  test "collect_all passes limit to fetch function" do
    received_limits = :atomics.new(1, signed: true)

    fetch_page = fn limit, _offset ->
      :atomics.put(received_limits, 1, limit)
      {:ok, %{data: [1], has_more: false}}
    end

    Pagination.collect_all(fetch_page, limit: 25)
    assert :atomics.get(received_limits, 1) == 25
  end

  # Test 5: collect_all tracks offset correctly
  test "collect_all tracks offset across pages" do
    pages = [
      {:ok, %{data: [1, 2], has_more: true}},
      {:ok, %{data: [3, 4], has_more: true}},
      {:ok, %{data: [5], has_more: false}}
    ]

    call_count = :atomics.new(1, signed: true)
    :atomics.put(call_count, 1, 1)
    offsets = :ets.new(:offsets, [:ordered_set])

    fetch_page = fn _limit, offset ->
      idx = :atomics.get(call_count, 1)
      :atomics.add(call_count, 1, 1)
      :ets.insert(offsets, {idx, offset})
      Enum.at(pages, idx - 1)
    end

    Pagination.collect_all(fetch_page, limit: 2)

    recorded = :ets.tab2list(offsets) |> Enum.sort_by(&elem(&1, 0)) |> Enum.map(&elem(&1, 1))
    assert recorded == [0, 2, 4]

    :ets.delete(offsets)
  end

  # Test 6: paginate stream yields items lazily
  test "paginate stream yields items lazily" do
    pages = [
      {:ok, %{data: ["a", "b"], has_more: true}},
      {:ok, %{data: ["c"], has_more: false}}
    ]

    call_count = :atomics.new(1, signed: true)
    :atomics.put(call_count, 1, 1)

    fetch_page = fn _limit, _offset ->
      idx = :atomics.get(call_count, 1)
      :atomics.add(call_count, 1, 1)
      Enum.at(pages, idx - 1)
    end

    items = Pagination.paginate(fetch_page, limit: 2) |> Enum.to_list()
    assert items == ["a", "b", "c"]
  end

  # Test 7: paginate stream handles empty result
  test "paginate stream with empty result returns empty list" do
    fetch_page = fn _limit, _offset -> {:ok, %{data: [], has_more: false}} end
    items = Pagination.paginate(fetch_page) |> Enum.to_list()
    assert items == []
  end

  # Test 8: collect_all stops on empty data even with has_more true
  test "collect_all stops on empty data even when has_more is true" do
    fetch_page = fn _limit, _offset -> {:ok, %{data: [], has_more: true}} end
    assert Pagination.collect_all(fetch_page) == []
  end

  # Test 9: collect_all respects max_pages option
  test "collect_all respects max_pages option" do
    page_count = :atomics.new(1, signed: true)

    fetch_page = fn _limit, _offset ->
      n = :atomics.get(page_count, 1)
      :atomics.add(page_count, 1, 1)
      {:ok, %{data: [n], has_more: true}}
    end

    result = Pagination.collect_all(fetch_page, limit: 1, max_pages: 5)
    assert length(result) == 5
  end

  # Test 10: default limit is 50
  test "default limit is documented as 50" do
    # Verify by calling without explicit limit
    received_limit = :atomics.new(1, signed: true)

    fetch_page = fn limit, _offset ->
      :atomics.put(received_limit, 1, limit)
      {:ok, %{data: [1], has_more: false}}
    end

    Pagination.collect_all(fetch_page)
    assert :atomics.get(received_limit, 1) == 50
  end

  # Test 11: collect_all handles invalid fetch_page return gracefully
  test "collect_all handles invalid fetch_page return gracefully" do
    fetch_page = fn _limit, _offset -> :error end
    assert Pagination.collect_all(fetch_page) == []
  end

  # Test 12: paginate stream respects max_pages
  test "paginate stream respects max_pages" do
    page_count = :atomics.new(1, signed: true)

    fetch_page = fn _limit, _offset ->
      n = :atomics.get(page_count, 1)
      :atomics.add(page_count, 1, 1)
      {:ok, %{data: [n], has_more: true}}
    end

    items = Pagination.paginate(fetch_page, limit: 1, max_pages: 3) |> Enum.to_list()
    assert length(items) == 3
  end
end
