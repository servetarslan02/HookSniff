# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 19:26 GMT+8

---

## ✅ Tamamlanan Oturumlar

### Oturum 73-78 ✅
- Rate Limiting, Webhook Verification, Infrastructure, Dashboard Routing, API Uyumsuzluğu, Billing & Account

### Oturum 79 — SSRF & Security Hardening ✅
- HS-011: Notification URL'lerine SSRF validation eklendi
- HS-012: ❌ Yanlış bulgu — endpoint URL'leri creation'da validate edilmiş
- HS-013: CSP'den `unsafe-eval` kaldırıldı
- HS-014: ❌ Operasyonel — credential rotation gerekli
- HS-015: ❌ Standart pratik — token sadece email'de
- HS-016: `DefaultHasher` → SHA-256

---

## 🔴 Sıradaki Oturum: #80 — Worker & Backend Core

### Görev
Worker ve backend düzeltmeleri.

### Düzeltilcek Sorunlar
| ID | Sorun | Dosya |
|----|-------|-------|
| HS-018 | Error classification yok — 400/401/404 de retry ediliyor | `worker/src/delivery/mod.rs` |
| HS-019 | WebSocket connection limit yok | `api/src/ws/` |
| HS-020 | Circuit breaker modülü var ama entegre edilmemiş | `api/src/circuit_breaker.rs` |
| HS-021 | Billing webhook'larda idempotency yok | `api/src/routes/billing.rs` |
| HS-022 | Throttle state in-memory | `api/src/throttle/` |
| HS-023 | FIFO modülü var ama worker'a bağlanmamış | `worker/src/` |

---

## 📋 Sıradaki 5 Oturum

| # | Görev | Sorunlar |
|---|-------|----------|
| 80 | **Worker & Backend Core** | HS-018, HS-019, HS-020, HS-021, HS-022, HS-023 |
| 81 | Database Issues | HS-024, HS-025, HS-026, HS-027, HS-038d, HS-038e |
| 82 | Auth & Crypto Security | HS-038f, HS-038g, HS-038h, HS-038i, HS-038j, HS-038k, HS-038l |
| 83 | SDK & Config Fixes | HS-035, HS-036, HS-037, HS-038, HS-038m, HS-038n |
| 84 | Frontend Component Issues | HS-039, HS-040, HS-041, HS-042, HS-043, HS-044 |

---

## 📊 İlerleme

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 13 | 1 |
| 🔴 P1 | 44 | 11 (+6 yanlış) | 27 |
| 🟡 P2 | 38 | 0 | 38 |
| 🟢 P3 | 13 | 0 | 13 |
| **TOPLAM** | **103** | **24** | **76** |
