# 🔍 Admin Panel Görsel Denetim Raporu

> Tarih: 2026-05-10 16:55 GMT+8
> Hesap: servetarslan02@gmail.com (Business, Admin)
> Dil: Türkçe (/tr)

---

## 📋 Özet

| Kategori | Sorun Sayısı |
|----------|-------------|
| 🔴 Kritik (Çeviri Eksik) | 22 |
| 🟡 Orta (Karışık Dil) | 8 |
| 🟢 Hafif | 3 |
| **Toplam** | **33** |

---

## 🔴 KRİTİK SORUNLAR — Tamamı İngilizce Kalan Metinler

### 1. Admin Panel Sidebar (TÜM SAYFALAR)
Tüm admin sayfalarında sidebar tamamen İngilizce:

| Mevcut (EN) | Olması Gereken (TR) |
|-------------|---------------------|
| Admin Panel | Yönetici Paneli |
| HookSniff Management | HookSniff Yönetimi |
| Overview | Genel Bakış |
| Users | Kullanıcılar |
| Revenue | Gelir |
| System | Sistem |
| Settings | Ayarlar |
| ← Back to Dashboard | ← Kontrol Paneline Dön |
| Logout | Çıkış |

### 2. Overview Sayfası (`/tr/admin`)
| Mevcut (EN) | Olması Gereken (TR) |
|-------------|---------------------|
| Admin Overview | Yönetici Genel Bakış |
| Platform-wide metrics and recent activity | Platform geneli metrikler ve son aktiviteler |
| No recent signups | Son kayıt yok |

### 3. Users Sayfası (`/tr/admin/users`)
| Mevcut (EN) | Olması Gereken (TR) |
|-------------|---------------------|
| Users (header) | Kullanıcılar |
| Manage users, plans, and account status | Kullanıcıları, planları ve hesap durumlarını yönetin |
| ID | ID |
| Email | E-posta |
| Name | İsim |
| Plan | Plan |
| Status | Durum |
| Created | Oluşturulma |
| Actions | İşlemler |
| View | Görüntüle |
| Plan (button) | Plan |
| Ban | Yasakla |

### 4. Revenue Sayfası (`/tr/admin/revenue`)
| Mevcut (EN) | Olması Gereken (TR) |
|-------------|---------------------|
| Revenue (header) | Gelir |
| Revenue Dashboard | Gelir Paneli |
| Financial metrics and revenue breakdown | Finansal metrikler ve gelir dağılımı |

### 5. System Sayfası (`/tr/admin/system`)
| Mevcut (EN) | Olması Gereken (TR) |
|-------------|---------------------|
| System (header) | Sistem |
| Monitor infrastructure services and system status | Altyapı servislerini ve sistem durumunu izleyin |
| Last checked: ... | Son kontrol: ... |
| Auto-refresh every 15s | 15 saniyede bir otomatik yenile |
| Checking... | Kontrol ediliyor... |
| unknown | bilinmiyor |

### 6. Settings Sayfası (`/tr/admin/settings`)
| Mevcut (EN) | Olması Gereken (TR) |
|-------------|---------------------|
| Settings (header) | Ayarlar |
| Configure platform-wide defaults and limits | Platform geneli varsayılanları ve limitleri yapılandır |
| Default Plan | Varsayılan Plan |
| Max Endpoints | Maks Endpoint |
| Max Webhooks/Month | Maks Webhook/Ay |
| Rate Limit (req/min) | Hız Limiti (dakika başına istek) |
| Retention (days) | Saklama süresi (gün) |
| Max Retry Attempts | Maks Tekrar Deneme |

### 7. User Detail Sayfası (`/tr/admin/users/[id]`)
| Mevcut (EN) | Olması Gereken (TR) |
|-------------|---------------------|
| User Not Found | Kullanıcı Bulunamadı |
| ← Back to Users | ← Kullanıcılara Dön |

---

## 🟡 ORTA SEVİYELİ SORUNLAR — Karışık Dil

