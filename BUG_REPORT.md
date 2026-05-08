# 🐛 HookSniff — Bug Raporu ve Güvenlik Analizi

> Tarih: 2026-05-08
> Tarayan: AI Asistan (kapsamlı kod incelemesi)

---

## 🔴 KRİTİK SORUNLAR

### 1. Dashboard API Wrapper'ı Token Geçirmiyor
**Dosya:** `dashboard/src/lib/api.ts`
```typescript
// Bu wrapper metotlar token DEĞİL kullanıyor:
export const api = {
  get: async <T>(path: string) => ({ data: await apiFetch<T>(path) }),
  post: async <T>(path: string, body?: unknown) => ({ data: await apiFetch<T>(path, { method: 'POST', body }) }),
  // ...
};
```
`apiFetch` fonksiyonu token opsiyonel olarak alıyor ama `api.get/post/put/delete` wrapper'ları hiç token geçirmiyor. Dashboard bu wrapper'ları kullanıyorsa tüm korumalı endpoint'ler 401 döner.

**Etki:** Dashboard'da teams, notifications, analytics gibi sayfalar çalışmaz.

### 2. CI/CD Pipeline Hataları Deploy'u Engellemiyor
**Dosya:** `.github/workflows/ci.yml`
```yaml
- name: Check formatting
  run: cargo fmt --all -- --check
  continue-on-error: true  # ← Hatalı kod deploy'a geçebilir

- name: Clippy lints
  run: cargo clippy --workspace --all-targets -- -D warnings
  continue-on-error: true  # ← Lint uyarıları görmezden geliniyor

- name: Run tests
  run: cargo test --workspace
  continue-on-error: true  # ← Test başarısızlıkları deploy'u engellemiyor
```
**Etki:** Bozuk kod production'a deploy edilebilir.

### 3. Login/Register Rate Limit Yok
**Dosya:** `api/src/routes/auth.rs`

`/v1/auth/login` ve `/v1/auth/register` endpoint'lerinde rate limit uygulanmamış. Brute-force saldırısıyla şifreler denenebilir.

**Etki:** Güvenlik açığı — hesaplar ele geçirilebilir.

---

## 🟡 ORTA SEVİYE SORUNLAR

### 4. `seen_webhooks` Temizliği Çalışmıyor
**Dosya:** `api/src/middleware/idempotency.rs`

`cleanup_expired_webhooks()` fonksiyonu tanımlanmış ama hiçbir yerde çağrılmıyor. Tablo sonsuz büyür.

**Etki:** DB boyutu zamanla şişer, performans düşer.

### 5. `idempotency_keys` Temizliği Yok
**Dosya:** `api/src/middleware/idempotency.rs`

24 saat TTL ile saklanan idempotency key'leri hiçbir background job tarafından temizlenmiyor.

**Etki:** DB boyutu şişer.

### 6. Admin Plan Değişikliği `webhook_count` Sıfırlıyor
**Dosya:** `api/src/routes/admin.rs` — `change_plan()`
```rust
"UPDATE customers SET plan = $1, webhook_limit = $2, webhook_count = 0 WHERE id = $3"
```
Plan değişikliğinde sayaç sıfırlanıyor. Bu kasıtlı olabilir ama billing webhook'larında böyle bir sıfırlama yok — tutarsızlık.

### 7. Billing Webhook'unda `webhook_limit` Güncellenmiyor
**Dosya:** `api/src/routes/billing.rs` — `process_webhook_result()`

SubscriptionCreated olayında `webhook_limit` güncelleniyor ama SubscriptionUpdated olayında sadece `plan` güncelleniyor, `webhook_limit` güncellenmiyor.

```rust
WebhookResult::SubscriptionUpdated { .. } => {
    // webhook_limit burada güncellenmiyor!
    sqlx::query("UPDATE customers SET plan = $1, webhook_limit = $2 WHERE ...")
    // ↑ webhook_limit = plan.max_webhooks_per_month() olmalı
}
```
**Etki:** Plan yükseltmede yeni limit geçerli olmaz.

