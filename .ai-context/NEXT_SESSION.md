# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 09:20 GMT+8

---

## ✅ BU OTURUMDA YAPILAN (Session 68 — TAMAMLANDI)

### Toplam: 30+ fix, 15+ commit

#### 🔴 Kritik Düzeltmeler (10)
1. **Fiyat $49/$149 → $29/$99** — billing, admin, landing, i18n
2. **Config Debug secret sızıntısı** — custom Debug (REDACTED)
3. **search credentials hatası** — headers içinden çıkarıldı
4. **GDPR delete_account** — 7 eksik tablo eklendi
5. **inbound.rs crypt()** → Argon2 verification
6. **teams.rs invite token** — response'dan kaldırıldı
7. **Checkout URL doğrulaması** — trusted hosts kontrolü
8. **Landing pricing tutarsızlığı** — $49→$29
9. **i18n free tier** — 1,000→10,000 (8 dil)
10. **Privacy retention** — 3→7 gün

#### 🟠 Yüksek Düzeltmeler (10)
11. **HookRelay→HookSniff** — 12+ dosya
12. **Portal double-path** — /api/v1→/v1
13. **alert()→toast()** — 3 sayfa
14. **Dead code** — playground, search
15. **window.location→router.push** — search
16. **Deploy hardcoded values** — env vars
17. **Production log level** — debug→info
18. **Auth middleware cache** — 30s TTL
19. **ROI calculator** — free tier threshold
20. **SDK HookRelay referansları** — python, ruby, PHP

#### 🟡 Orta Düzeltmeler (5)
21. **i18n translations** — previous button (6 dil), q4
22. **Polar product ID** — configurable
23. **Dashboard refactor** — 4 sayfa fetch→apiFetch
24. **api.ts** — 4 yeni API modülü
25. **Workspace kurulumu** — USER, SOUL, IDENTITY

---

## ⚠️ Kalan İşler

### 🔴 Yüksek
1. **SSO client_secret şifreleme** — AES-GCM
2. **Batch webhook race condition** — queue publish hatası
3. **Worker paralel değil** — tokio::spawn

### 🟡 Orta
4. **Newsletter CSRF** — blog, contact
5. **Modal focus trapping** — erişilebilirlik
6. **Dashboard token refresh** — 401→login

### 🟢 Düşük
7. **JSON-LD structured data** — SEO
8. **Blog post ordering** — date-based
9. **aria-label** — icon buttons

---

## 🟡 Servet'in Yapması Gereken
- OAuth test et
- GitHub PAT rotate
- Vercel rebuild kontrol
- iyzico hesap aç
