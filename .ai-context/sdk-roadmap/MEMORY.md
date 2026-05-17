# SDK Roadmap — Hafıza

> Son güncelleme: 2026-05-17 22:15 GMT+8
> Bu dosya SDK çalışmalarının özel hafızasıdır. Her oturum başı okunur.

---

## 📖 Okuma Rehberi (Her Oturum)

1. Bu dosyayı oku (MEMORY.md)
2. `STATUS.md` — 11 SDK durum tablosu
3. `TODO.md` — yapılacak işler
4. `DONE.md` — yapılan işler
5. `PLAN.md` — strateji planı
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
│   ├── node/        ← ✅ Yeniden yazıldı (0.5.0)
│   ├── python/      ← ⬜ Sıradaki
│   ├── go/          ← ⬜ Sıradaki
│   ├── rust/        ← ⬜ Sıradaki
│   └── ... (7 diğer)
└── .ai-context/
    └── sdk-roadmap/ ← 🔑 BU DOSYANIN KONUMU
        ├── MEMORY.md    ← bu dosya
        ├── STATUS.md
        ├── TODO.md
        ├── DONE.md
        └── PLAN.md
```

---

## 🔧 Yapılan İşler (Özet)

### 2026-05-17 — Oturum 196
1. ✅ Node.js SDK yeniden yazım (Svix tabanlı, %70-75 kalite)
2. ✅ Svix branding kaldırıldı (%100 HookSniff native)
3. ✅ `sdk-roadmap/` klasörü oluşturuldu (4 dosya)
4. ✅ 12 resource, 80+ TypeScript type
5. ✅ Versiyon: 0.4.0 → 0.5.0
6. ✅ Commit: d4445119

---

## 📋 Sıradaki İşler

| # | Görev | Öncelik | Süre |
|---|-------|---------|------|
| 1 | Node.js 0.5.0 npm publish | 🔴 | 10 dk |
| 2 | Python SDK rewrite | 🟡 | 2-3 saat |
| 3 | Go SDK rewrite | 🟡 | 2-3 saat |
| 4 | Rust SDK rewrite | 🟡 | 2-3 saat |
| 5 | Test suite (Node.js) | 🟡 | 2-3 saat |
| 6 | GitHub Actions CI/CD | 🟡 | 1 saat |
| 7 | Kalan 7 SDK rewrite | 🟢 | 2 gün |

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

1. **Svix branding** — Public dosyalarda (README, package.json, src/) Svix adı geçmeyecek
2. **svix-id/svix-timestamp/svix-signature** — Bunlar Standard Webhooks spec, kalabilir
3. **Versiyon tutarlılığı** — Tüm SDK'lar 0.5.0 olmalı
4. **Onay** — Yeni SDK'ya geçmeden Servet'e sor
5. **Commit + push** — Her değişiklikten sonra GitHub'a sync et

---

## 📊 Kalite Hedefleri

| Seviye | Kriter | Durum |
|--------|--------|-------|
| %70+ | Retry, pagination, webhook verify | ✅ Node.js |
| %85+ | + Test suite + CI/CD | ⬜ |
| %90+ | + Dokümantasyon + examples | ⬜ |
