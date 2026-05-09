# 🐛 HookSniff — Bug Raporu ve Durum

> Son güncelleme: 2026-05-09

---

## ✅ Düzeltilen Sorunlar (16 adet)

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
| 9 | Zombie reaper sadece queue temizliyor | `reap_orphaned_deliveries` eklendi | ✅ |
| 10 | `#[allow(dead_code)]` gizliyor | Kaldırıldı, uyarılar artık görünür | ✅ |
| 11 | Invoice oluşturma eksik | `SubscriptionCreated` + `SubscriptionUpdated`'a invoice INSERT eklendi | ✅ |
| 12 | CORS production'da engelliyor | Origin yoksa dashboard URL'lerine default izin | ✅ |
| 13 | Replay protection race condition | Atomic `INSERT ... ON CONFLICT DO NOTHING` ile yeniden yazıldı | ✅ |
| 14 | `validate_url` şema kontrolü yok | `ssrf.rs`'e http/https şeması kontrolü eklendi | ✅ |
| 15 | Kod formatı dağınık | `cargo fmt --all` uygulandı (70 dosya) | ✅ |
| 16 | OTLP exporter panic | Graceful fallback eklendi, `reqwest` feature eklendi | ✅ |

---

## 📋 Servet'in Yapması Gereken

| Görev | Durum | Not |
|-------|-------|-----|
| iyzico hesap | ❌ | Vergi levhası + banka hesabı |
| Domain kararı | ❌ | hooksniff.vercel.app yeterli şimdilik |
| GCP SA key rotate | ⚠️ | Chat'te paylaşıldı, yeni key oluştur |
| GitHub PAT rotate | ⚠️ | Chat'te paylaşıldı, yeni token oluştur |

---

## 🟢 İyi Yapılmış Şeyler

- SSRF koruması (DNS resolution, IPv4/IPv6, metadata endpoints, http/https şeması)
- Argon2id API key + şifre hashleme
- Standard Webhooks HMAC-SHA256
- Idempotency key + replay protection (atomic)
- Exponential backoff retry
- Zombie reaper + orphaned recovery
- Graceful shutdown (SIGTERM/SIGINT)
- LISTEN/NOTIFY + poll fallback
- FOR UPDATE SKIP LOCKED
- CSV formula injection koruması
- Login/register rate limit
- Per-endpoint throttling (token bucket)
- FIFO ordered delivery
- Circuit breaker
- CloudEvents v1.0 support
- OpenTelemetry distributed tracing
