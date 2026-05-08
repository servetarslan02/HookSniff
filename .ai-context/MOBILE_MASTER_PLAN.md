# 📱 HookSniff Mobil Uygulama — Master Plan

> Son güncelleme: 2026-05-08 22:00 GMT+8
> Karar: Servet onayı ile netleştirildi

---

## 📋 Kararlar

| Konu | Karar |
|------|-------|
| **Platform** | Android (şimdilik) |
| **Teknoloji** | React Native + Expo |
| **Dağıtım** | Siteden APK indirme (Google Play YOK) |
| **Güncelleme** | OTA (Expo Updates) + APK güncelleme |
| **Tasarım** | Premium, native his, dark mode varsayılan |
| **Dil** | Türkçe varsayılan, İngilizce destek |
| **Maliyet** | $0 (Apple Developer $99/yıl ileride) |
| **Süre** | 6-8 hafta |

---

## 🏗️ Teknik Mimari

### Kullanılacak Araçlar

| Araç | Ne İşe Yarar | Versiyon |
|------|-------------|----------|
| **Expo SDK 53** | React Native framework | Son stable |
| **Expo Router** | Sayfa navigasyonu (file-based) | v4 |
| **Expo Updates** | OTA güncelleme (kodsal) | Built-in |
| **Expo Secure Store** | Token saklama (güvenli) | Built-in |
| **Expo Local Auth** | Parmak izi / yüz tanıma | Built-in |
| **Expo Notifications** | Push notification (FCM/APNs) | Built-in |
| **NativeWind** | Tailwind CSS (React Native) | v4 |
| **React Native Recharts** | Grafikler | - |
| **React Native Paper** | Material Design bileşenleri | v5 |
| **Zustand** | State management | - |
| **Axios** | HTTP istemcisi | - |

### Proje Yapısı

```
hooksniff-mobile/
├── app/                    # Expo Router sayfaları
│   ├── (auth)/             # Giriş, kayıt, şifre sıfırlama
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/             # Ana tab bar
│   │   ├── index.tsx       # Dashboard
│   │   ├── events.tsx      # Event listesi
│   │   ├── endpoints.tsx   # Endpoint listesi
│   │   └── settings.tsx    # Ayarlar
│   ├── event/[id].tsx      # Event detayı
│   ├── endpoint/[id].tsx   # Endpoint detayı
│   ├── alerts.tsx          # Alarm listesi
│   ├── notifications.tsx   # Bildirimler
│   ├── api-keys.tsx        # API key yönetimi
│   ├── billing.tsx         # Fatura & plan
│   ├── admin/              # Admin paneli
│   │   ├── index.tsx       # Admin dashboard
│   │   ├── users.tsx       # Müşteri listesi
│   │   └── system.tsx      # Sistem durumu
│   └── _layout.tsx         # Root layout
├── components/             # Paylaşılan bileşenler
│   ├── ui/                 # Temel UI bileşenleri
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── Skeleton.tsx
│   ├── charts/             # Grafik bileşenleri
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   └── PieChart.tsx
│   └── layout/             # Layout bileşenleri
│       ├── Header.tsx
│       ├── TabBar.tsx
│       └── SafeArea.tsx
├── lib/                    # Yardımcı kütüphaneler
│   ├── api.ts              # API istemcisi
│   ├── auth.ts             # Kimlik doğrulama
│   ├── storage.ts          # Güvenli depolama
│   ├── notifications.ts    # Push notification
│   └── updates.ts          # OTA güncelleme
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useNotifications.ts
├── store/                  # Zustand store
│   ├── authStore.ts
│   ├── eventStore.ts
│   └── settingsStore.ts
├── assets/                 # Görseller, ikonlar
│   ├── images/
│   ├── fonts/
│   └── icons/
├── app.json                # Expo config
├── eas.json                # EAS Build config
└── package.json
```

---

## 📱 Sayfa Listesi (29 Sayfa)

### Auth (3 sayfa)
| # | Sayfa | İçerik |
|---|-------|--------|
| 1 | **Giriş** | Email + şifre + parmak izi |
| 2 | **Kayıt** | Email + şifre + şirket adı |
| 3 | **Şifre Sıfırlama** | Email → token → yeni şifre |

