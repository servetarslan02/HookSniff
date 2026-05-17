# SDK Roadmap — Hafıza

> Son güncelleme: 2026-05-17 22:20 GMT+8
> Bu dosya SDK çalışmalarının özel hafızasıdır. Her oturum başı okunur.

---

## 📖 Okuma Rehberi (Her Oturum)

1. Bu dosyayı oku (MEMORY.md)
2. `STATUS.md` — 11 SDK durum tablosu
3. `TODO.md` — yapılacak işler (%100 yol haritası, 7 faz)
4. `DONE.md` — yapılan işler
5. `PLAN.md` — strateji planı (%100 hedefi)
6. İşe başla

---

## 👤 Kullanıcı

- **İsim:** Servet Arslan
- **Teknik bilgi:** Yok — kodu AI yazıyor
- **Dil:** Türkçe
- **Kural:** Onay almadan işlem yapma

---

## 📋 Proje Bağlamı

**HookSniff** webhook altyapı platformu. 11 dilde SDK var.

### SDK Stratejisi
- Svix'in open-source core'unu (MIT lisans) adapte ediyoruz
- Public dosyalarda Svix branding yok — %100 HookSniff native
- Internal PLAN.md'de referans linkleri var (işimize yarar)

### Dosya Konumu
```
HookSniff/
├── sdks/
│   ├── node/        ← ✅ Yeniden yazıldı (0.5.0, %70-75)
│   ├── python/      ← ⬜ Sıradaki
│   ├── go/          ← ⬜ Sıradaki
│   ├── rust/        ← ⬜ Sıradaki
│   └── ... (7 diğer)
└── .ai-context/
    └── sdk-roadmap/ ← 🔑 BU DOSYANIN KONUMU
        ├── MEMORY.md    ← bu dosya
        ├── STATUS.md
        ├── TODO.md      ← %100 yol haritası (7 faz)
        ├── DONE.md
        └── PLAN.md      ← %100 strateji planı
```

---

## 🎯 %100 Yol Haritası (7 Faz)

| Faz | İçerik | Süre | Durum | Sonuç |
|-----|--------|------|-------|-------|
| ✅ | Node.js SDK rewrite | — | Tamamlandı | %70-75 |
| Faz 1 | Core kalite (rate limit, ESM, debug, error, JSDoc, streaming) | 6 saat | ⬜ | %85 |
| Faz 2 | Test suite (95%+ coverage) | 4 saat | ⬜ | %90 |
| Faz 3 | CI/CD (GitHub Actions) | 2 saat | ⬜ | %92 |
| Faz 4 | OpenAPI codegen (100% type-safe) | 3 saat | ⬜ | %95 |
| Faz 5 | Dokümantasyon sitesi | 4 saat | ⬜ | %97 |
| Faz 6 | Multi-dil (10 SDK rewrite) | 12-16 saat | ⬜ | 11/11 %95+ |
| Faz 7 | Son dokunuşlar (tree-shaking, benchmark, security) | 3 saat | ⬜ | %100 |
| **TOPLAM** | | **34-38 saat** | | **%100** |

---

## 🔧 Yapılan İşler (Özet)

### 2026-05-17 — Oturum 196
1. ✅ Node.js SDK yeniden yazım (%70-75 kalite)
2. ✅ Svix branding kaldırıldı
3. ✅ `sdk-roadmap/` klasörü oluşturuldu (5 dosya)
4. ✅ %100 yol haritası planlandı (7 faz, 34-38 saat)
5. ✅ Publish rehberi eklendi (11 dil)
6. ✅ Commit: d4445119, 8c534f3f

---

## 📋 Sıradaki İş (Bir Sonraki Oturum)

**Faz 1.1: Rate Limit Handling**
- `src/request.ts`'e 429 auto-retry ekle
- Süre: 30 dakika
- Detay: `TODO.md` → Faz 1 → 1.1

---

## 🔗 Referans Linkleri (Svix Core — Internal)

| Dil | Repo |
|-----|------|
| TypeScript | `github.com/svix/svix-webhooks/javascript/` |
| Python | `github.com/svix/svix-webhooks/python/` |
| Go | `github.com/svix/svix-webhooks/go/` |
| Rust | `github.com/svix/svix-webhooks/rust/` |
| Ruby | `github.com/svix/svix-webhooks/ruby/` |
| Java | `github.com/svix/svix-webhooks/java/` |
| Kotlin | `github.com/svix/svix-webhooks/kotlin/` |
| PHP | `github.com/svix/svix-webhooks/php/` |
| C# | `github.com/svix/svix-webhooks/csharp/` |
| Swift | `github.com/svix/svix-webhooks/swift/` |
| Elixir | `github.com/svix/svix-webhooks/elixir/` |

---

## ⚠️ Dikkat Edilecekler

1. **Svix branding** — Public dosyalarda Svix adı geçmeyecek
2. **svix-id/svix-timestamp/svix-signature** — Standard Webhooks spec, kalabilir
3. **Versiyon tutarlılığı** — Tüm SDK'lar 0.5.0 olmalı
4. **Onay** — Yeni SDK'ya geçmeden Servet'e sor
5. **Commit + push** — Her değişiklikten sonra GitHub'a sync et

---

## 📊 Kalite Hedefleri

| Seviye | Kriter | Durum |
|--------|--------|-------|
| %70+ | Retry, pagination, webhook verify | ✅ Node.js |
| %85+ | + Rate limit, ESM, debug, error class, JSDoc | ⬜ Faz 1 |
| %90+ | + Test suite (95%+ coverage) | ⬜ Faz 2 |
| %95+ | + CI/CD + OpenAPI codegen | ⬜ Faz 3-4 |
| %97+ | + Dokümantasyon sitesi | ⬜ Faz 5 |
| %100 | + Tree-shaking + benchmark + security | ⬜ Faz 7 |
