# HookSniff — Yapılacaklar

> Son güncelleme: 2026-05-09

---

## ✅ Tamamlanan Teknik Görevler

26/26 teknik görev tamamlandı. Detaylı liste için `FEATURES.md` ve `CHANGELOG.md`'ye bakın.

---

## 🔄 Devam Eden İşler

| Görev | Durum | Not |
|-------|-------|-----|
| OTLP exporter fix | ✅ | Graceful fallback eklendi, GitHub'a push edildi |
| GitHub docs güncelleme | ✅ | SECURITY, CONTRIBUTING, CHANGELOG, LICENSE, CODE_OF_CONDUCT eklendi |
| Stale referans temizliği | ✅ | HookRelay → HookSniff, X-HookSniff-Signature → Standard Webhooks |

---

## 📋 Servet'in Yapması Gereken

| Görev | Durum | Not |
|-------|-------|-----|
| iyzico hesap aç | ❌ | Vergi levhası + banka hesabı gerekli |
| Domain kararı | ❌ | hooksniff.vercel.app yeterli şimdilik |
| GCP SA key rotate | ⚠️ | Chat'te paylaşıldı, yeni key oluştur |
| GitHub PAT rotate | ⚠️ | Chat'te paylaşıldı, yeni token oluştur |

---

## 🚀 Sonraki Adımlar (Opsiyonel)

### Altyapı
- [ ] GitHub Actions CI'yı aktif et (deploy workflow)
- [ ] Grafana Cloud alert rules kur
- [ ] Cloudflare R2 storage entegrasyonu

### SDK Publish
- [ ] npm `@hooksniff/sdk` publish
- [ ] PyPI `hooksniff` publish
- [ ] crates.io `hooksniff` publish
- [ ] Terraform Registry submit

### Enterprise
- [ ] gRPC delivery implementasyonu
- [ ] SQS delivery implementasyonu
- [ ] SOC 2 hazırlık
- [ ] Integration test coverage artır
