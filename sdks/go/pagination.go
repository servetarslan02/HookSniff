package hooksniff

// PaginatedIterator iterates over paginated API responses.
// The Fetch function is called with (limit, offset) and returns items + has_more flag.
type PaginatedIterator[T any] struct {
	Fetch     func(limit, offset int) ([]T, bool, error)
	Limit     int
	MaxPages  int
	offset    int
	page      int
	buf       []T
	hasMore   bool
	lastErr   error
	done      bool
}

// NewPaginatedIterator creates an iterator with default limit=20, maxPages=0 (unlimited).
func NewPaginatedIterator[T any](fetch func(limit, offset int) ([]T, bool, error)) *PaginatedIterator[T] {
	return &PaginatedIterator[T]{
		Fetch:    fetch,
		Limit:    20,
		MaxPages: 0,
		hasMore:  true,
	}
}

// Next returns the next item, or false when exhausted.
func (it *PaginatedIterator[T]) Next() (T, bool) {
	var zero T
	if it.done {
		return zero, false
	}

	// Refill buffer if empty
	for len(it.buf) == 0 {
		if !it.hasMore {
			it.done = true
			return zero, false
		}
		if it.MaxPages > 0 && it.page >= it.MaxPages {
			it.done = true
			return zero, false
		}

		items, hasMore, err := it.Fetch(it.Limit, it.offset)
		if err != nil {
			it.lastErr = err
			it.done = true
			return zero, false
		}

		it.page++
		it.offset += len(items)
		it.hasMore = hasMore
		it.buf = items

		if len(items) == 0 {
			it.done = true
			return zero, false
		}
	}

	item := it.buf[0]
	it.buf = it.buf[1:]
	return item, true
}

// Err returns the last fetch error.
func (it *PaginatedIterator[T]) Err() error {
	return it.lastErr
}

// CollectAll drains the iterator and returns all items.
func (it *PaginatedIterator[T]) CollectAll() ([]T, error) {
	var all []T
	for {
		item, ok := it.Next()
		if !ok {
			break
		}
		all = append(all, item)
	}
	return all, it.Err()
}
