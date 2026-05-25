# 2026-05-24 — OpenClaw Oturumu (17:07 GMT+8)

## Yapılan İşler

### 1. Cortex Dashboard — 2 Yeni Tab (329 satır)
- `dashboard/src/app/[locale]/admin/cortex/page.tsx`
- **ML Quality tab** (`/cortex/ml/quality`):
  - Genel kalite skoru kartı (büyük, renkli)
  - Her model için: doğruluk %, ortalama hata %, tahmin sayısı
  - Kalite skoru badge'i (80+, 60+, 40+, <40)
  - Düşük kaliteli modelleri sıfırla butonu (`/cortex/ml/quality/reset`)
  - Model yokken bilgilendirme mesajı
- **Proactive Healing tab** (`/cortex/proactive/status`):
  - 3 istatistik kartı: toplam uyarı, kritik, uyarı
  - Her insight için: severity badge, tür, detay, tavsiye
  - Latency trend, rate limit risk, stress detection, cascade risk desteklenir
  - Uyarı yokken emerald Shield ikonu + bilgilendirme
- **PredictionsTab typo fix**: `dark:sentence-400` → `dark:text-slate-400`
- Import: `Target` eklendi (icons.ts'den)

### 2. Vercel Build Fix (5 dosya)
- `cortex/page.tsx`: unused import'lar kaldırıldı (Activity, ChevronDown, Cpu, Gauge, Heart, Layers, LineChart, Settings, TrendingDown, ArrowRight)
- `cortex/page.tsx`: unused değişkenler kaldırıldı (useTranslations, category, method)
- `cortex/page.tsx`: unused `factors` parametresi `_factors` olarak yeniden adlandırıldı
- `docs/billing/page.tsx`, `docs/deliveries/page.tsx`, `docs/endpoints/page.tsx`, `docs/service-tokens/page.tsx`: unused `CodeBlock` import kaldırıldı
- `npx tsc --noEmit` → **0 hata** ✅
- `npm run build` → **exit 0** ✅

### 3. Değişen Dosyalar
- `dashboard/src/app/[locale]/admin/cortex/page.tsx` — 615 → 931 satır
- `dashboard/src/app/[locale]/docs/billing/page.tsx` — 1 satır silindi
- `dashboard/src/app/[locale]/docs/deliveries/page.tsx` — 1 satır silindi
- `dashboard/src/app/[locale]/docs/endpoints/page.tsx` — 1 satır silindi
- `dashboard/src/app/[locale]/docs/service-tokens/page.tsx` — 1 satır silindi

### 4. Commitlar
- `b820786a` — Cortex dashboard tab'ları
- `44ae028f` — .ai-context güncelleme
- `a70453c6` — Vercel build fix
- `02d85729` — Session log güncelleme
- `acae7570` — OAuth double-click fix (PKCE removal)
- `a9b6c5a7` — OAuth callback hard redirect fix
- `1e40adfa` — Session duration fix (1h token, 90d refresh, visibility handler)

### 5. OAuth Double-Click Fix (2 iteration)

**Root Cause (iteration 1):** GitHub OAuth Apps PKCE desteklemez → kaldırıldı.
**Root Cause (iteration 2):** `router.replace('/core')` client-side navigation, AuthProvider mount olmadan token okunamıyor → login'e düşüyor.

**Final Çözüm:**
- `api/src/routes/oauth.rs`: GitHub'dan PKCE kaldırıldı
- `auth/callback/page.tsx`: Tamamen yeniden yazıldı
  - `window.location.href = '/core'` — hard redirect, fresh page load
  - Token API'de doğrulanıyor, redirect'ten önce
  - localStorage'da token varsa (2. deneme) hemen redirect
  - `useTranslations` kaldırıldı (bağımlılık azaltıldı)
  - Hata durumunda retry butonu

## Proje Durumu Değerlendirmesi

### Zaten Yapılmış Olanlar (NEXT_SESSION.md'de "sıradaki" olarak listeleniyordu ama aslında tamamlanmış)
- ✅ Rate Limiting (Redis) — `rate_limit.rs` tam çalışır durumda, Redis + InMemory
- ✅ Alert Evaluation Worker — `api/src/jobs/alert_eval.rs` tam implementasyon
- ✅ Redis State Migration (SSO) — `SsoStateStore.with_redis()` main.rs'de aktif
- ✅ RBAC Role Rate Limiting — `teams.rs:check_role_rate_limit()` çalışır

### Gerçekten Eksik Olanlar
- 🟡 Backend integration tests (henüz yok)
- 🟡 Servet OAuth kurulumu (Google + GitHub)
- 🟡 Servet Secret Manager güncelleme
- 🟡 Servet Migration uygulama (087, 088, 089)
- 🟡 Keycloak SSO test

## Servet'e Notlar
1. `1e40adfa` push edildi — session fix + OAuth fix + Cortex tabs
2. Dashboard'daki Cortex sayfasında artık 6 tab var
3. ML Quality ve Proactive Healing tab'ları otomatik API'den veri çeker
4. OAuth ilk tıklamada çalışmalı (hard redirect fix)
5. PC'de random logout sorunu çözüldü (1 saatlik token + visibility handler)
6. Mobile'da oturum artık 90 gün sonra refresh token dolunca sona erer

### Session Duration Fix (4 dosya)

**Sorunlar:**
- PC: Arka plan sekme → setInterval throttle → 15dk token doluyor → random logout
- Mobile: Sekme canlı kalıyor → refresh asla durmuyor → oturum kapanmıyor

**Düzeltmeler:**
- `api/src/auth/jwt.rs`: Access token **15dk → 1 saat**
- `api/src/routes/auth.rs`: Auth cookie **900 → 3600**, refresh token **30 gün → 90 gün**
- `api/src/routes/oauth.rs`: OAuth cookie'leri de güncellendi
- `dashboard/src/lib/api.ts`:
  - Proactive refresh **12dk → 50dk** (1 saatlik token'a uygun)
  - `visibilitychange` handler eklendi — sekme geri geldiğinde token 10dk'dan az kaldıysa hemen refresh
