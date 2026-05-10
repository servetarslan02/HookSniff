# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 19:32 GMT+8

---

## ✅ Tamamlanan Oturumlar

### Oturum 73-79 ✅
- Rate Limiting, Webhook Verification, Infrastructure, Dashboard Routing, API Uyumsuzluğu, Billing & Account, SSRF & Security

### Oturum 80 — Worker & Backend Core (kısmi) ✅
- HS-018: Error classification eklendi (4xx except 429 → dead letter, 429/5xx → retry)
- HS-019-023: Sonraki oturumlara kaldı

---

## 🔴 Sıradaki Oturum: #81 — Database Issues + Worker Kalan

### Görev
DB düzeltmeleri + worker kalan sorunlar.

### Düzeltilcek Sorunlar
| ID | Sorun | Dosya |
|----|-------|-------|
| HS-024 | İki migration sistemi senkron değil | `api/migrations/` |
| HS-025 | CHECK constraint'ler eksik | `api/migrations/` |
| HS-026 | `webhook_queue`'da FK eksik | `api/migrations/` |
| HS-027 | `amount_cents` INT → BIGINT | `api/migrations/` |
| HS-038d | `custom_domains` dig subprocess — command injection | `api/src/routes/custom_domains.rs` |
| HS-038e | Dynamic SQL construction — `format!` ile WHERE | `api/src/routes/events.rs` |

---

## 📋 Sıradaki 5 Oturum

| # | Görev | Sorunlar |
|---|-------|----------|
| 81 | **Database Issues** | HS-024, HS-025, HS-026, HS-027, HS-038d, HS-038e |
| 82 | Auth & Crypto Security | HS-038f, HS-038g, HS-038h, HS-038i, HS-038j, HS-038k, HS-038l |
| 83 | SDK & Config Fixes | HS-035, HS-036, HS-037, HS-038, HS-038m, HS-038n |
| 84 | Frontend Component Issues | HS-039, HS-040, HS-041, HS-042, HS-043, HS-044 |
| 85 | Frontend Performance & Bundle | HS-045, HS-046, HS-047, HS-048 |

---

## 📊 İlerleme

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 13 | 1 |
| 🔴 P1 | 44 | 12 (+7 yanlış/operasyonel) | 25 |
| 🟡 P2 | 38 | 0 | 38 |
| 🟢 P3 | 13 | 0 | 13 |
| **TOPLAM** | **103** | **26** | **74** |
