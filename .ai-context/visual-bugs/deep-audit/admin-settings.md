# 🔍 HookSniff Admin Settings - Deep UI/UX Audit

**Sayfa:** `/tr/admin/settings`  
**Tarih:** 2025-05-10  
**Ekran:** Dark mode, 1280x800+ çözünürlük  
**Screenshot'lar:** `screenshots/settings-fullpage.png`, `screenshots/settings-error-state.png`

---

## A. ÇEVİRİ SORUNLARI 🔴 Kritik

### A1. Tamamen İngilizce Kalan Metinler

| Konum | Mevcut Metin | Olması Gereken | Önem |
|-------|-------------|----------------|------|
| Header başlık | "Settings" | "Ayarlar" | 🔴 Yüksek |
| Header rozet | "Admin" | "Yönetici" | 🟡 Orta |
| Logout butonu | "Logout" | "Çıkış" | 🟡 Orta |
| Sayfa açıklama | "Configure platform-wide defaults and limits" | "Platform genelinde varsayılan ayarları ve limitleri yapılandırın" | 🔴 Yüksek |
| Default Plan label | "Default Plan" | "Varsayılan Plan" | 🔴 Yüksek |
| Select seçeneği 1 | "Free" | "Ücretsiz" | 🔴 Yüksek |
| Select seçeneği 2 | "Pro" | "Pro" | ✅ Kabul edilebilir (evrensel terim) |
| Plan Limitleri - label 1 | "Max Endpoints" | "Maksimum Uç Nokta" veya "Maks. Endpoint" | 🔴 Yüksek |
| Plan Limitleri - label 2 | "Max Webhooks/Month" | "Maks. Webhook/Ay" | 🔴 Yüksek |
| Plan Limitleri - label 3 | "Rate Limit (req/min)" | "Hız Limiti (istek/dk)" | 🔴 Yüksek |
| Plan Limitleri - label 4 | "Retention (days)" | "Süre (gün)" | 🔴 Yüksek |
| Tekrar Deneme - label | "Max Retry Attempts" | "Maks. Tekrar Deneme Sayısı" | 🔴 Yüksek |
| Hata mesajı | "Failed to save settings" | "Ayarlar kaydedilemedi" | 🔴 Yüksek |

### A2. Sidebar - Tamamen İngilizce

| Mevcut | Olması Gereken |
|--------|----------------|
| "Admin Panel" | "Yönetim Paneli" |
| "HookSniff Management" | "HookSniff Yönetimi" |
| "Overview" | "Genel Bakış" |
| "Users" | "Kullanıcılar" |
| "Revenue" | "Gelir" |
| "System" | "Sistem" |
| "Settings" | "Ayarlar" |
| "Back to Dashboard" | "Dashboard'a Dön" |
| "Switch to light mode" | "Açık moda geç" |

### A3. Çeviri Tutarlılığı Sorunları

- **Karma dil kullanımı:** Sayfa başlığı Türkçe ("Platform Ayarları") ama açıklama İngilizce. Bu tutarsızlık kullanıcı deneyimini bozar.
- **"Plan Limitleri" bölümü:** Section başlığı Türkçe ama içindeki tüm label'lar İngilizce.
- **"Tekrar Deneme Ayarları" bölümü:** Başlık Türkçe ama label ("Max Retry Attempts") İngilizce.
- **"Genel" bölümü:** Başlık Türkçe, toggle açıklamaları Türkçe ama "Default Plan" label'ı İngilizce.

### A4. Özel Durumlar

- **"endpoint" kelimesi:** Teknik terim olarak kabul edilebilir, ancak tooltip/açıklama ile desteklenmeli.
- **"req/min":** Kısaltma, tam açıklaması olmalı.
- **"Retention":** Türk kullanıcılar için yabancı kalabilir.

---

## B. LAYOUT & SPACING 🟡 Orta

### B1. Form Elemanları Hizalama

| Sorun | Detay | Önem |
|-------|-------|------|
| Label-input ilişkisi | Label'lar `<label>` elementi olarak tanımlanmış ama `htmlFor` attribute'u boş - input ile programatik bağlantı yok | 🔴 Yüksek |
| Toggle butonları | Toggle'lar `<button>` elementi, switch davranışı için `role="switch"` eksik | 🔴 Yüksek |
| Section spacing | Section'lar arası boşluk tutarlı (~24px), iyi | ✅ |
| Plan kartları | "Ücretsiz Plan" ve "Pro Plan" yan yana, iyi hizalanmış | ✅ |
| Input genişlikleri | Number input'lar eşit genişlikte, tutarlı | ✅ |

### B2. Section Başlıkları

