# 2026-05-16 — Admin Stats & Zod Null Fix

## Bug
Admin Overview sayfası "Failed to load stats" hatası gösteriyordu.

## Neden
Zod `.optional()` sadece `undefined` kabul eder, `null` reddeder.
Backend Rust'ta `Option<T>` → JSON `null` döndürüyor.
Bu uyumsuzluk Zod validation hatasına → React Query error → "Failed to load stats" mesajına neden oluyordu.

## Düzeltmeler (`dashboard/src/schemas/api.ts`)

### 1. AdminStatsSchema — recent_signups.name
```ts
// ❌ name: z.string().optional()
// ✅ name: z.string().nullish()
```
Backend: `name: Option<String>` → `null` dönebilir.

### 2. DeliverySchema — event, response_status
```ts
// ❌ event: z.string().optional()
// ❌ response_status: z.number().optional()
// ✅ event: z.string().nullish()
// ✅ response_status: z.number().nullish()
```
Backend: `event_type: Option<String>`, `response_status: Option<i32>`

### 3. AuditLogEntrySchema — resource_id, details, ip_address, user_agent
```ts
// ❌ .optional()  → ✅ .nullish()
```
Backend: Tümü `Option<String>` / `Option<Value>`

### 4. DeployInfoSchema — git_commit, build_time
```ts
// ❌ .optional()  → ✅ .nullish()
```
Backend: `git_commit: Option<String>`, `build_time: Option<String>`

## Kural
- Zod `.optional()` = sadece `undefined` kabul eder
- Zod `.nullish()` = hem `undefined` hem `null` kabul eder
- Backend `Option<T>` → JSON `null` döndürür → `.nullish()` gerekli
