# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 15:15 GMT+8

---

## ✅ BU OTURUMDA YAPILAN (Session 70)

### OpenClaw Entegrasyonu
1. HookSniff repo OpenClaw workspace'ine klonlandı
2. `.ai-context/` hafıza sistemi incelendi
3. MEMORY.md güncellendi — Session 70 eklendi
4. NEXT_SESSION.md güncellendi
5. GitHub push — `03ddf64`

### Site Görsel Denetimi
- Desktop (1440px) + Mobile (375px) tarayıcı denetimi yapıldı
- 5 sayfada 404, mobil taşma sorunları, çeviri eksiklikleri, fiyat tutarsızlığı tespit edildi
- Detaylar MEMORY.md'de

---

## 🔴 ACİL — Site Düzeltmeleri (Sırasıyla)

### 1. 404 Sayfalar (Kritik)
Footer'da link verilen 5 sayfa çalışmıyor:
- `/tr/docs` → sayfa oluştur veya link kaldır
- `/tr/dashboard` → sayfa oluştur veya link kaldır
- `/tr/about` → sayfa oluştur veya link kaldır
- `/tr/faq` → sayfa oluştur veya link kaldır
- `/tr/contact` → sayfa oluştur veya link kaldır
- **Not:** `/en/` versiyonunda da aynı sorun var

### 2. Get Started Çevirisi (Orta)
`/tr/get-started` sayfası neredeyse tamamen İngilizce:
- H1: "Get Started with HookSniff" → "HookSniff ile Başlayın"
- Tüm step başlıkları, paragraflar, butonlar çevrilmeli
- Sadece nav çevrilmiş

### 3. Mobil Code Block Taşması (Orta)
- `<pre>` bloğu 375px viewport'ta taşıyor (821px genişlik)
- `overflow-x: auto` + `max-width: 100%` ekle

### 4. Fiyat Tutarsızlığı (Orta)
- Ana sayfa fiyat kartı: Free = **1.000 webhook/ay**
- Get Started + README: Free = **10.000 webhook/ay**
- Tutarlı hale getir

### 5. Mobil İstatistik Kartları (Küçük)
- "24,891 Deliveries" vb. kartlar mobilde `text-2xl` ile taşıyor
- Mobilde font küçült

### 6. Nav "Get Started" Çevirisi (Küçük)
- Nav'daki "Get Started" Türkçe olmalı ("Başlayın")

### 7. Footer Taşması (Küçük)
- Footer link grubu mobilde yatay taşıyor

### 8. Adım Numaraları Çakışması (Küçük)
- "Nasıl çalışır" bölümünde 1,2,3 badge'leri ikonlarla çakışıyor

---

## ⚠️ Kalan İşler (Önceki Oturumlardan)

### 🟡 Orta
1. **Billing modal focus trapping** — billing/page.tsx'teki upgrade ve cancel modalleri ConfirmDialog kullanmıyor
2. **Onboarding window.location** — router.push ile değiştirilmeli
3. **NotificationCenter window.location** — router.push ile değiştirilmeli

### 🟢 Düşük
4. **Dashboard icon buttons** — icon-only butonlarda aria-label eksik
5. **Portal customize aria-labels** — copy/remove butonları
6. **Signature verifier aria-labels** — copy butonu

---

## 🟡 Servet'in Yapması Gereken
- OAuth test et
- GitHub PAT rotate
- Vercel rebuild kontrol
- iyzico hesap aç
- **ENCRYPTION_KEY env var** — production'da ayarlanmalı (64 hex karakter)
