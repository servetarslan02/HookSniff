# HookSniff — Proje Planı

> Son güncelleme: 2026-06-07
> Oturum süresi: ~1 saat | Sık commit yap, PLAN.md güncelle

---

## Proje Özeti

**HookSniff** — Open-source webhook delivery platform.
- **Backend:** Rust (Axum) — `api/` + `worker/`
- **Frontend:** Next.js 16, React 19, TypeScript — `dashboard/`
- **Veritabanı:** PostgreSQL 16 + Redis
- **Deployment:** Vercel (dashboard) + Google Cloud Run (API/worker)
- **Boyut:** 337 Rust dosyası, 567 TS/TSX dosyası

---

## Mevcut Durum

- ✅ Core webhook delivery sistemi çalışıyor
- ✅ Auth (JWT, 2FA, OAuth, SSO)
- ✅ 11 SDK (Node, Python, Go, Rust, Java, Kotlin, Ruby, PHP, C#, Elixir, Swift)
- ✅ Dashboard 40+ sayfa
- ✅ Cortex AI entegrasyonu
- ✅ Billing (Polar.sh + iyzico)
- ✅ Canlı deployment var

---

## Aktif Görevler

_(Servet'in yönlendirmesine göre buraya eklenecek)_

| # | Görev | Durum | Notlar |
|---|-------|-------|--------|
| - | _(henüz belirlenmedi)_ | - | Servet ne yapmamız gerektiğini söyleyecek |

---

## Tamamlananlar

| Tarih | Görev | PR/Commit |
|-------|-------|-----------|
| 2026-06-07 | Cortex + Security docs + landing page (kod incelemeli) | PR #87 |
| 2026-06-07 | ML Quality boş sayfa fix | PR #87 |
| 2026-06-07 | Repo clone + workspace kurulumu | local |

---

## Çalışma Kuralları

1. **Her değişiklikten sonra commit + push** — oturum kapanırsa iş kaybolmasın
2. **Küçük parçalar halinde çalış** — tek seferde büyük değişiklik yapma
3. **Bu dosyayı güncelle** — kaldığım yeri bileyim
4. **Test et** — değişiklik sonrası build/lint kontrol
5. **Branch stratejisi** — büyük özellikler için ayrı branch, küçük fix'ler için direkt main

---

## Teknik Notlar

- `make local` ile her şeyi başlat (docker compose)
- API: `localhost:3000`, Dashboard: `localhost:3001`
- Dashboard build: `cd dashboard && npm run build`
- Rust build: `cd api && cargo build` veya `cd worker && cargo build`
- Test: `cargo test` (Rust), `npm test` (Dashboard)
