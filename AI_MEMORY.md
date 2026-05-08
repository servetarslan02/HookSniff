# 🧠 HookSniff — AI Hafıza Dosyası

> Bu dosya, AI asistanın oturumlar arası hafızasıdır.
> Her oturum başında bu dosya okunur, oturum sonunda güncellenir.
> Son güncelleme: 2026-05-08 18:35 GMT+8

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

## 🐛 Tespit Edilen ve Düzeltilen Hatalar (2026-05-08)

### Tüm 15 Madde İşlendi ✅
1. ✅ CI `continue-on-error` kaldırıldı
2. ✅ Dashboard API wrapper token desteği eklendi
3. ✅ Login/register rate limit eklendi (10/15dk login, 5/saat register)
4. ✅ `seen_webhooks` cleanup job eklendi (6 saatte bir)
5. ✅ `idempotency_keys` cleanup job eklendi (6 saatte bir)
6. ✅ Billing `webhook_limit` zaten doğru çalışıyormuş (yanlış tespit)
7. ✅ Admin plan değişikliği: upgrade'de sıfırla, downgrade'de cap
8. ✅ Duplicate `truncate` fonksiyonu birleştirildi
9. ✅ Duplicate `validate_url` fonksiyonu ssrf.rs'e yönlendirildi
10. ✅ Zombie reaper artık orphaned delivery'leri de kurtarıyor
11. ✅ `#[allow(dead_code)]` kaldırıldı
12. ✅ Invoice oluşturma eklendi (SubscriptionCreated + SubscriptionUpdated)
13. ✅ CORS fallback: production'da origin yoksa dashboard'a izin ver
14. ✅ OTEL headers aslında doğru işleniyormuş (yanlış tespit)
15. ✅ Replay protection race condition düzeltildi (atomic INSERT)

Değişen dosyalar: ci.yml, main.rs (api), admin.rs, auth.rs, billing.rs, validation.ts, api.ts, main.rs (worker), idempotency.rs

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
