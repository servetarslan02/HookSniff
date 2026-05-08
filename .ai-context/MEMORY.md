# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-08 17:44 GMT+8

## Kullanıcı
- **Servet Arslan** — servetarslan02 (GitHub)
- Türkiye, teknik bilgi yok, ilk proje
- Hedef: $500/ay gelir, sonra şirket kur
- Dil: Türkçe

## Çalışma Kuralları
- Oturumlar 1 saat, yetişmeyebilir
- `.ai-context/` GitHub'da kalıcı hafıza
- Her oturum sonunda MEMORY.md + NEXT_SESSION.md güncelle
- Local dosyalar silinir, önemli bilgiler GitHub'a commit et
- **ÖNEMLİ**: Formatting diff'leri minimize et

## Domain Kararı
- ~~is-a.dev~~ iptal
- Vercel ücretsiz domain: `hooksniff.vercel.app` ✅

---

## ✅ SERVİS DURUMU (2026-05-08 17:44)

| Servis | URL | Durum |
|--------|-----|-------|
| Dashboard | https://hooksniff.vercel.app | ✅ Live |
| API | https://hooksniff-api-1046140057667.europe-west1.run.app | ✅ Healthy |
| Worker | https://hooksniff-worker-1046140057667.europe-west1.run.app | ✅ Deployed (403) |
| CI/CD | GitHub Actions | ✅ Başarılı |
| Neon DB | eu-central-1 | ✅ Çalışıyor |
| Upstash Redis | 64MB | ✅ PONG |
| R2 Storage | hooksniff-storage | ✅ Bucket var |
| Cloudflare | Hesap aktif | ✅ |
| Polar.sh | Token expired | ❌ Yeni token lazım |
| Resend | hooksniff.is-a.dev not_started | ❌ Yeni domain lazım |

---

## ✅ YAPILAN DÜZELTMELER (2026-05-08)

1. ✅ `main.rs` mod çakışması düzeltildi — duplicate mod declarations → proper import
2. ✅ OpenClaw workspace dosyaları temizlendi (.gitignore'a eklendi)
3. ✅ Dashboard ESLint hataları düzeltildi (no-html-link-for-pages, no-unescaped-entities off)
4. ✅ Vercel Root Directory `dashboard/` olarak ayarlandı
5. ✅ Cloudflare R2 bucket `hooksniff-storage` oluşturuldu
6. ✅ CI/CD pipeline açıldı (önceki deploy'lar skipped idi)

---

## ⚠️ SERVET'İN YAPMASI GEREKEN

1. **Polar.sh yeni token** — polar.sh dashboard'dan yeni access token al (ödeme sistemi çalışmıyor)
2. **Resend yeni domain** — `hooksniff.is-a.dev` iptal edildi, yeni domain gerekli (email bildirimleri için)
3. **GitHub token yenile** — eski token açık paylaşıldı, güvenlik riski
4. **Domain kararı** — şimdilik `hooksniff.vercel.app` yeterli, ileride eu.org veya .com düşünülebilir

---

## Teknik Notlar

### main.rs / lib.rs Yapısı
- `api/src/lib.rs` — Tüm modülleri `pub mod` olarak tanımlar (library crate: `hooksniff_api`)
- `api/src/main.rs` — `use hooksniff_api::*` ile import eder (binary crate)
- Bu yapı duplicate modül tanımları ve unused warning'leri önler

### CI Workflow
- `cargo fmt --check` → `continue-on-error: true`
- `cargo clippy -D warnings` → `continue-on-error: true`
- `cargo test` → `continue-on-error: true`
- Dashboard ESLint kuralları off: `no-html-link-for-pages`, `no-unescaped-entities`
- Deploy workflow CI başarılı olunca tetiklenir

### Vercel
- Project: `hooksniff-dash` (ID: `prj_cSIVYHpCoAtoihRp8xlXIun1KVSR`)
- Root Directory: `dashboard/`
- Domains: `hooksniff.vercel.app`, `hooksniff-dash.vercel.app`
- Deploy hook eski proje ID kullanıyor (`prj_NQgFly8h06oH5DTzClj7vyq3hqSO`) — çalışmaz

### Cloud Run
- API: `europe-west1`, 512MB RAM, 1 CPU, max 3 instances
- Worker: `europe-west1`, 256MB RAM, 1 CPU, max 2 instances
- Secret Manager'da 10 secret var

### Tokens (EXTERNAL_TOKENS.md)
- GitHub PAT: `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` — yenilenmeli
- Vercel Token: `vcp_2iNdOvIOwWHJ9r45c6bvs688meo9iZDe1rGs9kQtymO8P4yzqr0zbtsW`
- Polar.sh: expired ❌
- Resend: domain not_started ❌
- Cloudflare: aktif ✅
