# 2026-05-17 — Vercel Build Fix (5 TypeScript Errors)

## Sorun
Vercel build fail — 5 farklı TypeScript hatası:

### Hata 1: `apiPlans` unused (PlanCards.tsx:41)
- `const { plans: apiPlans, getPlan } = usePlans()` → `apiPlans` hiç kullanılmamış
- Çözüm: `const { getPlan } = usePlans()`

### Hata 2: `planInfo` unused (billing/page.tsx:32)
- `const planInfo = getPlan(currentPlan)` → hiç kullanılmamış
- Çözüm: `planInfo` satırı + `getPlan` destructuring kaldırıldı

### Hata 3: `planPrices` unused (revenue/page.tsx:159)
- `const planPrices = { ... }` → hiç kullanılmamış
- Çözüm: satır kaldırıldı

### Hata 4: `result` unused (revenue/page.tsx:217)
- `const result = await updateSettingsMutation.mutateAsync(...)` → result kullanılmamış
- Çözüm: `const result =` kaldırıldı, sadece `await` bırakıldı

### Hata 5: `PlatformSettingsSchema` eksik alanlar
- Zod şemasında `max_endpoints_startup`, `max_endpoints_enterprise`, `max_webhooks_startup`, `max_webhooks_enterprise`, `rate_limit_startup`, `rate_limit_enterprise` yoktu
- TypeScript interface'de vardı ama Zod'da yoktu → type mismatch
- Çözüm: 6 alan `.optional()` ile Zod şemasına eklendi

### Hata 6: Optional field type mismatch (revenue/page.tsx:188)
- Zod `.optional()` → `number | undefined` ama planForm `number` bekliyor
- Çözüm: useEffect içindeki tüm alanlara `?? defaultValue` eklendi

### Hata 7: Mutation call signature (revenue/page.tsx:216)
- `mutateAsync({ token, settings: ... })` → hook `Partial<PlatformSettings>` bekliyor, token hook içinde alınır
- Çözüm: `mutateAsync({ ...settings, ...planForm })` olarak düzeltildi

## Değişen Dosyalar
1. `dashboard/src/app/[locale]/(dashboard)/billing/components/PlanCards.tsx` — unused apiPlans
2. `dashboard/src/app/[locale]/(dashboard)/billing/page.tsx` — unused planInfo + getPlan
3. `dashboard/src/app/[locale]/admin/revenue/page.tsx` — 4 fix (planPrices, result, fallbacks, mutation)
4. `dashboard/src/app/[locale]/content.tsx` — unused planData + getPlanPrice
5. `dashboard/src/schemas/api.ts` — 6 eksik alan eklendi

## Commit
- `ce56ebe3` — fix(build): resolve Vercel TypeScript errors

## Sonuç
- ✅ `next build` başarılı (20.3s, 216+ sayfa)
- ✅ Push edildi → Vercel otomatik deploy tetiklenmeli
