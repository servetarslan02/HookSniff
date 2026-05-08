# 🚀 HookSniff — Yeni Özellik Planı

> Tarih: 2026-05-08 21:21 GMT+8
> ⚠️ Bu plan hafıza kaydıdır. Servet onayı ile uygulanacak.

---

## 📊 Mevcut Durum (Zaten Var ✅)

| Özellik | Durum | Dosya |
|---------|-------|-------|
| Alert sistemi | ✅ Var | `api/src/routes/alerts.rs` |
| Bildirim sistemi | ✅ Var | `api/src/routes/notifications.rs` |
| Çoklu dil desteği | ✅ Var (8 dil) | `dashboard/src/components/LanguageSwitcher.tsx` |
| Retry politikası | ✅ Var | `api/src/routes/webhooks.rs` (RetryPolicy) |
| Rate limiting | ✅ Var | `api/src/throttle/mod.rs` |
| Anomaly detection | ✅ Var | AI tabanlı |
| Inbound proxy | ✅ Var | `api/src/routes/inbound.rs` |
| 4 delivery method | ✅ Var | HTTP/WS/gRPC/SQS |
| Self-hosted | ✅ Var | Docker + Cloud Run |
| 11 SDK | ✅ Var | `sdks/` klasörü |

---

## 🆕 Yeni Özellikler (Eklenecek)

### 1. 🔔 "Akıllı Alarm Sistemi" (Smart Alerts)
**Mevcut:** Temel alert CRUD var
**Eksik:** Otomatik tetikleme yok

**Eklenecekler:**
- Endpoint başarı oranı %95'in altına düşünce otomatik alert
- Ortalama gecikme 5 saniyeyi geçince alert
- Hiç event gelmiyor 1 saattir alert
- Alert kanalları: email + Slack webhook + Discord webhook
- Dashboard'da alert geçmişi

**Zorluk:** Orta (1 hafta)
**Dosyalar:** `api/src/routes/alerts.rs` genişletilecek

---

### 2. 🕐 "Zaman Tüneli" (Event Timeline)
**Mevcut:** Yok
**Eksik:** Her webhook'un yaşam döngüsü görünmüyor

**Eklenecekler:**
- Her event için adım adım gösterim:
  ```
  10:00:01 → Kuyruğa alındı
  10:00:02 → Gönderildi
  10:00:03 → 500 hatası
  10:00:32 → 2. deneme
  10:00:33 → 200 başarılı ✅
  ```
- Dashboard'da "Timeline" sekmesi
- Filtre: sadece başarısız olanlar
- Filtre: son 1 saat / 24 saat / 7 gün

**Zorluk:** Orta (1 hafta)
**Dosyalar:** Yeni API endpoint + dashboard sayfası

---

### 3. 🧪 "Test Modu" (Test Mode)
**Mevcut:** Yok
**Eksik:** Geliştiriciler gerçek webhook göndermeden test edemiyor

**Eklenecekler:**
- API key iki türde: `sk_test_` (test) ve `sk_live_` (gerçek)
- Test modunda event gönderilir ama gerçek endpoint'e gitmez
- Dashboard'da "Test Events" sekmesi — tüm test event'leri görünür
- Test event'i oluştur butonu (JSON editor ile)
- Geçiş: dashboard'dan tek tıkla test → live

**Zorluk:** Orta (1 hafta)
**Dosyalar:** `api/src/middleware/auth.rs` + yeni test endpoint

---

### 4. 📊 "Müşteri İstatistikleri" (Customer Analytics)
**Mevcut:** Yok
**Eksik:** SaaS şirketleri kendi müşterilerinin webhook kullanımını göremiyor

**Eklenecekler:**
- Dashboard'da "Analytics" sekmesi
- Grafikler:
  - Günlük/halık/aylık event sayısı
  - Endpoint başarı oranı trendi
  - En yavaş endpoint'ler
  - En çok hata alan endpoint'ler
- Müşteri bazlı rapor (customer_id filtresi)
- CSV/JSON export

