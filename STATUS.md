# 🪝 HookSniff — Durum Özeti

> Son güncelleme: 2026-05-08 13:53 GMT+8

---

## URL'ler

| Servis | URL | Durum |
|--------|-----|-------|
| Dashboard | https://hooksniff.vercel.app | ⚠️ Proje ID sorunu |
| API | https://hooksniff-api.onrender.com | ⚠️ Build kuyrukta |
| Worker | https://hooksniff-worker.onrender.com | ✅ Live |

### Domain Planı (Güncel)
- ~~is-a.dev iptal edildi~~
- **Vercel ücretsiz domain**: `hooksniff.vercel.app`
- İleride istenirse: eu.org (ücretsiz) veya .com ($12/yıl)

---

## Altyapı

| Bileşen | Servis | Durum | Not |
|---------|--------|-------|-----|
| Frontend | Vercel | ⚠️ | Proje ID bulunamıyor, token erişemiyor |
| API | Render | ⚠️ | Build kuyrukta, önceki build_failed |
| Worker | Render | ✅ | Live, çalışıyor |
| Database | Neon PostgreSQL | ✅ | Serverless, eu-central-1 |
| Cache | Upstash Redis | ✅ | Serverless, 64MB, eu-central-1 |
| Email | Resend | ❌ | Domain not_started (is-a.dev iptal) |
| Monitoring | Grafana Cloud | ⏳ | OTEL headers hazır |
| Storage | Cloudflare R2 | ❌ | Bucket hiç oluşturulmamış |
| CDN | Cloudflare | ✅ | Hesap aktif |
| Ödeme (Global) | Polar.sh | ❌ | Token expired |
| Ödeme (TR) | iyzico | ❌ | Hesap açılacak |

---

## Dış Servis Durumu (Detaylı — 2026-05-08 13:53)

### ✅ Çalışanlar
- **GitHub**: ✅ Private repo, son push 13:49
- **Neon DB**: ✅ Port 5432 açık, eu-central-1
- **Upstash Redis**: ✅ PONG, 1 key, 64MB max
- **Cloudflare Hesap**: ✅ Servetarslan02@gmail.com
- **Render Worker**: ✅ Live

### ⚠️ Sorunlular
- **Render API**: ⚠️ Build queued (son commit tetikledi). Önceki deploy build_failed
- **Vercel**: ⚠️ Token çalışıyor ama proje ID bulunamıyor. `prj_NQgFly8h06oH5DTzClj7vyq3hqSO` hatalı olabilir

### ❌ Çalışmayanlar
- **Polar.sh**: ❌ Token expired — yeni token lazım
- **Resend**: ❌ Domain `hooksniff.is-a.dev` not_started (is-a.dev iptal, yeni domain gerekli)
- **Cloudflare R2**: ❌ Bucket yok
- **iyzico**: ❌ Hesap açılmamış

---

## Maliyet ($0/ay)

| Servis | Free Tier | Limit |
|--------|-----------|-------|
| Vercel | ✅ | 100GB bant genişliği |
| Render | ✅ | 750 saat/ay ücretsiz |
| Neon | ✅ | 512MB PostgreSQL |
| Upstash | ✅ | 10K komut/gün |
| Resend | ✅ | 100 email/gün |
| Grafana | ✅ | 10K log/ay |
| R2 | ✅ | 10GB depolama |

---

## Rakip Fiyat Karşılaştırması

| Servis | Free Tier | Başlangıç | Orta Plan |
|--------|-----------|-----------|-----------|
| **Svix** | 50/sn, 30 gün ret. | $490/ay | Enterprise özel |
| **Hookdeck** | 10K olay/ay, 3 gün ret. | $39/ay | $499/ay |
| **Convoy** | Self-host ücretsiz | Cloud belirsiz | — |
| **Hook0** | Self-host ücretsiz | Cloud free tier | — |
| **HookSniff** | 1K olay/ay, 7 gün ret. | $49/ay | $149/ay |

---

## Önemli Linkler

- GitHub: https://github.com/servetarslan02/HookSniff
- Vercel Dashboard: https://hooksniff.vercel.app
- Render Dashboard: https://dashboard.render.com
- Neon Console: https://console.neon.tech
- Polar.sh: https://polar.sh (slug: hooksniff)
