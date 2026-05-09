# 📱 HookSniff Mobile — Eksik Plan Kararları

> Son güncelleme: 2026-05-08 22:08 GMT+8
> Servet onayı ile netleştirildi

---

## 1. 📶 Offline Stratejisi

### Ne Cache'lenecek?

| Veri | Cache Süresi | Güncelleme |
|------|-------------|------------|
| **Kullanıcı profili** | Süresiz | Giriş yapınca |
| **Endpoint listesi** | 1 saat | Pull-to-refresh |
| **Son 50 event** | 30 dakika | Pull-to-refresh |
| **Alarm listesi** | 1 saat | Pull-to-refresh |
| **Dashboard istatistikleri** | 15 dakika | Pull-to-refresh |
| **API key'ler** | Süresiz | Değişiklik olunca |
| **Plan bilgisi** | 1 gün | Giriş yapınca |
| **Ayarlar (tema, dil)** | Süresiz | Değişiklik olunca |

### Offline Davranış

| Durum | Ne Olacak |
|-------|-----------|
| **İnternet yok + sayfa açılır** | Cache'den göster + "Çevrimdışı" banner |
| **İnternet yok + aksiyon** | "İnternet bağlantısı yok" toast |
| **İnternet gelir** | Otomatik yenileme |
| **İnternet yok + bildirim** | Bildirim gösterilir ama detay açılamaz |

### Teknik Çözüm
- **AsyncStorage** → Basit veri cache
- **TanStack Query** → Otomatik cache + stale-while-revalidate
- **NetInfo** → İnternet durumu kontrolü

---

## 2. 🐛 Hata Raporlama

### Karar: Sentry

| Seçenek | Avantaj | Dezavantaj | Karar |
|---------|---------|------------|-------|
| **Sentry** | Ücretsiz tier (5K error/ay), React Native desteği, source maps | Kurulum biraz karmaşık | ✅ Seçildi |
| Firebase Crashlytics | Google ekosistemi, ücretsiz | React Native desteği zayıf | ❌ |
| Bugsnag | İyi UI | Ücretsiz tier sınırlı | ❌ |

### Sentry Entegrasyonu
```bash
npx expo install @sentry/react-native
```

### Ne Raportlanacak?
| Olay | Öncelik |
|------|---------|
| Uygulama çökmesi | 🔴 Kritik |
| API hatası (5xx) | 🔴 Kritik |
| Ağ hatası | 🟡 Önemli |
| Yükleme hatası | 🟡 Önemli |
| Kullanıcı hatası (4xx) | 🟢 Düşük |

### Kullanıcı Deneyimi
- Hata olursa kullanıcıya gösterilmez (sessiz rapor)
- Kritik hata olursa "Bir sorun oluştu, raporlandı" toast
- Geliştirici Sentry dashboard'dan hata takibi yapar

---

## 3. 📊 Analitik

### Karar: Basit Analitik (Sentry + Backend)

| Seçenek | Avantaj | Dezavantaj | Karar |
|---------|---------|------------|-------|
| **Sentry Performance** | Hata raporlama ile entegre | Ücretsiz tier sınırlı | ✅ Seçildi |
| Firebase Analytics | Çok detaylı | Google bağımlılığı, kurulum karmaşık | ❌ |
| Mixpanel | İyi UI | Ücretsiz tier sınırlı | ❌ |
| PostHog | Açık kaynak, self-hosted | Kurulum gerektirir | ❌ Alternatif |

### Takip Edilecek Olaylar

| Olay | Ne | Neden |
|------|---|-------|
| `app_open` | Uygulama açıldı | Kullanıcı sayısı |
| `login` | Giriş yapıldı | Aktif kullanıcı |
| `register` | Kayıt olundu | Yeni kullanıcı |
| `endpoint_created` | Endpoint oluşturuldu | Feature kullanımı |
| `event_viewed` | Event detayı açıldı | Feature kullanımı |
| `event_retried` | Event tekrar gönderildi | Feature kullanımı |
| `alert_created` | Alarm oluşturuldu | Feature kullanımı |
| `plan_upgraded` | Plan değiştirildi | Gelir takibi |
| `notification_opened` | Bildirim açıldı | Bildirim etkinliği |

