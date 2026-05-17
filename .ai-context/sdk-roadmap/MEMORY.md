# SDK Roadmap MEMORY

> Son güncelleme: 2026-05-17 23:04 GMT+8

## Durum
- Node.js SDK: ✅ Yeniden yazıldı (0.5.0, %70-75)
- Python SDK: ✅ Yeniden yazıldı (0.5.0, %70-75)
- Go SDK: ⬜ Sıradaki
- Rust SDK: ⬜ Sıradaki
- 7 SDK daha: ⬜ Beklemede

## Sıradaki
1. Go SDK rewrite (Svix Go core'dan adapte)
2. Rust SDK rewrite
3. Kalan 7 SDK
4. Faz 1-7: Core kalite, test, CI/CD, codegen, docs

## Yaklaşım
- Svix'in mevcut SDK'larını alıp HookSniff'e çeviriyoruz
- Her SDK: el yapımı, retry+backoff, pagination, webhook verify
- Hedef: %100 (Stripe seviyesi)
