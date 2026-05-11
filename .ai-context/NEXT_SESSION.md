# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 19:59 GMT+8

---

## ✅ DEPLOY SORUNLARI ÇÖZÜLDÜ!

Her iki servis Cloud Run'da çalışıyor:
- **API:** `hooksniff-api-00069-l2s` → Healthy ✅
- **Worker:** `hooksniff-worker-00032-wzv` → Healthy ✅
- **OTEL:** Enabled, Grafana'ya veri akıyor ✅

## 📋 Sonraki Oturumda Yapılabilecekler

1. **Grafana'da OTEL verilerini kontrol et** — metrics, logs, traces gelmiş olmalı
2. **API endpoint'lerini test et** — register, login, webhook delivery
3. **SDK publish** — npm, PyPI, crates.io'ya publish (Servet'in registry erişimi gerek)
4. **Polar.sh Stripe payout** — Servet'in yapması gereken (identity verification)
5. **Grafana trial** — 20 Mayıs'ta bitiyor (9 gün kaldı), upgrade gerekli

## 🔧 Build Hatası Özeti (Gelecek Referans)

| Hata | Kök Neden | Fix |
|------|-----------|-----|
| `CryptoProvider` panic (exit 101) | rustls 0.23+ hem aws-lc-rs hem ring compiled | `main.rs`'e `install_default()` ekle |
| `GLIBC_2.38 not found` | `rust:slim` = 1.97/trixie, runtime = bookworm | `rust:1.95-bookworm` ile pinle |

## ⚠️ Dikkat Edilecekler
- Cloud Build SA key `/tmp/gcp-sa.json` oturum sonunda silinir
- GitHub PAT: Servet'in verdiği token (scope: repo)
- GCloud kurulumu: `/tmp/google-cloud-sdk/`
