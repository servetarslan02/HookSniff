# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 20:20 GMT+8

---

## ✅ DEPLOY + TESTLER TAMAM

Her iki servis Cloud Run'da çalışıyor, tüm testler geçiyor:
- **API:** `hooksniff-api-00069-l2s` → Healthy ✅
- **Worker:** `hooksniff-worker-00032-wzv` → Healthy ✅
- **OTEL:** Enabled, Grafana'ya veri akıyor ✅
- **API Tests:** 993/993 ✅ (10 yeni db.rs testi dahil)
- **Worker Tests:** 48/48 ✅
- **Dashboard:** TypeScript 0, ESLint 0 ✅

## 📋 Sonraki Oturumda Yapılabilecekler

### Öncelikli
1. **Grafana'da OTEL verilerini kontrol et** — metrics, logs, traces gelmiş olmalı
2. **API endpoint'lerini test et** — register, login, webhook delivery (canlı ortamda)
3. **HS-082: SDK version mismatch** — Kotlin 0.2.0 vs 0.3.0 kontrol et

### Servet'in Yapması Gereken
4. **Polar.sh Stripe payout** — identity verification gerekli
5. **Grafana trial** — 20 Mayıs'ta bitiyor (9 gün kaldı), upgrade gerekli
6. **SDK publish** — npm, PyPI, crates.io'ya publish (registry erişimi gerek)

### Lansman Sonrası
7. **HS-090: SDK otomatik güncelleme sistemi** — detaylı araştırma gerekli

## 🔧 Build Hatası Özeti (Gelecek Referans)

| Hata | Kök Neden | Fix |
|------|-----------|-----|
| `CryptoProvider` panic (exit 101) | rustls 0.23+ hem aws-lc-rs hem ring compiled | `main.rs`'e `install_default()` ekle |
| `GLIBC_2.38 not found` | `rust:slim` = 1.97/trixie, runtime = bookworm | `rust:1.95-bookworm` ile pinle |

## ⚠️ Dikkat Edilecekler
- Cloud Build SA key `/tmp/gcp-sa.json` oturum sonunda silinir
- GitHub PAT: `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` (scope: repo)
- GCloud kurulumu: `/tmp/google-cloud-sdk/`
- **db.rs integration testleri:** `DATABASE_URL` env var + `cargo test -- --ignored` ile çalışır
