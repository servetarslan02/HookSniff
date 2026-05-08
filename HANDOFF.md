# 🔄 Oturum El Değiştirme Dokümanı

> Son oturum: 2026-05-08 18:56 GMT+8
> Bu dosya: Yeni oturumun ihtiyaç duyduğu her şeyi içerir

---

## 📌 Proje Bilgileri

- **Repo:** https://github.com/servetarslan02/HookSniff
- **AI Hafıza Dosyası:** `AI_MEMORY.md` (repo kökünde)
- **Bug Raporu:** `BUG_REPORT.md` (repo kökünde)
- **Platform:** Rust (Axum) API + Worker, Next.js Dashboard

---

## ✅ Yapılan İşler (Bu Oturum)

### Düzeltilen 13 Sorun:
1. CI `continue-on-error` kaldırıldı
2. Dashboard API token wrapper düzeltildi
3. Login rate limit eklendi (10/15dk, 5/saat register)
4. `seen_webhooks` cleanup job eklendi (6 saatte bir)
5. `idempotency_keys` cleanup job eklendi (6 saatte bir)
6. Admin plan değişikliğinde webhook_count yönetimi
7. Duplicate `truncate` fonksiyonu birleştirildi
8. Duplicate `validate_url` ssrf.rs'e yönlendirildi
9. Zombie reaper + orphaned delivery kurtarma
10. `#[allow(dead_code)]` kaldırıldı
11. Invoice oluşturma eklendi
12. CORS fallback (production'da dashboard izni)
13. Replay protection race condition (atomic INSERT)
14. validate_url http/https şeması kontrolü
15. cargo fmt --all (tam kod formatlaması)
16. Unused import'lar temizlendi

---

## ❌ KALAN SORUNLAR (Yeni oturumda düzeltilmeli)

### 1. `validate_json_depth` Test Hatası
**Dosya:** `api/src/validation.rs`
**Sorun:** Test 10 seviye derinliği kabul etmesi gerektiğini söylüyor ama `MAX_JSON_DEPTH = 10` iken `check_depth(value, 1)` ile başlıyor, yani 10 seviye = depth 11 = hata.
**Çözüm:** Ya `MAX_JSON_DEPTH`'i 11'e çıkar ya da test'i 9 seviye ile çalıştır. Veya `check_depth(value, 0)` ile başlat.

### 2. Stripe Signature Test Hataları (5 test)
**Dosya:** `api/src/billing/stripe.rs`
**Sorun:** `test_verify_signature_valid`, `test_verify_signature_expired_timestamp`, `test_verify_signature_future_timestamp`, `test_verify_signature_tampered_payload`, `test_verify_signature_wrong_secret` — muhtemelen test verileri güncel değil veya timestamp tolerance ile ilgili.
**Çözüm:** `stripe.rs`'deki test fonksiyonlarını incele, timestamp hesaplamalarını düzelt.

### 3. Transform Test Hatası
**Dosya:** `api/src/transform/mod.rs`
**Sorun:** `test_legacy_pipeline_chaining` — `output.get("name").is_none()` assertion失败
**Çözüm:** Transform pipeline'ın name field'ını nasıl işlediğini incele.

---

## 🔧 Gerekli Kurulumlar (Yeni Oturum)

### Rust Toolchain
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
```

### GitHub CLI (opsiyonel)
```bash
# gh CLI kurulu değilse token ile API kullan:
curl -s -H "Authorization: token <TOKEN>" "https://api.github.com/repos/servetarslan02/HookSniff/actions/runs?per_page=3"
```

### Proje Kontrol
```bash
cd /root/.openclaw/workspace/HookSniff
git pull origin main
cargo fmt --all
cargo check --workspace
cargo test --workspace
cargo clippy --workspace
```

---

## 📋 Servet'in Yapması Gerekenler

| Görev | Durum | Not |
|-------|-------|-----|
| Polar.sh yeni token | ❌ Bekliyor | polar.sh dashboard'dan |
| Resend yeni domain | ❌ Bekliyor | is-a.dev iptal, yeni domain gerekli |
| Domain kararı | ❌ Bekliyor | eu.org ücretsiz vs .com $12/yıl |
| iyzico hesap aç | ❌ Bekliyor | Vergi levhası + banka hesabı |

---

## 🚀 CI/CD Durumu

Son CI run: https://github.com/servetarslan02/HookSniff/actions/runs/25550911830
- **lint:** Başarısız (önceden var olan format sorunları → düzeltildi)
- **test:** Başarısız (7 önceden var olan test hatası → yeni oturumda düzeltilecek)
- **build-dashboard:** Başarılı ✅
- **Deploy:** CI başarısız olduğu için atlandı

---

## 📁 Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `AI_MEMORY.md` | AI hafıza dosyası — her oturum başında oku, sonunda güncelle |
| `BUG_REPORT.md` | Kapsamlı bug raporu |
| `api/src/main.rs` | API giriş noktası |
| `api/src/routes/auth.rs` | Login/register (rate limit eklendi) |
| `api/src/routes/admin.rs` | Admin paneli (webhook_count fix) |
| `api/src/routes/billing.rs` | Ödeme sistemi (invoice eklendi) |
| `api/src/middleware/idempotency.rs` | Replay protection (atomic fix) |
| `api/src/validation.rs` | URL ve JSON validation |
| `api/src/ssrf.rs` | SSRF koruması (şema kontrolü eklendi) |
| `worker/src/main.rs` | Worker (orphaned delivery fix) |
| `dashboard/src/lib/api.ts` | Dashboard API wrapper |
| `.github/workflows/ci.yml` | CI pipeline |

---

## ⚠️ Hatırlatmalar

1. **Her oturum başında:** `AI_MEMORY.md` oku
2. **Her oturum sonunda:** Değişiklikleri GitHub'a push et, `AI_MEMORY.md` güncelle
3. **Session 1 saat** — işleri buna göre planla
4. **Servet kod bilmiyor** — teknik açıklamaları basit tut
5. **CI/CD tetikleme:** `git push origin main` yeterli
6. **Test çalıştırma:** `DATABASE_URL` gerekli (CI'da PostgreSQL servisi var, local'de Neon DB)
