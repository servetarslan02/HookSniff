# SDK Roadmap MEMORY

> Son güncelleme: 2026-05-17 23:42 GMT+8

## Durum
- Node.js SDK: ✅ Svix'ten adapte edildi (0.5.0, %70-75)
- Python SDK: ✅ Svix SDK'dan doğrudan adapte edildi (127 dosya, 101 model, sync+async) (1.0.0, %80)
- Go SDK: ⬜ Sıradaki (Svix Go core'dan adapte)
- Rust SDK: ⬜ Sıradaki
- 7 SDK daha: ⬜ Beklemede

## Yaklaşım
- Svix'in mevcut SDK'larını alıp HookSniff'e uyarlıyoruz
- Python: Svix SDK'nın tamamı kopyalandı, svix→hooksniff yeniden adlandırıldı, Svix-specific features kaldırıldı
- Node.js: Svix'ten adapte edildi
- Go ve sonrası: Hepsi Svix'ten adapte edilecek
- Hedef: %100 (Stripe seviyesi)

## Sıradaki
1. Go SDK rewrite (Svix Go core'dan adapte)
2. Rust SDK rewrite
3. Kalan 7 SDK
4. Faz 1-7: Core kalite, test, CI/CD, codegen, docs
