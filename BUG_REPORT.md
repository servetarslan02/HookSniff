# 🐛 HookSniff — Bug Raporu ve Durum

> Son güncelleme: 2026-05-08 18:58 GMT+8

---

## ✅ Düzeltilen Sorunlar (13 adet)

| # | Sorun | Fix | Durum |
|---|-------|-----|-------|
| 1 | CI `continue-on-error: true` | Kaldırıldı, hatalar artık deploy'u engelliyor | ✅ |
| 2 | Dashboard API token geçirmiyor | `api.get/post/put/delete` wrapper'ına token parametresi eklendi | ✅ |
| 3 | Login/register rate limit yok | Login: 10/15dk, Register: 5/saat IP bazlı limit | ✅ |
| 4 | `seen_webhooks` temizliği yok | 6 saatte bir cleanup job eklendi (api/src/main.rs) | ✅ |
| 5 | `idempotency_keys` temizliği yok | 6 saatte bir cleanup job eklendi (api/src/main.rs) | ✅ |
| 6 | Admin plan değişikliği `webhook_count` sıfırlıyor | Upgrade'de sıfırla, downgrade'de LEAST ile cap | ✅ |
| 7 | Duplicate `truncate` fonksiyonu | Worker'da `delivery::truncate_str`'e delegasyon | ✅ |
| 8 | Duplicate `validate_url` fonksiyonu | `validation.rs` → `ssrf.rs`'e yönlendirildi | ✅ |
| 9 | Zombie reaper sadece queue temizliyor | `reap_orphaned_deliveries` eklendi — orphaned delivery'leri queue'ya geri alır | ✅ |
| 10 | `#[allow(dead_code)]` gizliyor | Kaldırıldı, uyarılar artık görünür | ✅ |
| 11 | Invoice oluşturma eksik | `SubscriptionCreated` + `SubscriptionUpdated`'a invoice INSERT eklendi | ✅ |
| 12 | CORS production'da engelliyor | Origin yoksa dashboard URL'lerine default izin | ✅ |
| 13 | Replay protection race condition | `check_replay` atomic `INSERT ... ON CONFLICT DO NOTHING` ile yeniden yazıldı | ✅ |
| 14 | `validate_url` şema kontrolü yok | `ssrf.rs`'e http/https şeması kontrolü eklendi | ✅ |
| 15 | Kod formatı dağınık | `cargo fmt --all` uygulandı (70 dosya) | ✅ |
| 16 | Unused import'lar | api/src/main.rs temizlendi | ✅ |

---

## ❌ Kalan Sorunlar (3 adet — Yeni oturumda düzeltilecek)

### 1. `validate_json_depth` Test Hatası
**Dosya:** `api/src/validation.rs` → `test_validate_json_depth`
**Sorun:** `check_depth(value, 1)` ile başlıyor, `MAX_JSON_DEPTH = 10`. 10 seviye JSON = depth 11 = hata ama test 10 seviyeyi kabul etmesini bekliyor.
**Çözüm:** `check_depth(value, 0)` ile başlat VEYA `MAX_JSON_DEPTH`'i 11'e çıkar.

### 2. Stripe Signature Test Hataları (5 test)
**Dosya:** `api/src/billing/stripe.rs`
**Testler:** `test_verify_signature_valid`, `test_verify_signature_expired_timestamp`, `test_verify_signature_future_timestamp`, `test_verify_signature_tampered_payload`, `test_verify_signature_wrong_secret`
**Sorun:** Timestamp tolerance veya test verileri güncel değil.
**Çözüm:** `stripe.rs`'deki test fonksiyonlarını incele, timestamp hesaplamalarını düzelt.

### 3. Transform Pipeline Test Hatası
**Dosya:** `api/src/transform/mod.rs` → `test_legacy_pipeline_chaining`
**Sorun:** `output.get("name").is_none()` assertion失败 — transform pipeline name field'ını silmiyor.
**Çözüm:** Transform filter'ın name field'ını nasıl işlediğini incele.

---

## 📋 Servet'in Yapması Gereken

| Görev | Durum | Not |
|-------|-------|-----|
| Polar.sh yeni token | ❌ | polar.sh dashboard → Settings → API |
| Resend yeni domain | ❌ | is-a.dev iptal, yeni domain + DNS TXT+MX |
| Domain kararı | ❌ | eu.org ücretsiz vs .com $12/yıl |
| iyzico hesap | ❌ | Vergi levhası + banka hesabı |

---

## 🟢 İyi Yapılmış Şeyler

- SSRF koruması (DNS resolution, IPv4/IPv6, metadata endpoints, http/https şeması)
- Argon2id API key + şifre hashleme
- Standard Webhooks HMAC-SHA256
- Idempotency key + replay protection (artık atomic)
- Exponential backoff retry
- Zombie reaper + orphaned recovery
- Graceful shutdown (SIGTERM/SIGINT)
- LISTEN/NOTIFY + poll fallback
- FOR UPDATE SKIP LOCKED
- CSV formula injection koruması
- Login/register rate limit