### Gizlilik
- Kişisel veri toplanmaz (email, IP vs.)
- Sadece olay sayıları ve süreler
- Kullanıcı analitik kapatabilir (Ayarlar → Gizlilik)

---

## 4. 🔗 Deep Link Yapısı

### Bildirim → Sayfa Eşleştirmesi

| Bildirim Türü | Hedef Sayfa | Parametre |
|---------------|-------------|-----------|
| Endpoint düştü | `/endpoint/[id]` | `endpoint_id` |
| Başarı oranı düştü | `/dashboard` | — |
| Yeni hata | `/event/[id]` | `event_id` |
| Retry başarılı | `/event/[id]` | `event_id` |
| Fatura kesildi | `/billing` | — |
| Plan değişikliği | `/billing` | — |
| Yeni müşteri (admin) | `/admin/users/[id]` | `user_id` |
| Sistem hatası (admin) | `/admin/system` | — |

### URL Yapısı
```
hooksniff://dashboard
hooksniff://events
hooksniff://events/{id}
hooksniff://endpoints
hooksniff://endpoints/{id}
hooksniff://alerts
hooksniff://notifications
hooksniff://settings
hooksniff://billing
hooksniff://admin
hooksniff://admin/users/{id}
```

### Bildirim Veri Yapısı
```json
{
  "to": "expo_push_token",
  "title": "Endpoint düştü",
  "body": "api.example.com son 5 dk'da %100 hata",
  "data": {
    "screen": "endpoint",
    "id": "endpoint_uuid",
    "type": "endpoint_down"
  }
}
```

---

## 5. ♿ Accessibility (Erişilebilirlik)

### Kararlar

| Özellik | Uygulama |
|---------|----------|
| **Ekran okuyucu** | React Native `accessibilityLabel` tüm bileşenlere eklenecek |
| **Büyük font** | Sistem font boyutunu destekle (Dynamic Type) |
| **Yüksek kontrast** | Dark mode'da yeterli kontrast (WCAG AA) |
| **Dokunma hedefi** | Minimum 44x44 dp (Apple standardı) |
| **Animasyon kapatma** | Ayarlar → "Animasyonları azalt" seçeneği |
| **Renk körlüğü** | Durum renkleri sadece renk değil, ikon da kullan |

### Öncelik
- Temel erişilebillik (accessibilityLabel, dokunma hedefi) → geliştirme sırasında
- Gelişmiş erişilebillik (büyük font, animasyon kapatma) → sonraki sürüm

---

## 6. 🌍 Çoklu Dil

### Kararlar

| Konu | Karar |
|------|-------|
| **Varsayılan dil** | Türkçe |
| **İkinci dil** | İngilizce |
| **Gelecekte** | Almanca, Fransızca, Arapça, İspanyolca |
| **Kütüphane** | `i18next` + `react-i18next` |
| **Dosya yapısı** | `locales/tr.json`, `locales/en.json` |

