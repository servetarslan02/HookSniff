# HookSniff Auth Flow & Dashboard Hata Raporu

**Tarih:** 2026-05-12  
**Test URL:** https://hooksniff.vercel.app  
**Tester:** Frontend QA Specialist (AI Agent)  

---

## 🔴 Kritik Sorunlar

### BUG-001: Setup Checklist Linklerinde Locale Kaybı

**Sayfa:** `/tr/dashboard` (tüm kullanıcılar)  
**Önem:** 🔴 Yüksek  
**Sorun:** Dashboard içindeki "Kurulum İlerlemesi" checklist linkleri `/tr/` prefix'i olmadan oluşturulmuş. Bu linkler locale kaybına neden olur.

**Tespit edilen linkler:**
| Mevcut (Hatalı) | Beklenen |
|---|---|
| `/dashboard` | `/tr/dashboard` |
| `/dashboard/api-keys` | `/tr/dashboard/api-keys` |
| `/dashboard/endpoints` | `/tr/dashboard/endpoints` |
| `/dashboard/playground` | `/tr/dashboard/playground` |
| `/dashboard/deliveries` | `/tr/dashboard/deliveries` |

**Ekran görüntüsü (snapshot verisi):**
```
link "✓ Create account" → /url: /dashboard          ← /tr/ eksik
link "🔑 Get API key" → /url: /dashboard/api-keys    ← /tr/ eksik
link "🔗 Create first endpoint" → /url: /dashboard/endpoints  ← /tr/ eksik
link "🧪 Send first webhook" → /url: /dashboard/playground    ← /tr/ eksik
link "📊 Check deliveries" → /url: /dashboard/deliveries      ← /tr/ eksik
```

**Beklenen davranış:** Tüm linkler mevcut locale göre `/tr/dashboard/...` formatında olmalı.

---

### BUG-002: Dashboard İçeriği İngilizce Kalmış (Çeviri Eksik)

**Sayfa:** `/tr/dashboard`  
**Önem:** 🔴 Yüksek  
**Sorun:** Login sonrası açılan dashboard'daki onboarding/welcome alanı tamamen İngilizce. Türkçe locale seçili olmasına rağmen bu metinler çevrilmemiş.

**Tespit edilen İngilizce metinler:**
- `"Welcome, Servet Arslan!"` / `"Welcome, Demo User!"` → Türkçe olmalı
- `"HookSniff handles webhook delivery, retries, monitoring, and security — so you can focus on building your product."` → Türkçe olmalı
- `"✓ Free forever"` → "✓ Sonsuza kadar ücretsiz"
- `"✓ 11 SDKs"` → "✓ 11 SDK"
- `"✓ 5 min setup"` → "✓ 5 dk kurulum"
- `"Skip setup"` → "Kurulumu atla"
- `"Let's go →"` → "Hadi başlayalım →"

**Ekran görüntüsü (snapshot verisi):**
```
heading "Welcome, Servet Arslan!" [level=2]
paragraph: HookSniff handles webhook delivery, retries, monitoring, and security — so you can focus on building your product.
text: ✓ Free forever ✓ 11 SDKs ✓ 5 min setup
button "Skip setup"
button "Let's go →"
```

**Beklenen davranış:** `/tr/` locale'indeki tüm metinler Türkçe olmalı.

---

### BUG-003: Endpoints Sayfasında İngilizce Buton ve Mesaj

**Sayfa:** `/tr/dashboard/endpoints`  
**Önem:** 🔴 Yüksek  
**Sorun:** Endpoint'ler sayfasındaki buton ve boş durum mesajı İngilizce.

**Tespit edilen İngilizce metinler:**
- `"+ New Endpoint"` → "+ Yeni Endpoint"
- `"No endpoints yet. Create one to start receiving webhooks."` → "Henüz endpoint yok. Webhook almaya başlamak için bir tane oluşturun."

**Ekran görüntüsü (snapshot verisi):**
```
button "+ New Endpoint" [ref=e85]
generic [ref=e86]: No endpoints yet. Create one to start receiving webhooks.
```

**Beklenen davranış:** Tüm UI metinleri Türkçe olmalı.

---

### BUG-004: Teslimatlar Tablosu Başlıkları ve Durum Değerleri İngilizce

**Sayfa:** `/tr/dashboard` (Son Teslimatlar bölümü)  
**Önem:** 🟡 Orta  
**Sorun:** Dashboard'daki "Son Teslimatlar" tablosunun başlıkları ve durum değerleri İngilizce.

**Tespit edilen İngilizce metinler:**
- Tablo başlıkları: `"ID"`, `"Event"`, `"Status"`, `"Attempts"`, `"Time"`
- Durum değerleri: `"delivered"` → "teslim edildi"

**Beklenen:**
- `"ID"`, `"Olay"`, `"Durum"`, `"Deneme"`, `"Zaman"`
- Durum: `"teslim edildi"`

---

### BUG-005: Dashboard Sayfalarında Footer Eksik

**Sayfa:** `/tr/dashboard`, `/tr/dashboard/endpoints`, `/tr/dashboard/deliveries`, vb.  
**Önem:** 🟡 Orta  
**Sorun:** Dashboard alt sayfalarının hiçbirinde footer bulunmuyor. Ana sayfada footer var ama dashboard sayfalarında yok.

**Ekran görüntüsü (snapshot verisi):**  
Dashboard sayfalarının snapshot'larında `contentinfo` veya `footer` rolünde hiçbir element bulunamadı.

