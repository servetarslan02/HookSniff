# Standard Webhooks — Spesifikasyon Analizi

## 📋 Genel Bilgi
- **Repo:** https://github.com/standard-webhooks/standard-webhooks
- **Lisans:** Apache 2.0 ✅
- **Versiyon:** 1.0.0
- **Rust library:** `libraries/rust/` içinde mevcut

## 📐 Spesifikasyon Özeti

### İmzalama Şeması

**İçerik:** `msg_id.timestamp.payload` (nokta ile ayrılmış)

**Algoritma:**
| Tür | Algoritma | Secret Format | Signature Prefix |
|-----|-----------|---------------|-----------------|
| Symmetric | HMAC-SHA256 | `whsec_` + base64 | `v1,` |
| Asymmetric | ed25519 | `whsk_` (private) / `whpk_` (public) | `v1a,` |

### Header Yapısı
```
webhook-id: msg_2KWPBgLlAfxdpx2AI54pPJ85f4W
webhook-timestamp: 1674087231
webhook-signature: v1,K5oZfzN95Z9UVu1EsfQmfVNQhnkZ2pj9o9NDN/H/pI4=
```

### Payload Yapısı (Önerilen)
```json
{
  "type": "user.created",
  "timestamp": "2022-11-03T20:26:10.344522Z",
  "data": {
    "id": "...",
    ...
  }
}
```

### Retry Schedule (Önerilen)
| Gecikme | Başlangıçtan itibaren |
|---------|----------------------|
| Hemen | 00:00:00 |
| 5 saniye | 00:00:05 |
| 5 dakika | 00:05:05 |
| 30 dakika | 00:35:05 |
| 2 saat | 02:35:05 |
| 5 saat | 07:35:05 |
| 10 saat | 17:35:05 |
| 14 saat | 31:35:05 |
| 20 saat | 51:35:05 |
| 24 saat | 75:35:05 |

### Başarılı/Başarılı Teslimat
- **2xx** → Başarılı
- **3xx** → Başarız (redirect takip etme)
- **410 Gone** → Endpoint'i devre dışı bırak
- **429** → Throttle uygula
- **502/504** → Throttle uygula
- **retry-after header** → Dikkate al

### Güvenlik Önerileri
1. **HTTPS zorunlu** — payload şifrelenmeli
2. **SSRF koruması** — internal IP'leri blokla (smokescreen proxy)
3. **Constant-time comparison** — timing attack koruması
4. **Timestamp tolerance** — replay attack koruması (5 dakika)
5. **Idempotency** — webhook-id'yi idempotency key olarak kullan

## 🔄 HookSniff Uyumluluk Kontrolü

### Mevcut Durum
- HookSniff'in `signing.rs` dosyası var
- `events/cloudevents.rs` var (CloudEvents formatı)

### Eksik Olanlar
1. ❌ `webhook-id`, `webhook-timestamp`, `webhook-signature` header'ları
2. ❌ `whsec_` prefix ile secret formatı
3. ❌ Multi-signature (secret rotation) desteği
4. ❌ Standard Webhooks retry schedule
5. ❌ 410 Gone handling
6. ❌ SSRF koruması

### Yapılması Gerekenler
1. Standard Webhooks header'larını ekle
2. `whsec_` prefix ile secret oluştur
3. Retry schedule'ı Standard Webhooks'a uygun yap
4. SSRF koruması ekle (IP filtering)
5. 410 Gone ve 429 handling ekle

## 📦 Rust Library

Standard Webhooks'ın kendi Rust library'si var:
- Dosya: `libraries/rust/src/lib.rs`
- Bağımlılıklar: `hmac-sha256`, `base64`, `http`, `time`
- Svix library ile neredeyse aynı — sadece unbranded header'lar kullanır

### Kullanım
```rust
use standard_webhooks::Webhook;

let wh = Webhook::new("whsec_...")?;
wh.verify(payload_bytes, &headers)?;
```

## 🎯 Tavsiye
HookSniff **Standard Webhooks uyumlu** olmalı. Bu, müşteri SDK'larımızın evrensel olmasını sağlar. Svix library veya Standard Webhooks library'sinden birini kullan — ikisi de aynı standardı implemente ediyor.
