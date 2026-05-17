# SDK — Tamamlanan İşler

> Son güncelleme: 2026-05-18 00:08 GMT+8

---

## ✅ Rust SDK — Svix'ten Doğrudan Adaptasyon — 2026-05-17

### Yöntem
- Svix Rust SDK (`svix-libs/rust/`) kopyalandı
- `svix` → `hooksniff` bulk find-replace
- Svix-specific features kaldırıldı
- `Cargo.toml` güncellendi

### Sonuç
- 118 Rust dosyası
- 98 typed model
- 6 resource: endpoint, message, message_attempt, authentication, event_type, statistics
- Versiyon: 1.0.0

---

## ✅ Go SDK — Svix'ten Doğrudan Adaptasyon — 2026-05-17

### Yöntem
- Svix Go SDK (`svix-libs/go/`) kopyalandı
- `svix` → `hooksniff` bulk find-replace
- Import path: `github.com/servetarslan02/hooksniff-go`
- `go.mod` oluşturuldu

### Sonuç
- 115 Go dosyası
- 99 typed model
- 6 resource
- Versiyon: 1.0.0

---

## ✅ Python SDK — Svix'ten Doğrudan Adaptasyon — 2026-05-17

### Yöntem
- Svix Python SDK (`svix-libs/python/svix/`) kopyalandı
- `svix` → `hooksniff` bulk find-replace
- Svix-specific features kaldırıldı
- `pyproject.toml` güncellendi

### Sonuç
- 127 Python dosyası
- 101 typed model
- 6 resource: endpoint, message, message_attempt, authentication, event_type, statistics
- Sync + Async destegi
- httpx + attrs + ApiBase pattern
- PEP 561 compliant (py.typed)
- Versiyon: 1.0.0

---

## ✅ Node.js SDK — Svix'ten Adaptasyon — 2026-05-17

### Yöntem
- Svix Node.js SDK referans alınarak adapte edildi

### Sonuç
- 12 resource
- 80+ TypeScript type
- retry+backoff, auto-pagination, webhook verify
- Versiyon: 0.5.0
