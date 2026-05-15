# 🔍 Ek Bulgular — SDK & Dil Spesifik Versiyonlar

> Son tarama: 2026-05-16
> Bu dosya: Tüm SDK'ların dil/framework spesifik versiyon detayları

---

## 1. Java SDK (`sdks/java/`)

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| maven.compiler.source/target | **17** | **21** (LTS) | 🟡 |
| junit.version | **5.12.2** | 5.x | ✅ |
| SDK version | 0.4.0 | — | Proje version'ı |

---

## 2. Kotlin SDK (`sdks/kotlin/`)

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| kotlin("jvm") | **2.0.21** | **2.3.21** | 🟡 Minor |
| gson | **2.14.0** | 2.x | ✅ |
| okhttp | **4.12.0** | **5.0.0-alpha.16** | 🟡 (5.0 alpha, 4.x stable) |
| moshi | **1.15.2** | 1.15.2 | ✅ Güncel |
| gradle (wrapper) | **8.14.3** | **9.5.1** | 🔴 Major |
| nexus-publish-plugin | **2.0.0** | 2.x | ✅ |

---

## 3. C# / .NET SDK (`sdks/csharp/`)

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| TargetFramework | **net8.0** | **net9.0** | 🟡 Major |
| Microsoft.NET.Test.Sdk | **18.0.1** | 18.x | ✅ |
| xunit | **2.9.3** | 2.x | ✅ |
| xunit.runner.visualstudio | **3.1.5** | 3.x | ✅ |
| Microsoft.Extensions.Hosting | **8.0.1** | 9.x | 🟡 |
| SDK version | 0.4.0 | — | Proje version'ı |

---

## 4. PHP SDK (`sdks/php/`)

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| php minimum | **>=8.0** | PHP **8.4** en son | 🟡 Eski minimum |
| ext-curl | * | * | ✅ |
| ext-json | * | * | ✅ |

**Not:** PHP 8.0 Kasım 2023'te EOL. Minimum `>=8.2` olmalı.

---

## 5. Elixir SDK (`sdks/elixir/`)

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| elixir | **~> 1.18** | **1.18.x** | ✅ Güncel |
| SDK version | 1.0.0 | — | Proje version'ı |

---

## 6. Swift SDK (`sdks/swift/`)

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| swift-tools-version | **5.1** | **6.0** | 🔴 Major |
| iOS platform | **.v11** | **.v16** | 🟡 |
| macOS platform | **.v10_13** | **.v13** | 🟡 |

**Not:** Swift tools version 5.1 çok eski. Swift 6.0 ile uyumlu olmalı.

---

## 7. Go SDK (`sdks/go/`)

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| go directive | **1.22** | **1.24** | 🟡 |
| gopkg.in/validator.v2 | v2.0.1 | v2.0.1 | ✅ Güncel |

---

## 8. Python SDK (`sdks/python/`)

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| requires-python | **>=3.9** | Python 3.13 en son | 🟡 (3.9 EOL) |
| pydantic | >=2.11 | 2.11+ | ✅ |
| urllib3 | >=2.1.0 | 2.x | ✅ |
| python-dateutil | >=2.8.2 | 2.x | ✅ |
| typing-extensions | >=4.7.1 | 4.x | ✅ |

---

## 9. Node.js SDK (`sdks/node/`)

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| engines.node | **>=18.0.0** | Node 22 LTS | 🟡 (18 EOL) |
| typescript | ^5.0.0 | 6.0.3 | 🔴 Major |
| @types/node | ^25.6.2 | 25.x | ✅ |
| tsx | ^4.0.0 | 4.x | ✅ |
| SDK version | 0.4.0 | — | Proje version'ı |

---

## 10. Rust SDK (`sdks/rust/`) — TEKRAR (Detay)

| Bileşen | Mevcut | Ana Proje | En Son | Durum |
|---------|--------|-----------|--------|-------|
| edition | **2021** | 2021 | 2024 | 🟡 |
| reqwest | **0.12** | 0.13 | 0.13.3 | 🔴 Major |
| hmac | **0.12** | 0.13 | 0.13.0 | 🔴 Major |
| sha2 | **0.10** | 0.11 | 0.11.0 | 🔴 Major |
| serde | 1 | 1 | 1.0.228 | ✅ |
| serde_json | 1 | 1 | 1.0.149 | ✅ |
| serde_repr | 0.1 | — | 0.1.x | ✅ |
| serde_with | 3 | — | 3.x | ✅ |
| base64 | 0.22 | 0.22 | 0.22.1 | ✅ |
| uuid | 1 | 1 | 1.23.1 | ✅ |
| url | 2 | 2 | 2.x | ✅ |
| chrono | 0.4 | 0.4 | 0.4.44 | ✅ |

---

