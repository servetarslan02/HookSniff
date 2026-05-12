# 📨 Gelen (Inbound)

> Sayfa: `dashboard/src/app/[locale]/dashboard/inbound/page.tsx`
> Route: `/dashboard/inbound`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Provider Listesi
| Provider | İkon | Docs |
|----------|------|------|
| Stripe | 💳 | stripe.com/docs/webhooks |
| GitHub | 🐙 | docs.github.com/en/webhooks |
| Shopify | 🛒 | shopify.dev/docs |
| Generic | 🔗 | - |

### Veri Akışı
- `endpointsApi.list(token)` → endpoint listesi
- `inboundApi.listConfigs(token)` → inbound konfigürasyonları
- `inboundApi.create(token, {provider, endpoint_id, secret})` → yeni konfigürasyon

## Özellikler
- ✅ Provider seçimi (Stripe, GitHub, Shopify, Generic)
- ✅ Endpoint atama
- ✅ Webhook secret girişi
- ✅ "How it works" açıklaması
- ✅ Konfigürasyon listesi
- ✅ i18n desteği

## Tespit Edilen Durumlar
### ⚠️ Potansiyel Sorunlar
- **API_BASE hardcoded** — `process.env.NEXT_PUBLIC_API_URL` fallback ile
- **"📨" emoji hardcoded** — i18n key yerine doğrudan emoji
- **Provider docs linkleri hardcoded** — i18n değil

### 🔴 Eksiklikler
- Konfigürasyon düzenleme yok
- Konfigürasyon silme yok
- Webhook test butonu yok
- Provider bazlı rehber yok
- Entegrasyon durumu gösterimi yok