### Ana Ekran (4 sayfa)
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 4 | **Dashboard** | Bugünkü event, başarı oranı, grafik, son hatalar | Pull to refresh |
| 5 | **Event Listesi** | Tüm event'ler, filtre, infinite scroll | Swipe → tekrar gönder |
| 6 | **Event Detayı** | Payload, header, timeline, response | Kopyala, tekrar gönder |
| 7 | **Event Arama** | ID, payload, header ile ara | Sonuç listesi |

### Endpoint Yönetimi (4 sayfa)
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 8 | **Endpoint Listesi** | Tüm endpoint'ler, durum, başarı oranı | Durdur/aktifleştir |
| 9 | **Endpoint Detayı** | URL, secret, retry, health | Düzenle, test gönder |
| 10 | **Yeni Endpoint** | Form: URL, secret, retry | Oluştur |
| 11 | **Endpoint Test** | JSON editör, gönder, yanıt | Gönder |

### Alarm & Bildirim (4 sayfa)
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 12 | **Alarm Listesi** | Tüm alarmlar, durum | Ekle, düzenle, sil |
| 13 | **Alarm Detayı** | Koşul, eşik, kanal | Düzenle, test et |
| 14 | **Yeni Alarm** | Koşul seç, eşik belirle | Oluştur |
| 15 | **Bildirimler** | Gelen bildirimler, okundu/okunmadı | Okundu işaretle |

### Ayarlar (5 sayfa)
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 16 | **Profil** | İsim, email, şirket, fotoğraf | Düzenle |
| 17 | **Bildirim Tercihleri** | Push, email, Telegram, Discord | Değiştir |
| 18 | **API Key Yönetimi** | Key'ler, yenisi oluştur | Oluştur, sil |
| 19 | **Fatura & Plan** | Mevcut plan, kullanım, faturalar | Plan değiştir |
| 20 | **Genel Ayarlar** | Tema, dil, parmak izi, otomatik güncelleme | Değiştir |

### Admin (4 sayfa)
| # | Sayfa | İçerik | Aksiyonlar |
|---|-------|--------|-----------|
| 21 | **Admin Dashboard** | Toplam müşteri, gelir, sistem durumu | — |
| 22 | **Müşteri Listesi** | Tüm müşteriler, plan, durum | Filtrele, ara |
| 23 | **Müşteri Detayı** | Endpoint'leri, event'leri, faturası | Plan değiştir |
| 24 | **Sistem Durumu** | API, DB, Redis, Worker sağlık | Restart |

### Ek (5 sayfa)
| # | Sayfa | İçerik |
|---|-------|--------|
| 25 | **Splash Screen** | Logo animasyonu |
| 26 | **Onboarding** | İlk kurulum rehberi (3 adım) |
| 27 | **Hakkında** | Versiyon, lisans, linkler |
| 28 | **Güncelleme** | Yeni sürüm bildirimi |
| 29 | **Hata Sayfası** | Bağlantı hatası, retry |

---

## 🎨 Tasarım Sistemi

### Renk Paleti

```typescript
const colors = {
  // Ana renkler
  primary: '#6d28d9',      // Mor (ana marka)
  primaryLight: '#8b5cf6', // Açık mor
  primaryDark: '#5b21b6',  // Koyu mor
  
  // Durum renkleri
  success: '#22c55e',      // Yeşil (başarılı)
  warning: '#f59e0b',      // Sarı (uyarı)
  error: '#ef4444',        // Kırmızı (hata)
  info: '#3b82f6',         // Mavi (bilgi)
  
  // Dark mode
  dark: {
    bg: '#0f0f0f',
    card: '#1a1a1a',
    border: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#a1a1aa',
  },
  
  // Light mode
  light: {
    bg: '#ffffff',
    card: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    textSecondary: '#6b7280',
  },
};
```

### Tipografi

```typescript
const typography = {
  h1: { fontSize: 28, fontWeight: '700' },
  h2: { fontSize: 22, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
};
```

### Spacing (Boşluk)

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

---

## 🔐 Güvenlik

| Özellik | Nasıl |
|---------|-------|
| **Token saklama** | Expo Secure Store (şifreli) |
| **Parmak izi** | Expo Local Auth |
| **API key** | Asla plaintext saklanmaz |
| **SSL** | Tüm iletişim HTTPS |
| **Pin code** | Opsiyonel uygulama kilidi |
| **Oturum süresi** | 24 saat, refresh token ile uzatma |

---

## 🔔 Bildirim Senaryoları