## 11. Dashboard tsconfig.json İnceleme

```json
{
  "compilerOptions": {
    "target": "ES2017",        // 🟡 ES2022 olabilir (Node 18+)
    "module": "esnext",         // ✅
    "moduleResolution": "bundler", // ✅
    "lib": ["dom", "dom.iterable", "esnext"], // ✅
    "strict": true,             // ✅
    "jsx": "preserve"           // ✅ (Next.js)
  }
}
```

**Not:** `target: "ES2017"` → `ES2022` olarak güncellenebilir (Node 18+ tüm ES2022 özelliklerini destekler).

---

## 12. Edge Proxy tsconfig.json İnceleme

```json
{
  "compilerOptions": {
    "target": "ES2022",        // ✅
    "module": "ES2022",        // ✅
    "moduleResolution": "bundler", // ✅
    "lib": ["ES2022"],         // ✅
    "types": ["@cloudflare/workers-types"] // ✅
  }
}
```

---

## 13. Node SDK tsconfig.json İnceleme

```json
{
  "compilerOptions": {
    "target": "ES2022",        // ✅
    "module": "commonjs",      // 🟡 ESM düşünülebilir
    "moduleResolution": "node" // 🟡 "bundler" veya "node16" olabilir
  }
}
```

---

## 14. Next.js Config İnceleme

```js
// next.config.js — CommonJS format
const nextConfig = {
  reactStrictMode: true,       // ✅
  images: {
    formats: ['image/avif', 'image/webp'], // ✅
  },
  // output: 'standalone' — REMOVED (Vercel) // ✅
};
```

**Not:** Next.js 16 ile `next.config.ts` (TypeScript) desteği geldi. `next.config.js` → `next.config.ts` düşünülebilir.

---

## 15. Tailwind Config İnceleme

```js
// tailwind.config.js — v3 format
module.exports = {
  darkMode: 'class',           // ✅
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], // ✅
  plugins: [require('@tailwindcss/forms')], // ✅
};
```

**⚠️ Tailwind v4'te bu dosya tamamen değişiyor!** Config CSS'e taşınacak.

---

## 16. PostCSS Config İnceleme

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},    // 🟡 v4'te @tailwindcss/postcss olacak
    autoprefixer: {},   // 🟡 v4'te otomatik handled
  },
};
```

---

## 17. ESLint Config İnceleme

```js
// eslint.config.mjs — Flat config format ✅
import { FlatCompat } from "@eslint/eslintrc";
const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  { rules: { ... } },
];
export default eslintConfig;
```

**Not:** `@eslint/eslintrc` compat layer kullanıyor. ESLint 10 ile bu layer kaldırılabilir.

---

## 18. Vitest Config İnceleme

```ts
// dashboard/vitest.config.ts
export default defineConfig({
  oxc: { jsx: 'react-jsx', jsxImportSource: 'react' }, // ✅
  test: { environment: 'node' }, // 🟡 'jsdom' olabilir (React component testleri için)
});
```

---

## 19. Docusaurus Config İnceleme

```js
// docs-sdk/docusaurus.config.js
const config = {
  title: 'HookSniff SDK',
  url: 'https://docs.hooksniff.dev',
  i18n: { defaultLocale: 'en', locales: ['en', 'tr'] },
  // React 18 kullanıyor — dashboard React 19'da
};
```

---

## 20. OpenAPI Spec İnceleme

```yaml
openapi: 3.0.3    # 🟡 3.1.0 mevcut
info:
  version: 1.0.0  # API version
```

**Not:** OpenAPI 3.1.0, JSON Schema 2020-12 uyumluluğu ve daha iyi type safety sağlar.

---

## 📊 SDK Versiyon Özeti

| SDK | Dil | Dil Versiyonu | Framework | Durum |
|-----|-----|--------------|-----------|-------|
| Node.js | TypeScript | 5.x → 6.x | — | 🔴 |
| Python | Python | >=3.9 → >=3.11 | pydantic 2.11 | 🟡 |
| Go | Go | 1.22 → 1.24 | validator.v2 | 🟡 |
| Rust | Rust | 2021 edition | reqwest 0.12 → 0.13 | 🔴 |
| Ruby | Ruby | 3.3 → 3.4 | rubocop 0.66 → 1.75+ | 🔴 |
| Java | Java | 17 → 21 | JUnit 5.12 | 🟡 |
| Kotlin | Kotlin | 2.0 → 2.3 | Gradle 8 → 9 | 🔴 |
| PHP | PHP | >=8.0 → >=8.2 | — | 🟡 |
| C# | .NET | net8.0 → net9.0 | xunit 2.9 | 🟡 |
| Elixir | Elixir | ~> 1.18 | — | ✅ |
| Swift | Swift | 5.1 → 6.0 | — | 🔴 |
