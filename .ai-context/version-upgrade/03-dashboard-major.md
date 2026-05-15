# ⚛️ Dashboard Major Güncelleme Rehberi

> Risk: 🔴 Yüksek (5 major güncelleme)
> Tahmini süre: 5-7 oturum

---

## Sıralama (ÖNEMLİ!)

Bu güncellemeleri **sırasıyla** yap. Her adımdan sonra build + test et.

| Sıra | Güncelleme | Risk | Süre |
|------|-----------|------|------|
| 1 | TypeScript 5 → 6 | 🟡 | 1 oturum |
| 2 | ESLint 9 → 10 | 🟡 | 1 oturum |
| 3 | recharts 2 → 3 | 🟡 | 1 oturum |
| 4 | Tailwind CSS 3 → 4 | 🔴 | 1-2 oturum |
| 5 | Next.js 15 → 16 | 🔴 | 2-3 oturum |

---

## 1. TypeScript 5 → 6

### Kaynak
- https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
- https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html

### Breaking Changes

1. **Compiler option varsayılanları değişti**
   - `target`, `module`, `moduleResolution` yeni varsayılanlara sahip olabilir
   - Mevcut `tsconfig.json`'ı kontrol et

2. **`import ... assert {}` syntax deprecated**
   - Yerine `import ... with {}` kullanılacak
   - Kodda `assert` keyword'ü varsa değiştir

3. **Context-sensitive function inference**
   - Generic call'larda bazı fonksiyon tipleri farklı çıkarılabilir
   - Build sırasında tip hataları görünebilir

4. **Subpath imports `#/` desteği**
   - Node.js uyumlu subpath imports artık destekleniyor

### Adımlar

```bash
cd dashboard

# 1. Güncelle
npm install -D typescript@latest @types/react@latest @types/react-dom@latest

# 2. tsconfig.json kontrol et
# target, module, moduleResolution varsayılanlarını kontrol et
# Gerekirse explicit olarak ayarla

# 3. Tip kontrolü
npx tsc --noEmit

# 4. Hataları düzelt
# - import assert → import with
# - Tip uyumsuzluklarını düzelt

# 5. Build test
npm run build
```

### Olası Sorunlar

- `import ... assert { type: "json" }` → `import ... with { type: "json" }`
- Generic fonksiyonlarda tip çıkarımı değişikliği → explicit type argument ekle

---

## 2. ESLint 9 → 10

### Kaynak
- https://eslint.org/docs/latest/use/migrate-to-10.0.0
- https://eslint.org/blog/2026/02/eslint-v10.0.0-released/

### Breaking Changes

1. **Node.js 20.19+ gerekli**
   - ESLint 10 artık Node 18'i desteklemiyor

2. **Eski config formatı tamamen kaldırıldı**
   - `.eslintrc`, `.eslintrc.json` artık çalışmaz
   - Sadece `eslint.config.js` (flat config)

3. **Config lookup algoritması değişti**
   - Dosya dizininden yukarıya doğru arama artık varsayılan

4. **`eslint-env` yorumları artık hata**
   - `/* eslint-env node */` gibi yorumları kaldır

5. **`eslint:recommended` güncellendi**
   - 3 yeni kural: `no-unassigned-vars`, `no-useless-assignment`, `preserve-caught-error`

6. **JSX referans takibi**
   - JSX element'leri artık scope'da referans olarak algılanıyor
   - `no-unused-vars` false positive'ler düzeltilmiş olabilir

### Adımlar

```bash
cd dashboard

# 1. Güncelle
npm install -D eslint@latest eslint-config-next@latest

# 2. Eski config kontrolü
# .eslintrc.json veya .eslintrc varsa eslint.config.js'e taşı

# 3. eslint-env yorumlarını kaldır
grep -r "eslint-env" --include="*.js" --include="*.ts" --include="*.tsx" .

# 4. Yeni kuralları test et
npx eslint . --max-warnings=100

# 5. Build test
npm run build
```

### Olası Sorunlar

- `.eslintrc.json` → `eslint.config.js` dönüşümü gerekli
- `eslint-config-next` güncellenmeli (Next.js 16 ile uyumlu)
- Yeni kurallar uyarı verebilir → düzelt veya disable

---

## 3. recharts 2 → 3

### Kaynak
- https://github.com/recharts/recharts/wiki/3.0-migration-guide

### Breaking Changes

1. **`CategoricalChartState` kaldırıldı**
   - Custom component'lerde internal state erişimi değişti
   - `Customized` component'i opsiyonel artık

2. **`activeIndex` prop kaldırıldı**
   - Scatter, Bar, Pie'da artık yok
   - Tooltip ile aynı işlev sağlanabilir

3. **`TooltipProps` → `TooltipContentProps`**
   - Custom tooltip'lerde tip değişikliği
   - `label` prop tipi: `string` → `undefined | string | number`

4. **`ref.current.current` kaldırıldı**
   - ResponsiveContainer'da

5. **`alwaysShow` kaldırıldı**
   - Reference component'lerde

6. **`isFront` prop kaldırıldı**
   - Reference element'lerde

7. **Legend sırası değişmiş olabilir**
8. **Z-index render sırasına göre belirleniyor**

### Adımlar

```bash
cd dashboard

# 1. Güncelle
npm install recharts@latest

# 2. Kullanılan recharts component'lerini tara
grep -r "recharts" --include="*.tsx" --include="*.ts" .

# 3. Breaking change kontrolü
# - activeIndex kullanılıyor mu?
# - Customized component var mı?
# - Custom tooltip var mı? (TooltipProps → TooltipContentProps)
# - ResponsiveContainer ref kullanılıyor mu?

# 4. Düzeltmeleri yap

# 5. Build test
npm run build
```

