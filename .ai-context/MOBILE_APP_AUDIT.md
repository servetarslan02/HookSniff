# 📱 Mobil Uygulama — Tam Eksiklik Analizi

> Tarih: 2026-05-08 21:49 GMT+8
> ⚠️ Bu dosya TEK SEFERLİK kapsamlı analiz. Tekrar tekrar taramaya gerek yok.

---

## ✅ MEVCUT — Mobil uygulama doğrudan kullanabilir

### Auth (Kimlik Doğrulama)
| Endpoint | Durum | Mobil Kullanım |
|----------|-------|----------------|
| `POST /auth/register` | ✅ Var | Kayıt ekranı |
| `POST /auth/login` | ✅ Var | Giriş ekranı |
| `GET /auth/me` | ✅ Var | Profil yükleme |
| `PUT /auth/profile` | ✅ Var | Profil düzenleme |
| `PUT /auth/password` | ✅ Var | Şifre değiştirme |

### Dashboard Verileri
| Endpoint | Durum | Mobil Kullanım |
|----------|-------|----------------|
| `GET /stats` | ✅ Var | Ana ekran (toplam delivery, başarı oranı) |
| `GET /analytics/deliveries` | ✅ Var | Grafik — günlük event trendi |
| `GET /analytics/latency` | ✅ Var | Grafik — gecikme trendi |
| `GET /analytics/success-rate` | ✅ Var | Grafik — başarı oranı trendi |

### Endpoint Yönetimi
| Endpoint | Durum | Mobil Kullanım |
|----------|-------|----------------|
| `GET /endpoints` | ✅ Var | Endpoint listesi |
| `POST /endpoints` | ✅ Var | Yeni endpoint oluştur |
| `PUT /endpoints/{id}` | ✅ Var | Endpoint düzenle |
| `DELETE /endpoints/{id}` | ✅ Var | Endpoint sil |
| `PUT /endpoints/{id}/retry-policy` | ✅ Var | Retry politikası |
| `POST /endpoints/{id}/rotate-secret` | ✅ Var | Secret yenile |
| `GET /endpoints/{id}/health` | ✅ Var | Endpoint sağlık durumu |

### Event/Webhook Yönetimi
| Endpoint | Durum | Mobil Kullanım |
|----------|-------|----------------|
| `GET /webhooks` | ✅ Var | Event listesi |
| `POST /webhooks` | ✅ Var | Test event gönder |
| `GET /webhooks/{id}` | ✅ Var | Event detayı |
| `GET /webhooks/{id}/attempts` | ✅ Var | Deneme geçmişi |
| `POST /webhooks/{id}/replay` | ✅ Var | Tekrar gönder |
| `POST /webhooks/batch` | ✅ Var | Toplu işlem |
| `GET /webhooks/export` | ✅ Var | Dışa aktar |
| `GET /search` | ✅ Var | Event arama |
| `GET /stream/deliveries` | ✅ Var | Canlı akış (SSE) |

### Alarm & Bildirim
| Endpoint | Durum | Mobil Kullanım |
|----------|-------|----------------|
| `GET /alerts` | ✅ Var | Alarm listesi |
| `POST /alerts` | ✅ Var | Yeni alarm |
| `DELETE /alerts/{id}` | ✅ Var | Alarm sil |
| `POST /alerts/{id}/test` | ✅ Var | Alarm test et |
| `GET /notifications` | ✅ Var | Bildirim listesi |
| `GET /notifications/unread-count` | ✅ Var | Okunmamış sayısı |
| `PUT /notifications/{id}/read` | ✅ Var | Okundu işaretle |
| `PUT /notifications/read-all` | ✅ Var | Tümünü okundu işaretle |

### API Key & Ayarlar
| Endpoint | Durum | Mobil Kullanım |
|----------|-------|----------------|
| `GET /api-keys` | ✅ Var | Key listesi |
| `POST /api-keys` | ✅ Var | Yeni key |
| `DELETE /api-keys/{id}` | ✅ Var | Key sil |
| `POST /api-keys/{id}/rotate` | ✅ Var | Key yenile |
| `GET /customer/plan` | ✅ Var | Plan bilgisi |
| `GET /customer/usage` | ✅ Var | Kullanım bilgisi |

### Fatura & Ödeme
| Endpoint | Durum | Mobil Kullanım |
|----------|-------|----------------|
| `GET /billing/subscription` | ✅ Var | Abonelik detayı |
| `POST /billing/upgrade` | ✅ Var | Plan değiştir |
| `GET /billing/invoices` | ✅ Var | Fatura listesi |
| `POST /billing/portal` | ✅ Var | Ödeme portalı |

### Admin
| Endpoint | Durum | Mobil Kullanım |
|----------|-------|----------------|
| `GET /admin/users` | ✅ Var | Müşteri listesi |
| `GET /admin/users/{id}` | ✅ Var | Müşteri detayı |
| `PUT /admin/users/{id}/plan` | ✅ Var | Plan değiştir |
| `PUT /admin/users/{id}/status` | ✅ Var | Durum değiştir |
| `GET /admin/stats` | ✅ Var | Sistem istatistikleri |
| `GET /admin/revenue` | ✅ Var | Gelir raporu |

