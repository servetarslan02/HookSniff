# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 15:36 GMT+8

---

## ✅ BU OTURUMDA YAPILAN (Session 70 — TAMAMLANDI)

### OpenClaw Entegrasyonu
1. HookSniff repo OpenClaw workspace'ine klonlandı
2. `.ai-context/` hafıza sistemi incelendi
3. MEMORY.md güncellendi — Session 70 eklendi
4. NEXT_SESSION.md güncellendi
5. GitHub push — `03ddf64`

### Site Görsel Denetimi
- Desktop (1440px) + Mobile (375px) tarayıcı denetimi yapıldı
- 5 sayfada 404, mobil taşma sorunları, çeviri eksiklikleri tespit edildi
- GitHub push — `8915ce3`

### Build Hataları Düzeltildi (4 dosya)
1. `alerts/page.tsx` — token null check
2. `inbound/page.tsx` — InboundConfig import + API_BASE
3. `playground/page.tsx` — unused import kaldırıldı
4. `settings/page.tsx` — token null → undefined

### Mobil Görsel Düzeltmeler
5. İstatistik kartları — text-2xl → text-lg sm:text-2xl
6. Code block — text-xs sm:text-sm + break-all
7. Footer — flex-wrap
8. Adım numaraları — z-20
9. Nav "Get Started" — tNav('getStarted') + 8 dilde key eklendi
- GitHub push — `b5dab6b`

### Fiyat Tutarlılık Düzeltmesi (12 dosya)
10. Tüm sayfalarda Pro $29→$49, Business $99→$149
11. Free tier 1,000→10,000 webhook (alternatives, compare sayfaları)
12. ROI calculator güncellendi
13. Startups %50 indirim $14→$24
- GitHub push — `77faa60`

---

## 🔴 ACİL — Sonraki Oturum Görevleri

### 1. 404 Sayfalar (Kritik)
Footer'da link verilen 5 sayfa 404 dönüyor — build'den kaynaklanıyor olabilir, araştır:
- `/tr/docs`
- `/tr/dashboard`
- `/tr/about`
- `/tr/faq`
- `/tr/contact`

### 2. Get Started Çevirisi (Orta)
`/tr/get-started` sayfası neredeyse tamamen İngilizce

### 3. Fiyat Sayfası Çeviri (Orta)
`/pricing` sayfası İngilizce (hardcoded text, translation keys değil)

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
