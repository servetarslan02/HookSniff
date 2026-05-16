# 2026-05-16 — DeliveriesList Crash Fix

## Bug
`DeliveriesList.tsx` sayfası `replayTarget` null iken crash oluyordu.

## Neden
```tsx
// ❌ HATALI — non-null assertion, null iken crash
message={t('replayConfirm', { id: replayTarget!.id.slice(0, 10) })}

// ✅ DOĞRU — optional chaining + fallback
message={t('replayConfirm', { id: replayTarget?.id.slice(0, 10) ?? '' })}
```

JSX'te prop'lar her zaman evaluate edilir. `open={!!replayTarget}` olsa bile `message` prop'u hesaplanır. `replayTarget` null iken `!.id` → TypeError crash.

## Dosya
- `dashboard/src/app/[locale]/(dashboard)/deliveries/DeliveriesList.tsx`

## Çözüm
`replayTarget!.id` → `replayTarget?.id ?? ''` olarak değiştirildi.
