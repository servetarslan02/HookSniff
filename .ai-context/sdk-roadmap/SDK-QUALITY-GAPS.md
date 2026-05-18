# SDK-QUALITY-GAPS.md — Payload Parsing Eklendi

> Güncelleme: 2026-05-19 02:45 GMT+8 — **#5 Webhook Payload Parsing tamamlandı**
> Durum: Faz 2 başlangıcı

---

## ✅ TAMAMLANANLAR (1-5)

### 5. Webhook Payload Parsing ✅ (11/11 SDK)

Her SDK'da `verify()` artık type-safe `WebhookEvent` döndürüyor:

| SDK | Method | Return Type | Backward Compat |
|-----|--------|-------------|-----------------|
| Node.js | `verify()` | `WebhookEventMap[T]` | `verifyRaw()` → `unknown` |
| Python | `verify()` | `WebhookEvent` | `verify_raw()` → `Any` |
| Go | `VerifyAndParse()` | `(*WebhookEvent, error)` | `Verify()` → `error` (unchanged) |
| Rust | `verify_and_parse()` | `Result<WebhookEvent, WebhookError>` | `verify()` → `Result<(), WebhookError>` (unchanged) |
| Ruby | `verify()` | `WebhookEvent` | `verify_raw()` → `Hash` |
| Java | `verifyAndParse()` | `WebhookEvent` | `verify()` → `void` (unchanged) |
| Kotlin | `verifyAndParse()` | `WebhookEvent` | `verify()` → `Unit` (unchanged) |
| PHP | `verify()` | `WebhookEvent` | `verifyRaw()` → `array` |
| C# | `VerifyAndParse()` | `WebhookEvent` | `Verify()` → `void` (unchanged) |
| Swift | `verify()` | `WebhookEvent` | `verifyRaw()` → `[String: Any]` |
| Elixir | `verify()` | `{:ok, %WebhookEvent{}}` | `verify_raw()` → `{:ok, map}` |

#### WebhookEvent Fields (tüm dillerde aynı):
- `event` / `Event` — Event type name (e.g., "endpoint.created")
- `data` / `Data` — Payload data (dict/map/hash)
- `timestamp` / `Timestamp` — ISO 8601 timestamp string

#### Backward Compatibility:
- **Go, Rust, Java, Kotlin, C#:** Mevcut `verify()` methodu dokunulmadı, yeni `verifyAndParse()` eklendi
- **Node.js, Python, Ruby, PHP, Swift, Elixir:** `verify()` güncellendi, eski davranış için `verifyRaw()` eklendi

---

## ❌ KALAN EKSİKLER

### 6. Idempotency Key Kontrolü ❌ — Sıradaki
- 🔴 YÜKSEK öncelik
- Tahmini süre: 1-2 saat (tüm diller)

### 7. Response Metadata Erişimi ❌
### 8. Config Seçenekleri ❌
### 9. Debug Logging ❌
### 10. Typed Webhook Events ❌
### 11-17. Düşük öncelikli items

---

## 📊 Güncel Skor

```
Svix:      ████████████████████ 100%
HookSniff: ██████████████████░░  88%  (+3%)
```