### 8. Production'da CORS Tüm Origin'leri Engelliyor
**Dosya:** `api/src/main.rs`
```rust
if cfg.is_production() && origins.is_empty() {
    CorsLayer::new()
        .allow_origin(AllowOrigin::list(std::iter::empty()))
```
Deploy config'de `CORS_ORIGINS=https://hooksniff.vercel.app` set edilmiş ama eğer bu env var düşerse, production'da tüm cross-origin istekler engellenir.

### 9. OTEL_EXPORTER_OTLP_HEADERS Zorunlu Değil Ama Kullanılıyor
**Dosya:** `api/src/config.rs`

OTEL headers opsiyonel ama deploy'da set ediliyor. Eğer headers boşsa OTLP exporter hata verebilir.

---

## 🟢 DÜŞÜK SEVİYE / İYİLEŞTİRME

### 10. `#[allow(dead_code, unused_imports)]` Her Yerde
**Dosya:** `api/src/main.rs`, `worker/src/main.rs`

Bu attribute'lar uyarıları gizleyerek potansiyel hataları kaçırır. Development'da kaldırılmalı.

### 11. `truncate` Fonksiyonu İki Yerde Tanımlanmış
**Dosya:** `worker/src/main.rs` ve `worker/src/delivery/http.rs`

Aynı işi yapan `truncate` / `truncate_str` fonksiyonu iki ayrı yerde tanımlanmış. Ortak bir util modülüne taşınmalı.

### 12. `validate_url` İki Yerde Tanımlanmış
**Dosya:** `api/src/validation.rs` ve `api/src/ssrf.rs`

Her iki dosyada da URL validation var. `ssrf.rs` daha kapsamlı (DNS resolution dahil), `validation.rs` daha basit. Hangisinin nerede kullanılacağı belirsiz.

### 13. Invoice Oluşturma Eksik
**Dosya:** `api/src/routes/billing.rs`

`PaymentSucceeded` olayında sadece log yazıyor, `invoices` tablosuna kayıt eklemiyor. Fatura geçmişi boş kalır.

### 14. Zombie Reaper Sadece `webhook_queue`'yu Temizliyor
**Dosya:** `worker/src/main.rs` — `reap_zombies()`

`deliveries` tablosundaki stuck kayıtları da temizlemeli. `webhook_queue` temizlenip `deliveries` temizlenmezse tutarsızlık olur.

### 15. Replay Protection Race Condition
**Dosya:** `api/src/middleware/idempotency.rs` — `check_replay()`

`check_webhook_seen` ve `mark_webhook_seen` arasında race condition var. Aynı anda iki istek aynı webhook ID'yi işleyebilir. `INSERT ... ON CONFLICT` kullanılıyor ama `check` ve `mark` ayrı atomic olmayan işlemler.

---

## ✅ İYİ YAPILMIŞ ŞEYLER

- SSRF koruması kapsamlı (DNS resolution, IPv4/IPv6, metadata endpoints)
- Argon2id ile API key ve şifre hashleme
- Standard Webhooks HMAC-SHA256 signature
- Idempotency key desteği
- Exponential backoff retry mekanizması
- Zombie reaper (stuck queue item'ları kurtarma)
- Graceful shutdown (SIGTERM/SIGINT)
- LISTEN/NOTIFY + poll fallback (güvenilir queue processing)
- FOR UPDATE SKIP LOCKED (concurrency-safe queue processing)
- CSV export'ta formula injection koruması

---

## 📋 Öncelik Sırası

1. **🔴 #2** — CI continue-on-error kaldır (en kolay, en etkili)
2. **🔴 #1** — Dashboard API wrapper'a token ekle
3. **🔴 #3** — Login/register rate limit ekle
4. **🟡 #4** — seen_webhooks cleanup job ekle
5. **🟡 #5** — idempotency_keys cleanup job ekle
6. **🟡 #7** — Billing webhook'ta webhook_limit güncelle
7. **🟡 #6** — Admin plan değişikliğinde webhook_count politikası belirle
8. **🟢 #13** — Invoice oluşturma ekle
9. **🟢 #14** — Zombie reaper'ı deliveries tablosunu da kapsayacak şekilde genişlet
10. **🟢 #10-12** — Kod temizliği (duplicate functions, allow attributes)
