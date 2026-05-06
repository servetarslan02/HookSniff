# CloudEvents Rust SDK — Analizi

## 📋 Genel Bilgi
- **Repo:** https://github.com/cloudevents/sdk-rust
- **Lisans:** Apache 2.0 ✅
- **Standard:** CloudEvents v1.0 (CNCF graduated project)
- **crates.io:** `cloudevents` crate

## 📐 CloudEvents v1.0 Attributes

### Required (Zorunlu)
| Attribute | Tip | Açıklama |
|-----------|-----|----------|
| `specversion` | String | `"1.0"` |
| `id` | String | Event unique ID |
| `type` | String | Event type (örn: `order.created`) |
| `source` | URI-reference | Event kaynağı |

### Optional (Opsiyonel)
| Attribute | Tip | Açıklama |
|-----------|-----|----------|
| `datacontenttype` | String | Content type (örn: `application/json`) |
| `dataschema` | URI | Schema URL |
| `subject` | String | Event konusu |
| `time` | Timestamp | Event zamanı (ISO 8601) |

### Payload Yapısı
```json
{
  "specversion": "1.0",
  "id": "1234-5678",
  "type": "order.created",
  "source": "/myapp/orders",
  "time": "2024-01-01T00:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "order_id": "ORD-123",
    "amount": 100
  }
}
```

## 🦀 Rust SDK Yapısı

### Core Types
- `Event` — CloudEvents ana tipi
- `Attributes` (v1.0) — specversion, id, type, source, + optional
- `AttributesV03` — eski versiyon uyumluluğu
- `EventBuilder` — builder pattern ile event oluşturma
- `SpecVersion` — V10 veya V03

### Serialization
- JSON format
- BinarySerializer / MessageSerializer
- HTTP binding desteği

### Kullanım Örneği
```rust
use cloudevents::Event;

let event = Event::builder()
    .id("my-id")
    .source("https://example.com")
    .ty("order.created")
    .data("application/json", json!({"order_id": "123"}))
    .build()?;
```

## 🔄 HookRelay Entegrasyonu

### Mevcut Durum
HookRelay'in `events/cloudevents.rs` dosyası var — muhtemelen kısmi implementasyon.

### Karşılaştırma

| Özellik | CloudEvents SDK | HookRelay Mevcut |
|---------|----------------|-----------------|
| specversion | ✅ v1.0 + v0.3 | ❓ Kontrol et |
| id | ✅ UUID default | ✅ Var |
| type | ✅ | ✅ Var |
| source | ✅ URI | ❓ |
| time | ✅ ISO 8601 | ✅ Var |
| JSON serialization | ✅ | ✅ Var |
| Binary content mode | ✅ | ❓ |

### Tavsiye
**CloudEvents SDK'yı doğrudan kullanma** — fazla karmaşık ve HookRelay'in scope'u dışında. Bunun yerine:

1. CloudEvents **format standardını** takip et (specversion, id, type, source, time)
2. Mevcut `events/cloudevents.rs`'i bu standarda uygun hale getir
3. Customer-facing API'de CloudEvents formatını opsiyonel olarak sun

### Entegrasyon Planı
1. `events/cloudevents.rs`'i güncelle — v1.0 required attributes ekle
2. Endpoint konfigürasyonuna `format: "cloudevents" | "standard"` seçeneği ekle (zaten var)
3. Customer SDK'larda CloudEvents formatını destekle

## ✅ Yapılacaklar
1. Mevcut `cloudevents.rs`'i CloudEvents v1.0 spesifikasyonuna uygun hale getir
2. `specversion` ve `source` required attribute'larını ekle
3. Customer'a format seçeneği sun (standard vs cloudevents)
4. SDK'larda CloudEvents envelope parsing desteği ekle
