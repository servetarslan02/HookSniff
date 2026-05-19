---
sidebar_position: 3
---

# Pagination

All list endpoints use **cursor-based pagination**. Faster and more reliable than offset-based pagination.

## How It Works

```
GET /v1/endpoints?limit=20
→ { "data": [...], "cursor": "eyJpZCI6MTB9" }

GET /v1/endpoints?limit=20&cursor=eyJpZCI6MTB9
→ { "data": [...], "cursor": null }  // No more pages
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Items per page (max 100) |
| `cursor` | string | null | Cursor from previous response |

## Node.js

```typescript
// Manual pagination
let cursor = undefined;
do {
  const page = await hs.endpoint.list({ limit: 20, cursor });
  for (const ep of page.data) {
    console.log(ep.url);
  }
  cursor = page.cursor;
} while (cursor);

// Auto-paginate
for await (const ep of hs.endpoint.listIterator({ limit: 100 })) {
  console.log(ep.url);
}
```

## Python

```python
# Manual pagination
cursor = None
while True:
    page = hs.endpoint.list(limit=20, cursor=cursor)
    for ep in page.data:
        print(ep.url)
    cursor = page.cursor
    if not cursor:
        break

# Auto-paginate
for ep in hs.endpoint.list_iterator(limit=100):
    print(ep.url)
```

## Go

```go
// Manual pagination
cursor := ""
for {
    page, _ := hs.Endpoint.List(ctx, &hooksniff.EndpointListOptions{
        Limit: hooksniff.Int32(20),
        Cursor: &cursor,
    })
    for _, ep := range page.Data {
        fmt.Println(ep.Url)
    }
    if page.Cursor == nil || *page.Cursor == "" {
        break
    }
    cursor = *page.Cursor
}
```

## Filtering

```
GET /v1/webhooks?event_type=order.created&limit=20
GET /v1/webhooks?endpoint_id=ep_abc123&limit=20
GET /v1/webhooks?status=failed&limit=20
```
