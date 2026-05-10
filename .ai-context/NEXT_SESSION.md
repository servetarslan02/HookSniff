# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 08:50 GMT+8

---

## ✅ BU OTURUMDA YAPILAN (Session 68 — TAMAMLANDI)

### Dashboard Refactor (Önceki oturumda başladı)
- `api.ts`'ya 4 yeni API modülü eklendi
- 4 dashboard sayfası direct fetch → apiFetch

### Kod İnceleme Düzeltmeleri (20+ fix)

#### 🔴 Kritik Düzeltmeler
1. **Fiyat $49/$149 → $29/$99** — billing/mod.rs, admin.rs, landing page
2. **Config Debug secret sızıntısı** — custom Debug impl (tüm secrets REDACTED)
3. **search/page.tsx credentials hatası** — credentials headers içinden çıkarıldı
4. **Landing page pricing tutarsızlığı** — $49→$29, $149→$99
5. **i18n free tier 1,000→10,000** — 8 dil düzeltildi
6. **Privacy/terms retention tutarsızlığı** — 3→7 gün (API ile uyumlu)

#### 🟠 Yüksek Düzeltmeler
7. **HookRelay→HookSniff** — 12 dosyada tüm referanslar yeniden adlandırıldı
8. **Portal double-path** — /api/v1 → /v1
9. **alert()→toast()** — endpoints, settings, alerts sayfaları
10. **Dead code temizliği** — playground _endpoints, search _setEvent
11. **window.location.href→router.push** — search sayfası
12. **Deploy hardcoded values** — gcp-deploy.sh env vars
13. **Production log level** — debug→info (render.yaml)
14. **i18n translations** — previous button 6 dil, q4 Korean char

#### 🟡 Orta Düzeltmeler
15. **SDK HookRelay referansları** — python, ruby, PHP README
16. **Polar product ID** — configurable variables

---

## ⚠️ Kalan İşler (Öncelik Sırası)

### 🔴 Yüksek Öncelik
1. **SSO client_secret şifreleme** — Base64 yerine AES-GCM
2. **Batch webhook race condition** — queue publish hatası
3. **Auth middleware cache** — her istekte 2 DB sorgusu
4. **Worker paralel değil** — sırayla for loop

### 🟡 Orta Öncelik
5. **Dashboard token refresh** — 401 → login redirect
6. **Checkout URL doğrulamasız redirect** — billing security
7. **Newsletter CSRF koruması** — blog, contact formları
8. **ROI calculator formülleri** — pricing sayfası

### 🟢 Düşük Öncelik
9. **Modal focus trapping** — erişilebilirlik
10. **aria-label** — icon-only butonlar
11. **JSON-LD structured data** — SEO
12. **Blog post ordering** — manual → date-based

---

## 🟡 Servet'in Yapması Gereken
- OAuth test et (Google + GitHub)
- GitHub PAT rotate et
- Vercel dashboard rebuild kontrol et
- iyzico hesap aç (vergi levhası + banka hesabı)
