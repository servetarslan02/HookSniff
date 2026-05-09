# HookSniff — İlk Müşteri Deneyimi ve Onboarding Stratejisi

> Oluşturma: 2026-05-09
> Öncelik: Lansmandan ÖNCE yapılacak
> Durum: Taslak — Servet onayı bekliyor

---

## İçindekiler

1. [Müşteri Yolculuğu](#1-müşteri-yolculuğu)
2. [Rakip Karşılaştırması](#2-rakip-karşılaştırması)
3. [Mevcut Durum Analizi](#3-mevcut-durum-analizi)
4. [Tespit Edilen Sorunlar](#4-tespit-edilen-sorunlar)
5. [Çözümler](#5-çözümler)
6. [Uygulama Planı](#6-uygulama-planı)

---

## 1. Müşteri Yolculuğu

Bir developer'ın HookSniff ile ilk temasından ilk webhook'unu göndermesine kadar yaşadığı adımlar:

### Adım 1: Landing Page (hooksniff.vercel.app)

**Müşteri ne görüyor:**
- Typewriter efektli başlık
- "How It Works" — 3 adım: Send → Deliver → Monitor
- Özellik listesi (retry, HMAC, dashboard, DLQ, global)
- Fiyatlandırma: $0 / $49 / $149
- "Get Started" butonu → login sayfası

**Sorun:** Fiyatlar güncel değil. $29/$99 olmalı.

---

### Adım 2: Kayıt (/login)

**Müşteri ne görüyor:**
- Login/Register toggle (tek sayfa)
- Email + şifre + isteğe bağlı isim
- Şifre gücü göstergesi (Weak/Medium/Strong)
- Kayıt sonrası → /dashboard'a yönlendirme

**Sorun yok.** Standart ve iyi bir kayıt akışı.

---

### Adım 3: Dashboard İlk Açılış

**Müşteri ne görüyor:**
- Onboarding modal açılıyor — 4 adım:
  1. "Welcome" — tanıtım
  2. "Create Endpoint" → /dashboard/endpoints'e yönlendirme
  3. "Send Webhook" → /dashboard/playground'a yönlendirme
  4. "Monitor Deliveries" → bitir

**Sorunlar:**
- Modal sadece yönlendiriyor, adım adım yaptırmıyor
- Kullanıcı endpoints sayfasına gidince ne yapacağını bilmiyor
- API key'den bahsedilmiyor
- Playground'a gidince "şimdi ne yapacağım?" diyor

---

### Adım 4: API Key Alma

**Müşteri ne görüyor:**
- Dashboard → Settings → API Keys
- Key oluşturma, kopyalama, silme

**Sorun:** Onboarding'de API key'den bahsedilmiyor. Kullanıcı key'i nereden bulacağını bilmiyor.

---

### Adım 5: Endpoint Oluşturma

**Müşteri ne görüyor:**
- Dashboard → Endpoints → "New Endpoint"
- URL gir → oluştur

**Sorun:** Sadece URL istiyor. İlk kullanıcı için "nereye webhook göndereceğim?" belirsiz. Hazır test URL'si yok.

---

### Adım 6: Webhook Gönderme

**Müşteri ne görüyor:**
- Dashboard → Playground
- Endpoint seç, event adı, JSON data

**Sorun:** Playground var ama onboarding'de yeterince vurgulanmamış. Hazır template yok.

---

### Adım 7: Dokümantasyon (/docs)

**Müşteri ne görüyor:**
- Quick Start: curl komutları
- Authentication açıklaması
- Signature verification (Node.js + Python)

**Sorunlar:**
- Sadece curl örnekleri, SDK örnekleri yok
- "5 dakikada ilk webhook" vaadi var ama adım adım rehber eksik
- Core concepts (endpoint, delivery, secret) açıklanmamış
- Integration örnekleri ayrı dosyada, link yok

---

## 2. Rakip Karşılaştırması

### Svix — Sektör Lideri ($17M yatırımlı)

**Kayıt sonrası akış:**
1. Dashboard açılır, "Quickstart" sayfası direkt gösterilir
2. API key otomatik oluşturulur, kopyalamak tek tık
3. "Core Concepts" hemen açıklanır: Application, Endpoint, Message
4. SDK kurulumu: `npm install svix` — 3 dilde örnek
5. Kod örnekleri: Application oluştur → Message gönder → Bitti

**Svix'in güçlü yönleri:**
- Kavramlar hemen açıklanıyor (Application, Endpoint, Message)
- SDK örnekleri quickstart'ta var
- "How Svix works" bölümü — bilgi akışı şeması
- uid desteği — kendi ID'lerini Svix'te kullanabilir
- Idempotency desteği — güvenli retry

**Svix Portal Sistemi:**
- Beyaz etiketli portal (iframe ile embed)
- Müşteri kendi endpoint'lerini yönetir
- Müşteri kendi delivery'lerini görür
- Müşteri Svix varlığını bile bilmez
- Magic link ile erişim — Svix hesabı gerekmez

Bu çok güçlü bir özellik. HookSniff'te embed widget var ama portal sistemi yok.

---

### Hook0 — Açık Kaynak Rakip

**Kayıt sonrası akış:**
1. Dashboard açılır, UI tutorial başlar (isteğe bağlı)
2. 8 adımlı tutorial:
   - Step 1: Docker ile başlat (self-hosted) veya cloud'a kayıt
   - Step 2: Application oluştur
   - Step 3: API token al
   - Step 4: Event type oluştur (`user.account.created`)
   - Step 5: Webhook subscription oluştur (webhook.site ile test)
   - Step 6: İlk event'i gönder
   - Step 7: Delivery'leri kontrol et
   - Step 8: Signature verification

**Hook0'un güçlü yönleri:**
- Hook0 Play — anında test URL'si, kayıt gerekmez (`play.hook0.com`)
- Adım adım tutorial her adımda ne yapılacağını söylüyor
- Dashboard'da inline tutorial (sayfa içinde rehber)
- webhook.site entegrasyonu — anında test

**Hook0'un zayıf yönleri:**
- 8 adım çok fazla, kullanıcı yorulabilir
- Payload string formatı kafa karıştırıcı
- Self-hosted kurulum zor

---

### Hookdeck — Farklı Ürün (Inbound)

**Onboarding:**
- CLI odaklı: `hookdeck listen` ile localhost'a tunnel
- Console'da payload inspection
- Radar ile latency alerts

**Hookdeck'in güçlü yönleri:**
- CLI tool — developer'lar terminal'den sever
- Anında localhost testi
- Console'da gerçek zamanlı payload görüntüleme

**Not:** Hookdeck farklı sorun çözüyor (inbound webhook). Doğrudan karşılaştırma adaletsiz olur.

---

### Karşılaştırma Tablosu

| Özellik | Svix | Hook0 | HookSniff |
|---------|------|-------|-----------|
| İlk açılış | Quickstart sayfası | UI tutorial | Onboarding modal (4 adım) |
| API key | Otomatik oluşturulur | Manuel oluşturulur | Manuel oluşturulur |
| Core concepts | Hemen açıklanır | Dokümanda var | Yok |
| SDK quickstart | 3 dil (Node, Python, Go) | Yok (sadece curl) | Yok (sadece curl) |
| Test aracı | Svix Play (test endpoint) | Hook0 Play (anında URL) | Playground (dashboard) |
| CLI tool | Yok | Yok | Yok |
| Portal sistemi | ✅ Beyaz etiketli iframe | ❌ Yok | ❌ Yok (embed widget var) |
| Inline tutorial | ❌ Yok | ✅ Dashboard içinde | ❌ Yok |
| Adım sayısı | 4 (basit) | 8 (detaylı) | 4 (yönlendirme) |
| Test endpoint | Svix Play | webhook.site + Play | Playground |
| Signature verification | Dokümanda | 8. adımda | Dokümanda |
| Integration örnekleri | ❌ Yok | ❌ Yok | ✅ Var (examples.md) |
| i18n | ❌ Yok | ❌ Yok | ✅ 8 dil |

---

## 3. Mevcut Durum Analizi

### Landing Page

| Konu | Durum | Sorun |
|------|-------|-------|
| Başlık | Typewriter efekti | İyi |
| How It Works | 3 adım | İyi |
| Özellikler | 6 özellik | İyi |
| Fiyatlandırma | $0/$49/$149 | ❌ Güncel değil |
| CTA | "Get Started" | İyi |
| Try It Now | Yok | ❌ Rakiplerde var |
| SDK tanıtımı | Yok | ❌ Svix'te var |

### Kayıt Akışı

| Konu | Durum | Sorun |
|------|-------|-------|
| Login/Register | Tek sayfa toggle | İyi |
| Şifre gücü | Gösterge var | İyi |
| Email verification | Var | İyi |
| Yönlendirme | /dashboard | İyi |

### Onboarding Modal

| Konu | Durum | Sorun |
|------|-------|-------|
| Adım sayısı | 4 | İyi |
| Görseller | SVG illüstrasyonlar | İyi |
| Yönlendirme | Sayfalara link var | İyi |
| Etkileşim | Yok | ❌ Sadece yönlendirme |
| API key | Bahsedilmiyor | ❌ Kritik eksik |
| Tekrar açılabilir | Hayır | ❌ localStorage |

### Dashboard

| Konu | Durum | Sorun |
|------|-------|-------|
| Quick Start kartı | Yok | ❌ Rakiplerde var |
| Test webhook butonu | Yok | ❌ Kolay deneme yok |
| Core concepts | Yok | ❌ Kullanıcı ne yapacağını bilmiyor |
| Stat kartları | Var (animasyonlu) | İyi |
| Grafikler | Var (Recharts) | İyi |

### Dokümantasyon

| Konu | Durum | Sorun |
|------|-------|-------|
| Quick start | curl örnekleri | ❌ SDK örnekleri yok |
| Core concepts | Yok | ❌ Kritik eksik |
| API reference | Swagger UI var | İyi |
| Integration examples | examples.md var | ❌ Link yok |
| Signature verification | Node.js + Python | İyi |
| i18n | 8 dil | İyi (rakiplerde yok) |

### Playground

| Konu | Durum | Sorun |
|------|-------|-------|
| Test webhook gönderme | Var | İyi |
| Endpoint seçimi | Var | İyi |
| Event type | Manuel giriş | ⚠️ Hazır template yok |
| JSON editor | Var | İyi |
| Sonuç gösterimi | Var | İyi |

---

## 4. Tespit Edilen Sorunlar

### Kritik (Lansmandan önce çözülmeli)

| # | Sorun | Etki | Rakip Durumu |
|---|-------|------|-------------|
| 1 | Core concepts yok — endpoint, delivery, secret açıklanmamış | Kullanıcı ne yaptığını bilmez | Svix'te var |
| 2 | SDK quickstart yok — sadece curl | Developer'lar SDK kullanmak ister | Svix'te 3 dil var |
| 3 | API key onboarding'de bahsedilmiyor | İlk webhook gönderilemez | Svix'te otomatik |
| 4 | Onboarding sadece yönlendirme yapıyor | Kullanıcı kaybolur | Hook0'da inline tutorial var |

### Önemli (İlk hafta çözülmeli)

| # | Sorun | Etki | Rakip Durumu |
|---|-------|------|-------------|
| 5 | Fiyatlar güncel değil ($49/$149) | Yanlış bilgi | — |
| 6 | "Try It Now" sayfası yok | Kayıt gerekli, dönüşüm düşük | Hook0 Play var |
| 7 | Dashboard'da Quick Start kartı yok | İlk adımlar belirsiz | — |
| 8 | Test webhook butonu yok | Deneme zor | — |

### İyileştirme (İlk ay çözülmeli)

| # | Sorun | Etki | Rakip Durumu |
|---|-------|------|-------------|
| 9 | Integration örnekleri gizli | Kullanıcı bulamaz | — |
| 10 | Playground'ta hazır template yok | İlk deneme zor | Hook0'da var |
| 11 | Onboarding tekrar açılamıyor | Hatırlamak isteyen açamaz | — |
| 12 | CLI tool onboarding'de yok | Developer'lar sever | Hookdeck'te var |
| 13 | Portal sistemi tanıtımı yok | Müşteri yönetimi | Svix'te güçlü |

---

## 5. Çözümler

### Çözüm 1: Core Concepts Bölümü

**Nereye:** Docs sayfası + Dashboard ana sayfa

**İçerik:**
```
HookSniff Nasıl Çalışır?

ENDPOINT
  Webhook'un gönderileceği URL.
  Örnek: https://myapp.com/webhook
  Her endpoint'in bir secret'ı var (whsec_ ile başlar).

DELIVERY
  Bir webhook'un teslimat kaydı.
  Başarılı veya başarısız olabilir.
  Başarısız olursa otomatik tekrar deneme.

SECRET
  Endpoint'in HMAC imzalama anahtarı.
  Gelen webhook'ların doğruluğunu kontrol etmek için kullanılır.

AKIŞ:
  Sen API çağrısı yap → HookSniff endpoint'e teslim eder → Başarısızsa tekrar dener
```

**Neden önemli:** Svix bunu hemen yapıyor. Kullanıcı ne yaptığını anlamadan güvenemez.

---

### Çözüm 2: SDK Quick Start

**Nereye:** Docs sayfası + Landing page + Dashboard Quick Start kartı

**Her SDK için 3 satırlık örnek:**

**Node.js:**
```javascript
import { HookSniff } from 'hooksniff-sdk';
const hs = new HookSniff('hr_live_KEY');
await hs.webhooks.send({ endpointId: 'ep_abc', event: 'order.created', data: { id: '123' } });
```

**Python:**
```python
from hooksniff import HookSniff
hs = HookSniff('hr_live_KEY')
hs.webhooks.send(endpoint_id='ep_abc', event='order.created', data={'id': '123'})
```

**Go:**
```go
hs := hooksniff.NewClient("hr_live_KEY")
hs.Webhooks.Send(ctx, "ep_abc", "order.created", map[string]string{"id": "123"})
```

**Rust:**
```rust
let hs = HookSniff::new("hr_live_KEY");
hs.webhooks().send("ep_abc", "order.created", serde_json::json!({"id": "123"})).await?;
```

**Ruby:**
```ruby
hs = HookSniff::Client.new('hr_live_KEY')
hs.webhooks.send(endpoint_id: 'ep_abc', event: 'order.created', data: { id: '123' })
```

**Java:**
```java
HookSniff hs = new HookSniff("hr_live_KEY");
hs.webhooks().send("ep_abc", "order.created", Map.of("id", "123"));
```

**Kotlin:**
```kotlin
val hs = HookSniff("hr_live_KEY")
hs.webhooks.send("ep_abc", "order.created", mapOf("id" to "123"))
```

**PHP:**
```php
$hs = new HookSniff('hr_live_KEY');
$hs->webhooks->send('ep_abc', 'order.created', ['id' => '123']);
```

**C#:**
```csharp
var hs = new HookSniffClient("hr_live_KEY");
await hs.Webhooks.SendAsync("ep_abc", "order.created", new { id = "123" });
```

**Elixir:**
```elixir
hs = HookSniff.new("hr_live_KEY")
HookSniff.Webhooks.send(hs, "ep_abc", "order.created", %{id: "123"})
```

**Swift:**
```swift
let hs = HookSniff(apiKey: "hr_live_KEY")
try await hs.webhooks.send(endpointId: "ep_abc", event: "order.created", data: ["id": "123"])
```

**Neden önemli:** Svix sadece 3 dil sunuyor. HookSniff 11 dil sunuyor — bu büyük avantaj. Ama quickstart'ta gösterilmezse kimse bilmez.

---

### Çözüm 3: Dashboard Quick Start Kartı

**Nereye:** Dashboard ana sayfası (en üstte)

**Tasarım:**
```
┌─────────────────────────────────────────────────┐
│ 🪝 Hızlı Başlangıç                              │
│                                                 │
│ [1] API Key kopyala          ✅ Tamamlandı      │
│ [2] Endpoint oluştur          ⬜ Başla →        │
│ [3] İlk webhook'u gönder      ⬜ Başla →        │
│ [4] Sonucu kontrol et         ⬜ Başla →        │
│                                                 │
│ [Turu Tekrar Göster]                            │
└─────────────────────────────────────────────────┘
```

**Davranış:**
- Her adım tıklanabilir, ilgili sayfaya gider
- Tamamlanan adımlar tik alır (localStorage ile takip)
- "Turui Tekrar Göster" butonu onboarding modal'ı tekrar açar
- Tüm adımlar tamamlanınca kart küçülür ama gizlenmez

**Neden önemli:** Hook0'da inline tutorial var. Kullanıcı dashboard'a her girdiğinde ne yapacağını bilir.

---

### Çözüm 4: Onboarding Modal'ı Yeniden Tasarla

**Mevcut:** 4 adım, sadece yönlendirme
**Önerilen:** 5 adım, etkileşimli rehber

```
Adım 1: "Hoş geldin"
  - 2 cümle tanıtım
  - "Başla" butonu

Adım 2: "API Key kopyala"
  - Settings sayfasında key otomatik seçili
  - "Kopyala" butonu
  - Kopyalandıktan sonra "Devam" butonu

Adım 3: "Test endpoint oluştur"
  - Endpoints sayfasında form açık
  - webhook.site URL'si hazır doldurulmuş
  - "Oluştur" butonu
  - Oluştuktan sonra "Devam" butonu

Adım 4: "İlk webhook'u gönder"
  - Playground'ta hazır template seçili
  - Endpoint otomatik seçilmiş
  - "Gönder" butonu
  - Sonuç gösterilir

Adım 5: "Sonucu gör"
  - Deliveries sayfasında son delivery vurgulanmış
  - "Tamamla" butonu
```

**Her adım o sayfada gerçekleşsin, modal rehberlik etsin.**

**Neden önemli:** Svix ve Hook0'un aksine, HookSniff'in onboarding'i sadece yönlendiriyor. Kullanıcı kaybolabilir.

---

### Çözüm 5: "Test Webhook" Butonu

**Nereye:** Endpoints sayfası, her endpoint satırında

**Tasarım:**
```
[ep_abc123] https://myapp.com/webhook  [🧪 Test] [✏️ Edit] [🗑️ Delete]
```

**"Test" butonuna basınca:**
1. Hazır test webhook gönderilir (`event: "test.ping"`, `data: {"hello": "world"}`)
2. Sonuç modal'da gösterilir:
   - ✅ Başarılı — 200 OK (145ms)
   - ❌ Başarısız — 500 Error (retry edilecek)
3. "Detayları Gör" linki → deliveries sayfası

**Neden önemli:** Kullanıcı endpoint oluşturduktan sonra hemen test edebilmeli.

---

### Çözüm 6: "Try It Now" Sayfası

**Nereye:** Landing page'e "Try it now" butonu → `/try` sayfası

**Tasarım:**
```
┌─────────────────────────────────────────────────┐
│ 🧪 HookSniff'i Dene — Kayıt Gerekmez           │
│                                                 │
│ 1. Test URL'n:                                  │
│    https://hooksniff.app/try/abc123             │
│    [Kopyala]                                    │
│                                                 │
│ 2. Bu komutu çalıştır:                          │
│    curl -X POST https://api.hooksniff.com/...   │
│    [Kopyala]                                    │
│                                                 │
│ 3. Sonuç:                                       │
│    ✅ Teslim edildi — 200 OK (145ms)            │
│    [Detayları Gör]                              │
│                                                 │
│ [Kayıt Ol ve Devam Et]                          │
└─────────────────────────────────────────────────┘
```

**Neden önemli:** Hook0 Play ve Svix Play var. Kayıt gerekmeden denemek dönüşümü artırır.

---

### Çözüm 7: Landing Page Fiyatlarını Güncelle

**Mevcut:** $0 / $49 / $149
**Önerilen:** $0 / $29 / $99

Ayrıca "5x cheaper than Svix" mesajı ekle.

---

### Çözüm 8: Integration Örneklerini Göster

**Nereye:** Docs sayfası, ayrı section

**examples.md'deki örnekleri docs sayfasına taşı:**
- Stripe → Slack
- GitHub → Deploy
- Node.js handler
- Python handler

**Neden önemli:** Mevcut ama gizli. Kullanıcı bulamaz.

---

### Çözüm 9: Playground Template'leri

**Nereye:** Dashboard → Playground

**Hazır template'ler:**
```
[Test]          event: "test.ping"        data: {"hello": "world"}
[Order]         event: "order.created"    data: {"id": "123", "total": 99.99}
[Payment]       event: "payment.completed" data: {"customer": "cus_123", "amount": 4999}
[User]          event: "user.created"     data: {"id": "u_123", "email": "..."}
[Custom]        event: ""                 data: {}
```

Kullanıcı template seçince form otomatik dolar.

---

## 6. Uygulama Planı

### Faz 1: Temel İyileştirmeler (Lansmandan önce — 6 saat)

| Sıra | Ne | Zaman | Dosya |
|------|-----|-------|-------|
| 1 | Core Concepts bölümü (docs + dashboard) | 1 saat | docs/quickstart.md, dashboard docs page |
| 2 | SDK quick start (11 dil, 3'er satır) | 2 saat | docs/quickstart.md, dashboard docs page |
| 3 | Fiyatları güncelle ($29/$99) | 30 dk | dashboard landing page |
| 4 | Landing page'e "5x cheaper than Svix" | 30 dk | dashboard landing page |
| 5 | Integration örneklerini docs sayfasına taşı | 30 dk | dashboard docs page |
| 6 | Playground template'leri ekle | 1 saat | dashboard playground page |

### Faz 2: Onboarding İyileştirmeleri (İlk hafta — 8 saat)

| Sıra | Ne | Zaman | Dosya |
|------|-----|-------|-------|
| 7 | Dashboard Quick Start kartı | 2 saat | dashboard page.tsx |
| 8 | Onboarding modal yenileme (etkileşimli) | 3 saat | Onboarding.tsx |
| 9 | "Test Webhook" butonu (endpoints sayfası) | 1 saat | endpoints page.tsx |
| 10 | Onboarding tekrar açma butonu | 30 dk | Onboarding.tsx |
| 11 | API key otomatik oluşturma (kayıt sonrası) | 1 saat | auth flow |

### Faz 3: Gelişmiş Özellikler (İlk ay — 6 saat)

| Sıra | Ne | Zaman | Dosya |
|------|-----|-------|-------|
| 12 | "Try It Now" sayfası (kayıt gerekmez) | 3 saat | yeni sayfa + API |
| 13 | CLI tool tanıtımı (docs) | 1 saat | docs |
| 14 | Portal sistemi tanıtımı (docs) | 1 saat | docs |
| 15 | Landing page SDK showcase | 1 saat | landing page |

### Toplam: ~20 saat

---

## Beklenen Etki

| İyileştirme | Dönüşüm Etkisi |
|-------------|---------------|
| Core concepts | Kullanıcı ne yaptığını anlar → güven artar |
| SDK quickstart | Developer deneyimi iyileşir → signup artar |
| Quick Start kartı | İlk adımlar netleşir → activation artar |
| Onboarding yenileme | Kaybolma azalır → activation artar |
| Test webhook butonu | Deneme kolaylaşır → activation artar |
| Try It Now | Kayıt gerekmez → signup artar |
| Fiyat güncelleme | Doğru bilgi → güven artar |

**Tahmini etki:** Mevcut activation oranı ~%30 → hedef ~%60

(Activation = kayıt olan kullanıcıdan ilk webhook'unu gönderen oranı)
