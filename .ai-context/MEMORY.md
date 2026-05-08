# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-08 14:43 GMT+8

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

## Domain Kararı
- ~~is-a.dev~~ iptal
- Şimdilik: `hooksniff.vercel.app` (Vercel ücretsiz)

## KRİTİK GÖREV: API Taşıma
- **Render API build_failed** — Rust compile hataları düzeltilemedi
- **Çözüm**: API'yi Google Cloud Run'a taşı
- GCP service account `.ai-context/gcp-service-account.json` dosyasında
- Proje: hooksniff-app, bölge: europe-west1
- Dockerfile.api zaten hazır

## ✅ Tamamlanan İşler (26/26 + düzeltmeler)
- 26/26 teknik görev tamamlandı
- Bu oturumda: struct field düzeltmeleri, Provider Display impl, Vercel ID fix
- Tüm değişiklikler push edildi

## Dış Servis Durumu

| Servis | Durum | Not |
|--------|-------|-----|
| GitHub | ✅ | Private repo |
| Render Worker | ✅ | Live |
| Render API | ❌ | Build failed → Cloud Run'a taşınacak |
| Vercel | ✅ | prj_cSIVYHpCoAtoihRp8xlXIun1KVSR |
| Neon DB | ✅ | eu-central-1 |
| Upstash Redis | ✅ | 64MB |
| Cloudflare | ✅ | Hesap aktif |
| Polar.sh | ❌ | Token expired |
| Resend | ❌ | Domain not_started |
| R2 | ❌ | Bucket yok |

## Servet'in Yapması Gereken
1. Polar.sh yeni token al
2. Domain kararı (eu.org veya .com)
3. Resend domain doğrulama
4. iyzico hesap aç
