//! HookSniff Pagination Tests
//!
//! Comprehensive tests for the PaginatedIterator.

use hooksniff::pagination::{Page, PaginatedIterator};

/// Helper: build a Page with the given items and has_more flag.
fn make_page<T>(data: Vec<T>, has_more: bool) -> Page<T> {
    Page { data, has_more }
}

// ── Single page ──────────────────────────────────────────────────────

#[test]
fn test_single_page() {
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| Ok(make_page(vec![1, 2, 3], false)),
        10,
        10,
    );
    let page = iter.next_page().unwrap();
    assert_eq!(page, vec![1, 2, 3]);
    assert!(iter.next_page().unwrap().is_empty());
}

#[test]
fn test_single_page_collect_all() {
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| Ok(make_page(vec!["a", "b"], false)),
        10,
        10,
    );
    let all = iter.collect_all().unwrap();
    assert_eq!(all, vec!["a", "b"]);
}

// ── Multi page ───────────────────────────────────────────────────────

#[test]
fn test_multi_page() {
    let call = std::sync::Mutex::new(0u32);
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| {
            let mut c = call.lock().unwrap();
            *c += 1;
            match *c {
                1 => Ok(make_page(vec![1, 2], true)),
                2 => Ok(make_page(vec![3, 4], true)),
                _ => Ok(make_page(vec![5], false)),
            }
        },
        2,
        10,
    );

    assert_eq!(iter.next_page().unwrap(), vec![1, 2]);
    assert_eq!(iter.next_page().unwrap(), vec![3, 4]);
    assert_eq!(iter.next_page().unwrap(), vec![5]);
    assert!(iter.next_page().unwrap().is_empty());
}

#[test]
fn test_multi_page_collect_all() {
    let call = std::sync::Mutex::new(0u32);
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| {
            let mut c = call.lock().unwrap();
            *c += 1;
            match *c {
                1 => Ok(make_page(vec![10, 20], true)),
                2 => Ok(make_page(vec![30], true)),
                _ => Ok(make_page(Vec::<i32>::new(), false)),
            }
        },
        2,
        10,
    );

    let all = iter.collect_all().unwrap();
    assert_eq!(all, vec![10, 20, 30]);
}

// ── Empty page ───────────────────────────────────────────────────────

#[test]
fn test_empty_first_page() {
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| Ok(make_page(Vec::<i32>::new(), false)),
        10,
        10,
    );
    assert!(iter.next_page().unwrap().is_empty());
    assert!(iter.collect_all().unwrap().is_empty());
}

#[test]
fn test_empty_page_mid_stream() {
    let call = std::sync::Mutex::new(0u32);
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| {
            let mut c = call.lock().unwrap();
            *c += 1;
            match *c {
                1 => Ok(make_page(vec![1], true)),
                _ => Ok(make_page(Vec::<i32>::new(), true)),
            }
        },
        10,
        10,
    );

    assert_eq!(iter.next_page().unwrap(), vec![1]);
    assert!(iter.next_page().unwrap().is_empty());
}

// ── max_pages limit ──────────────────────────────────────────────────

#[test]
fn test_max_pages_limit() {
    let call = std::sync::Mutex::new(0u32);
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| {
            let mut c = call.lock().unwrap();
            *c += 1;
            Ok(make_page(vec![*c], true))
        },
        1,
        3,
    );

    assert_eq!(iter.next_page().unwrap(), vec![1]);
    assert_eq!(iter.next_page().unwrap(), vec![2]);
    assert_eq!(iter.next_page().unwrap(), vec![3]);
    assert!(iter.next_page().unwrap().is_empty());
}

#[test]
fn test_max_pages_one() {
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| Ok(make_page(vec![42], true)),
        10,
        1,
    );
    assert_eq!(iter.next_page().unwrap(), vec![42]);
    assert!(iter.next_page().unwrap().is_empty());
}

#[test]
fn test_max_pages_zero_returns_empty() {
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| Ok(make_page(vec![1, 2, 3], true)),
        10,
        0,
    );
    assert!(iter.next_page().unwrap().is_empty());
}

// ── Offset propagation ───────────────────────────────────────────────

#[test]
fn test_offset_advances_correctly() {
    let offsets = std::sync::Mutex::new(Vec::new());
    let mut iter = PaginatedIterator::new(
        |_limit, offset| {
            offsets.lock().unwrap().push(offset);
            match offset {
                0 => Ok(make_page(vec![1, 2, 3], true)),
                _ => Ok(make_page(vec![4, 5], false)),
            }
        },
        3,
        10,
    );

    iter.collect_all().unwrap();
    let recorded = offsets.into_inner().unwrap();
    assert_eq!(recorded, vec![0, 3]);
}

#[test]
fn test_offset_starts_at_zero() {
    let first_offset = std::sync::Mutex::new(None);
    let mut iter = PaginatedIterator::new(
        |_limit, offset| {
            let mut fo = first_offset.lock().unwrap();
            if fo.is_none() {
                *fo = Some(offset);
            }
            Ok(make_page(vec![1], false))
        },
        10,
        10,
    );
    iter.next_page().unwrap();
    assert_eq!(*first_offset.lock().unwrap(), Some(0));
}

