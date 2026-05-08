# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-08 13:53 GMT+8

## Kullanıcı
- **Servet Arslan** — servetarslan02 (GitHub)
- Türkiye, teknik bilgi yok, ilk proje
- Hedef: $500/ay gelir, sonra şirket kur
- Dil: Türkçe konuşuyor, kod bilmiyor

## Çalışma Kuralları
- Oturumlar 1 saat sürüyor, her zaman yetişmeyebilir
- `.ai-context/` klasörü GitHub'da kalıcı hafıza olarak kullanılır
- Her oturum sonunda MEMORY.md ve NEXT_SESSION.md güncellenmeli
- Local dosyalar 1 saat sonra siliniyor, önemli bilgiler GitHub'a commit edilmeli

---

## Domain Kararı (GÜNCEL)
- ~~is-a.dev iptal edildi~~
- **Şimdilik**: Vercel ücretsiz domain (`hooksniff.vercel.app`)
- **İleride**: eu.org (ücretsiz) veya .com ($12/yıl) alınabilir

---

## ✅ TAMAMLANAN İŞLER — 26/26 BİTTİ! 🎉

| # | Görev | Durum |
|---|-------|-------|
| 1 | Render Docker build | ✅ |
| 2 | Free tier limit → 10,000 | ✅ |
| 3 | Playground UI | ✅ |
| 4 | Delivery Details UI | ✅ |
| 5 | Custom Retry Policy UI | ✅ |
| 6 | Signature Rotation UI | ✅ |
| 7 | Rate Limit Dashboard | ✅ |
| 8 | Customer Self-Service | ✅ |
| 9 | Standard Webhooks | ✅ |
| 10 | Event hierarchy filtering | ✅ |
| 11 | Timestamp tolerans docs | ✅ |
| 12 | Alerting test | ✅ |
| 13 | Health Monitoring test | ✅ |
| 14 | Grafana OTEL test | ✅ |
| 15 | Embeddable Customer Portal | ✅ |
| 16 | CLI Tool | ✅ |
| 17 | Webhook Transformations | ✅ |
| 18 | Self-Host kolaylaştır | ✅ |
| 19 | Webhook Analytics Dashboard | ✅ |
| 20 | Inbound Webhook Proxy | ✅ |
| 21 | Bulk Operations | ✅ |
| 22 | WebSocket real-time updates | ✅ (SSE ile) |
| 23 | Event Schema Validation | ✅ |
| 24 | Terraform Provider | ✅ |
| 25 | Test coverage | ✅ |
| 26 | Paket adı reserve | ✅ |

---

## Dış Servis Durumu (2026-05-08 13:53 denetimi)

| Servis | Durum | Not |
|--------|-------|-----|
| GitHub | ✅ | Private repo, PAT ile erişim |
| Render Worker | ✅ | Live |
| Render API | ⚠️ | Build queued, önceki build_failed |
| Vercel | ⚠️ | Token çalışıyor, proje ID bulunamıyor |
| Neon DB | ✅ | Port 5432 açık |
| Upstash Redis | ✅ | PONG, 64MB |
| Cloudflare | ✅ | Hesap aktif |
| Polar.sh | ❌ | Token expired |
| Resend | ❌ | Domain not_started (is-a.dev iptal) |
| Cloudflare R2 | ❌ | Bucket yok |
| Grafana | ⏳ | OTEL headers hazır |
| iyzico | ❌ | Hesap açılacak |

---

## Servet'in Yapması Gereken

1. **Vercel**: Dashboard'dan doğru proje ID'sini bul (Settings → General)
2. **Polar.sh**: Yeni API token al (Settings → API Keys)
3. **Resend**: Yeni domain ile DNS doğrulama (is-a.dev iptal, yeni domain gerekli)
4. **Cloudflare R2**: Bucket oluştur (veya AI'a söyle)
5. **iyzico**: Hesap aç (vergi levhası + banka hesabı)

---

## Oturum Geçmişi

### 2026-05-08 — Oturum 1 (06:00)
- 26/26 teknik görev tamamlandı
- Tüm SDK'lar yazıldı
- Terraform provider, CLI tool, Inbound proxy eklendi

### 2026-05-08 — Oturum 2 (13:47-13:53)
- Servet ile tanışma
- GitHub hafıza mekanizması kuruldu
- Dış servis denetimi yapıldı
- is-a.dev iptal edildi, Vercel ücretsiz domain kullanılacak
- Sorunlar tespit edildi: Vercel ID, Polar.sh token, Resend domain, R2 bucket