- `h1`: "Platform Ayarları" ✅
- `h2`: "Genel", "Plan Limitleri", "Tekrar Deneme Ayarları" ✅ Tutarlı hiyerarşi
- `h3`: "Ücretsiz Plan", "Pro Plan" ✅

### B3. Spacing Değerlendirmesi

- Sidebar padding: Tutarlı ✅
- Main content padding: Tutarlı ✅
- Form grupları arası: Tutarlı ✅
- Label-input arası: `mb-1` / `mb-1.5` - Küçük tutarsızlık 🟡

---

## C. GÖRSEL HATALAR 🟡 Orta

### C1. Form Elemanları Stil Tutarlılığı

| Eleman | Stil | Durum |
|--------|------|-------|
| Number input'lar (Plan Limitleri) | `px-3 py-2 rounded-lg` | ✅ |
| Number input (Max Retry) | `px-4 py-3 rounded-xl` | 🔴 Farklı padding ve radius! |
| Select (Default Plan) | `px-4 py-3 rounded-xl` | ✅ Max Retry ile tutarlı |
| Toggle butonları | `w-11 h-6 rounded-full` | ✅ |

**Sorun:** Plan Limitleri input'ları `py-2 rounded-lg` kullanırken, Max Retry input'ı `py-3 rounded-xl` kullanıyor. Aynı sayfa içinde farklı input stilleri tutarsız.

### C2. Focus State'leri

- Tailwind CSS `:focus-visible` ring stilleri mevcut ✅
- Dark mode için `dark:focus-visible` kuralları tanımlı (ama boş!) 🔴
- Input'larda computed style'da `outline: none` - ring CSS değişkenleriyle uygulanıyor

### C3. Error State

- Hata mesajı sayfanın üstünde gösteriliyor (toast/banner) ✅
- Kırmızı arka plan ile vurgulanmış ✅
- **Sorun:** `role="alert"` attribute'u boş alert elementinde var ama asıl hata mesajı içeren element'te yok 🔴
- **Sorun:** Hata mesajı İngilizce 🔴

### C4. Success Feedback

- Başarılı kaydetme sonrası feedback mekanizması **test edilemedi** (API hatası nedeniyle)
- Success toast/banner elementi DOM'da görünmüyor 🔴

### C5. Placeholder Metinler

- Number input'larda placeholder yok - değerler dolu olarak geliyor ✅
- Select'te placeholder yok, varsayılan "Free" seçili ✅

---

## D. ERİŞİLEBİLİRLİK (A11Y) 🔴 Kritik

### D1. Form Label Bağlantıları

| Label | htmlFor | Durum |
|-------|---------|-------|
| "Default Plan" | ❌ Boş | 🔴 |
| "Max Endpoints" (x2) | ❌ Boş | 🔴 |
| "Max Webhooks/Month" (x2) | ❌ Boş | 🔴 |
| "Rate Limit (req/min)" (x2) | ❌ Boş | 🔴 |
| "Retention (days)" (x2) | ❌ Boş | 🔴 |
| "Max Retry Attempts" | ❌ Boş | 🔴 |

**Tüm label'lar `htmlFor` attribute'undan yoksun.** Bu, ekran okuyucuların label-input ilişkisini kuramayacağı anlamına gelir.

### D2. Required Field İşaretleri

- Hiçbir input'ta `required` attribute'u yok
- Hangi alanların zorunlu olduğu belirsiz
- Görsel olarak zorunlu alan işareti (*) yok

### D3. ARIA Attributes

| Eleman | role | aria-label | aria-describedby | Durum |
|--------|------|-----------|-----------------|-------|
| Toggle - Bakım Modu | ❌ Yok | ❌ Yok | ❌ Yok | 🔴 Kritik |
| Toggle - Kayıtlar Etkin | ❌ Yok | ❌ Yok | ❌ Yok | 🔴 Kritik |
| Number input'lar | - | ❌ Yok | ❌ Yok | 🔴 |
| Select | - | ❌ Yok | ❌ Yok | 🟡 |
| Save butonu | - | ❌ Yok | - | ✅ Metin yeterli |

**Toggle'lar için `role="switch"` ve `aria-checked` attribute'ları eksik.** Ekran okuyucular bu butonların toggle olduğunu anlayamaz.

### D4. Tab Sırası

- Doğal DOM sırası takip ediliyor ✅
- Sidebar → Header → Form alanları → Buton sırası mantıklı ✅
- Skip-to-content link'i yok 🟡

### D5. Renk Kontrastı

- Dark mode'da label metinleri (`text-slate-400`) kontrast oranı düşük olabilir 🟡
- Hata mesajı kırmızı arka plan üzerinde beyaz metin - kontrol edilmeli

---