### Çeviri Dosya Yapısı
```json
// locales/tr.json
{
  "common": {
    "loading": "Yükleniyor...",
    "error": "Hata oluştu",
    "retry": "Tekrar dene",
    "save": "Kaydet",
    "cancel": "İptal",
    "delete": "Sil",
    "edit": "Düzenle"
  },
  "dashboard": {
    "title": "Dashboard",
    "todayEvents": "Bugünkü Eventler",
    "successRate": "Başarı Oranı",
    "recentErrors": "Son Hatalar"
  },
  "events": {
    "title": "Eventler",
    "filter": "Filtrele",
    "search": "Ara",
    "replay": "Tekrar Gönder"
  },
  "endpoints": {
    "title": "Endpointler",
    "add": "Yeni Endpoint",
    "status": "Durum",
    "health": "Sağlık"
  },
  "alerts": {
    "title": "Alarmlar",
    "add": "Yeni Alarm",
    "condition": "Koşul",
    "threshold": "Eşik"
  },
  "settings": {
    "title": "Ayarlar",
    "profile": "Profil",
    "notifications": "Bildirimler",
    "theme": "Tema",
    "language": "Dil",
    "security": "Güvenlik"
  },
  "auth": {
    "login": "Giriş Yap",
    "register": "Kayıt Ol",
    "forgotPassword": "Şifremi Unuttum",
    "email": "E-posta",
    "password": "Şifre"
  }
}
```

### Dil Değiştirme
- Ayarlar → Dil → Türkçe / English
- Sistem diline göre otomatik algılama
- Değişiklik anında uygulanır (restart gerekmez)

---

## 7. 🔍 Uygulama İçi Arama

### Karar: Global Search

| Arama | Kaynak | Sonuç |
|-------|--------|-------|
| Event ID | `/search` API | Event detayı |
| Event payload | `/search` API | Event listesi |
| Endpoint URL | `/endpoints` API | Endpoint detayı |
| Alarm adı | `/alerts` API | Alarm detayı |

### UI
- Header'da arama ikonu (🔍)
- Tıklayınce tam sayfa arama ekranı
- Son aramalar (cache)
- Sonuçlar: Event / Endpoint / Alarm olarak kategorize

---

## 8. 📤 Paylaşım Özelliği

### Karar: Event Paylaşma

| Paylaşım | İçerik |
|----------|--------|
| **Event detayı** | Payload + response + timestamp |
| **Format** | JSON (kopyalanabilir) + Metin (okunabilir) |
| **Kanal** | Kopyala / Diğer uygulamalar (WhatsApp, Telegram, Email) |

### UI
- Event detayında "Paylaş" butonu
- Seçenekler: Kopyala · WhatsApp · Telegram · Email

---

## 9. 📱 Widget

### Karar: İkinci Sürüm

| Widget | İçerik | Boyut |
|--------|--------|-------|
| **Hızlı Durum** | Bugünkü event sayısı + başarı oranı | 2x1 |
| **Endpoint Durumu** | Son endpoint sağlık durumu | 2x2 |

### Not
- Android widget desteği Expo ile mümkün (`react-native-android-widget`)
- İlk sürümde yok, ikinci sürümde eklenecek

---

## 10. 📷 QR Kod Tarama

### Karar: Endpoint Ekleme için

| Kullanım | Nasıl |
|----------|-------|
| **Endpoint URL tarama** | QR kod okut → URL otomatik doldur |
| **API key tarama** | QR kod okut → key otomatik doldur |

### Kütüphane
- `expo-camera` → QR kod okuma (built-in)

---

## 📋 Tüm Kararlar Özeti

| # | Konu | Karar |
|---|------|-------|
| 1 | Offline | AsyncStorage + TanStack Query cache, 15dk-1saat |
| 2 | Hata raporlama | Sentry (5K error/ay ücretsiz) |
| 3 | Analitik | Sentry Performance + basit olay takibi |
| 4 | Deep link | `hooksniff://screen/id` formatı |
| 5 | Accessibility | Temel (label, dokunma hedefi) + ileride büyük font |
| 6 | Çoklu dil | Türkçe + İngilizce, i18next |
| 7 | Arama | Global search (event, endpoint, alarm) |
| 8 | Paylaşım | Event paylaşma (kopyala/WhatsApp/Telegram) |
| 9 | Widget | İkinci sürümde (2x1 durum + 2x2 endpoint) |
| 10 | QR kod | Endpoint ekleme için (expo-camera) |

---

> Son güncelleme: 2026-05-08 22:08 GMT+8
> Tüm eksik planlar tamamlandı. Geliştirmeye başlanabilir.