### 1. Overview Sayfası Metrik Kartları
- ✅ "Toplam Kullanıcı" — Türkçe
- ✅ "Toplam Teslimat" — Türkçe
- ✅ "Toplam Gelir" — Türkçe
- ✅ "Bugünkü Aktif Kullanıcılar" — Türkçe
- ❌ "Plana Göre Kullanıcılar" — Türkçe ama "No recent signups" İngilizce

### 2. Revenue Sayfası Metrik Kartları
- ✅ "Aylık Tekrarlayan Gelir" — Türkçe
- ✅ "Toplam Gelir" — Türkçe
- ✅ "Kayıp Oranı" — Türkçe
- ✅ "Aylık Gelir" — Türkçe
- ✅ "Zaman içinde gelir" — Türkçe
- ✅ "Gelir verisi yok" — Türkçe
- ❌ Header "Revenue" — İngilizce

### 3. System Sayfası
- ✅ "Sistem Sağlığı" — Türkçe
- ✅ "Sistem Sorunları Tespit Edildi" — Türkçe
- ✅ "Altyapı" — Türkçe
- ❌ Servis isimleri İngilizce (API Server, PostgreSQL Database, vb.) — teknik terimler, kabul edilebilir
- ❌ "Checking..." ve "unknown" — İngilizce

### 4. Settings Sayfası
- ✅ "Platform Ayarları" — Türkçe
- ✅ "Genel" — Türkçe
- ✅ "Bakım Modu" — Türkçe
- ✅ "Kayıtlar Etkin" — Türkçe
- ✅ "Plan Limitleri" — Türkçe
- ✅ "Ücretsiz Plan" / "Pro Plan" — Türkçe
- ✅ "Tekrar Deneme Ayarları" — Türkçe
- ✅ "Başarısız webhook teslimatlarını tekrar deneme sayısı" — Türkçe
- ✅ "Ayarları Kaydet" — Türkçe
- ❌ "Default Plan" — İngilizce
- ❌ Input label'ları İngilizce (Max Endpoints, Max Webhooks/Month, vb.)

---

## 🟢 HAFİF SORUNLAR

### 1. Admin Panel'de Dil Değiştirici Yok
Dashboard'da dil değiştirici var ama admin panelinde yok. Kullanıcı admin panelinde dili değiştiremez.

### 2. Tarih Formatı
Users sayfasında tarih "5/10/2026" formatında (ABD). Türkiye'de "10.05.2026" formatı tercih edilir.

### 3. "Admin" Badge
Her sayfanın header'ında "Admin" yazısı var — bu bir rozet/badge olarak gösterilmeli, sadece metin olarak değil.

---

## 📊 Sayfa Bazlı Özet

| Sayfa | Çeviri Durumu | Kritik Sorun |
|-------|---------------|-------------|
| `/tr/admin` (Overview) | %40 Türkçe | Header + sidebar İngilizce |
| `/tr/admin/users` | %30 Türkçe | Tablo başlıkları + butonlar İngilizce |
| `/tr/admin/revenue` | %50 Türkçe | Header İngilizce |
| `/tr/admin/system` | %45 Türkçe | Status mesajları İngilizce |
| `/tr/admin/settings` | %60 Türkçe | Input label'ları İngilizce |
| `/tr/admin/users/[id]` | %0 Türkçe | Tamamen İngilizce |

---

## 🔧 Öncelikli Düzeltme Sırası

1. **Sidebar çevirisi** — Tüm sayfaları etkiler, en yüksek etki
2. **Page header'ları** — Her sayfada "Overview", "Users" vb. İngilizce
3. **Tablo başlıkları** — Users sayfasında tüm kolonlar İngilizce
4. **Settings input label'ları** — Plan limitleri İngilizce
5. **System status mesajları** — "Checking...", "unknown" İngilizce
6. **User detail sayfası** — Tamamen İngilizce
7. **Dil değiştirici** — Admin panelinde eksik
8. **Tarih formatı** — ABD formatı kullanılıyor

---

## 📁 Ekran Görüntüleri

Tüm screenshots `/root/.openclaw/media/browser/` klasöründe saklanmıştır.