### Ek Özellikler
| Özellik | Durum | Mobil Kullanım |
|---------|-------|----------------|
| WebSocket | ✅ Var | Gerçek zamanlı güncelleme |
| SSE Stream | ✅ Var | Canlı event akışı |
| Rate limiting | ✅ Var | Güvenlik |
| 8 dil desteği | ✅ Var | i18n |
| Transform kuralları | ✅ Var | Veri dönüştürme |
| Inbound proxy | ✅ Var | Webhook alma |
| Schema validation | ✅ Var | Veri doğrulama |
| Template sistemi | ✅ Var | Hazır kurulumlar |
| Takımlar | ✅ Var | Çoklu kullanıcı |

---

## ❌ EKSİK — Mobil uygulama için eklenmeli

### 🔴 KRİTİK (Olmazsa olmaz)

| # | Ne | Neden Gerekli | Backend Durum | Zorluk |
|---|---|---------------|---------------|--------|
| 1 | **Push Notification (FCM/APNs)** | Telefon anlık bildirim alamaz | ❌ Yok | 1-2 gün |
| 2 | **Şifre Sıfırlama API'si** | Kullanıcı şifresini unutursa | ⚠️ `email.rs`'de fonksiyon var ama route yok | Yarım gün |
| 3 | **Email Doğrulama API'si** | Kayıt sonrası email onayı | ⚠️ `email.rs`'de fonksiyon var ama route yok | Yarım gün |

### 🟡 ÖNEMLİ (İyi kullanıcı deneyimi için)

