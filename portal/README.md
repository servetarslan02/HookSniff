# HookRelay — Embeddable Webhook Portal Widget

Müşterilerinizin kendi sitelerine tek satır kod ile ekleyebileceği, iframe tabanlı webhook portal widget'ı.

## Hızlı Başlangıç

```html
<script
  src="https://cdn.hookrelay.com/portal/embed.js"
  data-api-key="YOUR_API_KEY"
></script>
```

Bu kadar. Sayfanıza bir webhook portalı eklenecek.

## Parametreler

| Parametre | Zorunlu | Varsayılan | Açıklama |
|-----------|---------|------------|----------|
| `data-api-key` | ✅ | — | Müşteri API anahtarı |
| `data-api-url` | ❌ | `https://api.hookrelay.com` | API base URL |
| `data-theme` | ❌ | `dark` | Tema: `dark` veya `light` |
| `data-height` | ❌ | `600px` | Widget yüksekliği |
| `data-width` | ❌ | `100%` | Widget genişliği |

## Örnekler

### Light tema, özel boyut

```html
<script
  src="https://cdn.hookrelay.com/portal/embed.js"
  data-api-key="hrk_abc123"
  data-theme="light"
  data-height="500px"
  data-width="800px"
></script>
```

### Self-hosted API

```html
<script
  src="https://cdn.hookrelay.com/portal/embed.js"
  data-api-key="hrk_abc123"
  data-api-url="https://hooks.mysite.com"
></script>
```

## Dosya Yapısı

```
portal/
├── embed.js      ← Ana script (iframe oluşturur)
├── widget.html   ← Iframe içeriği (webhook listesi)
├── style.css     ← Dark/light tema stilleri
└── README.md     ← Bu dosya
```

## Widget Özellikleri

- **Authentication** — API key ile güvenli erişim
- **Son 50 webhook** — Teslimat durumu, timestamp, event type
- **Detay paneli** — Payload, headers, delivery attempts
- **Dark/Light tema** — Toggle ile geçiş, `localStorage` ile kalıcı
- **Arama & filtreleme** — Event type ve duruma göre filtre
- **Responsive** — Mobil ve masaüstü uyumlu
- **Animasyonlar** — Slide-in detail panel, toast bildirimler, loading spinner

## API Yanıt Formatı

Widget, `/api/v1/webhooks?limit=50` endpoint'ine şu formatta yanıt bekler:

```json
{
  "webhooks": [
    {
      "id": "wh_01HXYZ...",
      "event_type": "order.created",
      "status": "delivered",
      "endpoint_url": "https://example.com/webhook",
      "created_at": "2026-05-06T10:30:00Z",
      "headers": { "Content-Type": "application/json" },
      "payload": { "order_id": "12345" },
      "attempts": [
        {
          "status": "delivered",
          "timestamp": "2026-05-06T10:30:01Z",
          "response_code": 200
        }
      ]
    }
  ]
}
```

### Webhook Obje Alanları

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | string | Webhook ID |
| `event_type` | string | Event tipi (örn. `order.created`) |
| `status` | string | `delivered`, `failed`, veya `pending` |
| `endpoint_url` | string | Hedef URL |
| `created_at` | string | ISO 8601 timestamp |
| `headers` | object/string | İstek header'ları |
| `payload` | object/string | İstek body'si |
| `attempts` | array | Teslimat denemeleri |

## CORS

API sunucusunda aşağıdaki header'ların ayarlandığından emin olun:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Methods: GET, OPTIONS
```

## Self-Hosting

Dosyaları kendi CDN'inize veya sunucunuza yükleyin:

```bash
# Dosyaları sunucuya kopyala
cp embed.js widget.html style.css /var/www/portal/

# Nginx örneği
server {
    listen 443 ssl;
    server_name portal.yoursite.com;

    location / {
        add_header Access-Control-Allow-Origin *;
        root /var/www/portal;
    }
}
```

## Güvenlik

- API key iframe URL'inde query param olarak geçer (parent page'de görünmez)
- `postMessage` kullanılmaz — iframe sandbox'lanmıştır
- `loading="lazy"` ile performans optimizasyonu
- XSS koruması için tüm dinamik content escape edilir

## Tarayıcı Desteği

Chrome 60+, Firefox 60+, Safari 12+, Edge 79+

## Lisans

MIT
