# 📋 Sonraki Oturum Rehberi — Güvenlik Geliştirme

> **Son güncelleme:** 2026-05-26

## 🚀 Hızlı Başlangıç

```bash
cd /root/.openclaw/workspace/HookSniff && git pull origin main
cat .ai-context/guvenlik-gelistirme-projesi/NEXT_SESSION.md
cat .ai-context/guvenlik-gelistirme-projesi/UYGULAMA-PLANI.md
```

## 📍 Sıradaki Adım: FAZ 1 — OWASP API Security Top 10

| # | Adım | Dosya | Açıklama |
|---|------|-------|----------|
| 1 | Object-level authz | `middleware/authz.rs` | YENİ — endpoint/delivery erişim kontrolü |
| 2 | Field-level filter | `middleware/field_filter.rs` | YENİ — hassas alan filtreleme |
| 3 | Pagination limits | `middleware/pagination.rs` | YENİ — max 100 sayfa |
| 4 | Bot detection | `middleware/bot_detection.rs` | YENİ — UA kontrolü + honeypot |
| 5 | API versioning | `routes/versioning.rs` | YENİ — X-API-Version header |
| 6 | OWASP tests | `tests/security/owasp_tests.rs` | YENİ — API1-API10 test senaryoları |
| 7 | Test | — | `cargo check && cargo test` |
