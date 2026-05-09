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
6. [Ek Analiz](#6-ek-analiz-tamamlayıcı)
   - 6.1 Email Akışları
   - 6.2 Hata Durumları
   - 6.3 Mobil Deneyim
   - 6.4 Billing (Ödeme) Akışı
   - 6.5 "Kendin Yap" Rakibi
   - 6.6 Analytics/Takip Planı
7. [Uygulama Planı (Güncellenmiş)](#7-uygulama-planı-güncellenmiş)
8. [Beklenen Etki](#8-beklenen-etki)
9. [Canlı Test Planı](#9-canlı-test-planı-ai-tarafından-yapılacak)

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

## 6. Ek Analiz (Tamamlayıcı)

### 6.1 Email Akışları

**Mevcut email sistemi:** Google Cloud Gmail API (service account)

| Email | Durum | İçerik |
|-------|-------|--------|
| Hoş geldin emaili | ✅ Var | "Welcome to HookSniff!" — basit HTML |
| Email doğrulama | ✅ Var | 24 saat geçerli link |
| Şifre sıfırlama | ✅ Var | 1 saat geçerli link |
| Başarısız teslimat bildirimi | ✅ Var | Endpoint adı + hata detayı |
| Haftalık özet | ❌ Yok | — |
| Kullanım limiti uyarısı | ❌ Yok | — |
| İlk webhook tebrik | ❌ Yok | — |
| Pro plan'a geçiş tebrik | ❌ Yok | — |

**Eksik emailler:**

| Email | Ne zaman gönderilmeli | İçerik |
|-------|---------------------|--------|
| İlk webhook tebrik | İlk başarılı teslimattan sonra | "Tebrikler! İlk webhook'un teslim edildi. Dashboard'dan sonuçları görebilirsin." |
| Haftalık özet | Her Pazartesi | "Bu hafta X webhook teslim edildi, %Y başarı oranı." |
| Kullanım limiti uyarısı | Limitin %80'ine ulaşıldığında | "Bu ay X/Y webhook kullandınız. Pro plan'a geçmeyi düşünün." |
| Pro plan tebrik | Plan yükseltme sonrası | "Pro plan'a hoş geldiniz! Yeni özellikleriniz: ..." |
| 30 gün pasif | 30 gün giriş yapılmamış | "Sizi özledik! Dashboard'da sizi bekleyen X teslimat var." |

### 6.2 Hata Durumları

**Kayıt hataları:**

| Hata | Mevcut mesaj | Sorun |
|------|-------------|-------|
| Email zaten kayıtlı | "Email already registered" | İyi ama "Giriş yap veya şifre sıfırla" linki yok |
| Şifre kısa | "Password must be at least 8 characters" | İyi |
| Email geçersiz | "Invalid email" | İyi |
| Rate limit | "Rate limit exceeded" | Kullanıcı ne yapacağını bilmiyor |
| Sunucu hatası | Generic error | İyi |

**Giriş hataları:**

| Hata | Mevcut mesaj | Sorun |
|------|-------------|-------|
| Email bulunamadı | "Unauthorized" | Çok belirsiz — "Email bulunamadı" demeli |
| Yanlış şifre | "Unauthorized" | Çok belirsiz — "Şifre yanlış" demeli |
| Hesap deaktif | "Account has been deactivated" | İyi |
| 2FA gerekli | TwoFactorRequiredResponse | İyi |
| Rate limit | "Rate limit exceeded" | İyi |

**Dashboard hataları:**

| Hata | Mevcut | Sorun |
|------|--------|-------|
| Sayfa hatası | error.tsx — "Something went wrong" + Try again | İyi |
| 404 | not-found.tsx — "404" + Back to Home | İyi |
| Loading | loading.tsx var | İyi |
| API hatası | getErrorMessage() helper | İyi |
| Toast bildirimleri | Toast component var | İyi |

**Kritik eksiklik:**
- Hata mesajları çok genel. "Unauthorized" yerine "Email veya şifre hatalı" demeli.
- Rate limit mesajında "X dakika sonra tekrar deneyin" demeli.
- Kayıt hatasında "Zaten hesabın var mı? Giriş yap" linki olmalı.

### 6.3 Mobil Deneyim

**Landing page:**
- ✅ Responsive — `md:` ve `sm:` breakpoint'leri var
- ✅ Mobil hamburger menü var
- ✅ Font boyutları responsive (`text-4xl md:text-6xl`)
- ✅ Grid layout responsive (`grid-cols-1 md:grid-cols-3`)

**Dashboard:**
- ⚠️ Sidebar mobilde gizleniyor ama toggle mekanizması kontrol edilmedi
- ⚠️ Tablolar mobilde taşabilir
- ⚠️ Grafikler mobilde küçük kalabilir

**Onboarding modal:**
- ✅ `max-w-lg w-full` — responsive
- ⚠️ Küçük ekranda butonlar sıkışabilir

**Genel:** Landing page iyi. Dashboard'da mobil test yapılmalı.

### 6.4 Billing (Ödeme) Akışı

**Mevcut ödeme sağlayıcıları:**
- ✅ Stripe (global)
- ✅ Polar.sh (global, MoR)
- ✅ iyzico (Türkiye) — hesap açılacak

**Billing sayfası:**
- Plan karşılaştırma tablosu: $0 / $49 / $149 (güncellenmeli)
- Kullanım grafiği (SVG chart)
- Fatura listesi
- Plan yükseltme butonu

**Eksiklikler:**
| Konu | Durum | Sorun |
|------|-------|-------|
| Fiyatlar | $49/$149 | ❌ $29/$99 olmalı |
| Türkiye fiyatı | ₺149 | ₺99 olmalı |
| Kullanım limiti uyarısı | ❌ Yok | %80'de email + dashboard bildirimi |
| Plan yükseltme sonrası | ❌ Yok | Tebrik emaili + dashboard toast |
| Downgrade akışı | ❌ Yok | Kullanıcı plan düşürmek isterse |
| Fatura indirme | ✅ Var | İyi |
| Müşteri portalı | ✅ Var | İyi |

### 6.5 "Kendin Yap" Rakibi

Developer'lar webhook altyapısını kendileri de yazabilir. Karşılaştırma:

| | Kendin Yap | HookSniff |
|---|-----------|-----------|
| Kurulum süresi | 2-4 hafta | 5 dakika |
| Retry mekanizması | Elle yazılmalı | Otomatik |
| HMAC imzalama | Elle yazılmalı | Otomatik |
| Dead letter queue | Elle yazılmalı | Otomatik |
| Monitoring | Elle yazılmalı | Dashboard dahil |
| SDK desteği | Yok | 11 dil |
| Bakım | Sürekli | HookSniff halleder |
| Maliyet | Developer zamanı | $0/ay (free tier) |

**Pazarlama mesajı:** "Webhook altyapısını kendin yazmak 2-4 hafta sürer. HookSniff ile 5 dakikada başlayın."

### 6.6 Analytics/Takip Planı

**Ölçülmesi gerekenler:**

| Metrik | Tanım | Hedef |
|--------|-------|-------|
| Signup conversion | Landing page → kayıt | %5+ |
| Activation rate | Kayıt → ilk webhook | %60+ |
| Time to first webhook | Kayıttan ilk webhook'a süre | <10 dk |
| Onboarding completion | Modal'ı tamamlayanlar | %80+ |
| Drop-off noktası | Hangi adımda vazgeçiyorlar | Tespit et |
| Feature adoption | Hangi özellikler kullanılıyor | Tespit et |

**Nasıl ölçülecek:**
- Google Analytics (ücretsiz) — landing page trafik
- Dashboard'da event tracking — onboarding adımları
- Backend'de log — API kullanımı, hata oranları
- PostHog veya Mixpanel (ücretsiz tier) — kullanıcı yolculuğu

---

## 7. Uygulama Planı (Güncellenmiş)

> Not: Aşağıdaki plan, Bölüm 6'daki orijinal planın genişletilmiş halidir. Ek analiz bulgularını içerir.

### Faz 0: Temel Düzeltmeler (Lansmandan önce — 4 saat)

| Sıra | Ne | Zaman | Dosya |
|------|-----|-------|-------|
| 1 | Fiyatları güncelle ($29/$99, ₺99/₺299) | 30 dk | landing page + billing page |
| 2 | Hata mesajlarını iyileştir (Türkçe + İngilizce) | 1 saat | auth flow + errors.ts |
| 3 | "Zaten hesabın var mı?" linki (kayıt hatasında) | 30 dk | login page |
| 4 | Rate limit mesajında süre göster | 30 dk | auth flow |
| 5 | Kullanım limiti uyarısı (%80'de) | 1 saat | billing page + email |

### Faz 1: Onboarding İyileştirmeleri (İlk hafta — 10 saat)

| Sıra | Ne | Zaman | Dosya |
|------|-----|-------|-------|
| 6 | Core Concepts bölümü | 1 saat | docs + dashboard |
| 7 | SDK quick start (11 dil) | 2 saat | docs + dashboard |
| 8 | Dashboard Quick Start kartı | 2 saat | dashboard page.tsx |
| 9 | Onboarding modal yenileme | 3 saat | Onboarding.tsx |
| 10 | "Test Webhook" butonu | 1 saat | endpoints page.tsx |
| 11 | Playground template'leri | 1 saat | playground page.tsx |

### Faz 2: Gelişmiş Özellikler (İlk ay — 8 saat)

| Sıra | Ne | Zaman | Dosya |
|------|-----|-------|-------|
| 12 | "Try It Now" sayfası | 3 saat | yeni sayfa + API |
| 13 | Eksik emailler (tebrik, haftalık özet) | 2 saat | email.rs |
| 14 | Integration örneklerini docs'a taşı | 1 saat | docs page |
| 15 | CLI tool tanıtımı | 1 saat | docs |
| 16 | Analytics entegrasyonu | 1 saat | dashboard |

### Faz 3: Ölçme ve Optimizasyon (İlk 3 ay — sürekli)

| Sıra | Ne | Zaman |
|------|-----|-------|
| 17 | Google Analytics kurulumu | 1 saat |
| 18 | PostHog/Mixpanel kurulumu | 2 saat |
| 19 | Haftalık metrik review | Sürekli |
| 20 | A/B test (onboarding varyasyonları) | Sürekli |

### Toplam: ~22 saat + sürekli optimizasyon

---

## 8. Beklenen Etki

| İyileştirme | Dönüşüm Etkisi |
|-------------|---------------|
| Fiyat güncelleme | Doğru bilgi → güven artar |
| Hata mesajları | Kullanıcı ne yapacağını bilir → frustration azalır |
| Core concepts | Kullanıcı ne yaptığını anlar → güven artar |
| SDK quickstart | Developer deneyimi iyileşir → signup artar |
| Quick Start kartı | İlk adımlar netleşir → activation artar |
| Onboarding yenileme | Kaybolma azalır → activation artar |
| Test webhook butonu | Deneme kolaylaşır → activation artar |
| Try It Now | Kayıt gerekmez → signup artar |
| Eksik emailler | Kullanıcı bağlılığı artar → churn azalır |
| Analytics | Ölçme → optimizasyon → sürekli iyileştirme |

**Tahmini etki:**
- Mevcut activation oranı: ~%30 (tahmini)
- Hedef activation oranı: ~%60
- İlk 2 ay hedefi: 50-100 kullanıcı, 5-10 ödeme

---

## 9. Canlı Test Planı (AI Tarafından Yapılacak)

> Bu testler bir sonraki oturumda AI tarafından gerçekleştirilecektir. Sonuçlar rapora eklenecek ve tespitler güncellenecektir.

### Test 1: Landing Page İncelemesi
- [ ] hooksniff.vercel.app açılacak
- [ ] Tüm bölümler kontrol edilecek (hero, features, pricing, footer)
- [ ] Responsive kontrol (mobil, tablet, desktop)
- [ ] Linkler çalışıp çalışmadığı kontrol edilecek
- [ ] Fiyat bilgilerinin doğruluğu kontrol edilecek
- [ ] Ekran görüntüsü alınacak

### Test 2: Kayıt Akışı
- [ ] Register formu açılacak
- [ ] Geçersiz email ile deneme (hata mesajı kontrol)
- [ ] Kısa şifre ile deneme (hata mesajı kontrol)
- [ ] Başarılı kayıt denemesi
- [ ] Hoş geldin emaili tetikleniyor mu kontrol
- [ ] Email doğrulama akışı kontrol

### Test 3: Giriş Akışı
- [ ] Yanlış email ile deneme (hata mesajı kontrol)
- [ ] Yanlış şifre ile deneme (hata mesajı kontrol)
- [ ] Rate limit tetikleme (10+ başarısız deneme)
- [ ] Başarılı giriş
- [ ] 2FA akışı (varsa)

### Test 4: Dashboard Gezintisi
- [ ] Ana sayfa (stat kartları, grafikler)
- [ ] Onboarding modal açılıyor mu
- [ ] Endpoints sayfası
- [ ] API Keys sayfası
- [ ] Deliveries sayfası
- [ ] Analytics sayfası
- [ ] Billing sayfası
- [ ] Settings sayfası
- [ ] Tüm sidebar linkleri çalışıyor mu

### Test 5: Hata Durumları
- [ ] Var olmayan URL'ye gitme (404 sayfası)
- [ ] API key olmadan istek atma (401 hatası)
- [ ] Geçersiz endpoint URL'si ile webhook gönderme
- [ ] Boş form ile endpoint oluşturma
- [ ] Ağ hatası simülasyonu

### Test 6: API Testleri (curl)
- [ ] POST /v1/auth/register
- [ ] POST /v1/auth/login
- [ ] GET /v1/endpoints
- [ ] POST /v1/endpoints
- [ ] POST /v1/webhooks
- [ ] GET /v1/webhooks
- [ ] Health check endpoint

### Test 7: Mobil Kontrol
- [ ] Landing page mobil görünüm
- [ ] Dashboard mobil görünüm
- [ ] Onboarding modal mobil
- [ ] Form'lar mobilde çalışır mı
- [ ] Tablolar mobilde okunabilir mi

### Test 8: Karşılaştırma (Rakipler)
- [ ] Svix kayıt akışı (mümkünse)
- [ ] Hook0 kayıt akışı (mümkünse)
- [ ] Onboarding deneyimleri not edilecek

### Çıktı
Testler tamamlandıktan sonra:
- Her testin sonucu (geçti/başarısız/not)
- Ekran görüntüleri
- Tespit edilen yeni sorunlar
- Raporun güncellenmesi
