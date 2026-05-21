# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-21 16:15 GMT+8 (Session 2)

## ✅ Bu Oturumda Yapılan İşler (Session 2)

1. **Proje inceleme** — Tüm hafıza dosyaları okundu, durum analizi
2. **Bug taraması** — 29 bug kontrol edildi, çoğu zaten düzeltilmiş
3. **BUG-028 fix** — `sso.rs` pagination limit `.min(100)` → `.min(200)`
4. **Dashboard build** — `npm install` + `next build` başarılı, 0 hata
5. **REAL-BUGS.md güncellendi** — BUG-004, 020, 021, 028 düzeltildi olarak işaretlendi

## 🔴 KRİTİK: Deploy Gerekli

Birçok fix push edildi ama Cloud Run eski kodu çalışıyor:

### Deploy Komutları
```bash
# GCP Console'dan tetikle:
# https://console.cloud.google.com/cloud-build/triggers?project=hooksniff-app

# VEYA gcloud CLI:
gcloud builds submit --config cloudbuild.yaml
```

## 📋 Açık Kalan Bug'lar (REAL-BUGS.md)

| Bug | Öncelik | Açıklama |
|-----|---------|----------|
| BUG-002 | 🟡 | CORS health endpoint hardcoded |
| BUG-006 | 🟡 | Contact form rate limit sadece IP bazlı |
| BUG-008 | 🟡 | Outbound IP'ler statik (Cloud Run'da değişebilir) |
| BUG-009 | 🟢 | SELECT * — coupons tablosunda |
| BUG-010 | 🟢 | Error context eksik |
| BUG-011 | 🟢 | Test secret'ları production code'da |
| BUG-022 | 🟡 | CSP unsafe-inline + unsafe-eval |
| BUG-024 | 🟡 | Webhook retry state in-memory |
| BUG-025 | 🟢 | Events endpoint SELECT * |
| BUG-029 | 🟢 | deny_unknown_fields kullanılmıyor |

## 📋 Önerilen Sonraki Adımlar

### Kısa Vadeli (1-2 oturum)
1. **Deploy** — Cloud Build tetikle (GCP erişimi gerek)
2. **Alert Evaluation Worker** — Item 254, `alert_rules` tablosu var ama worker yok
3. **BUG-022** — CSP nonce-based'e çevir (XSS koruması)

### Orta Vadeli (3-5 oturum)
4. **Application Modeli** — Multi-tenant Organization → Application hiyerarşisi
5. **Public Webhook Tester** — play.hooksniff.com (signup gerektirmez)
6. **Two-Phase Retry** — Hızlı + yavaş faz

### Uzun Vadeli
7. **Documentation Overhaul** — Diataxis metodu
8. **Status Page** — Public uptime monitoring
9. **SOC 2 hazırlık**

## 🔧 Teknik Notlar

- Dashboard build: `cd dashboard && npm install && npx next build` ✅
- Git config: `user.email = servetarslan02@gmail.com`, `user.name = servetarslan02`
- `ai@hooksniff.dev` KULLANMA — Vercel BLOCKED deploy yapıyor
- 11 SDK hepsi ayrı repolarda, ana repo'da `sdks/` klasörü yok
- Neon DB: 77+ migration uygulanmış
- Upstash Redis: 500K limit dolu olabilir