**Beklenen davranış:** Tutarlılık için dashboard sayfalarında da footer olmalı (veya kasıtlı olarak kaldırıldıysa bu bir UX kararı olarak belgelenmeli).

---

### BUG-006: Sidebar Başlığında Ham Çeviri Anahtarı

**Sayfa:** `/tr/dashboard` (ilk yükleme)  
**Önem:** 🟡 Orta  
**Sorun:** Admin kullanıcısıyla login sonrası dashboard ilk yüklendiğinde sidebar başlığında `"nav.webhookDashboard"` ham çeviri anahtarı görünüyor. Diğer sayfalarda bu `"Webhook Paneli"` olarak doğru gösteriliyor.

**Ekran görüntüsü (snapshot verisi):**
```
link "🪝 HookSniff nav.webhookDashboard" → /url: /tr
  generic: HookSniff
  generic: nav.webhookDashboard    ← ham key!
```

Diğer sayfada:
```
link "🪝 HookSniff Webhook Paneli" → /url: /tr
  generic: HookSniff
  generic: Webhook Paneli          ← doğru çeviri
```

**Beklenen davranış:** Her zaman `"Webhook Paneli"` (veya locale'e karşılık gelen çeviri) gösterilmeli.

---

### BUG-007: Admin Paneli Sidebar Başlığında Tekrarlayan Etiket

**Sayfa:** `/tr/admin`  
**Önem:** 🟢 Düşük  
**Sorun:** Admin paneli sidebar'ında başlık `"⚡ Yönetim Paneli Yönetim"` olarak görünüyor - "Yönetim" kelimesi tekrar ediyor.

**Ekran görüntüsü (snapshot verisi):**
```
complementary:
  text: ⚡ Yönetim Paneli Yönetim
```

**Beklenen davranış:** `"⚡ Yönetim Paneli"` veya `"⚡ Admin Paneli"` olmalı.

---

### BUG-008: Navbar'da "Panel" Linki Eksik

**Sayfa:** Dashboard sayfaları (tümü)  
**Önem:** 🟢 Düşük  
**Sorun:** Task'te belirtilen "Navbar'daki Panel linki" bulunamadı. Navbar'da sadece başlık olarak "Kontrol Paneli" var ama bu tıklanabilir bir link değil. Sidebar'da "📊 Kontrol Paneli" linki mevcut.

**Beklenen davranış:** Navbar'da tıklanabilir bir "Panel" linki olmalı (varsa kasıtlı kaldırıldıysa bu bir UX kararı olarak belgelenmeli).

---

## ✅ Doğru Çalışan Özellikler

### Senaryo 1: Admin Login ✅
- Login sonrası `/tr/dashboard`'a yönlendirme doğru
- Sidebar'daki tüm 27 link `/tr/` prefix'i ile doğru
- "⚡ Yönetici Paneli" linki admin hesapta görünüyor → `/tr/admin` doğru
- "Ücretsiz başlayın" / "Kayıt ol" butonları giriş yapmış kullanıcıya gösterilmiyor ✅

### Senaryo 2: Demo Login ✅
- Login sonrası `/tr/dashboard`'a yönlendirme doğru
- "⚡ Yönetici Paneli" linki demo hesapta GÖRÜNMÜYOR ✅ (sidebar'da yok)
- Demo kullanıcı `/tr/admin`'e doğrudan erişmeye çalıştığında `/tr/dashboard`'a yönlendiriliyor ✅

### Senaryo 3: Doğrudan Dashboard Erişimi ✅
- Oturum açmamış kullanıcı `/tr/dashboard`'a gittiğinde `/tr/login?redirect=%2Ftr%2Fdashboard`'a yönlendiriliyor ✅
- Redirect URL'inde locale (`/tr/`) korunuyor ✅

### Senaryo 4: Locale Kaybı (Kısmi) ✅/❌
- Login sonrası URL `/tr/dashboard` olarak korunuyor ✅
- Sidebar linklerinin tamamı `/tr/` prefix'i ile doğru ✅
- "Tümünü gör →" linki `/tr/dashboard/deliveries` doğru ✅
- Admin paneli linkleri `/tr/admin/...` doğru ✅
- **Setup checklist linkleri HARİÇ** (BUG-001) ❌

---

## 📊 Özet

| Kategori | Sayı |
|---|---|
| 🔴 Kritik (Locale/Çeviri) | 3 |
| 🟡 Orta | 3 |
| 🟢 Düşük | 2 |
| ✅ Doğru çalışan | 4 senaryo |

**Ana sorun:** Türkçe locale seçiliyken dashboard içeriğinin büyük kısmı hala İngilizce. Setup checklist linklerinde `/tr/` prefix eksikliği var.

**Öncelikli aksiyonlar:**
1. Dashboard onboarding/welcome metinlerini Türkçe'ye çevir (BUG-002)
2. Setup checklist linklerine `/tr/` prefix ekle (BUG-001)
3. Endpoints sayfası buton/mesaj çevirisini yap (BUG-003)
4. Tablo başlıklarını ve durum değerlerini çevir (BUG-004)
5. Sidebar başlığındaki ham çeviri anahtarını düzelt (BUG-006)
6. Admin sidebar başlığındaki tekrarlayan etiketi düzelt (BUG-007)
7. Footer stratejisini belirle (BUG-005)
8. Navbar "Panel" linki stratejisini belirle (BUG-008)