**Zorluk:** Orta (1-2 hafta)
**Dosyalar:** Yeni API endpoint + dashboard grafikleri

---

### 5. 🔄 "Özelleştirilebilir Retry" (Custom Retry)
**Mevcut:** Retry var ama politika sabit
**Eksik:** Müşteri kendi stratejisini seçemiyor

**Eklenecekler:**
- Dashboard'da retry politikası seçici:
  - **Hızlı:** 1s, 5s, 30s, 2m
  - **Normal:** 1m, 5m, 30m, 2s (varsayılan)
  - **Sabırlı:** 5m, 30m, 2s, 12s
  - **Özel:** Müşteri kendi değerlerini girer
- Her endpoint için ayrı politika
- Grafik: "Bu endpoint kaç denemede başarılı oldu"

**Zorluk:** Kolay (3-4 gün)
**Dosyalar:** `api/src/routes/endpoints.rs` + dashboard

---

### 6. 🏷️ "Event Etiketleri" (Event Tags)
**Mevcut:** Yok
**Eksik:** 1000+ event/gün olunca bulmak zor

**Eklenecekler:**
- Event'lere etiket ver: `#odeme`, `#siparis`, `#stok`
- Dashboard'da etiket filtresi
- Etiket bazlı alert kuralları: `#odeme` etiketli event başarısız olunca alert
- Otomatik etiket: event type'dan türet

**Zorluk:** Kolay (3-4 gün)
**Dosyalar:** DB migration + API + dashboard

---

### 7. 📱 "Telegram Bildirim Botu" (Telegram Bot)
**Mevcut:** Email bildirim var
**Eksik:** Anlık bildirim yok

**Eklenecekler:**
- **Telegram bot:** Kritik hatalarda mesaj gönder
- **Discord webhook:** Alert kanalı (opsiyonel)
- **Slack webhook:** Alert kanalı (opsiyonel)
- Dashboard'da "Bildirim Ayarları" sayfası
- Her alert kuralı için ayrı kanal seçimi

**Zorluk:** Kolay (2-3 gün)
**Dosyalar:** Yeni notification service + dashboard

---

### 8. 🔗 "Webhook Zinciri" (Event Chain / Automation)
**Mevcut:** Yok
**Eksik:** Bir event tetikleyince zincirleme aksiyon yok

**Eklenecekler:**
- Dashboard'da görsel zincir editörü:
  ```
  [Sipariş Geldi] → [Stok Güncelle] → [Muhasebeye Bildir]
  ```
- Her adımda transform (veri dönüştürme)
- Koşullu zincir: "Eğer stok < 5 ise → tedarikçiye bildir"
- Zincir geçmişi: hangi adımda hata aldı

**Zorluk:** Zor (2-3 hafta)
**Dosyalar:** Yeni automation engine + dashboard

---

### 9. 💾 "Ayar Dışa Aktar" (Config Export / Import)
**Mevcut:** Yok
**Eksik:** Ayarları yedeklemek/taşımak mümkün değil

**Eklenecekler:**
- "Export" butonu → tüm endpoint + alert + routing kuralları JSON
- "Import" butonu → JSON yükle
- Başka hesaba aktarma
- Versiyonlama: "v1", "v2" olarak kaydet

**Zorluk:** Kolay (2-3 gün)
**Dosyalar:** Yeni export/import API endpoint

---

### 10. 📈 "Uptime Monitörü" (Endpoint Health)
**Mevcut:** Yok
**Eksik:** Endpoint'in canlı olup olmadığı bilinmiyor

**Eklenecekler:**
- Her endpoint için otomatik health check (5 dakikada bir)
- Dashboard'da uptime yüzdesi: %99.9
- Son 30 gün grafik
- Düşme alert'i

**Zorluk:** Orta (1 hafta)
**Dosyalar:** Worker'a health check job + dashboard

---

### 11. 🔒 "IP Whitelist" (Güvenlik)
**Mevcut:** Yok
**Eksik:** Sadece belirli IP'lerden webhook kabul etme yok

