/// Pagination utilities for HookSniff SDK.
/// Provides iterator-style pagination over list endpoints.

use serde::Deserialize;

#[derive(Deserialize)]
pub struct Page<T> {
    pub data: Vec<T>,
    pub has_more: bool,
}

pub struct PaginatedIterator<T, F>
where
    F: FnMut(u32, u32) -> Result<Page<T>, Box<dyn std::error::Error>>,
{
    fetch_fn: F,
    limit: u32,
    offset: u32,
    has_more: bool,
    max_pages: u32,
    pages_fetched: u32,
}

impl<T, F> PaginatedIterator<T, F>
where
    F: FnMut(u32, u32) -> Result<Page<T>, Box<dyn std::error::Error>>,
{
    pub fn new(fetch_fn: F, limit: u32, max_pages: u32) -> Self {
        Self {
            fetch_fn,
            limit,
            offset: 0,
            has_more: true,
            max_pages,
            pages_fetched: 0,
        }
    }

    /// Fetch next page and return items
    pub fn next_page(&mut self) -> Result<Vec<T>, Box<dyn std::error::Error>> {
        if !self.has_more || self.pages_fetched >= self.max_pages {
            return Ok(Vec::new());
        }
        let page = (self.fetch_fn)(self.limit, self.offset)?;
        self.has_more = page.has_more;
        self.offset += page.data.len() as u32;
        self.pages_fetched += 1;
        Ok(page.data)
    }

    /// Collect all items into a Vec
    pub fn collect_all(&mut self) -> Result<Vec<T>, Box<dyn std::error::Error>> {
        let mut all = Vec::new();
        loop {
            let items = self.next_page()?;
            if items.is_empty() {
                break;
            }
            all.extend(items);
        }
        Ok(all)
    }
}