### Olası Sorunlar

- `activeIndex` → Tooltip ile değiştir
- Custom tooltip'lerde tip güncellemesi
- Legend sırası değişikliği → manuel `sort` prop ekle

---

## 4. Tailwind CSS 3 → 4

### Kaynak
- https://tailwindcss.com/docs/upgrade-guide

### Breaking Changes

1. **Config dosyası CSS'e taşındı**
   - `tailwind.config.js` → CSS `@theme` directive
   - `@tailwind` direktifleri → `@import "tailwindcss"`

2. **PostCSS plugin değişti**
   - `tailwindcss` → `@tailwindcss/postcss`
   - `postcss-import` ve `autoprefixer` otomatik handled

3. **Yeniden adlandırılan utility'ler**

| v3 | v4 |
|----|-----|
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `rounded-sm` | `rounded-xs` |
| `rounded` | `rounded-sm` |
| `blur-sm` | `blur-xs` |
| `blur` | `blur-sm` |
| `ring` | `ring-3` |
| `outline-none` | `outline-hidden` |

4. **Varsayılan border rengi**
   - `gray-200` → `currentColor`
   - Tüm `border-*` kullanımında renk belirtilmeli

5. **Varsayılan ring**
   - 3px blue-500 → 1px currentColor
   - `ring` → `ring-3 ring-blue-500`

6. **Container config kaldırıldı**
   - `center`, `padding` options artık yok
   - `@utility container` ile customize

7. **Space/divide selector değişti**
   - Performans optimizasyonu

### Adımlar

```bash
cd dashboard

# 1. Otomatik upgrade tool (ÖNERİLEN)
npx @tailwindcss/upgrade

# 2. Manuel kontrol (otomatik tool sonrası)
# - postcss.config.mjs: tailwindcss → @tailwindcss/postcss
# - CSS import: @tailwind → @import "tailwindcss"
# - Utility rename'leri kontrol et

# 3. PostCSS config güncelle
# postcss.config.mjs:
# plugins: {
#   "@tailwindcss/postcss": {},
# }

# 4. Build test
npm run build

# 5. Görsel test
npm run dev
# Tarayıcıda aç, tüm sayfaları kontrol et
```

### Olası Sorunlar

- `@tailwind` direktifleri → `@import "tailwindcss"` (otomatik tool yapıyor)
- `shadow-sm` → `shadow-xs` (otomatik tool yapıyor)
- Border rengi kaybolabilir → manuel `border-gray-200` ekle
- Ring kaybolabilir → `ring-3 ring-blue-500` ekle
- Custom tailwind config → CSS @theme'e dönüştür

---

## 5. Next.js 15 → 16

### Kaynak
- https://nextjs.org/docs/app/guides/upgrading/version-16
- https://nextjs.org/blog/next-16-2

### Breaking Changes

1. **Turbopack varsayılan oldu**
   - `next dev` ve `next build` artık Turbopack kullanıyor
   - Custom webpack config varsa build başarısız olur
   - Çözüm: `--webpack` flag veya Turbopack'e geç

2. **Async Request APIs tamamen kaldırıldı**
   - `cookies()`, `headers()`, `params`, `searchParams` sadece async
   - v15'te sync uyumluluk vardı, v16'da kaldırıldı

3. **Node.js 18 desteği kaldırıldı**
   - Minimum 20.9.0

4. **Middleware → Proxy convention**
   - Eski `middleware` convention deprecated

5. **ESLint config değişikliği**
   - `next lint` yerine ESLint CLI

6. **Turbopack config taşındı**
   - `experimental.turbopack` → top-level `turbopack`

### Adımlar

```bash
cd dashboard

# 1. Codemod ile otomatik güncelleme (ÖNERİLEN)
npx @next/codemod@canary upgrade latest

# 2. Manuel paket güncelleme
npm install next@latest react@latest react-dom@latest

# 3. TypeScript tiplerini güncelle
npm install -D @types/react@latest @types/react-dom@latest

# 4. next.config.js kontrol et
# - experimental.turbopack → turbopack (top-level)
# - Custom webpack config varsa --webpack flag ekle

# 5. Async API kontrolü
# - cookies(), headers() async kullanılıyor mu?
# - params, searchParams async mi?
# Gerekirse: npx @next/codemod@canary upgrade latest (tekrar)

# 6. Build test
npm run build

# 7. Görsel test
npm run dev
```

### Olası Sorunlar

- **Custom webpack config** → `--webpack` flag ile opt-out veya Turbopack'e geç
- **Sync cookie/header erişimi** → async/await ekle
- **Middleware dosyası** → proxy convention'a taşı
- **ESLint config** → eslint.config.js'e taşı (ESLint 10 ile birlikte)
- **Sass tilde import** → `~bootstrap/...` → `bootstrap/...`

---

## Ortak Sorun Giderme

### Build Hataları

```bash
# Cache temizle
rm -rf .next node_modules
npm install
npm run build

# TypeScript hataları
npx tsc --noEmit 2>&1 | head -50

# ESLint hataları
npx eslint . --max-warnings=0 2>&1 | head -50
```

### Dependency Conflict

```bash
# Force install (son çare)
npm install --force

# veya legacy peer deps
npm install --legacy-peer-deps
```

### Rollback

Her adımdan önce branch oluştur:

```bash
git checkout -b upgrade/typescript-6
# ... değişiklikler ...
git commit -m "chore: upgrade TypeScript to 6.0"
git push origin upgrade/typescript-6
# Test et, sorun yoksa merge et
```