**Eklenecekler:**
- Endpoint başına IP whitelist
- Dashboard'da IP listesi yönetimi
- CIDR desteği (192.168.1.0/24)
- Whitelist dışı IP'lerden gelen istekleri logla + alert

**Zorluk:** Kolay (2-3 gün)
**Dosyalar:** Middleware + dashboard

---

### 12. 🎯 "Webhook Playground" (Etkileşimli Test)
**Mevcut:** Yok
**Eksik:** Geliştiriciler dashboard'dan test edemiyor

**Eklenecekler:**
- Dashboard'da "Playground" sayfası
- JSON editörü: payload yaz
- "Gönder" butonu → gerçek endpoint'e gönder
- Yanıtı anında göster (status code, body, headers)
- Geçmiş: son 10 test

**Zorluk:** Kolay (2-3 gün)
**Dosyalar:** Dashboard sayfası + test API endpoint

---

## 📋 Uygulama Planı

### Faz 1 — Hızlı Kazanımlar (2 hafta)
| # | Özellik | Süre | Öncelik |
|---|---------|------|---------|
| 1 | Akıllı Alarm Sistemi | 1 hafta | 🔴 Yüksek |
| 2 | Telegram Bot | 2-3 gün | 🔴 Yüksek |
| 3 | Test Modu | 1 hafta | 🔴 Yüksek |

### Faz 2 — Developer Experience (2 hafta)
| # | Özellik | Süre | Öncelik |
|---|---------|------|---------|
| 4 | Zaman Tüneli | 1 hafta | 🟡 Orta |
| 5 | Webhook Playground | 2-3 gün | 🟡 Orta |
| 6 | Özelleştirilebilir Retry | 3-4 gün | 🟡 Orta |
| 7 | Event Etiketleri | 3-4 gün | 🟡 Orta |

### Faz 3 — İş Özellikleri (2-3 hafta)
| # | Özellik | Süre | Öncelik |
|---|---------|------|---------|
| 8 | Müşteri İstatistikleri | 1-2 hafta | 🟡 Orta |
| 9 | Uptime Monitörü | 1 hafta | 🟡 Orta |
| 10 | Config Export/Import | 2-3 gün | 🟢 Düşük |
| 11 | IP Whitelist | 2-3 gün | 🟢 Düşük |

### Faz 4 — İleri Özellik (3+ hafta)
| # | Özellik | Süre | Öncelik |
|---|---------|------|---------|
| 12 | Webhook Zinciri | 2-3 hafta | 🟢 Düşük |

---

## 💰 Fiyat Etkisi

| Plan | Fiyat | Özellikler |
|------|-------|-----------|
| Free | $0 | 1000 event/gün, 2 endpoint, temel alarm |
| Starter | $49/ay | 10K event/gün, 5 endpoint, test modu, playground |
| Pro | $99/ay | 100K event/gün, sınırsız, analytics, zincir, uptime |
| Enterprise | Özel | Her şey + SLA + dedicated support |

---

## 📊 Toplam Süre Tahmini

| Faz | Süre | Sonuç |
|-----|------|-------|
| Faz 1 | 2 hafta | Temel alarm + bildirim + test modu |
| Faz 2 | 2 hafta | Developer experience tamam |
| Faz 3 | 2-3 hafta | İş özellikleri tamam |
| Faz 4 | 3+ hafta | İleri özellik tamam |
| **Toplam** | **9-10 hafta** | **Tam donanımlı platform** |

---

## ⚠️ Notlar

- Tüm özellikler mevcut sisteme EKLENİR, mevcut kod DEĞİŞTİRİLMEZ
- Her özellik ayrı branch'te geliştirilir
- Test edilir → Servet onay verirse → main'e birleştir
- $0 maliyet (free tier yeterli)
- Sıra Servet'in onayına göre belirlenecek

---

## 📱 EN SON: Mobil Uygulama Planı (Admin & Müşteri Yönetim Paneli)

> ⚠️ Bu EN SON yapılacak iş. Tüm web özellikleri bittikten sonra başlanacak.
> Servet onayı beklemede.