### Müşteri Bildirimleri
| Tetikleyici | İçerik | Öncelik |
|------------|--------|---------|
| Endpoint düştü | "⚠️ endpoint.xyz durdu" | Yüksek |
| Başarı oranı düştü | "🔴 %85 başarı oranı" | Yüksek |
| Yeni hata | "❌ 500 hatası" | Orta |
| Retry başarılı | "✅ 3. denemede başarılı" | Düşük |
| Fatura kesildi | "💳 $49 fatura kesildi" | Orta |

### Admin Bildirimleri
| Tetikleyici | İçerik | Öncelik |
|------------|--------|---------|
| Yeni müşteri | "🎉 Yeni müşteri" | Düşük |
| Sistem hatası | "🔴 API hatası" | Kritik |
| Kullanım limiti | "⚠️ Limit %90" | Yüksek |

---

## 📦 APK Dağıtım Sistemi

### Kurulum Akışı
```
1. Kullanıcı hooksniff.com/mobile sayfasına gider
2. "Android'e İndir" butonuna basar
3. APK dosyası iner (Cloudflare R2'den)
4. "Bilinmeyen kaynaklar" uyarısı çıkar
5. Kullanıcı izin verir, kurar
6. Uygulamayı açar, giriş yapar
```

### Güncelleme Akışı
```
1. Uygulama her açılışta /app/version endpoint'ini kontrol eder
2. Eğer OTA güncelleme varsa → arka planda iner, bir sonraki açılışta aktif
3. Eğer APK güncelleme varsa → "Yeni sürüm var" bildirimi
4. Kullanıcı "Güncelle" butonuna basar → yeni APK iner → kurulur
```

### Versiyon API'si
```
GET /app/version
Response: {
  "latest_version": "1.2.0",
  "latest_code": 12,
  "apk_url": "https://r2.hooksniff.com/releases/hooksniff-1.2.0.apk",
  "min_version": "1.0.0",
  "force_update": false,
  "changelog": "Yeni özellikler..."
}
```

---

## 🚀 Build ve Deploy

### EAS Build Config
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "distribution": "internal"
      }
    },
    "production": {
      "android": {
        "buildType": "apk",
        "distribution": "internal"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Build Komutları
```bash
# Development build
eas build --profile preview --platform android

# Production APK
eas build --profile production --platform android

# OTA güncelleme gönder
eas update --branch production
```

---

## 📅 Uygulama Takvimi

### Hafta 1-2: Kurulum + Auth
| Gün | İş |
|-----|---|
| 1-2 | Expo projesi kur, NativeWind, React Native Paper |
| 3-4 | Auth ekranları (giriş, kayıt, şifre sıfırlama) |
| 5-7 | Splash screen, onboarding, bottom tab bar |

### Hafta 3-4: Ana Ekranlar
| Gün | İş |
|-----|---|
| 8-10 | Dashboard + grafikler |
| 11-13 | Event listesi + detay + arama |
| 14 | Endpoint listesi + detay |

### Hafta 5-6: Yönetim + Bildirim
| Gün | İş |
|-----|---|
| 15-17 | Alarm yönetimi + bildirimler |
| 18-19 | API key + fatura + profil |
| 20-21 | Push notification (FCM) |

### Hafta 7-8: Admin + Polish
| Gün | İş |
|-----|---|
| 22-24 | Admin paneli |
| 25-26 | Parmak izi + dark mode |
| 27-28 | Test + hata düzeltme |
| 29-30 | Polish + APK build + dağıtım |

---

## 💰 Maliyet Özeti

| Kalem | Maliyet |
|-------|---------|
| Expo | $0 |
| EAS Build | $0 (free tier: 30 build/ay) |
| Expo Updates | $0 (free tier) |
| Firebase FCM | $0 (free tier: 10M mesaj/ay) |
| Cloudflare R2 (APK hosting) | $0 (10GB free) |
| Google Play | $0 (kullanmıyoruz) |
| **Toplam** | **$0** |

---

## 📁 İlgili Dosyalar

| Dosya | İçerik |
|-------|--------|
| `MOBILE_APP_AUDIT.md` | Tam eksiklik analizi |
| `FEATURE_PLAN.md` | Tüm özellik planı (mobil + web) |
| `MARKET_RESEARCH.md` | Pazar araştırması |
| `RESOURCES.md` | Hazır kütüphaneler |
| `MEMORY.md` | Genel proje hafızası |

---

> Bu dosya Servet onayı ile netleştirilmiştir.
> Uygulama bu plana göre yapılacaktır.
