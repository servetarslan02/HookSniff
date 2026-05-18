# 2026-05-10 — Playground API Access

## Oturum — 03:18 GMT+8

### Katılanlar
- Servet Arslan (proje sahibi)
- AI Asistan (OpenClaw — webchat)

### Yapılan İşler

**Playground API Access Eklendi (03:18-03:25)**

1. **`/playground` sayfasına "API Access" sekmesi eklendi:**
   - Quick Start guide (3 adım: generate URL → send webhook → read requests)
   - 4 endpoint referansı (POST token, ANY in/{token}, GET history/{token}, DELETE history/{token})
   - Query parameters dokümantasyonu (force_status_code, echo_body, since, limit)
   - Code examples: cURL (4 örnek), Node.js, Python, Go
   - Svix Play vs HookSniff karşılaştırma tablosu (11 özellik)
   - CTA (playground → signup)

2. **CORS header'ları eklendi (3 API route):**
   - `/api/playground/token` — Access-Control-Allow-Origin: *
   - `/api/playground/in/[id]` — Tüm HTTP methods + webhook header'ları
   - `/api/playground/history/[id]` — GET, DELETE, OPTIONS

3. **Next.js 15 uyumluluğu düzeltildi:**
   - API route'larda `params` → `Promise<{ id: string }>` (async params)
   - `customers/[slug]/page.tsx` → async component + await params
   - `DELETE` handler'da unused `request` parametresi düzeltildi

4. **Build: 0 hata, 1 warning (pre-existing useCallback dependency)**

### GitHub Push
- `4740374` — feat: playground API Access

### Değişiklikler
- 5 dosya modifiye
- +487 satır, -28 satır

### Dosyalar
- `dashboard/src/app/[locale]/playground/page.tsx` — +426 satır (API Access sekmesi)
- `dashboard/src/app/api/playground/token/route.ts` — CORS
- `dashboard/src/app/api/playground/in/[id]/route.ts` — CORS + async params
- `dashboard/src/app/api/playground/history/[id]/route.ts` — CORS + async params
- `dashboard/src/app/[locale]/customers/[slug]/page.tsx` — async params fix