### Ne Yapılacak?
HookSniff mobil uygulaması — admin ve müşterilerin webhook'ları telefondan yönetmesi.
Sadece izleme değil, tam yönetim: oluştur, düzenle, durdur, test et, fatura öde.

---

### 👤 MÜŞTERİ SAYFALARI (17 Sayfa)

#### Ana Ekran
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 1 | **Dashboard** | Bugünkü event sayısı, başarı oranı, grafik, son 5 hata | — |
| 2 | **Hızlı Durum** | Tüm endpoint'lerin anlık durumu (yeşil/sarı/kırmızı) | Tek tıkla durdur/aktifleştir |

#### Event Yönetimi
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 3 | **Event Listesi** | Tüm event'ler, filtre (tarih, durum, etiket, endpoint) | Detay gör, tekrar gönder |
| 4 | **Event Detayı** | Payload, header, timeline, response kodu | Kopyala, tekrar gönder, şikayet et |
| 5 | **Event Arama** | ID, payload içeriği, header ile ara | — |

#### Endpoint Yönetimi
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 6 | **Endpoint Listesi** | Tüm endpoint'ler, durum, başarı oranı | Ekle, düzenle, sil, durdur |
| 7 | **Endpoint Detayı** | URL, secret, retry politika, rate limit, etiketler | Düzenle, test gönder |
| 8 | **Yeni Endpoint** | URL, secret, retry seçimi, etiketler | Oluştur |
| 9 | **Endpoint Test** | Test payload'ı yaz, gönder, yanıtı gör | Gönder, kaydet |

#### Alarm & Bildirim
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 10 | **Alarm Listesi** | Tüm alarm kuralları, durum | Ekle, düzenle, sil, durdur |
| 11 | **Alarm Detayı** | Koşul, eşik, kanal, sıklık | Düzenle, test et |
| 12 | **Yeni Alarm** | Koşul seç, eşik belirle, kanal seç | Oluştur |
| 13 | **Bildirim Geçmişi** | Gelen tüm bildirimler, okundu/okunmadı | Okundu işaretle, sil |

#### Ayarlar & Fatura
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 14 | **Profil** | İsim, email, şirket, dil, saat dilimi | Düzenle |
| 15 | **Bildirim Tercihleri** | Telegram, email, Discord, Slack seçimi | Değiştir |
| 16 | **API Key Yönetimi** | Mevcut key'ler, yenisi oluştur | Oluştur, sil, yenile |
| 17 | **Fatura & Plan** | Mevcut plan, kullanım, son fatura, upgrade | Plan değiştir, fatura indir |

---

### 👑 ADMIN SAYFALARI (12 Sayfa)

#### Sistem Yönetimi
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 1 | **Admin Dashboard** | Toplam müşteri, aktif, gelir, sistem durumu | — |
| 2 | **Sistem Sağlık** | API, DB, Redis, Worker, Queue durumu | Restart, log gör |
| 3 | **Performans Grafikleri** | Request/sn, latency, error rate, queue depth | Tarih seç, export |

#### Müşteri Yönetimi
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 4 | **Müşteri Listesi** | Tüm müşteriler, plan, durum, kayıt tarihi | Filtrele, ara |
| 5 | **Müşteri Detayı** | Endpoint'leri, event'leri, faturası, kullanımı | Düzenle, plan değiştir |
| 6 | **Müşteri Endpoint'leri** | Müşterinin tüm endpoint'leri, durum | Durdur, sil |
| 7 | **Müşteri Event'leri** | Müşterinin son event'leri | Filtrele, detay gör |

#### Gelir & Fatura
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 8 | **Gelir Dashboard** | Aylık gelir, MRR, churn, LTV | Grafik, export |
| 9 | **Fatura Listesi** | Tüm faturalar, durum | İncele, manuel fatura oluştur |
| 10 | **Plan Yönetimi** | Tüm planlar, fiyat, özellik | Plan oluştur/düzenle |

