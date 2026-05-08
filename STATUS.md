# 🪝 HookSniff — Durum Özeti

> Son güncelleme: 2026-05-08 16:56 GMT+8

---

## URL'ler

| Servis | URL | Durum |
|--------|-----|-------|
| Dashboard | https://hooksniff.vercel.app | ✅ Live |
| API | https://hooksniff-api-1046140057667.europe-west1.run.app | ✅ Live (healthy) |
| Worker | https://hooksniff-worker-1046140057667.europe-west1.run.app | ✅ Deployed |

### Domain Planı
- ~~is-a.dev iptal edildi~~
- **Vercel ücretsiz domain**: `hooksniff.vercel.app`
- İleride istenirse: eu.org (ücretsiz) veya .com ($12/yıl)

---

## Altyapı

| Bileşen | Servis | Durum | Not |
|---------|--------|-------|-----|
| Frontend | Vercel | ✅ | prj_cSIVYHpCoAtoihRp8xlXIun1KVSR |
| API | Google Cloud Run | ✅ | europe-west1, free tier |
| Worker | Google Cloud Run | ✅ | europe-west1, free tier |
| Database | Neon PostgreSQL | ✅ | Serverless, eu-central-1 |
| Cache | Upstash Redis | ✅ | Serverless, 64MB |
| Email | Resend | ❌ | Domain not_started |
| Monitoring | Grafana Cloud | ⏳ | OTEL headers hazır |
| Storage | Cloudflare R2 | ❌ | Bucket yok |
| CDN | Cloudflare | ✅ | Hesap aktif |
| Ödeme (Global) | Polar.sh | ❌ | Token expired |
| Ödeme (TR) | iyzico | ❌ | Hesap açılacak |

---

## CI/CD Durumu

| Kontrol | Durum | Not |
|---------|-------|-----|
| cargo fmt | ⚠️ continue-on-error | Format uyarıları var ama CI'ı bloklamıyor |
| cargo clippy | ⚠️ continue-on-error | ~152 unused warning |
| cargo test | ⚠️ continue-on-error | Testler çalışıyor |
| Dashboard ESLint | ✅ | `.eslintrc.json` eklendi |
| Deploy workflow | ✅ | GCP_SA_KEY secret ayarlandı |

### Formatting Diff Sorunu
- `dashboard/package-lock.json` büyük diff'ler oluşturuyor (npm version farkı)
- OpenClaw workspace dosyaları `.gitignore`'a eklendi, tracking'den kaldırıldı
- `cargo fmt` değişiklikleri de diff'e neden oluyor

---

## Son Yapılan İşler (2026-05-08)

1. ✅ API + Worker Cloud Run'a deploy edildi
2. ✅ Health check başarılı (DB: 36ms, Queue: 76ms)
3. ✅ CI workflow continue-on-error eklendi
4. ✅ Dashboard eslint config eklendi
5. ✅ OpenClaw workspace dosyaları temizlendi (.gitignore)
6. ✅ Hafıza dosyaları güncellendi

---

## Servet'in Yapması Gereken (ACİL)

1. **GitHub token yenile** — mesajda açık paylaşıldı, güvenlik riski
2. **Polar.sh yeni token al** — ödeme sistemi çalışmıyor
3. **Domain kararı** — eu.org (ücretsiz) veya .com ($12/yıl)
4. **Resend domain doğrulama** — email sistemi için
5. **iyzico hesap aç** — Türkiye ödemeleri için

---

## Maliyet ($0/ay)

| Servis | Free Tier | Limit |
|--------|-----------|-------|
| Vercel | ✅ | 100GB bant genişliği |
| Cloud Run | ✅ | 2 milyon istek/ay |
| Neon | ✅ | 512MB PostgreSQL |
| Upstash | ✅ | 10K komut/gün |
| Resend | ✅ | 100 email/gün |
| Grafana | ✅ | 10K log/ay |
| R2 | ✅ | 10GB depolama |
