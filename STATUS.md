# 🪝 HookSniff — Durum Özeti

> Son güncelleme: 2026-05-08 06:00

---

## URL'ler

| Servis | URL | Durum |
|--------|-----|-------|
| Dashboard | https://hooksniff.vercel.app | ✅ Çalışıyor |
| API | GCP Cloud Run | ✅ Çalışıyor |
| Worker | GCP Cloud Run | ✅ Çalışıyor |

### Domain Alınca
| Servis | Hedef URL | Yönlendirme |
|--------|-----------|-------------|
| Dashboard | `hooksniff.eu.org` veya `hooksniff.com` | Vercel |
| API | `api.hooksniff.eu.org` veya `api.hooksniff.com` | Cloud Run |

---

## Altyapı

| Bileşen | Servis | Durum | Not |
|---------|--------|-------|-----|
| Frontend | Vercel | ✅ | Next.js dashboard |
| API | Google Cloud Run | ✅ | Rust (Axum) |
| Worker | Google Cloud Run | ✅ | Webhook delivery |
| Database | Neon PostgreSQL | ✅ | Serverless, ücretsiz |
| Cache | Upstash Redis | ✅ | Serverless, ücretsiz |
| Email | Resend | ⏳ | Domain doğrulama bekliyor |
| Monitoring | Grafana Cloud | ⏳ | OTEL headers hazır |
| Storage | Cloudflare R2 | ✅ | Token hazır |
| CDN | Cloudflare | ⏳ | Domain bekliyor |
| Ödeme (Global) | Polar.sh | ✅ | Pro $49 / Business $149 |
| Ödeme (TR) | iyzico | ❌ | Hesap açılacak |

---

## Maliyet ($0/ay)

| Servis | Free Tier | Limit |
|--------|-----------|-------|
| Vercel | ✅ | 100GB bant genişliği |
| Cloud Run | ✅ | 2M istek/ay |
| Neon | ✅ | 512MB PostgreSQL |
| Upstash | ✅ | 10K komut/gün |
| Resend | ✅ | 100 email/gün |
| Grafana | ✅ | 10K log/ay |
| R2 | ✅ | 10GB depolama |

---

## Domain Planı

### Seçenek A: eu.org (Ücretsiz)
- [ ] https://nic.eu.org/arf/en/ adresinden kayıt ol
- [ ] `hooksniff.eu.org` için başvur
- [ ] Nameserver: `ns1.cloudflare.com` / `ns2.cloudflare.com`
- [ ] Onay beklenir (1-2 gün)
- [ ] Onaylanınca Cloudflare DNS kurulur
- [ ] Cloud Run custom domain mapping yapılır

### Seçenek B: .com Domain ($12/yıl)
- [ ] Cloudflare Registrar'dan `hooksniff.com` al
- [ ] DNS otomatik kurulur
- [ ] Cloud Run custom domain mapping yapılır

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
- GCP Console: https://console.cloud.google.com/run?project=hooksniff-app
- Neon Console: https://console.neon.tech
- Polar.sh: https://polar.sh (slug: hooksniff)
