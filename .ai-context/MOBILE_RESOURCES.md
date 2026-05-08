# 📦 HookSniff Mobile — Faydalı Repolar ve Kaynaklar

> Son güncelleme: 2026-05-08 22:06 GMT+8
> Bu dosya mobil uygulama geliştirme sırasında başvurulacak kaynakları içerir.

---

## 🏆 Ana Template

### NativeLaunch (Expo Starter Template)
- **GitHub:** https://github.com/nativelaunch
- **Site:** https://nativelaunch.dev
- **Ne:** Production-ready React Native/Expo template
- **İçinde:** Auth, payments, push notification, navigation, dark mode
- **Expo SDK:** 55 / React Native 0.83
- **Styling:** UniWind (Tailwind v4) + HeroUI Native
- **Not:** Private repo, satın almak gerekebilir ($0 alternatif: expo/examples)
- **Bizim için:** Ana template olarak kullanılabilir veya referans alınabilir

---

## 📚 Expo Resmi Örnekler

### expo/examples (Resmi Örnek Repo)
- **GitHub:** https://github.com/expo/examples
- **Ne:** Expo'nun resmi örnek uygulamaları
- **Önemli dizinler:**
  - `with-tailwindcss` → NativeWind + Expo örneği
  - `with-router` → Expo Router file-based routing
  - `with-notifications` → Push notification örneği
- **Bizim için:** Referans kod olarak kullanılacak

### Expo Router
- **GitHub:** https://github.com/expo/router
- **Docs:** https://docs.expo.dev/router/introduction/
- **Ne:** File-based routing (Next.js benzeri)
- **Bizim için:** Tüm sayfa navigasyonu bununla yapılacak

---

## 🎨 UI ve Bileşen Kütüphaneleri

### NativeWind (Tailwind CSS for React Native)
- **GitHub:** https://github.com/nativewind/nativewind
- **Docs:** https://www.nativewind.dev/
- **Ne:** React Native'de Tailwind CSS kullanımı
- **Versiyon:** v4 (son)
- **Bizim için:** Tüm stiller bununla yazılacak

### React Native Paper (Material Design)
- **GitHub:** https://github.com/callstack/react-native-paper
- **Docs:** https://reactnativepaper.com/
- **Stars:** ⭐ 12K+
- **Ne:** Material Design bileşen seti (Button, Card, Input, Dialog, vb.)
- **Bizim için:** Temel UI bileşenleri

### React Native Reusables
- **GitHub:** https://github.com/mrzachnugent/react-native-reusables
- **Ne:** shadcn/ui benzeri React Native bileşenleri
- **Bizim için:** Hazır bileşenler (copy-paste)

### Tamagui
- **GitHub:** https://github.com/tamagui/tamagui
- **Stars:** ⭐ 12K+
- **Ne:** Cross-platform UI toolkit (React Native + Web)
- **Bizim için:** Alternatif UI framework (NativeWind yerine)

---

## 📊 Grafik Kütüphaneleri

### Victory Native
- **GitHub:** https://github.com/FormidableLabs/victory-native
- **Docs:** https://commerce.nearform.com/open-source/victory-native/
- **Ne:** React Native grafik kütüphanesi
- **Özellikler:** Line, bar, pie, area charts, animasyonlu
- **Bizim için:** Dashboard grafikleri

### React Native Chart Kit
- **GitHub:** https://github.com/indiespirit/react-native-chart-kit
- **Stars:** ⭐ 3K+
- **Ne:** Basit grafik kütüphanesi
- **Bizim için:** Alternatif (daha basit)

### Skia (React Native Skia)
- **GitHub:** https://github.com/Shopify/react-native-skia
- **Stars:** ⭐ 6K+
- **Ne:** Yüksek performanslı 2D grafik
- **Bizim için:** Karmaşık animasyonlar ve grafikler

---

## 🔔 Bildirim Kütüphaneleri

### Expo Notifications
- **Docs:** https://docs.expo.dev/push-notifications/overview/
- **Ne:** Expo'nun built-in push notification sistemi
- **Destek:** FCM (Android) + APNs (iOS)
- **Bizim için:** Ana bildirim kütüphanesi

### Notifee
- **GitHub:** https://github.com/invertase/notifee
- **Stars:** ⭐ 1.5K+
- **Ne:** Yerel bildirim kütüphanesi (ses, titreşim, kanal)
- **Bizim için:** Android bildirim kanalları ve özelleştirme

---

## 🔐 Güvenlik ve Auth

### Expo Secure Store
- **Docs:** https://docs.expo.dev/versions/latest/sdk/securestore/
- **Ne:** Güvenli token saklama (Android Keystore)
- **Bizim için:** JWT token saklama

### Expo Local Authentication (Parmak İzi)
- **Docs:** https://docs.expo.dev/versions/latest/sdk/local-authentication/
- **Ne:** Parmak izi / yüz tanıma
- **Bizim için:** Biometrik giriş

### React Native Biometrics
- **GitHub:** https://github.com/sbaiahmed1/react-native-biometrics
- **Ne:** Biometric auth kütüphanesi
- **Bizim için:** Alternatif (daha fazla kontrol)

---

## 🔄 Güncelleme ve Dağıtım

### Expo Updates (OTA)
- **Docs:** https://docs.expo.dev/eas-update/introduction/
- **Ne:** Over-the-air güncelleme (JS kodu değişirse APK indirmeden)
- **Bizim için:** Kodsal güncellemeler

### Xavia OTA (Self-Hosted Alternatif)
- **GitHub:** https://github.com/nicob-dev/xavia-ota
- **Ne:** EAS Updates'in self-hosted alternatifi
- **Bizim için:** Expo sunucusuna bağımlı kalmak istemezsek

