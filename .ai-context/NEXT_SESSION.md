# NEXT_SESSION.md — Sonraki Oturum

> Son güncelleme: 2026-05-08 19:00 GMT+8

## Yeni Oturumda Ne Söyle

HookSniff projesi çalışıyor. 16 düzeltme yapıldı, 3 test hatası kaldı.
Önce test hatalarını düzelt, sonra feature geliştirme başla.

---

## 🔴 ÖNCELİK 1: Kalan 3 Test Hatasını Düzelt

### 1. `validate_json_depth` Test
**Dosya:** `api/src/validation.rs`
```rust
// SORUN: check_depth(value, 1) ile başlıyor, MAX_JSON_DEPTH = 10
// 10 seviye JSON = depth 11 = hata ama test 10 seviyeyi kabul etmesini bekliyor
// ÇÖZÜM: check_depth(value, 0) ile başlat VEYA MAX_JSON_DEPTH'i 11'e çıkar
```

### 2. Stripe Signature Testleri (5 test)
**Dosya:** `api/src/billing/stripe.rs`
```
test_verify_signature_valid
test_verify_signature_expired_timestamp
test_verify_signature_future_timestamp
test_verify_signature_tampered_payload
test_verify_signature_wrong_secret
```
**SORUN:** Timestamp tolerance veya test verileri güncel değil
**ÇÖZÜM:** stripe.rs'deki test fonksiyonlarını incele, timestamp hesaplamalarını düzelt

### 3. Transform Pipeline Test
**Dosya:** `api/src/transform/mod.rs`
```
test_legacy_pipeline_chaining — output.get("name").is_none() assertion失败
```
**SORUN:** Transform pipeline name field'ını silmiyor
**ÇÖZÜM:** Transform filter'ın name field'ını nasıl işlediğini incele

---

## 🟡 ÖNCELİK 2: Servet'in Yapması Gereken (Bekliyoruz)

1. **Polar.sh yeni token** — polar.sh dashboard → Settings → Access Tokens → yeni token
2. **Resend yeni domain** — resend.com dashboard → yeni domain ekle (is-a.dev iptal)
3. **GitHub token yenile** — github.com → Settings → Developer Settings → PAT
4. **iyzico hesap** — vergi levhası + banka hesabı

---

## 🟢 ÖNCELİK 3: Feature Geliştirme

### Dashboard
- Login/Register sayfası çalışıyor mu? Test et
- Dashboard sayfalarında gerçek veri gösterimi (API'ye bağla)
- Endpoint oluşturma/webhook gönderme akışı test et

### Billing (Polar.sh token gelince)
- Polar.sh entegrasyonu aktifleştir
- Free/Pro/Business plan gösterimi
- Checkout flow

### Email (Resend domain gelince)
- Email bildirimleri (webhook failure alerts)
- Hoşgeldin emaili

### Storage (R2)
- R2'ye dosya yükleme/okuma entegrasyonu
- Webhook payload arşivleme

### Monitoring
- Grafana Cloud kurulumu (OTEL headers hazır)
- Dashboard'da metrics gösterimi

---

## 🔧 Kurulum Komutları (Yeni Oturum)

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"

# Proje clone
cd /root/.openclaw/workspace
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff

# Kontrol
cargo fmt --all
cargo check --workspace
cargo test --workspace
cargo clippy --workspace
```

---

## 📋 Hafıza Kuralları

Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. `git add -A && git commit && git push origin main`
4. Gereksiz dosyaları commit etme
