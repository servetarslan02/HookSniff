# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 21:44 GMT+8

---

## ✅ DEPLOY + TESTLER TAMAM

Her iki servis Cloud Run'da çalışıyor, tüm testler geçiyor:
- **API:** `hooksniff-api-00069-l2s` → Healthy ✅
- **Worker:** `hooksniff-worker-00032-wzv` → Healthy ✅
- **OTEL:** Enabled, Grafana'ya veri akıyor ✅
- **API Tests:** 993/993 ✅ (10 yeni db.rs testi dahil)
- **Worker Tests:** 48/48 ✅
- **Dashboard:** TypeScript 0, ESLint 0 ✅
- **SDK'lar:** 11/11 yayında ✅ (tüm registry'lerde doğrulandı)

## 📋 Sonraki Oturumda Yapılabilecekler

### 🔴 Öncelikli — SDK Kalite Yol Haritası
> Detaylı plan: `.ai-context/sdk/QUALITY_ROADMAP.md`
> Hedef: Svix seviyesine çıkmak (35 oturum planı)

**Sıradaki görev (Aşama 1):**
1. **Node.js `request` → `node-fetch`** — deprecated library değişimi
2. **Node.js wrapper class** — `new HookSniff(key)` → `client.endpoints.create()`
3. **Node.js imza doğrulama** — `verifySignature()` fonksiyonu
4. **Python wrapper class + imza** — aynı kalıp
5. **Go wrapper class + imza** — aynı kalıp

### Servet'in Yapması Gereken
6. **Polar.sh Stripe payout** — identity verification gerekli
7. **Grafana trial** — 20 Mayıs'ta bitiyor (9 gün kaldı), upgrade gerekli

### Lansman Sonrası
8. **Aşama 2:** Serialization, Pagination, User-Agent, Idempotency
9. **Aşama 3:** Unit testler, CHANGELOG, CI/CD, dokümantasyon sitesi

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
