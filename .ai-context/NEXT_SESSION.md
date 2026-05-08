# NEXT_SESSION.md — Sonraki Oturum

> Son güncelleme: 2026-05-08 17:44 GMT+8

## Yeni Oturumda Ne Söyle

HookSniff projesi tamamen çalışıyor. Dashboard, API, Worker, CI/CD hepsi live.
Şimdi feature geliştirme ve eksik servislerin tamamlanması zamanı.

---

## ✅ Mevcut Durum (Her Şey Çalışıyor)

- Dashboard: https://hooksniff.vercel.app ✅
- API: https://hooksniff-api-1046140057667.europe-west1.run.app ✅ (healthy)
- CI/CD: GitHub Actions ✅ (success)
- R2 Storage: `hooksniff-storage` ✅

---

## Öncelik 1: Servet'in Yapması Gereken (Bekliyoruz)

1. **Polar.sh yeni token** — polar.sh dashboard → Settings → Access Tokens → yeni token
2. **Resend yeni domain** — resend.com dashboard → yeni domain ekle (is-a.dev iptal)
3. **GitHub token yenile** — github.com → Settings → Developer Settings → PAT → eskiyi sil, yenisini oluştur

## Öncelik 2: Feature Geliştirme

### Dashboard
- Login/Register sayfası çalışıyor mu? Test et
- Dashboard sayfalarında gerçek veri gösterimi (API'ye bağla)
- Endpoint oluşturma/webhook gönderme akışı test et

### Billing (Polar.sh token gelince)
- Polar.sh entegrasyonu aktifleştir
- Free/Pro/Business plan gösterimi
- Checkout flow

### Email (Resend domain gelince)
- Email bildirimleri (webhook failure alerts)
- Hoşgeldin emaili

### Storage (R2)
- R2'ye dosya yükleme/okuma entegrasyonu
- Webhook payload arşivleme

### Monitoring
- Grafana Cloud kurulumu (OTEL headers hazır)
- Dashboard'da metrics gösterimi

## Öncelik 3: İyileştirmeler

- WebSocket real-time delivery
- SDK'ları test et (Node, Python, Go)
- API dokümantasyonu (OpenAPI)
- Load testing (k6)
- Rate limiting fine-tune

---

## Teknik Hatırlatmalar

- `api/src/main.rs` → `use hooksniff_api::*` kullanır (lib.rs'den import)
- Dashboard ESLint: `no-html-link-for-pages` ve `no-unescaped-entities` off
- Vercel Root Directory: `dashboard/`
- Deploy hook eski proje ID kullanıyor — API ile deploy tetikle

## Hafıza Kuralları
Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. `git add -A && git commit && git push origin main`
4. **Gereksiz dosyaları commit etme**
