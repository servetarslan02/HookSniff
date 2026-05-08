# 🧠 HookSniff — AI Hafıza Dosyası

> Bu dosya, AI asistanın oturumlar arası hafızasıdır.
> Her oturum başında bu dosya okunur, oturum sonunda güncellenir.
> Son güncelleme: 2026-05-08 18:20 GMT+8

---

## 📋 Proje Hakkında

**HookSniff** — Geliştiriciler için güvenilir webhook teslimat servisi.
- Rust (Axum) API + Worker
- Next.js 15 Dashboard
- Neon PostgreSQL + Upstash Redis
- $0/ay maliyet (free tier)

**Repo:** https://github.com/servetarslan02/HookSniff

---

## 👥 Ekip

- **Servet** — Proje sahibi, kod yazmıyor, işin iş tarafıyla ilgileniyor
- **AI Asistan** — Tüm kodlama, teknik işler, deploy, debug

---

## ✅ Tamamlanan İşler

### 2026-05-08
- 26/26 teknik görev tamamlandı
- Tüm servisler deploy edildi (API, Worker, Dashboard)
- CI/CD pipeline çalışıyor
- Tüm SDK'lar hazır (Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift)

---

## 🔴 Servet'in Yapması Gereken (Teknik Değil)

| Görev | Durum | Not |
|-------|-------|-----|
| Polar.sh yeni token al | ❌ Bekliyor | polar.sh dashboard'dan |
| Resend yeni domain | ❌ Bekliyor | is-a.dev iptal, yeni domain gerekli |
| Domain kararı | ❌ Bekliyor | eu.org ücretsiz vs .com $12/yıl |
| iyzico hesap aç | ❌ Bekliyor | Vergi levhası + banka hesabı |

---

## 📌 Sonraki Adımlar (AI Yapabilir)

- npm @hooksniff scope publish
- PyPI hooksniff publish
- crates.io hooksniff publish
- Terraform Registry submit
- Production deploy test
- Dashboard geliştirmeleri
- Monitoring kurulumu (Grafana OTEL)

---

## 🔧 Teknik Notlar

- Cloud Run: europe-west1 region
- Worker 403 hatası normal (health check endpoint yok)
- GitHub Actions: cargo fmt/clippy → continue-on-error
- Neon DB: eu-central-1, 51ms latency

---

## 🐛 Tespit Edilen Hatalar (2026-05-08)

### KRİTİK:
1. Dashboard `api.get/post/put/delete` wrapper'ları token geçirmiyor → korumalı sayfalar çalışmaz
2. CI pipeline'da `continue-on-error: true` → bozuk kod deploy'a geçebilir
3. Login/register endpoint'lerinde rate limit yok → brute-force riski

### ORTA:
4. `seen_webhooks` cleanup fonksiyonu tanımlı ama çağrılmıyor → DB şişer
5. `idempotency_keys` cleanup job'ı yok → DB şişer
6. Billing webhook'ta `webhook_limit` güncellenmiyor (SubscriptionUpdated)
7. Admin plan değişikliği `webhook_count` sıfırlıyor (tutarsızlık)

### DÜŞÜK:
8. `truncate` ve `validate_url` fonksiyonları ikişer yerde tanımlanmış
9. Invoice oluşturma eksik (PaymentSucceeded)
10. Zombie reaper sadece webhook_queue'yu temizliyor, deliveries'ı değil

Detaylı rapor: `BUG_REPORT.md`

---

## 📝 Oturum Geçmişi

### Oturum 1 — 2026-05-08
- İlk tanışma
- GitHub repo bağlantısı kuruldu
- Hafıza dosyası oluşturuldu
- Mevcut proje durumu incelendi
- Tüm servisler kontrol edildi (API ✅, Dashboard ✅, Worker ✅)
- Kapsamlı kod incelemesi yapıldı — 15 sorun tespit edildi
- BUG_REPORT.md GitHub'a yüklendi

---

## ⚠️ Hatırlatmalar

- Servet kod bilmiyor, teknik açıklamaları basit tut
- Her oturum sonunda bu dosyayı GitHub'a push et
- Session 1 saat, işleri buna göre planla
- Servet'in yapması gereken işleri ona hatırlat