| # | Ne | Neden Gerekli | Backend Durum | Zorluk |
|---|---|---------------|---------------|--------|
| 4 | **Refresh Token** | JWT 24 saat, süresi dolunca tekrar giriş gerekiyor | ❌ Yok | 1 gün |
| 5 | **2FA (İki Faktörlü Doğrulama)** | Güvenlik, admin erişimi için şart | ❌ Yok | 1-2 gün |
| 6 | **Profil Fotoğrafı Yükleme** | Avatar, kişiselleştirme | ❌ Yok (upload endpoint'i yok) | Yarım gün |
| 7 | **Biometrik Giriş API'si** | Parmak izi / yüz tanıma | ❌ Yok | 1 gün |
| 8 | **Offline Desteği** | İnternet yokken son verileri göster | ❌ Yok | 2-3 gün |

### 🟢 İSTEĞE BAĞLI (Güzel olur ama şart değil)

| # | Ne | Neden Gerekli | Backend Durum | Zorluk |
|---|---|---------------|---------------|--------|
| 9 | **Deep Link** | Bildirime tıklayınca ilgili sayfaya git | ❌ Yok | 1 gün |
| 10 | **Uygulama İçi Güncelleme** | Yeni sürüm bildirimi | ❌ Yok | Yarım gün |
| 11 | **Dark Mode Tercihi Sync** | Tema tercihini sunucuda sakla | ⚠️ Dashboard'da var, API'de yok | Yarım gün |
| 12 | **Çoklu Dil Sync** | Dil tercihini sunucuda sakla | ⚠️ Dashboard'da var, API'de yok | Yarım gün |

---

## 📊 MEVCUT DASHBOARD SAYFALARI (36 sayfa)

Mobil uygulama bu sayfaları birebir kopyalayacak:

### Müşteri Sayfaları (20)
| # | Sayfa | URL | Durum |
|---|-------|-----|-------|
| 1 | Dashboard (ana ekran) | `/dashboard` | ✅ |
| 2 | Endpoint listesi | `/dashboard/endpoints` | ✅ |
| 3 | Endpoint detayı | `/dashboard/endpoints/[id]` | ✅ |
| 4 | Event listesi | `/dashboard/deliveries` | ✅ |
| 5 | Event detayı | `/dashboard/deliveries/[id]` | ✅ |
| 6 | Event arama | `/dashboard/search` | ✅ |
| 7 | Alarm listesi | `/dashboard/alerts` | ✅ |
| 8 | Bildirimler | `/dashboard/notifications` | ✅ |
| 9 | API key yönetimi | `/dashboard/api-keys` | ✅ |
| 10 | Analytics | `/dashboard/analytics` | ✅ |
| 11 | Health monitoring | `/dashboard/health` | ✅ |
| 12 | Playground (test) | `/dashboard/playground` | ✅ |
| 13 | Inbound proxy | `/dashboard/inbound` | ✅ |
| 14 | Transform kuralları | `/dashboard/transforms` | ✅ |
| 15 | Loglar | `/dashboard/logs` | ✅ |
| 16 | Fatura | `/dashboard/billing` | ✅ |
| 17 | Ayarlar | `/dashboard/settings` | ✅ |
| 18 | Takım | `/dashboard/team` | ✅ |
| 19 | Yeni webhook | `/dashboard/webhooks/new` | ✅ |
| 20 | Canlı akış | (SSE stream) | ✅ |

### Admin Sayfaları (6)
| # | Sayfa | URL | Durum |
|---|-------|-----|-------|
| 1 | Admin dashboard | `/admin` | ✅ |
| 2 | Müşteri listesi | `/admin/users` | ✅ |
| 3 | Müşteri detayı | `/admin/users/[id]` | ✅ |
| 4 | Gelir raporu | `/admin/revenue` | ✅ |
| 5 | Sistem durumu | `/admin/system` | ✅ |
| 6 | Admin ayarları | `/admin/settings` | ✅ |

### Genel Sayfalar (10)
| # | Sayfa | URL | Durum |
|---|-------|-----|-------|
| 1 | Ana sayfa | `/` | ✅ |
| 2 | Giriş | `/login` | ✅ |
| 3 | Hakkında | `/about` | ✅ |
| 4 | İletişim | `/contact` | ✅ |
| 5 | Dokümantasyon | `/docs` | ✅ |
| 6 | API docs | `/docs/api` | ✅ |
| 7 | SDK docs | `/docs/sdks` | ✅ |
| 8 | SSS | `/faq` | ✅ |
| 9 | Gizlilik | `/privacy` | ✅ |
| 10 | Şartlar | `/terms` | ✅ |

---

## 🔧 BACKEND İÇİN YAPILACAKLAR (Toplam 8 iş)

| # | İş | Süre | Öncelik | Açıklama |
|---|---|------|---------|----------|
| 1 | `POST /auth/forgot-password` route'u ekle | Yarım gün | 🔴 | `email.rs`'deki fonksiyonu çağıracak route |
| 2 | `POST /auth/reset-password` route'u ekle | Yarım gün | 🔴 | Token ile şifre sıfırlama |
| 3 | `POST /auth/verify-email` route'u ekle | Yarım gün | 🔴 | Email doğrulama token'ı |
| 4 | `POST /auth/refresh-token` route'u ekle | 1 gün | 🟡 | JWT refresh mekanizması |
| 5 | Push notification service ekle | 1-2 gün | 🔴 | FCM + APNs entegrasyonu |
| 6 | `POST /upload/avatar` endpoint'i ekle | Yarım gün | 🟡 | R2'ye dosya yükleme |
| 7 | `POST /auth/2fa/enable` + `verify` | 1-2 gün | 🟡 | TOTP tabanlı 2FA |
| 8 | Kullanıcı tercihleri API'si | Yarım gün | 🟢 | Tema, dil, bildirim tercihleri |

**Toplam backend işi: ~5-7 gün**

---

## 📱 MOBİL UYGULAMA İÇİN TEKNOLOJİ SEÇİMİ

### Seçenek A: PWA (Önerilen)
| Avantaj | Dezavantaj |
|---------|------------|
| $0 maliyet | Sınırlı push notification |
| App store gerekmez | Biometrik giriş sınırlı |
| Anında güncelleme | Performans biraz düşük |
| iOS + Android + Desktop | Offline desteği sınırlı |
| Mevcut dashboard kodu kullanılır | |
| 3 hafta | |

### Seçenek B: React Native / Expo
| Avantaj | Dezavantaj |
|---------|------------|
| Native performans | $99/yıl Apple Developer |
| Native push notification | 6-8 hafta |
| Biometrik giriş | App store onayı |
| Offline desteği | Ayrı kodbase |
| App store'da görünürlik | |

### Seçenek C: Flutter
| Avantaj | Dezavantaj |
|---------|------------|
| Güzel UI | Dart dili öğrenme |
| İyi performans | 6-8 hafta |
| Cross-platform | Mevcut kod kullanılamaz |

---

## 💰 MALİYET ANALİZİ

### PWA ile Başlarsak
| Kalem | Maliyet |
|-------|---------|
| Geliştirme | $0 (AI yapar) |
| Hosting | $0 (Vercel free) |
| Push (Firebase) | $0 (free tier) |
| **Toplam** | **$0** |

### Sonra Native'e Geçersek
| Kalem | Maliyet |
|-------|---------|
| Apple Developer | $99/yıl |
| Google Play | $25 (tek seferlik) |
| Expo EAS Build | $0 (free tier) |
| **Toplam** | **$124 ilk yıl** |

---

## 📋 UYGULAMA PLANI

### Faz 1 — PWA (3 hafta, $0)
1. Dashboard'u mobil responsive yap
2. PWA manifest + service worker ekle
3. Web push notification ekle
4. 29 sayfa (mobil uyumlu)
5. Offline cache (temel)

### Faz 2 — Backend Eksikleri (1 hafta)
1. Şifre sıfırlama API'si
2. Email doğrulama API'si
3. Push notification service
4. Refresh token

### Faz 3 — Native (gerekirse, 6-8 hafta)
1. React Native / Expo ile sıfırdan
2. Native push notification
3. Biometrik giriş
4. App Store + Google Play

---

## ⚠️ NOTLAR

- Bu dosya tek seferlik kapsamlı analizdir
- Her "eksik var mı?" sorusunda bu dosyaya bakılacak
- Yeni eksik çıkarsa bu dosyaya eklenecek
- Backend eksikleri AI tarafından yapılacak
- Servet sadece dış servis hesaplarını açacak (Apple, Google Play)

> Son güncelleme: 2026-05-08 21:49 GMT+8