#### Destek & Log
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 11 | **Destek Talepleri** | Müşteri mesajları, durum | Yanıtla, kapat |
| 12 | **Sistem Logları** | Hata logları, audit trail | Filtrele, export |

---

### 🔔 BİLDİRİM SİSTEMİ (Mobil)

#### Müşteri Bildirimleri
| Tetikleyici | Kanal | İçerik |
|------------|-------|--------|
| Endpoint düştü | Push + Telegram | "⚠️ endpoint.xyz durdu — son 5 dk'da %100 hata" |
| Başarı oranı düştü | Push + Telegram | "🔴 %85 başarı oranı — normal %99" |
| Yeni hata | Push | "❌ 500 hatası — order.created event'i" |
| Retry başarılı | Push | "✅ 3. denemede başarılı — payment event" |
| Fatura kesildi | Push + Email | "💳 $49 fatura kesildi" |
| Plan değişikliği | Push + Email | "📦 Pro plan'a geçtiniz" |

#### Admin Bildirimleri
| Tetikleyici | Kanal | İçerik |
|------------|-------|--------|
| Yeni müşteri | Push | "🎉 Yeni müşteri: abc@example.com" |
| Sistem hatası | Push + Telegram | "🔴 API hatası — 5xx oranı %5'i geçti" |
| Kullanım limiti | Push | "⚠️ Müşteri X limitinin %90'ını kullandı" |
| Ödeme hatası | Push + Email | "💳 Müşteri Y ödemesi başarısız" |
| Destek talebi | Push | "📩 Yeni destek talebi: Z müşterisi" |

---

### 📊 EKRAN AKIŞLARI (Müşteri Yolculuğu)

```
Uygulamayı Aç
    │
    ├── Dashboard (ana ekran)
    │   ├── Bugünkü event sayısı: 1.247
    │   ├── Başarı oranı: %99.2
    │   ├── Son 5 hata listesi
    │   └── [Hızlı Durum] → tüm endpoint'ler yeşil/sarı/kırmızı
    │
    ├── Event'ler
    │   ├── Filtre: tarih, endpoint, durum, etiket
    │   ├── Liste → tıkla → detay
    │   └── Detay: payload, header, timeline, response
    │       └── [Tekrar Gönder] → anında retry
    │
    ├── Endpoint'ler
    │   ├── Liste → tıkla → detay
    │   ├── Detay: URL, secret, retry, rate limit
    │   │   └── [Test Gönder] → test payload → sonuç
    │   └── [Yeni Endpoint] → form → oluştur
    │
    ├── Alarmlar
    │   ├── Liste → tıkla → detay
    │   └── [Yeni Alarm] → koşul + eşik + kanal → oluştur
    │
    ├── Bildirimler
    │   ├── Liste (okundu/okunmadı)
    │   └── Tıkla → ilgili sayfaya git
    │
    └── Ayarlar
        ├── Profil düzenle
        ├── Bildirim tercihleri (Telegram/Email/Discord)
        ├── API key yönetimi
        └── Fatura & plan
```

---

### 📊 EKRAN AKIŞLARI (Admin Yolculuğu)

```
Uygulamayı Aç (admin girişi)
    │
    ├── Admin Dashboard
    │   ├── Toplam müşteri: 47
    │   ├── Aktif: 42, Pasif: 5
    │   ├── Aylık gelir: $2.107
    │   ├── Sistem durumu: API ✅ DB ✅ Redis ✅
    │   └── [Hızlı Aksiyonlar]
    │
    ├── Müşteriler
    │   ├── Liste (plan, durum, tarih)
    │   ├── Tıkla → müşteri detayı
    │   │   ├── Endpoint'leri
    │   │   ├── Son event'leri
    │   │   ├── Kullanım grafiği
    │   │   ├── Fatura geçmişi
    │   │   └── [Plan Değiştir] [Durdur] [Sil]
    │   └── [Yeni Müşteri] → form → oluştur
    │
    ├── Gelir
    │   ├── MRR grafiği
    │   ├── Churn oranı
    │   ├── Plan dağılımı (pasta grafik)
    │   └── [Export CSV]
    │
    ├── Destek
    │   ├── Talep listesi (açık/kapalı)
    │   ├── Tıkla → mesaj geçmişi
    │   └── [Yanıtla] [Kapat]
    │
    └── Sistem
        ├── Sağlık durumu (API, DB, Redis, Worker)
        ├── Performans grafikleri
        ├── Son hatalar
        └── [Log Export]
```

