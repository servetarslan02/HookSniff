# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 03:56 GMT+8
> Bu dosya bir sonraki oturumda ne yapılacağını anlatır.

---

## 🔴 ACİL — Servet'in Yapması Gereken

| Görev | Öncelik | Not |
|-------|---------|-----|
| GitHub PAT rotate | 🔴 ACİL | Eski token chat'te paylaşıldı, yeni token oluştur |
| npm token rotate | 🔴 ACİL | Eski token paylaşıldı |
| GCP SA key rotate | 🔴 ACİL | Eski key paylaşıldı |
| Vercel token rotate | 🔴 ACİL | Bu oturumda paylaşıldı |
| Login test | 🔴 | Deploy sonrası dashboard'da dene |
| API deploy (GCP Console) | 🔴 | RateLimiter fix deploy edilmeli |
| iyzico hesap | ❌ | Vergi levhası + banka hesabı |

---

## ✅ SON OTURUMLARDA YAPILANLAR (2026-05-10)

### Oturum 63 — Playground API Access + Changelog v3 (03:17-03:56 GMT+8)

**Playground:**
- ✅ API Access sekmesi (Quick Start, endpoint reference, code examples, Svix comparison)
- ✅ CORS header'ları (3 API route)
- ✅ JSON error feedback, polling optimization, useCallback fix

**Changelog:**
- ✅ Rakip analizi (Svix, Hookdeck, Vercel, Linear, Supabase, PostHog)
- ✅ 12/12 rakip eşitliği sağlandı
- ✅ Ayrı entry URL (`/changelog/v0-5-0`) — SSG, OG meta, prev/next, share buttons
- ✅ Yıl/ay sidebar nav (PostHog tarzı)
- ✅ Görsel/screenshot + video demo desteği
- ✅ Email subscribe, type filtresi, ürün alanı filtresi
- ✅ next/image optimizasyonu (0 warning)

**Footer + i18n:**
- ✅ `/blog` ve `/what-is-a-webhook` linkleri eklendi (19 link)
- ✅ 8 dil desteği

---

## 🟡 YENİ OTURUMDA YAPILACAK

### Teknik Görevler

| # | Görev | Öncelik | Not |
|---|-------|---------|-----|
| 1 | **Repo public/private kararı** | 🔴 Kritik | GHA sınırsız dakika vs kod gizliliği |
| 2 | API deploy sonrası test | Yüksek | Login, register, webhook akışı |
| 3 | k6 load test çalıştırma | Orta | Gerçek trafik simülasyonu |
| 4 | Staging ortamı kurulumu | Orta | GCP'de staging environment |
| 5 | OpenAPI spec doldurma | Orta | Mevcut spec boş |
| 6 | Eski domain referansları temizliği | Düşük | 107 eski referans |

---

## 📋 Dosya Yapısı (Güncel)

```
.ai-context/
├── MEMORY.md                    ✅ Güncel
├── NEXT_SESSION.md              ✅ Bu dosya
├── ONBOARDING.md                ✅
├── README.md                    ✅
├── 2026-05-10.md                ✅
├── 2026-05-10-playground-api.md ✅
├── 2026-05-09.md                ✅
├── 2026-05-08.md                ✅
├── audit/                       ✅ Denetim raporları
├── code-review/                 ✅ Kod analizleri
├── logs/                        ✅ Oturum logları
├── market/                      ✅ Pazar araştırmaları
├── mobile/                      ✅ Mobil planlar
├── sdk/                         ✅ SDK rehberleri
└── strategy/                    ✅ 31/31 strateji raporu (~290KB+)
```

---

## ⚠️ Önemli Notlar

- **Oturumlar 1 saat sürüyor** — planlı çalış, GitHub push sık yap
- **Hafıza GitHub'da kalıcı** — `.ai-context/` klasörü
- **Her oturum sonunda** — NEXT_SESSION.md + MEMORY.md güncelle
- **Fiyat: $29/$99** — $49/$149 değil (Servet kararı)
- **Token rotation** — Servet'in yapması gereken en acil iş