## E. FONKSİYONEL SORUNLAR 🔴 Kritik

### E1. Toggle'lar

- **Bakım Modu toggle'ı:** Tıklanabilir ✅, görsel durum değişiyor ✅
- **Kayıtlar Etkin toggle'ı:** Tıklanabilir ✅
- **Sorun:** Toggle durumu görsel olarak değişiyor ama `aria-checked` attribute'u güncellenmiyor 🔴
- **Sorun:** Toggle'lar `type="submit"` olarak tanımlanmış - form submit tetikleyebilir! 🔴

### E2. Select Dropdown

- "Free" ve "Pro" seçenekleri mevcut ✅
- Açılır menü çalışıyor ✅
- **Sorun:** Seçenek metinleri İngilizce 🔴

### E3. Number Input'lar

| Input | min | max | step | Durum |
|-------|-----|-----|------|-------|
| Max Endpoints (Free) | ❌ | ❌ | ❌ | 🔴 Sınır yok |
| Max Webhooks/Month (Free) | ❌ | ❌ | ❌ | 🔴 Sınır yok |
| Rate Limit (Free) | ❌ | ❌ | ❌ | 🔴 Sınır yok |
| Retention (Free) | ❌ | ❌ | ❌ | 🔴 Sınır yok |
| Max Endpoints (Pro) | ❌ | ❌ | ❌ | 🔴 Sınır yok |
| Max Webhooks/Month (Pro) | ❌ | ❌ | ❌ | 🔴 Sınır yok |
| Rate Limit (Pro) | ❌ | ❌ | ❌ | 🔴 Sınır yok |
| Retention (Pro) | ❌ | ❌ | ❌ | 🔴 Sınır yok |
| Max Retry Attempts | ✅ 0 | ✅ 10 | ❌ | ✅ min/max var |

**Sorun:** Plan limit input'larında min/max/step sınırları yok. Kullanıcı negatif değer veya aşırı büyük değer girebilir.

### E4. "Ayarları Kaydet" Butonu

- Tıklanabilir ✅
- API çağrısı yapıyor ✅
- **Sorun:** API hatası alınıyor ("Failed to save settings") 🔴
- **Sorun:** Hata mesajı İngilizce 🔴
- **Sorun:** Buton loading state'i görünmüyor (spinner yok) 🟡

### E5. Başarılı Kaydetme Feedback'i

- Test edilemedi (API hatası nedeniyle)
- DOM'da success toast elementi yok

### E6. Hata Durumu Feedback'i

- Hata mesajı gösteriliyor ✅
- **Sorun:** Mesaj İngilizce ("Failed to save settings") 🔴
- **Sorun:** `role="alert"` eksik 🔴
- **Sorun:** Otomatik kapanma süresi belirsiz 🟡

---

## ÖZET TABLO

| Kategori | Kritik | Yüksek | Orta | Düşük |
|----------|--------|--------|------|-------|
| A. Çeviri | 3 | 8 | 2 | 0 |
| B. Layout | 0 | 1 | 1 | 0 |
| C. Görsel | 0 | 1 | 2 | 0 |
| D. Erişilebilirlik | 2 | 4 | 2 | 0 |
| E. Fonksiyonel | 2 | 4 | 2 | 0 |
| **TOPLAM** | **7** | **18** | **9** | **0** |

---

## ÖNCELİKLİ DÜZELTMELER

### 🔴 P0 - Acil (Bu hafta)
1. **Tüm İngilizce metinleri Türkçe'ye çevir** (13+ metin)
2. **Toggle'lara `role="switch"` ve `aria-checked` ekle**
3. **Label'ları input'lara `htmlFor` ile bağla**
4. **Number input'lara min/max sınırları ekle**
5. **Toggle butonlarının `type="submit"` sorununu düzelt**

### 🟡 P1 - Yüksek (Bu sprint)
6. Form input stillerini tutarlı hale getir (py-2 vs py-3)
7. Hata mesajlarına `role="alert"` ekle
8. Dark mode focus ring stillerini düzelt
9. Success feedback mekanizması ekle
10. Loading state (spinner) ekle

### 🟢 P2 - Orta (Gelecek sprint)
11. Zorunlu alan işaretleri (*) ekle
12. Skip-to-content link'i ekle
13. Renk kontrastlarını kontrol et
14. Hata mesajı otomatik kapanma süresi ekle

---

## KAYNAK DOSYALAR

- **Screenshot 1:** `screenshots/settings-fullpage.png` - Tam sayfa görünümü
- **Screenshot 2:** `screenshots/settings-error-state.png` - Hata durumu görünümü

---

*Bu denetim, OpenClaw UI/UX Audit Agent tarafından gerçekleştirilmiştir.*