---

### 🔐 GÜVENLİK

| Özellik | Açıklama |
|---------|----------|
| **Biometrik giriş** | Parmak izi / yüz tanıma |
| **2FA** | SMS veya authenticator |
| **Oturum yönetimi** | Aktif oturumları gör, uzaktan kapat |
| **Role-based access** | Admin / Müşteri / Readonly |
| **Audit log** | Kim ne yaptı, ne zaman |
| **IP whitelist** | Sadece belirli IP'lerden giriş |

---

### 📱 SAYFA ÖZETİ

| Kategori | Sayfa Sayısı |
|----------|-------------|
| Müşteri sayfaları | 17 |
| Admin sayfaları | 12 |
| **Toplam** | **29 sayfa** |

---

### Teknoloji Seçenekleri

| Seçenek | Teknoloji | Avantaj | Dezavantaj |
|---------|-----------|---------|------------|
| A | **React Native** | Tek kodbase, iOS + Android | Performans |
| B | **Flutter** | Güzel UI, performans | Dart dili |
| C | **PWA** (Progressive Web App) | En hızlı, app store gerekmez | Sınırlı bildirim |
| D | **Expo** (React Native) | Hızlı geliştirme, kolay deploy | Bağımlılık |

### Tavsiyem: Önce PWA, Sonra Native

**Faz 1 — PWA (3 hafta)**
- Mevcut Next.js dashboard'u PWA'ya çevir
- Service worker → offline çalışma
- Web push notification → anlık bildirim
- App store'a gerek yok, tarayıcıdan kurulur
- $0 maliyet
- 29 sayfa (responsive)

**Faz 2 — React Native / Expo (6-8 hafta)**
- PWA yetersiz kalırsa native'e geç
- Expo ile hızlı geliştirme
- App Store + Google Play
- Push notification (native)
- Biometrik giriş

### PWA Avantajları
- ✅ App store onayı gerekmez
- ✅ Anında güncelleme (kullanıcı bir şey yapmaz)
- ✅ iOS + Android + Desktop
- ✅ $0 maliyet
- ✅ Mevcut dashboard kodu kullanılır

### Native Avantajları
- ✅ Daha iyi performans
- ✅ Native push notification
- ✅ Offline çalışma
- ✅ App store'da görünürlik
- ✅ Biometrik giriş

### Plan

| Faz | Ne | Süre | Öncelik |
|-----|-----|------|---------|
| PWA | Dashboard'u PWA yap + 29 sayfa | 3 hafta | 🟡 Orta |
| Push Notification | Web push ekle + Telegram entegrasyon | 1 hafta | 🟡 Orta |
| Offline | Service worker + cache | 1 hafta | 🟢 Düşük |
| Native (gerekirse) | React Native/Expo | 6-8 hafta | 🟢 Düşük |

### Maliyet

| Kalem | Maliyet |
|-------|---------|
| PWA | $0 |
| Web Push (Firebase) | $0 (free tier) |
| App Store | $99/yıl (Apple) |
| Google Play | $25 (tek seferlik) |
| Expo EAS Build | $0 (free tier) |

### Notlar
- PWA ile başla, native'e geçme zorunlu değil
- Müşteri feedback'ine göre karar ver
- App Store'a koymak istersen Apple Developer hesabı lazım ($99/yıl)
- Google Play daha ucuz ($25 tek seferlik)
- 29 sayfa fazla gibi görünüyor ama çoğu sayfa benzer yapıda (liste → detay → form)
- Admin sayfaları gizli, sadece admin girişiyle erişilir
