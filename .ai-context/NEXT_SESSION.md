# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 23:26 GMT+8

---

## ✅ AŞAMA 2 TAMAMLANDI — Wrapper + İmza Doğrulama (11/11 SDK)

| SDK | Wrapper | verifySignature | Test | Durum |
|-----|---------|----------------|------|-------|
| Node.js | ✅ | ✅ | 14/14 ✅ | TAMAMLANDI |
| Python | ✅ | ✅ | 26/26 ✅ | TAMAMLANDI |
| Go | ✅ | ✅ | 8/8 ✅ | TAMAMLANDI |
| Rust | ✅ | ✅ | 8/8 ✅ | TAMAMLANDI |
| Ruby | ✅ | ✅ | 8/8 ✅ | TAMAMLANDI |
| Java | ✅ | ✅ | wrapper var, test yazılacak | %90 |
| Kotlin | ✅ | ✅ | wrapper var, test yazılacak | %90 |
| PHP | ✅ | ✅ | wrapper var, test yazılacak | %90 |
| C# | ✅ | ✅ | wrapper var, test yazılacak | %90 |
| Elixir | ✅ | ✅ | wrapper var, test yazılacak | %90 |
| Swift | ✅ | ✅ | wrapper var, test yazılacak | %90 |

### Kalan İş: Test Yazımı (Java, Kotlin, PHP, C#, Elixir, Swift)
Her SDK için `tests/webhook_test` dosyası yazılacak. Algoritma aynı, sadece dil syntax'ı farklı.

## 🔧 Vercel 404 Fix (2026-05-11 23:10 - 23:26) — Oturum 110+ (OpenClaw)
**Sorun:** docs/api, docs/portal, docs/sdks sayfaları Vercel'de 404 döndürüyor. 11 diğer docs sayfası çalışıyor.
**Teşhis:** `output: 'standalone'` + outputFileTracingRoot eksik → Vercel build'inde dosya bağımlılık izleme hatası.
**Yapılan:**
1. `output: 'standalone'` kaldırıldı (Vercel kendi serverless bundling'ini kullanıyor)
2. `outputFileTracingRoot: path.join(__dirname, '..')` eklendi (workspace root düzeltildi)
3. 3 sayfaya `export const dynamic = 'force-dynamic'` eklendi (SSG → SSR fallback)
4. Root `vercel.json` güncellendi (buildCommand, outputDirectory, framework, rewrites)
5. Commit: `6331a06e` — push edildi ✅
**Doğrulama:** Local build başarılı, 210 sayfa üretiliyor. Deploy sonrası Vercel'de kontrol et.

## 📋 Sonraki Adım: AŞAMA 2.3 — Test Tamamlama + AŞAMA 3 Publish

### Sıradaki görev:
1. **6 SDK'ya test yaz** (Java, Kotlin, PHP, C#, Elixir, Swift)
2. **AŞAMA 3 planla** — SDK publish stratejisi (npm, PyPI, crates.io, Maven, NuGet, Hex, SwiftPM)

## 📊 Version
- Node.js: 0.4.0
- Python: 0.4.0
- Go: 0.4.0
- Rust: 0.4.0
- Ruby: 0.4.0
