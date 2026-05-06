# 🔍 HookRelay SDK Araştırma Raporu

> **Tarih:** 2026-05-06
> **Amaç:** GitHub'daki webhook SDK'larını derinlemesine incelemek, kullanılabilecek kaynakları belirlemek ve entegrasyon planı oluşturmak.

---

## 📊 Araştırma Sonuçları

### 1. Svix SDK'ları (⭐ En Olgun Referans)

| Bilgi | Değer |
|-------|-------|
| **Repo** | [svix/svix-webhooks](https://github.com/svix/svix-webhooks) |
| **Lisans** | MIT ✅ — Ticari kullanıma uygun |
| **Desteklenen Diller** | Go, Python, TypeScript, Java, Kotlin, Ruby, C#, Rust, PHP, Terraform |
| **Yıldız** | 2,000+ |
| **Funding** | ~$17M (a16z, YC) |

**Neden Önemli:**
- Endüstri lideri webhook platformu, SDK tasarımı için altın standart
- Her dilde **hem API client hem webhook verification** sağlıyor
- Auto-generated API bindings (OpenAPI spec'ten)
- `whsec_` prefix'li secret formatı tüm dillerde tutarlı
- `svix-id`, `svix-signature`, `svix-timestamp` header'ları + fallback `webhook-*` header'ları

**Kullanılabilecek Parçalar:**
- ✅ Webhook verification implementasyonu (her dilde)
- ✅ SDK mimarisi (resource-based pattern)
- ✅ Error handling pattern'i
- ✅ Secret decode mantığı (`whsec_` prefix stripping + base64)

---

### 2. Standard Webhooks (⭐ Endüstri Standardı)

| Bilgi | Değer |
|-------|-------|
| **Repo** | [standard-webhooks/standard-webhooks](https://github.com/standard-webhooks/standard-webhooks) |
| **Lisans** | MIT ✅ — Ticari kullanıma uygun |
| **Desteklenen Diller** | Go, Python, JavaScript, Java, Kotlin, Rust, Ruby, PHP, C#, Elixir, Swift |
| **Backing** | Zapier, Twilio, Mux, ngrok, Supabase, Kong, Svix |

**Neden Önemli:**
- Webhook imza doğrulama için **endüstri standardı**
- Svix tarafından başlatılmış, büyük şirketler destekliyor
- Sadece verification library (API client yok)
- `webhook-id`, `webhook-signature`, `webhook-timestamp` header'ları
- 5 dakika tolerance ile timestamp doğrulama

**Kullanılabilecek Parçalar:**
- ✅ Signature verification spec'i (bizim implementasyonu buna uyumlu hale getirmeliyiz)
- ✅ Reference implementations (her dilde)
- ✅ Test vector'ları (cross-language uyumluluk testleri için)

---

### 3. Hookdeck Outpost (⭐ Modern Referans)

| Bilgi | Değer |
|-------|-------|
| **Repo** | [hookdeck/outpost](https://github.com/hookdeck/outpost) |
| **Lisans** | Apache 2.0 ✅ — Ticari kullanıma uygun |
| **Dil** | Go (backend), SDK'lar: Go, Python, TypeScript |
| **Backing** | Hookdeck (VC-backed) |

**Neden Önemli:**
- Modern webhook altyapısı, multi-tenant destek
- Event destination types: Webhooks, EventBridge, SQS, S3, Pub/Sub, RabbitMQ, Kafka
- Customer portal out-of-the-box
- OpenTelemetry entegrasyonu

**Kullanılabilecek Parçalar:**
- ✅ Multi-tenant architecture pattern'i
- ✅ Event destination abstraction
- ✅ Customer portal design
- ✅ SDK design patterns (Go, Python, TypeScript)

---

## 📋 Mevcut HookRelay SDK Durumu

| Dil | API Client | Webhook Verification | Standard Webhooks Uyumlu | Model Sınıfları | Durum |
|-----|-----------|---------------------|------------------------|----------------|-------|
| **Go** | ✅ | ✅ (HMAC + SW) | ⚠️ Kısmen | ✅ Struct | İyi |
| **Python** | ✅ | ✅ | ⚠️ Kısmen | ✅ Classes | İyi |
| **Node.js** | ✅ | ✅ (HMAC + SW) | ⚠️ Kısmen | ✅ Types | İyi |
| **Ruby** | ✅ | ✅ (HMAC + SW) | ⚠️ Kısmen | ✅ Models | İyi |
| **Java** | ✅ | ✅ | ⚠️ Kısmen | ✅ Classes | İyi |
| **C#** | ✅ | ✅ (HMAC + SW) | ⚠️ Kısmen | ✅ Classes | İyi |
| **PHP** | ✅ | ❌ Eksik | ❌ | ✅ Models | Eksik |

---

## 🔴 Tespit Edilen Eksiklikler

### 1. PHP SDK — Webhook Verification Eksik
PHP SDK'sında webhook imza doğrulama fonksiyonu yok. Diğer tüm dillerde var.

### 2. Standard Webhooks Header Uyumsuzluğu
HookRelay SDK'ları `X-Hookrelay-Signature` header'ını kullanıyor ama Standard Webhooks standardı `webhook-id`, `webhook-signature`, `webhook-timestamp` header'larını gerektiriyor. Svix SDK'ları her ikisini de destekliyor (svix-* + webhook-* fallback).

### 3. Eksik Diller
| Dil | Svix'te Var | Standard Webhooks'ta Var | HookRelay'de |
|-----|------------|------------------------|-------------|
| **Elixir** | ❌ | ✅ | ❌ |
| **Swift** | ❌ | ✅ | ❌ |
| **Kotlin** | ✅ | ✅ | ❌ |
| **Rust** | ✅ | ✅ | ❌ |
| **Terraform** | ✅ | N/A | ❌ |

### 4. Secret Format Tutarsızlığı
- Svix: `whsec_` prefix + base64
- Standard Webhooks: `whsec_` prefix + base64
- HookRelay: Bazı dillerde `whsec_` desteği var, bazılarında yok

### 5. SDK Feature Karşılaştırması

| Feature | Svix | Standard Webhooks | HookRelay |
|---------|------|------------------|-----------|
| API Client | ✅ | ❌ | ✅ |
| Webhook Verification | ✅ | ✅ | ✅ (PHP eksik) |
| `whsec_` prefix support | ✅ | ✅ | ⚠️ Kısmen |
| `webhook-*` headers | ✅ | ✅ | ❌ |
| `svix-*` headers | ✅ | ❌ | ❌ |
| Timestamp tolerance | 5 min | 5 min | ⚠️ Değişken |
| Multi-signature support | ✅ | ✅ | ⚠️ Kısmen |
| Constant-time comparison | ✅ | ✅ | ✅ |
| Typed models | ✅ | N/A | ✅ |
| Error classes | ✅ | N/A | ✅ |
| Pagination | ✅ | N/A | ✅ |
| Batch operations | ✅ | N/A | ✅ |
| Secret rotation | ✅ | N/A | ✅ |
| Export (CSV) | ✅ | N/A | ✅ |

---

## 🎯 Yasallık Analizi

### Kullanılabilir Lisanslar

| Kaynak | Lisans | Ticari Kullanım | Değişiklik | Dağıtım |
|--------|--------|-----------------|-----------|---------|
| **Svix SDK'ları** | MIT | ✅ | ✅ | ✅ |
| **Standard Webhooks** | MIT | ✅ | ✅ | ✅ |
| **Hookdeck Outpost** | Apache 2.0 | ✅ | ✅ | ✅ |

### Dikkat Edilmesi Gerekenler

1. **MIT Lisansı**: Kodu kopyalayabilir, değiştirebilir ve ticari olarak kullanabilirsiniz. Lisans metnini korumanız yeterli.
2. **Apache 2.0**: MIT'e benzer ama patent hakları da sağlar. NOTICES dosyası eklenmeli.
3. **Svix Kodu Kopyalama**: Svix'in verification kodunu doğrudan kopyalamak yerine, Standard Webhooks spec'ine uygun kendi implementasyonumuzu yazmalıyız. Bu hem yasal riski azaltır hem de HookRelay'e özel optimizasyonlara izin verir.
4. **Standard Webhooks Spec**: Bu bir spesifikasyon, kod değil. Spec'e uygun implementasyon yazmak serbest.

### Önerilen Yaklaşım
- ✅ Standard Webhooks **spec'ini** takip et (açık standart)
- ✅ Svix'in **design pattern'lerini** referans al (MIT)
- ❌ Svix kodunu **doğrudan kopyalama** (kendi implementasyonunu yaz)
- ✅ Hookdeck Outpost'un **mimari fikirlerini** kullan (Apache 2.0)

---

## 🚀 Entegrasyon Planı

### Aşama 1: Mevcut SDK'ları Standard Webhooks Uyumlu Yap (Öncelik: Yüksek)

Her SDK'ya eklenecekler:

1. **`webhook-*` header desteği** — `webhook-id`, `webhook-signature`, `webhook-timestamp`
2. **`whsec_` prefix decode** — Tüm dillerde tutarlı
3. **5 dakika timestamp tolerance** — Standard Webhooks spec
4. **Multi-signature verification** — Space-separated `v1,<sig>` formatı
5. **PHP'ye webhook verification ekle** — Eksik olan tek dil

### Aşama 2: Eksik Dilleri Ekle (Öncelik: Orta)

| Dil | Öncelik | Kaynak |
|-----|---------|--------|
| **Elixir** | 🟢 Düşük | Standard Webhooks reference impl |
| **Swift** | 🟢 Düşük | Community impl (m1guelpf/swift-standard-webhooks) |
| **Kotlin** | 🟡 Orta | Java SDK'dan türetilebilir |
| **Rust** | 🟡 Orta | Standard Webhooks reference impl |

### Aşama 3: SDK Kalitesini Artır (Öncelik: Orta)

- [ ] Async/await desteği (Python, Node.js, Ruby)
- [ ] Retry logic with exponential backoff
- [ ] Rate limit handling (429 → otomatik bekleme)
- [ ] Connection pooling (Go, Java)
- [ ] OpenTelemetry tracing hooks
- [ ] Comprehensive error types

### Aşama 4: Ekstra Feature'lar (Öncelik: Düşük)

- [ ] Terraform provider
- [ ] CLI tool (npx hookrelay-cli)
- [ ] OpenAPI spec generation
- [ ] SDK auto-generation pipeline

---

## 📚 Referans Kod Yapısı

### Standard Webhooks Verification (Go — Referans)

```go
// Standard Webheaders header constants
const (
    HeaderWebhookID        = "webhook-id"
    HeaderWebhookSignature = "webhook-signature"
    HeaderWebhookTimestamp = "webhook-timestamp"
)

// Secret prefix
const webhookSecretPrefix = "whsec_"

// Tolerance: 5 minutes
var tolerance = 5 * time.Minute

// Verify flow:
// 1. Read headers (webhook-id, webhook-signature, webhook-timestamp)
// 2. Parse timestamp, check tolerance
// 3. Compute: HMAC-SHA256(secret, "{id}.{timestamp}.{body}")
// 4. Base64 encode → "v1,{base64}"
// 5. Compare with constant-time comparison
```

### Svix SDK Architecture (Go — Referans)

```go
// Client yapısı
type Svix struct {
    client *SvixHttpClient
    
    Application    *Application
    Endpoint       *Endpoint
    Message        *Message
    MessageAttempt *MessageAttempt
    Statistics     *Statistics
    // ... resource-based pattern
}

// Her resource kendi CRUD operasyonlarına sahip
type Endpoint struct { ... }
func (e *Endpoint) Create(ctx, req) (*Endpoint, error)
func (e *Endpoint) Get(ctx, id) (*Endpoint, error)
func (e *Endpoint) List(ctx) (*ListResponse, error)
func (e *Endpoint) Delete(ctx, id) error
```

---

## ✅ Sonuç ve Öneriler

### Hemen Yapılması Gerekenler
1. **PHP SDK'ya webhook verification ekle** — Tek eksik dil
2. **Tüm SDK'ları Standard Webhooks uyumlu yap** — `webhook-*` header desteği
3. **`whsec_` prefix decode'ı tutarlı hale getir** — Tüm dillerde aynı davranış

### Kısa Vadeli (1-2 hafta)
4. **Go SDK'ya proper Webhook struct ekle** — Svix pattern'inden ilham al
5. **Test suite'leri oluştur** — Cross-language uyumluluk testleri
6. **README'leri güncelle** — Standard Webhooks uyumluluğu vurgulanmalı

### Orta Vadeli (1 ay)
7. **Elixir ve Swift SDK'lar** — Community contribution olarak
8. **Kotlin SDK** — Java SDK'dan türetilebilir
9. **Terraform provider** — Enterprise müşteri çekmek için

### Yasal Uyarlama
- ✅ Standard Webhooks spec'ini takip et — MIT lisanslı açık standart
- ✅ Svix'in tasarım kalıplarını referans al — doğrudan kopyalama yapma
- ✅ Hookdeck Outpost'un mimari fikirlerini kullan — Apache 2.0
- ✅ Her SDK'da LICENSE dosyası bulundur
- ✅ Third-party kod kullandıysan NOTICES/AUTHORS dosyası ekle

---

> 💡 Bu rapor, HookRelay SDK'larının endüstri standartlarına uyumunu sağlamak için bir yol haritası sunmaktadır.
