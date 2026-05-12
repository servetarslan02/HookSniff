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

---

## 🔧 Backend & Frontend Uyumsuzluğu (2026-05-13)

### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Konfigürasyon silme | — (backend'de delete endpoint'i yok) | ❌ Buton yok | Backend'e eklenmeli |
| Konfigürasyon düzenleme | — (backend'de update endpoint'i yok) | ❌ Form yok | Backend'e eklenmeli |
| Webhook test | — (backend'de test endpoint'i yok) | ❌ Buton yok | Backend'e eklenmeli |

### Yapılacaklar
1. **Konfigürasyon Silme** — Mevcut inbound yapılandırmasını kaldırma
   - Backend: `DELETE /v1/inbound/configs/{id}` endpoint'i eklenmeli (Rust)
   - Frontend: ConfirmDialog ile silme butonu
2. **Konfigürasyon Düzenleme** — Secret, endpoint değiştirme
   - Backend: `PUT /v1/inbound/configs/{id}` endpoint'i eklenmeli
   - Frontend: "Düzenle" butonu → Modal: endpoint select, secret input
3. **Webhook Test** — Inbound webhook test etme
   - Backend: `POST /v1/inbound/{provider}/test` endpoint'i eklenmeli
   - Frontend: "Test Et" butonu → örnek payload gönder → sonuç gösterimi
4. **Entegrasyon Durumu** — Provider bağlantı durumu
   - Frontend: Her provider kartında bağlantı durumu göstergesi (bağlı/bağlı değil)

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Konfigürasyon Silme Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx`
- **Backend:** — (backend'de delete endpoint'i yok)
- **Sorun:** Oluşturulan konfigürasyon silinemiyor.
- **Adımlar:**
  1. Backend'e `DELETE /v1/inbound/configs/{id}` ekle (Rust)
  2. `api.ts`'ye `inboundApi.deleteConfig` ekle
  3. Her konfigürasyon kartına silme butonu + ConfirmDialog

#### BF-02: Konfigürasyon Düzenleme Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx`
- **Backend:** — (backend'de update endpoint'i yok)
- **Sorun:** Secret veya endpoint değiştirilemiyor.
- **Adımlar:**
  1. Backend'e `PUT /v1/inbound/configs/{id}` ekle
  2. "Düzenle" butonu + form (endpoint select, secret input)

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx`
- **Sorun:** 2 useEffect, 4 fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

#### P-02: Pagination Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx`
- **Sorun:** Tüm konfigürasyonlar tek seferde yükleniyor.
