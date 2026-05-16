---
sidebar_position: 2
---

# Pagination

HookSniff API uses cursor-based pagination for list endpoints. Results are paginated with a default page size of 20.

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Items per page (max 100) |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | Sort order (`asc` or `desc`) |

## Examples

### Node.js

```javascript
// First page
const page1 = await client.webhooks.list({ page: 1, per_page: 20 });

// Next page
const page2 = await client.webhooks.list({ page: 2, per_page: 20 });

// With filters
const filtered = await client.webhooks.list({
  page: 1,
  status: 'failed',
  sort: 'created_at',
  order: 'desc',
});

// Iterate all pages
let page = 1;
let allDeliveries = [];
while (true) {
  const result = await client.webhooks.list({ page, per_page: 100 });
  allDeliveries.push(...result.data);
  if (result.data.length < 100) break;
  page++;
}
```

### Python

```python
# First page
page1 = hs.webhooks.list(page=1, per_page=20)

# With filters
filtered = hs.webhooks.list(page=1, status="failed", sort="created_at", order="desc")

# Iterate all pages
page = 1
all_deliveries = []
while True:
    result = hs.webhooks.list(page=page, per_page=100)
    all_deliveries.extend(result["data"])
    if len(result["data"]) < 100:
        break
    page += 1
```

### Go

```go
// First page
page1, err := client.Webhooks.List(&hooksniff.WebhookListInput{
    Page:    1,
    PerPage: 20,
})

// Iterate all pages
var allDeliveries []hooksniff.Delivery
page := 1
for {
    result, _ := client.Webhooks.List(&hooksniff.WebhookListInput{
        Page:    page,
        PerPage: 100,
    })
    allDeliveries = append(allDeliveries, result.Data...)
    if len(result.Data) < 100 {
        break
    }
    page++
}
```

## Response Format

All list endpoints return a consistent response format:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

## Tips

- Use `per_page=100` for bulk operations to minimize API calls
- Always check `data.length < per_page` to detect the last page
- Use `sort` and `order` to ensure consistent ordering across pages
- Cache results when possible to reduce API usage
