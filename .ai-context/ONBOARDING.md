# 🪝 HookSniff — Yeni Oturum Rehberi

> Her yeni oturumda ilk olarak bunu oku.

---

## Biz Kimiz?

- **Servet Arslan** — Proje sahibi, kod bilmiyor, Türkiye
- **AI Agent** — Tüm teknik işlerden sorumlu (Rust, Next.js, DevOps)

## Proje: HookSniff

Webhook delivery servisi. Geliştiricilere yönelik.
- Gönder, teslim edelim. Başarısız olursa tekrar deneyelim.
- Rakipler: Svix ($490/ay), Hookdeck ($39/ay), Convoy, Hook0
- Hedef: $500/ay gelir → şirket kur

## Hafıza Sistemi

Tüm hafıza `.ai-context/` klasöründe tutuluyor.

### Her yeni oturumda:
1. `git pull origin main`
2. Bu dosyayı oku (`.ai-context/ONBOARDING.md`)
3. `.ai-context/EXTERNAL_TOKENS.md` — tüm token'lar burada
4. `.ai-context/MEMORY.md` — proje durumu
5. `TODO.md` — yapılacaklar (root)
6. `.ai-context/NEXT_SESSION.md` — sıradaki işler
7. Kaldığın yerden devam et

### Hafıza dosyaları:
```
.ai-context/
  ONBOARDING.md        → Bu dosya (yeni oturum rehberi)
  MEMORY.md            → Proje durumu, mimari, kritik bilgiler
  NEXT_SESSION.md      → Sıradaki işler
  EXTERNAL_TOKENS.md   → Tüm API token'ları
  SDK_STRATEGY.md      → SDK bakım ve güvenlik planı (6 aktif, 5 pasif)
  SDK_AUDIT.md         → SDK denetim raporu (5 hata + eksikler)
  2026-05-08.md        → Oturum logları
  README.md            → Klasör açıklaması

TODO.md                → Yapılacaklar listesi (root, birleştirilmiş)
FEATURES.md            → Feature tracker (root)
STATUS.md              → Genel durum özeti (root)
```

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| API | Rust + Axum (port 3000) |
| Worker | Rust (background webhook delivery) |
| Dashboard | Next.js 15 (Vercel'de) |
| Veritabanı | PostgreSQL (Neon, serverless) |
| Cache | Redis (Upstash, serverless) |
| Hosting | Google Cloud Run (API + Worker) |
| CDN | Cloudflare |
| Monitoring | Grafana Cloud (OpenTelemetry) |
| Ödeme | Polar.sh (global) + iyzico (TR) |
| Email | Resend |

## Servis Durumları

| Servis | Durum | URL |
|--------|-------|-----|
| Dashboard | ✅ Çalışıyor | https://hooksniff.vercel.app |
| API | ✅ Çalışıyor | GCP Cloud Run |
| Worker | ✅ Çalışıyor | GCP Cloud Run |
| Neon DB | ✅ Aktif | Serverless PostgreSQL |
| Upstash Redis | ✅ Aktif | Serverless Redis |
| Polar.sh | ✅ Aktif | Pro $49, Business $149 |
| Resend | ⚠️ Domain doğrulanacak | API key var |
| Grafana Cloud | ⚠️ Test edilecek | Hesap var |
| Cloudflare R2 | ✅ Hazır | 10GB depolama |
| iyzico | ❌ Hesap açılacak | TR ödemeler |

## Domain Planı

- **Seçenek A:** eu.org (ücretsiz) — https://nic.eu.org/arf/en/ adresinden `hooksniff.eu.org` başvurusu
- **Seçenek B:** .com domain ($12/yıl) — Cloudflare Registrar'dan `hooksniff.com`
- Domain gelince: Cloudflare DNS kur → Cloud Run custom domain mapping → Resend domain doğrulama

## Kritik Kurallar

### Güvenlik
- `.env.production` asla GitHub'a push etme (gitignore'da)
- Token'lar sadece `.ai-context/EXTERNAL_TOKENS.md`'de tutulur

### TLS
- Tüm TLS bağımlılıkları rustls kullanır (OpenSSL yok)
- `reqwest`: `default-features = false, features = ["json", "rustls-tls"]`
- `redis`: `default-features = false, features = ["tokio-comp", "connection-manager", "tls-rustls"]`
- `sqlx`: `features = ["tls-rustls"]`

### Deploy
- Dashboard: Vercel (otomatik, GitHub push'ta)
- API + Worker: Google Cloud Run

## Proje Yapısı

```
HookSniff/
├── api/                 → Rust API sunucusu (Axum)
│   ├── src/routes/      → API endpoint'leri
│   ├── src/billing/     → Polar.sh, iyzico, Stripe
│   └── src/throttle/    → Rate limiting
├── worker/              → Background webhook delivery
│   └── src/delivery/    → HTTP, gRPC, SQS, WebSocket
├── dashboard/           → Next.js 15 frontend (Vercel)
├── sdks/                → 11 dilde SDK
├── portal/              → Embeddable customer portal
├── cli/                 → CLI tool
├── docs/                → OpenAPI spec + dokümantasyon
├── deploy/              → Deploy scriptleri + Dockerfile'lar
├── .ai-context/         → AI hafıza dosyaları
├── TODO.md              → Yapılacaklar (birleştirilmiş)
├── FEATURES.md          → Feature tracker
└── STATUS.md            → Genel durum
```

---

> Son güncelleme: 2026-05-08
