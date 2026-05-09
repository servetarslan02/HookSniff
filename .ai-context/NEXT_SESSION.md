# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 04:25 GMT+8

---

## 🔴 ACİL — Servet'in Yapması Gereken

| Görev | Öncelik | Not |
|-------|---------|-----|
| GitHub PAT rotate | 🔴 ACİL | Eski token chat'te paylaşıldı |
| npm token rotate | 🔴 ACİL | Eski token paylaşıldı |
| GCP SA key rotate | 🔴 ACİL | Eski key paylaşıldı |
| Vercel token rotate | 🔴 ACİL | Bu oturumda paylaşıldı |
| Login test | 🔴 | Deploy sonrası dashboard'da dene |
| iyzico hesap | ❌ | Vergi levhası + banka hesabı |

---

## ✅ SON OTURUM (64) — Yapılan İşler

### Compare Page Overhaul + 10 New Pages

**Yeni sayfalar (11 adet):**
| Sayfa | İçerik | Durum |
|-------|--------|-------|
| `/build-vs-buy` | 12 boyut karşılaştırma, maliyet analizi, 6 FAQ | ✅ |
| `/webhooks` | Webhooks hub (guides, glossary, providers, alternatives) | ✅ |
| `/webhooks/glossary` | 35+ webhook terimi tanımlı | ✅ |
| `/webhooks/guides` | 4 kategori: Fundamentals, Implementation, Advanced, Providers | ✅ |
| `/providers` | Provider guides hub | ✅ |
| `/providers/stripe` | Stripe webhook setup, events tablosu, Node.js kod örneği | ✅ |
| `/providers/github` | GitHub webhook setup, events tablosu | ✅ |
| `/providers/shopify` | Shopify webhook setup, events tablosu | ✅ |
| `/alternatives/svix-alternatives` | 4 servis karşılaştırma (HookSniff, Hookdeck, Hook0, Convoy) | ✅ |
| `/alternatives/hookdeck-alternatives` | 5 servis karşılaştırma + pros/cons | ✅ |
| `/alternatives/convoy-alternatives` | 5 servis karşılaştırma | ✅ |

**Güncellenen sayfalar (2 adet):**
| Sayfa | Değişiklik | Durum |
|-------|-----------|-------|
| `/compare` | Sosyal kanıt (3 testimonial), 7 FAQ, "Why it matters" açıklamaları, deep dive links | ✅ |
| Footer | 4 sütunlu SEO yapısı: Product, Compare, Resources, Company | ✅ |

### GitHub Push
- `2116baa` — feat: comprehensive compare page overhaul + 10 new pages
- 13 dosya changed, +1604 satır, -58 satır
- Build: ✅ 0 error, 0 warning

### Toplam
- 83 locale route × 8 dil = 664+ static page
- Build başarılı, GitHub push başarılı

---

## 🟡 YENİ OTURUMDA YAPILACAK

| # | Görev | Öncelik | Not |
|---|-------|---------|-----|
| 1 | **Repo public/private kararı** | 🔴 Kritik | GHA sınırsız dakika |
| 2 | Newsletter → DB taşıma | Yüksek | Neon PostgreSQL |
| 3 | Newsletter → double opt-in email | Yüksek | Gmail API |
| 4 | k6 load test | Orta | Gerçek trafik simülasyonu |
| 5 | Staging ortamı | Orta | GCP'de staging |
| 6 | OpenAPI spec doldurma | Orta | Mevcut spec boş |
| 7 | Terraform provider | Orta | Svix ve Hookdeck'te var |
| 8 | CLI tool | Orta | Svix ve Hookdeck'te var |
| 9 | Rakip logo'ları ekleme | Düşük | Compare sayfası görsel iyileştirme |
| 10 | Pricing calculator | Düşük | Hookdeck'te var (events slider) |

---

## ⚠️ Önemli Notlar

- **Oturumlar 1 saat** — planlı çalış, GitHub push sık yap
- **Hafıza GitHub'da kalıcı** — `.ai-context/`
- **Token rotation** — en acil iş
- **Newsletter API** — şu an in-memory, production'da DB gerekli
- **Build vs Buy sayfası** — Svix'in en güçlü SEO sayfasıydı, artık bizde de var
- **Footer SEO** — Hook0 tarzı 4 sütunlu yapı eklendi
