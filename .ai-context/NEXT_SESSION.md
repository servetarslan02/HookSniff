# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 08:30 GMT+8

---

## ✅ BU OTURUMDA YAPILAN (Session 68 — TAMAMLANDI)

### Dashboard Refactor: Direct fetch() → apiFetch
1. `api.ts`'ya yeni API modülleri eklendi: `alertsApi`, `inboundApi`, `transformsApi`, `billingApiExtended`
2. Alerts sayfası: direct fetch → alertsApi.list/create/delete/test
3. Inbound sayfası: direct fetch → inboundApi.listConfigs/createConfig
4. Transforms sayfası: direct fetch → transformsApi.list/create/delete
5. Billing sayfası: direct fetch → billingApiExtended.getUsage/upgrade
6. Tüm sayfalar artık centralized apiFetch kullanıyor (timeout + error handling)

### Workspace Kurulumu
- OpenClaw workspace USER.md, SOUL.md, IDENTITY.md güncellendi
- Servet Arslan proje sahibi olarak kaydedildi
- GitHub repo klonlandı ve sync edildi

---

## ⚠️ Kalan İşler (Öncelik Sırası)

### 🔴 Yüksek Öncelik
1. **SSO client_secret şifreleme** — Base64 yerine AES-GCM gerekli (security)
2. **Billing sayfası cancel flow** — `billingApiExtended`'a cancel metodu eklenecek
3. **OAuth test** — Google + GitHub OAuth akışını test et (Servet'in yapması gerekiyor)

### 🟡 Orta Öncelik
4. **Dashboard build test** — Vercel'de build olup olmadığını kontrol et
5. **Playground sayfası** — direct fetch var, apiFetch'e çevrilebilir
6. **Auth callback sayfası** — direct fetch var, apiFetch'e çevrilebilir

### 🟢 Düşük Öncelik
7. **Verify-email sayfası** — direct fetch var (auth-related, acil değil)
8. **Status sayfası** — static JSON fetch (farklı pattern, dokunma)

---

## 🟡 Servet'in Yapması Gereken
- OAuth test et (Google + GitHub)
- GitHub PAT rotate et
- Vercel dashboard rebuild kontrol et
- iyzico hesap aç (vergi levhası + banka hesabı)

---

## 📝 Teknik Notlar

### fetch() Kalıntıları (Düzeltilebilir)
- `playground/page.tsx` — 2 fetch() call (playground API, özel pattern)
- `auth/callback/page.tsx` — 1 fetch() (OAuth callback, özel pattern)
- `verify-email/page.tsx` — 2 fetch() (email verification, özel pattern)
- `status/page.tsx` — 3 fetch() (static JSON, farklı pattern)

### Doğrudan fetch Kullanılan Yerler (Dokunulmadı)
- Auth-related sayfalar (callback, verify-email) — cookie-based auth, token yok
- Status sayfası — static dosya fetch
- Playground — özel API pattern

### api.ts'ya Eklenen Modüller
```typescript
alertsApi      → list, create, delete, test
inboundApi     → listConfigs, createConfig
transformsApi  → list, create, delete
billingApiExtended → getUsage, getSubscription, upgrade
```