### React Native OTA Hot Update
- **GitHub:** https://github.com/vantuan88291/react-native-ota-hot-update
- **Ne:** Manuel OTA güncelleme
- **Bizim için:** Alternatif

---

## 📱 State Management ve API

### Zustand
- **GitHub:** https://github.com/pmndrs/zustand
- **Stars:** ⭐ 50K+
- **Ne:** Minimalist state management
- **Bizim için:** Global state (auth, settings, events)

### Axios
- **GitHub:** https://github.com/axios/axios
- **Stars:** ⭐ 105K+
- **Ne:** HTTP istemcisi
- **Bizim için:** API istekleri

### React Query / TanStack Query
- **GitHub:** https://github.com/TanStack/query
- **Stars:** ⭐ 44K+
- **Ne:** Server state management (cache, refetch, pagination)
- **Bizim için:** API veri yönetimi (infinite scroll, pull-to-refresh)

---

## 🎬 Animasyonlar

### React Native Reanimated
- **GitHub:** https://github.com/software-mansion/react-native-reanimated
- **Stars:** ⭐ 9K+
- **Ne:** Performanslı animasyonlar
- **Bizim için:** Sayfa geçişleri, mikro etkileşimler

### Lottie React Native
- **GitHub:** https://github.com/lottie-react-native/lottie-react-native
- **Stars:** ⭐ 16K+
- **Ne:** After Effects animasyonları
- **Bizim için:** Splash screen, loading animasyonları, boş durumlar

### Moti
- **GitHub:** https://github.com/nandorojo/moti
- **Stars:** ⭐ 4K+
- **Ne:** Declarative animasyon kütüphanesi
- **Bizim için:** Basit animasyonlar

---

## 🛠️ Geliştirme Araçları

### Expo CLI
- **Docs:** https://docs.expo.dev/workflow/expo-cli/
- **Ne:** Expo projesi oluşturma ve yönetme

### EAS CLI
- **Docs:** https://docs.expo.dev/build/introduction/
- **Ne:** Build ve submit aracı
- **Komut:** `npm install -g eas-cli`

### React Native Debugger
- **GitHub:** https://github.com/jhen0409/react-native-debugger
- **Ne:** Debug aracı (Chrome DevTools benzeri)

---

## 📖 Referans Projeler

### open-source-react-native-apps
- **GitHub:** https://github.com/nickolay-kondratyev/open-source-react-native-apps
- **Ne:** Açık kaynak React Native uygulamaları koleksiyonu
- **Bizim için:** Mimari referans

### Awesome React Native
- **GitHub:** https://github.com/jondot/awesome-react-native
- **Stars:** ⭐ 35K+
- **Ne:** React Native kaynak listesi
- **Bizim için:** Kütüphane keşfetme

---

## 📋 Kullanılacak Kütüphaneler (Final Liste)

| Kütüphane | Ne İşe Yarar | Öncelik |
|-----------|-------------|---------|
| `expo` | Framework | 🔴 Zorunlu |
| `expo-router` | Navigasyon | 🔴 Zorunlu |
| `nativewind` | Tailwind CSS | 🔴 Zorunlu |
| `react-native-paper` | UI bileşenleri | 🔴 Zorunlu |
| `zustand` | State management | 🔴 Zorunlu |
| `axios` | HTTP istemcisi | 🔴 Zorunlu |
| `expo-secure-store` | Token saklama | 🔴 Zorunlu |
| `expo-local-authentication` | Parmak izi | 🟡 Önemli |
| `expo-notifications` | Push notification | 🟡 Önemli |
| `victory-native` | Grafikler | 🟡 Önemli |
| `react-native-reanimated` | Animasyonlar | 🟡 Önemli |
| `lottie-react-native` | Lottie animasyonları | 🟢 Güzel olur |
| `@tanstack/react-query` | API cache | 🟢 Güzel olur |
| `notifee` | Bildirim kanalları | 🟢 Güzel olur |
| `react-native-skia` | Gelişmiş grafikler | 🟢 İsteğe bağlı |

---

## ⚠️ Plan Eksikleri Kontrolü

### ✅ Tamam
- [x] Platform kararı (Android)
- [x] Teknoloji seçimi (React Native + Expo)
- [x] Dağıtım yöntemi (APK)
- [x] Sayfa listesi (29 sayfa)
- [x] Tasarım sistemi (renk, tipografi, spacing)
- [x] Güvenlik (token, parmak izi, SSL)
- [x] Bildirim senaryoları
- [x] Build/deploy stratejisi
- [x] Zaman planı (6-8 hafta)
- [x] Maliyet ($0)
- [x] Kütüphane listesi

### ⚠️ Eksik (Düşük öncelik)
- [ ] Offline stratejisi detayı (hangi veriler cache'lenecek?)
- [ ] Hata raporlama (Crashlytics/Sentry entegrasyonu)
- [ ] Analitik (kullanıcı davranış takibi)
- [ ] A/B testing (opsiyonel)
- [ ] Deep link yapısı (bildirime tıklayınca hangi sayfa?)
- [ ] Accessibility (erişilebilirlik — büyük font, ekran okuyucu)
- [ ] Çoklu dil detayı (hangi diller, çeviri dosyası yapısı)

### ❌ Henüz Düşünülmedi
- [ ] Uygulama içi arama (global search)
- [ ] Paylaşım özelliği (event detayını paylaş)
- [ ] Widget (ana ekran widget'ı)
- [ ] QR kod tarama (endpoint ekleme)

---

> Son güncelleme: 2026-05-08 22:06 GMT+8
