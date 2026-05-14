# SDK NEXT_SESSION.md — Sıradaki İş

> Son güncelleme: 2026-05-15 07:50 GMT+8

## Sıradaki: Rust Wrapper + İmza Doğrulama

PLAN.md'deki "Dil 1: Rust" adımındayım.

### Yapılacaklar
1. `sdks/rust/` mevcut kodu incele
2. `sdks/rust/src/client.rs` — HookSniff wrapper yaz
3. `sdks/rust/src/webhook.rs` — HMAC-SHA256 imza doğrulama yaz
4. `sdks/rust/tests/` — unit testler yaz (20+)
5. Cargo.toml güncelle
6. `cargo build` + `cargo test`
7. git commit + push

### Referans Implementasyonlar
- Node.js: `sdks/node/src/hooksniff.ts`, `sdks/node/src/webhook.ts`
- Python: `sdks/python/hooksniff/client.py`, `sdks/python/hooksniff/webhook.py`
- Go: `sdks/go/hooksniff.go`, `sdks/go/webhook.go`

### Bitirince
- PLAN.md'deki tikleri işaretle
- Bu dosyayı sıradaki dil (Ruby) ile güncelle
- MEMORY.md'yi güncelle
- git push
