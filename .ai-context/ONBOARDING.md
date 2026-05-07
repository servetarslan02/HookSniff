# 🪝 HookSniff — Yeni Oturum Rehberi

> Bu dosya GitHub'da saklanır. Her yeni oturumda ilk olarak bunu oku.

---

## 👥 Biz Kimiz?

- **Servet Arslan** — Proje sahibi, kod bilmiyor, Türkiye
- **AI Agent** — Tüm teknik işlerden sorumlu (Rust, Next.js, DevOps)

## 🪝 Proje: HookSniff

Webhook delivery servisi. Geliştiricilere yönelik.
- Gönder, teslim edelim. Başarısız olursa tekrar deneyelim.
- Rakipler: Svix ($490/ay), Hookdeck ($39/ay)
- Hedef: $500/ay gelir → şirket kur

## 🧠 Hafıza Sistemi (ÇOK ÖNEMLİ)

**Sorun:** Yerel dosyalar 1 saat sonra siliniyor.
**Çözüm:** Tüm hafıza GitHub'da tutuluyor.

### Her yeni oturumda:
1. `git pull origin main` — GitHub'dan en son hafızayı çek
2. Bu dosyayı oku (`.ai-context/ONBOARDING.md`)
3. `.ai-context/EXTERNAL_TOKENS.md` — tüm token'lar burada
4. `MEMORY.md` — proje durumu
5. `TODO.md` — yapılacaklar
6. `SESSION_NOTES.md` — son oturum notları
7. `CONTEXT.md` — detaylı proje bağlamı

### Her 8 dakikada:
- Cron job otomatik olarak hafıza dosyalarını GitHub'a push eder
- Değişiklik varsa commit + push, yoksa pull yapar

### Hafıza dosyaları (GitHub'da):
```
MEMORY.md              → Genel hafıza, son durum
CONTEXT.md             → Detaylı proje bağlamı, mimari
TODO.md                → Yapılacaklar listesi
SESSION_NOTES.md       → Son oturum notları
.ai-context/
  ONBOARDING.md        → Bu dosya (yeni oturum rehberi)
  EXTERNAL_TOKENS.md   → Tüm API token'ları
  MEMORY.md            → AI hafıza dosyası
  NEXT_SESSION.md      → Sonraki oturum yapılacaklar
```

## 🔑 Token ve Servisler

Tüm token'lar `.ai-context/EXTERNAL_TOKENS.md` dosyasında.

| Servis | Durum | Ne işe yarar |
|--------|-------|-------------|
| **Neon** | ✅ Hazır | PostgreSQL veritabanı |
| **Upstash** | ✅ Hazır | Redis (rate limiting) |
| **Vercel** | ✅ Çalışıyor | Dashboard hosting |
| **Polar.sh** | ✅ Hazır | Ödeme (global) |
| **Cloudflare R2** | ✅ Hazır | Dosya depolama |
| **Grafana Cloud** | ✅ Hazır | Monitoring |
| **Resend** | ⚠️ Domain yok | Email gönderimi |
| **Render** | ⚠️ Build fail | Alternatif hosting |
| **Google Cloud** | ❌ Deploy yok | Ana hosting hedefi |

## 🏗️ Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| API | Rust + Axum (port 3000) |
| Worker | Rust (background webhook delivery) |
| Dashboard | Next.js 15 (Vercel'de) |
| Veritabanı | PostgreSQL (Neon, serverless) |
| Cache | Redis (Upstash, serverless) |
| Hosting | Google Cloud Run (deploy edilecek) |
| CDN | Cloudflare |
| Monitoring | Grafana Cloud (OpenTelemetry) |

## 📁 Proje Yapısı

```
HookSniff/
├── api/                 → Rust API sunucusu
│   ├── src/
│   │   ├── main.rs      → Ana giriş noktası
│   │   ├── routes/      → API endpoint'leri
│   │   ├── billing/     → Polar.sh, iyzico, Stripe
│   │   ├── auth/        → JWT + API key doğrulama
│   │   └── ...
│   └── Cargo.toml
├── worker/              → Background webhook delivery
├── dashboard/           → Next.js 15 frontend (Vercel)
├── deploy/              → Deploy scriptleri + Dockerfile'lar
│   ├── gcp-deploy.sh    → Google Cloud Run deploy scripti
│   ├── Dockerfile.api.prod
│   └── Dockerfile.worker.prod
├── sdks/                → 10+ dilde SDK (Node, Python, Go, Java...)
├── migrations/          → PostgreSQL migration'ları
├── .ai-context/         → AI hafıza dosyaları
├── Dockerfile.api       → API Docker build
├── Dockerfile.worker    → Worker Docker build
├── docker-compose.yml   → Lokal geliştirme
├── render.yaml          → Render blueprint
└── .env.production      → Production config (gitignore'da!)
```

## ⚠️ Kritik Kurallar

### 1. Güvenlik
- `.env.production` **asla** GitHub'a push etme (gitignore'da)
- Token'lar sadece `.ai-context/EXTERNAL_TOKENS.md`'de tutulur
- Tüm token'lar chat'te ifşa oldu → deploy sonrası **yenilenmeli**

### 2. TLS
- Tüm TLS bağımlılıkları **rustls** kullanır (OpenSSL yok)
- `reqwest`: `default-features = false, features = ["json", "rustls-tls"]`
- `redis`: `default-features = false, features = ["tokio-comp", "connection-manager", "tls-rustls"]`
- `sqlx`: `features = ["tls-rustls"]`

### 3. Deploy
- **Dashboard:** Vercel'de (otomatik deploy, GitHub push'ta)
- **API + Worker:** Google Cloud Run (deploy/gcp-deploy.sh)
- **Render:** Alternatif, Docker build düzeltildi ama henüz deploy edilmedi

### 4. Domain
- `hooksniff.is-a.dev` — is-a.dev PR'ı beklemede
- `api.hooksniff.is-a.dev` — Cloudflare DNS CNAME gerekiyor

## 🔴 Şu Anki Bloklar

1. **GCP Deploy** — `gcloud` CLI kurulup `deploy/gcp-deploy.sh` çalıştırılmalı
2. **Cloudflare DNS** — API deploy olduktan sonra CNAME kaydı
3. **Resend Domain** — hooksniff.is-a.dev doğrulanmalı
4. **Credential Revokasyonu** — Tüm token'lar yenilenmeli

## 💡 Hızlı Başlangıç

Yeni oturumda yapman gereken:

```
1. git pull origin main
2. .ai-context/ONBOARDING.md oku (bu dosya)
3. .ai-context/EXTERNAL_TOKENS.md oku (token'lar)
4. MEMORY.md oku (son durum)
5. TODO.md oku (yapılacaklar)
6. Kaldığın yerden devam et
```

---

> 💡 Bu dosyayı her önemli değişiklikte güncelle.
> Son güncelleme: 2026-05-08
