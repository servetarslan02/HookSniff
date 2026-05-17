# SDK Roadmap MEMORY

> Son güncelleme: 2026-05-17 23:19 GMT+8

## Durum
- Node.js SDK: ✅ Svix'ten adapte edildi (0.5.0, %70-75)
- Python SDK: ⚠️ Sıfırdan yazıldı, Svix'ten çevrilmedi → Svix Python SDK'dan yeniden yapılacak
- Go SDK: ⬜ Sıradaki (Svix Go core'dan adapte)
- Rust SDK: ⬜ Sıradaki
- 7 SDK daha: ⬜ Beklemede

## Yaklaşım
- Svix'in mevcut SDK'larını alıp HookSniff'e uyarlıyoruz
- Node.js: Svix'ten doğru çevrildi ✅
- Python: Önceki oturumda el yapımı yazıldı, Svix'ten yeniden çevrilecek ⚠️
- Go ve sonrası: Hepsi Svix'ten adapte edilecek
- Her SDK: el yapımı, retry+backoff, pagination, webhook verify
- Hedef: %100 (Stripe seviyesi)

## Sıradaki
1. Python SDK — Svix Python SDK'dan yeniden çevrilecek
2. Go SDK rewrite (Svix Go core'dan adapte)
3. Rust SDK rewrite
4. Kalan 7 SDK
5. Faz 1-7: Core kalite, test, CI/CD, codegen, docs