// ── Error propagation ────────────────────────────────────────────────

#[test]
fn test_fetch_error_propagates() {
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| -> Result<Page<i32>, Box<dyn std::error::Error>> {
            Err("network timeout".into())
        },
        10,
        10,
    );
    assert!(iter.next_page().is_err());
}

#[test]
fn test_error_stops_iteration() {
    let call = std::sync::Mutex::new(0u32);
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| -> Result<Page<i32>, Box<dyn std::error::Error>> {
            let mut c = call.lock().unwrap();
            *c += 1;
            if *c == 1 {
                Ok(make_page(vec![1], true))
            } else {
                Err("server error".into())
            }
        },
        10,
        10,
    );

    assert_eq!(iter.next_page().unwrap(), vec![1]);
    assert!(iter.next_page().is_err());
}

#[test]
fn test_error_on_first_page() {
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| -> Result<Page<i32>, Box<dyn std::error::Error>> {
            Err("auth failed".into())
        },
        10,
        10,
    );
    let result = iter.next_page();
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("auth failed"));
}

#[test]
fn test_collect_all_stops_on_error() {
    let call = std::sync::Mutex::new(0u32);
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| -> Result<Page<i32>, Box<dyn std::error::Error>> {
            let mut c = call.lock().unwrap();
            *c += 1;
            match *c {
                1 => Ok(make_page(vec![1, 2], true)),
                2 => Ok(make_page(vec![3], true)),
                _ => Err("third page fails".into()),
            }
        },
        2,
        10,
    );

    let result = iter.collect_all();
    assert!(result.is_err());
}

// ── Generic types ────────────────────────────────────────────────────

#[test]
fn test_with_string_items() {
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| Ok(make_page(vec!["hello".to_string(), "world".to_string()], false)),
        10,
        10,
    );
    let all = iter.collect_all().unwrap();
    assert_eq!(all, vec!["hello", "world"]);
}

#[test]
fn test_with_struct_items() {
    #[derive(Debug, PartialEq, serde::Deserialize)]
    struct Item {
        id: u32,
        name: String,
    }

    let mut iter = PaginatedIterator::new(
        move |_limit, _offset| Ok(Page {
            data: vec![
                Item { id: 1, name: "a".into() },
                Item { id: 2, name: "b".into() },
            ],
            has_more: false,
        }),
        10,
        10,
    );

    let all = iter.collect_all().unwrap();
    assert_eq!(all.len(), 2);
    assert_eq!(all[0].id, 1);
    assert_eq!(all[1].name, "b");
}

#[test]
fn test_with_u64_items() {
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| Ok(make_page(vec![100u64, 200, 300], false)),
        10,
        10,
    );
    let all = iter.collect_all().unwrap();
    assert_eq!(all, vec![100, 200, 300]);
}

// ── Edge cases ────────────────────────────────────────────────────────

#[test]
fn test_single_item_pages() {
    let call = std::sync::Mutex::new(0u32);
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| {
            let mut c = call.lock().unwrap();
            *c += 1;
            match *c {
                1..=5 => Ok(make_page(vec![*c], true)),
                _ => Ok(make_page(Vec::<u32>::new(), false)),
            }
        },
        1,
        100,
    );

    let all = iter.collect_all().unwrap();
    assert_eq!(all, vec![1, 2, 3, 4, 5]);
}

#[test]
fn test_large_page_size() {
    let items: Vec<i32> = (0..1000).collect();
    let mut iter = PaginatedIterator::new(
        move |_limit, _offset| Ok(make_page(items.clone(), false)),
        1000,
        1,
    );
    let all = iter.collect_all().unwrap();
    assert_eq!(all.len(), 1000);
}

#[test]
fn test_next_page_after_collect_all_returns_empty() {
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| Ok(make_page(vec![1, 2], false)),
        10,
        10,
    );
    let _all = iter.collect_all().unwrap();
    // After collecting all, next_page should return empty
    assert!(iter.next_page().unwrap().is_empty());
}

#[test]
fn test_interleaved_next_page_and_collect() {
    let mut iter = PaginatedIterator::new(
        |_limit, _offset| Ok(make_page(vec![1, 2], false)),
        10,
        10,
    );
    // First page
    let page = iter.next_page().unwrap();
    assert_eq!(page, vec![1, 2]);
    // Collect remaining (should be empty)
    let rest = iter.collect_all().unwrap();
    assert!(rest.is_empty());
}

// ── Page struct ──────────────────────────────────────────────────────

#[test]
fn test_page_has_more_true() {
    let page = make_page(vec![1, 2, 3], true);
    assert!(page.has_more);
    assert_eq!(page.data.len(), 3);
}

#[test]
fn test_page_has_more_false() {
    let page = make_page(vec![1], false);
    assert!(!page.has_more);
    assert_eq!(page.data.len(), 1);
}

#[test]
fn test_page_empty_data() {
    let page: Page<i32> = make_page(vec![], false);
    assert!(page.data.is_empty());
    assert!(!page.has_more);
}
