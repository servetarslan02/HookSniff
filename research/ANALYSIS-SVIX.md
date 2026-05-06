# Svix Webhooks — Rust SDK Analizi

## 📋 Genel Bilgi
- **Repo:** https://github.com/svix/svix-webhooks
- **Lisans:** MIT ✅
- **Dil:** Rust (SDK), Go/Python/JS/Java/Ruby/C#/PHP (diğer SDK'lar)
- **crates.io:** `svix` crate mevcut

## 🔑 İmzalama Implementasyonu

### Format
```
msg_id.timestamp.payload → HMAC-SHA256(secret, content) → base64 → "v1,<signature>"
```

### Header Yapısı
Svix iki header seti destekler:

**Svix-branded:**
- `svix-id` → mesaj ID
- `svix-timestamp` → unix timestamp (saniye)
- `svix-signature` → `v1,<base64_signature>`

**Unbranded (Standard Webhooks):**
- `webhook-id`
- `webhook-timestamp`
- `webhook-signature`

### Secret Format
- Prefix: `whsec_`
- Base64 encoded
- 24-64 byte arası

### Timestamp Tolerance
- 5 dakika (300 saniye) — eski/yeni timestamp reddedilir

### Multi-Signature Support
- Secret rotation için birden fazla imza destekler
- Space-delimited: `v1,sig1 v1,sig2 v1,sig3`
- Tüketici her birini dener, biri eşleşirse kabul

### Constant-Time Comparison
- `fold(0, |acc, (a, b)| acc | (a ^ b))` ile timing-attack koruması

## 🦀 HookSniff Entegrasyonu

### Mevcut Durum
HookSniff'in `signing.rs` dosyası var — henüz okumadım ama muhtemelen benzer bir şey yapıyor.

### Önerilen Entegrasyon

**Seçenek A: svix crate doğrudan kullan**
```toml
# Cargo.toml
[dependencies]
svix = "0.9"
```
```rust
use svix::webhooks::Webhook;

let wh = Webhook::new("whsec_...")?;
wh.verify(payload_bytes, &headers)?;
```

**Seçenek B: Standard Webhooks Rust library kullan**
```toml
# Cargo.toml (standard-webhooks repo'sundaki Rust library)
[dependencies]
# Git dependency veya crates.io'dan
```

**Seçenek C: Mevcut kodu iyileştir**
- Svix'in constant-time comparison'ını kopyala
- Multi-signature desteği ekle
- `whsec_` prefix handling ekle

### Tavsiye
**Seçenek A** — svix crate kullan. Battle-tested, tüm edge case'ler çözülmüş, sürekli güncelleniyor. Kendi imzalama kodunu bakım yükü olarak kalır.

## ✅ Yapılacaklar
1. `svix` crate'i Cargo.toml'a ekle
2. Mevcut `signing.rs`'i svix library ile değiştir
3. Standard Webhooks header'larını destekle (`webhook-id`, `webhook-timestamp`, `webhook-signature`)
4. Secret rotation (multi-signature) desteği ekle
5. `whsec_` prefix ile secret oluştur
