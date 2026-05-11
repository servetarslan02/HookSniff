# Svix OpenAPI Reference — HookSniff SDK için Referans

> Kaynak: https://api.svix.com/api/v1/openapi.json
> Tarih: 2026-05-11

## Svix Schema Pattern

Svix **455 schema** kullanır. Naming convention:

| Suffix | Amaç | Örnek | Count |
|--------|------|-------|-------|
| `*In` | Request body (create/update) | `ApplicationIn`, `EndpointIn` | 58 |
| `*Out` | Response body | `ApplicationOut`, `EndpointOut` | 109 |
| `*Patch` | Partial update (PATCH) | `ApplicationPatch`, `EndpointPatch` | 14 |
| Other | Enum, config, event, stats | `BackgroundTaskStatus`, `ConnectorKind` | 274 |

## Entity Pattern (Application örneği)

```yaml
ApplicationIn:
  properties:
    metadata: { type: object }
    name: { type: string }
    rateLimit: { type: integer }
    throttleRate: { type: integer }
    uid: { type: string }

ApplicationOut:
  properties:
    createdAt: { type: string, format: date-time }
    id: { type: string }
    metadata: { type: object }
    name: { type: string }
    rateLimit: { type: integer }

ApplicationPatch:
  properties:
    metadata: { type: object }
    name: { type: string }
    rateLimit: { type: integer }
    throttleRate: { type: integer }
    uid: { type: string }
```

## Pagination Pattern

Svix `ListResponse*` kullanır:
```json
{
  "data": [...],
  "done": false,
  "iterator": "eyJpZCI6IC..."
}
```

- `data`: item array
- `done`: boolean (has_more yerine)
- `iterator`: cursor-based pagination (page number yerine)

## HookSniff Karşılaştırması

| Konu | Svix | HookSniff (şimdi) | Hedef |
|------|------|-------------------|-------|
| Schema sayısı | 455 | 75 | ~151 (6 dil için) |
| Request suffix | `*In` | `*Request` | `*Request` (tutarlı) |
| Response suffix | `*Out` | `*Response` | `*Response` (tutarlı) |
| Patch suffix | `*Patch` | yok | `*PatchRequest` ekle |
| Pagination | cursor + iterator | page/per_page | page/per_page (koru) |
| List response | `ListResponse*` | inline | `*ListResponse` ekle |

## HookSniff Naming Convention (Karar)

- `*Request` — create/update body
- `*Response` — detail response
- `*PatchRequest` — partial update
- `*ListResponse` — pagination wrapper (data, has_more, total)
- `*Filter` — search/filter params

## Dikkat Edilecekler

1. Svix'te `*Out` = response, biz `*Response` kullanıyoruz (tutarlılık)
2. Svix cursor pagination kullanıyor, biz page/per_page kullanıyoruz (koru)
3. Svix'te enum'lar ayrı schema, biz de aynısını yapalım
4. Svix'te her entity için In/Out/Patch var, biz de her entity için Request/Response/PatchRequest yapalım
