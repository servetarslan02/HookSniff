# 🐛 Site Görsel Denetim Raporu

> Tarih: 2026-05-10 15:15 GMT+8
> Denetlenen: https://hooksniff.vercel.app/tr
> Tarayıcı: OpenClaw browser (desktop 1440px + mobile 375px)

---

## 🔴 KRİTİK — 404 Sayfalar

Footer ve navigasyonda link verilen 5 sayfa **404 hatası** veriyor:

| Sayfa | Link | Durum |
|-------|------|-------|
| Dokümanlar | `/tr/docs` | ❌ 404 |
| Panel (Dashboard) | `/tr/dashboard` | ❌ 404 |
| Hakkında | `/tr/about` | ❌ 404 |
| SSS (FAQ) | `/tr/faq` | ❌ 404 |
| İletişim | `/tr/contact` | ❌ 404 |

**Not:** Bu sayfalar `/en/` versiyonunda da yok. Sadece TR değil genel sorun.

**Çalışan sayfalar:**
- ✅ Ana sayfa (`/tr`)
- ✅ Durum (`/tr/status`)
- ✅ Şartlar (`/tr/terms`)
- ✅ Gizlilik (`/tr/privacy`)
- ✅ Get Started (`/tr/get-started`)

---

## 🟠 MOBİL UYUMLULUK SORUNLARI (375px viewport)

### 1. Code Block Taşması
- `<pre>` bloğu mobilde yatay taşma yapıyor
- `scrollWidth: 821px` vs `clientWidth: 317px`
- `overflow: auto` var ama yatay scroll fark edilmiyor
- **Çözüm:** `overflow-x: auto` + `max-width: 100%` + yatay scroll göstergesi

### 2. İstatistik Kartları Taşması
- "24,891 Deliveries", "99.97% Success Rate", "45ms Avg Latency" kartları
- `text-2xl font-bold` mobilde çok büyük
- `scrollWidth` vs `clientWidth` farkı: ~30-40px
- **Çözüm:** Mobilde `text-xl` veya `text-lg`

### 3. Footer Taşması
- Footer link grubu mobilde yatay taşıyor
- `scrollWidth: 477px` vs `clientWidth: 367px`
- **Çözüm:** Mobilde flex-col veya grid düzeni

### 4. Adım Numaraları Çakışması
- "Nasıl çalışır" bölümündeki 1, 2, 3 numaralarıikonlarla üst üste
- Numara badge'i ile ikon çakışıyor
- **Çözüm:** Pozisyon ayarı veya margin ekleme

---

## 🟡 ÇEVİRİ SORUNLARI

### Ana Sayfa (`/tr`)

| Öğe | Mevcut | Olması Gereken |
|-----|--------|----------------|
| Nav "Get Started" | Get Started | Başlayın / Ücretsiz Başlayın |
| Nav "Panel →" | Panel → | Panele Git → |
| Code block başlığı | `send-webhook.sh` | `webhook-gonder.sh` (opsiyonel) |

### Get Started Sayfası (`/tr/get-started`)

**NEREDEYSE TAMAMI İNGİLİZCE!** Sadece nav çevrilmiş.

| Öğe | Mevcut (İngilizce) | Olması Gereken (Türkçe) |
|-----|-------------------|------------------------|
| H1 | Get Started with HookSniff | HookSniff ile Başlayın |
| Step 1 | Create your account | Hesabınızı oluşturun |
| Step 2 | Get your API key | API anahtarınızı alın |
| Step 3 | Install the SDK | SDK'yı kurun |
| Step 4 | Create an endpoint | Bir endpoint oluşturun |
| Step 5 | Send your first webhook | İlk webhook'unuzu gönderin |
| Step 6 | Monitor deliveries & go live | Teslimatları izleyin ve canlıya alın |
| Badge | Free forever | Sonsuz ücretsiz |
| Badge | 11 SDKs | 11 SDK |
| Badge | No credit card | Kredi kartı gerekmez |
| Badge | 5 min setup | 5 dk kurulum |
| Button | Create Free Account → | Ücretsiz Hesap Oluştur → |
| Button | Copy | Kopyala |
| Paragraflar | Tümü İngilizce | Tümü Türkçe |

---

## 🟡 İÇERİK TUTARSIZLIĞI

### Fiyatlandırma Uyumsuzluğu

| Kaynak | Free Plan Webhook |
|--------|-------------------|
| Ana sayfa fiyat kartı | **1.000 webhook/ay** |
| Get Started sayfası | **10.000 webhook/ay** |
| README.md | **10.000 webhook/ay** |

→ Hangisi doğru olduğuna karar verilmeli ve tutarlı hale getirilmeli.

---

## 🟢 KÜÇÜK SORUNLAR

### 1. H1 Typewriter Cursor
- H1'de typewriter efekti sonunda `|` karakteri metne yapışık görünüyor
- Bazı durumlarda "çözüm|" şeklinde pipe karakteri sorunlu
- **Çözüm:** cursor'a `margin-left: 2px` ekle

### 2. Nav Overflow (Minimal)
- "Panel →" linki: 4px taşma (100px vs 96px)
- "Ücretsiz başlayın" butonu: 4px taşma (201px vs 197px)

### 3. Accessibility (İyi)
- ✅ Tüm img'lerin alt text'i var
- ✅ Boş button yok
- ✅ Heading hiyerarşisi doğru (H1 → H2 → H3)
- ✅ aria-label'lar mevcut

---

## 📋 DÜZELTME ÖNCELİK SIRASI

| # | Sorun | Öncelik | Tahmini Süre |
|---|-------|---------|-------------|
| 1 | 404 sayfalar (5 sayfa) | 🔴 Kritik | 1-2 saat |
| 2 | Get Started çevirisi | 🟡 Orta | 30 dk |
| 3 | Mobil code block taşması | 🟡 Orta | 15 dk |
| 4 | Fiyat tutarsızlığı | 🟡 Orta | 5 dk |
| 5 | Mobil istatistik kartları | 🟢 Küçük | 10 dk |
| 6 | Nav "Get Started" çevirisi | 🟢 Küçük | 5 dk |
| 7 | Footer mobil taşması | 🟢 Küçük | 15 dk |
| 8 | Adım numaraları çakışması | 🟢 Küçük | 10 dk |
