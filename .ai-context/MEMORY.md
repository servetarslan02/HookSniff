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

## KRİTİK GÖREV: API Taşıma (TAMAMLANDI ✅)
- **Render API build_failed** → Cloud Run'a taşındı
- **API**: https://hooksniff-api-1046140057667.europe-west1.run.app ✅ Live
- **Worker**: https://hooksniff-worker-1046140057667.europe-west1.run.app ✅ Live
- Health check: database ✅ queue ✅
- GCP secret manager'da 10 secret oluşturuldu
- Deploy workflow güncellendi, GitHub push edildi
- Compile hatası düzeltildi: serde_json::Error → AppError conversion eklendi

## ✅ Tamamlanan İşler (26/26 + düzeltmeler)
- 26/26 teknik görev tamamlandı
- Bu oturumda: struct field düzeltmeleri, Provider Display impl, Vercel ID fix
- Tüm değişiklikler push edildi

## Dış Servis Durumu

| Servis | Durum | Not |
|--------|-------|-----|
| GitHub | ✅ | Private repo |
| Cloud Run API | ✅ | hooksniff-api-1046140057667.europe-west1.run.app |
| Cloud Run Worker | ✅ | hooksniff-worker-1046140057667.europe-west1.run.app |
| Render API | ❌ | Artık kullanılmıyor → Cloud Run'a taşındı |
| Render Worker | ❌ | Artık kullanılmıyor → Cloud Run'a taşındı |
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
