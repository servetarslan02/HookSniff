# 2026-05-17 — Vercel Build Fix + Sentry Org Mismatch

## Oturum — 01:46 GMT+8

### Sorun
Vercel build fail: commit `400b5a02` ile çalışan deploy çöktü.

### Hata 1: TypeScript — Build Killer
- **Dosya:** `dashboard/src/app/[locale]/admin/settings/page.tsx:551`
- **Hata:** `'useQueryClient' is declared but its value is never read`
- **Sebep:** Dynamic import içinde destructuring yapılıp kullanılmamış
- **Çözüm:** Commit `0f595c72` — import kaldırıldı, sade `alert()` bırakıldı
- **Durum:** ✅ Düzeltildi (zaten repo'da mevcut)

### Hata 2: Sentry Org/Project Mismatch (Warning)
- **Log:** `Using organization 'hooksniff' (embedded in token) rather than manually-configured organization 'servetarslan02'`
- **Sebep:** Vercel'deki `SENTRY_ORG` env var muhtemelen `servetarslan02` olarak ayarlı, ama Sentry auth token `hooksniff` organizasyonuna ait
- **Çözüm:** Vercel Dashboard → Settings → Environment Variables:
  - `SENTRY_ORG` = `hooksniff` (token ile eşleşmeli)
  - `SENTRY_PROJECT` = `hooksniff-dashboard`
- **Durum:** ⏳ Servet'in Vercel'den güncellemesi gerekiyor

### Not
Sentry uyarıları build'i kırmıyor ama logları kirletiyor ve source map upload'ı başarısız oluyor (error tracking'te stacktrace'ler düzgün çalışmaz).

### Sonraki Adımlar
1. Vercel'de yeni deploy tetikle (commit `0f595c72` ile)
2. Sentry env var'larını düzelt (yukarıdaki)
3. Sentry instrumentation file eklenebilir (Next.js 15+ için önerilen yapı)
