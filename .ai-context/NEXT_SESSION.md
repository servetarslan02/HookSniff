# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 04:11 GMT+8

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

## ✅ SON OTURUM (63) — Yapılan İşler

| Sayfa | Değişiklik | Durum |
|-------|-----------|-------|
| `/playground` | API Access sekmesi, CORS, code examples | ✅ |
| `/changelog` | Entry URL, sidebar nav, image/video, 12/12 rakip eşitliği | ✅ |
| `/newsletter` | Social proof, FAQ, team, category filter, API fix | ✅ |
| Footer | 19 link, 8 dil | ✅ |

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

---

## ⚠️ Önemli Notlar

- **Oturumlar 1 saat** — planlı çalış, GitHub push sık yap
- **Hafıza GitHub'da kalıcı** — `.ai-context/`
- **Token rotation** — en acil iş
- **Newsletter API** — şu an in-memory, production'da DB gerekli
