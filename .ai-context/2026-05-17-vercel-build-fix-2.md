# 2026-05-17 — Vercel Build Fix (Oturum 196)

## Sorun
Vercel build fail: commit `1ecd972` ile deploy çöktü.

### Hata: `npm ci` — package-lock.json senkron değil
- `package.json` version upgrade (Faz 1-15) sırasında güncellenmiş ama `package-lock.json` yenilenmemiş
- 60+ eksik paket (webpack, recharts deps, webassemblyjs, terser, vb.)

### Hata: `'use client'` directive konumu
- `useRealtime.ts` dosyasında `'use client'` satır 2'deydi, satır 1'de olmalı

### Hata: Unused imports (TypeScript)
- `Endpoint` ve `RetryPolicyConfig` import edilmiş ama kullanılmamış

### Hata: recharts Tooltip formatter tipi
- `(value: number)` yerine `(value)` + `Number(value)` cast gerekli

## Yapılan
1. `npm install --legacy-peer-deps` — lock file yenilendi
2. `react-is` eklendi (recharts peer dep)
3. `'use client'` dosyanın en üstüne taşındı
4. Unused `Endpoint`, `RetryPolicyConfig` import'ları kaldırıldı
5. Revenue page formatter tipi düzeltildi (2 yer)
6. `next build` başarılı doğrulandı

## Değişen Dosyalar
- `dashboard/package-lock.json` — yenilendi
- `dashboard/package.json` — `react-is` eklendi
- `dashboard/src/hooks/useRealtime.ts` — `'use client'` pozisyonu
- `dashboard/src/hooks/useDashboardData.ts` — unused import kaldırıldı
- `dashboard/src/app/[locale]/admin/revenue/page.tsx` — formatter tipi
- `dashboard/tsconfig.json` — Next.js auto-update

## Commit
- `0d9e9255` — fix(build): package-lock sync, unused imports, useClient directive, recharts types

## Not
- Vercel otomatik deploy tetiklenecek (push → deploy)
- Build süresi: ~20s (Turbopack)
