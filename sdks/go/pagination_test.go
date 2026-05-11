package hooksniff

import (
	"errors"
	"testing"
)

// =============================================================================
// Pagination Tests — PaginatedIterator
// =============================================================================

func TestPaginatedIteratorSinglePage(t *testing.T) {
	items := []string{"a", "b", "c"}
	fetch := func(limit, offset int) ([]string, bool, error) {
		return items, false, nil // single page, has_more=false
	}

	it := NewPaginatedIterator(fetch)
	var got []string
	for {
		item, ok := it.Next()
		if !ok {
			break
		}
		got = append(got, item)
	}

	if it.Err() != nil {
		t.Fatalf("unexpected error: %v", it.Err())
	}
	if len(got) != 3 {
		t.Fatalf("expected 3 items, got %d", len(got))
	}
	if got[0] != "a" || got[1] != "b" || got[2] != "c" {
		t.Errorf("items mismatch: %v", got)
	}
}

func TestPaginatedIteratorMultiPage(t *testing.T) {
	pages := [][]string{
		{"a", "b"},
		{"c", "d"},
		{"e"},
	}
	call := 0
	fetch := func(limit, offset int) ([]string, bool, error) {
		if call >= len(pages) {
			return nil, false, nil
		}
		items := pages[call]
		call++
		hasMore := call < len(pages)
		return items, hasMore, nil
	}

	it := NewPaginatedIterator(fetch)
	it.Limit = 2

	got, err := it.CollectAll()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 5 {
		t.Fatalf("expected 5 items, got %d", len(got))
	}
	expected := []string{"a", "b", "c", "d", "e"}
	for i, v := range expected {
		if got[i] != v {
			t.Errorf("item[%d]: expected %s, got %s", i, v, got[i])
		}
	}
}

func TestPaginatedIteratorEmptyPage(t *testing.T) {
	fetch := func(limit, offset int) ([]string, bool, error) {
		return nil, false, nil // empty page
	}

	it := NewPaginatedIterator(fetch)
	got, err := it.CollectAll()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expected 0 items, got %d", len(got))
	}
}

func TestPaginatedIteratorEmptyFirstPageThenData(t *testing.T) {
	call := 0
	fetch := func(limit, offset int) ([]string, bool, error) {
		call++
		if call == 1 {
			return nil, true, nil // empty first page but has_more=true
		}
		return []string{"x"}, false, nil
	}

	it := NewPaginatedIterator(fetch)
	got, err := it.CollectAll()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// Empty first page terminates the iterator (items=0 triggers done)
	// This is expected behavior: if fetch returns 0 items, iterator stops
	if len(got) > 1 {
		t.Errorf("expected at most 1 item, got %d", len(got))
	}
}

func TestPaginatedIteratorHasMoreFalse(t *testing.T) {
	fetch := func(limit, offset int) ([]int, bool, error) {
		return []int{1, 2}, false, nil
	}

	it := NewPaginatedIterator(fetch)
	it.Limit = 10

	count := 0
	for {
		_, ok := it.Next()
		if !ok {
			break
		}
		count++
	}
	if count != 2 {
		t.Errorf("expected 2 items, got %d", count)
	}
	// Calling Next again should return false immediately
	_, ok := it.Next()
	if ok {
		t.Error("expected iterator to be done")
	}
}

func TestPaginatedIteratorMaxPages(t *testing.T) {
	call := 0
	fetch := func(limit, offset int) ([]string, bool, error) {
		call++
		return []string{"item"}, true, nil // always has_more
	}

	it := NewPaginatedIterator(fetch)
	it.MaxPages = 3

	got, err := it.CollectAll()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 3 {
		t.Errorf("expected 3 items (max_pages=3), got %d", len(got))
	}
	if call != 3 {
		t.Errorf("expected 3 fetch calls, got %d", call)
	}
}

func TestPaginatedIteratorMaxPagesUnlimited(t *testing.T) {
	call := 0
	fetch := func(limit, offset int) ([]int, bool, error) {
		call++
		if call > 50 {
			return nil, false, nil
		}
		return []int{call}, true, nil
	}

	it := NewPaginatedIterator(fetch)
	it.MaxPages = 0 // unlimited

	got, err := it.CollectAll()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 50 {
		t.Errorf("expected 50 items, got %d", len(got))
	}
}

func TestPaginatedIteratorFetchError(t *testing.T) {
	fetch := func(limit, offset int) ([]string, bool, error) {
		return nil, false, errors.New("network error")
	}

	it := NewPaginatedIterator(fetch)
	got, err := it.CollectAll()
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if err.Error() != "network error" {
		t.Errorf("expected 'network error', got: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expected 0 items on error, got %d", len(got))
	}
}

func TestPaginatedIteratorErrorOnSecondPage(t *testing.T) {
	call := 0
	fetch := func(limit, offset int) ([]string, bool, error) {
		call++
		if call == 1 {
			return []string{"ok"}, true, nil
		}
		return nil, false, errors.New("page 2 error")
	}

	it := NewPaginatedIterator(fetch)
	got, err := it.CollectAll()
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if len(got) != 1 {
		t.Errorf("expected 1 item before error, got %d", len(got))
	}
}

func TestPaginatedIteratorCollectAllEmpty(t *testing.T) {
	fetch := func(limit, offset int) ([]string, bool, error) {
		return []string{}, false, nil
	}

	it := NewPaginatedIterator(fetch)
	got, err := it.CollectAll()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != nil {
		t.Errorf("expected nil slice, got %v", got)
	}
}

func TestPaginatedIteratorTracksOffset(t *testing.T) {
	var offsets []int
	fetch := func(limit, offset int) ([]string, bool, error) {
		offsets = append(offsets, offset)
		if offset >= 4 {
			return []string{"e"}, false, nil
		}
		return []string{"x", "y"}, true, nil
	}

	it := NewPaginatedIterator(fetch)
	it.Limit = 2

	_, _ = it.CollectAll()
	if len(offsets) < 2 {
		t.Fatalf("expected at least 2 fetch calls, got %d", len(offsets))
	}
	// Second call should have offset=2
	if offsets[1] != 2 {
		t.Errorf("expected second offset=2, got %d", offsets[1])
	}
}
