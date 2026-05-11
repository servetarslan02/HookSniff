# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 22:44 GMT+8

---

## ✅ AŞAMA 1 TAMAMLANDI

| Adım | Durum | Sonuç |
|------|-------|-------|
| 1.1 — Analiz | ✅ | 32 kategori, 76 eksik model tespit edildi |
| 1.2 — Modeller | ✅ | 83 → 148 schema (+65 yeni model) |
| 1.3 — SDK yeniden üretim | ✅ | 11 SDK yeniden üretildi (Node, Python, Go, Java, Ruby, C#, Kotlin, PHP, Rust, Swift, Elixir) |
| 1.4 — Kalite kontrol | ✅ | 11/11 SDK doğrulandı, kritik sorun yok |

### SDK Model Sayıları (Güncel)
| SDK | Model | API | README |
|-----|-------|-----|--------|
| Node.js | 172 | 34 | ✅ |
| Python | 171 | 33 | ✅ |
| Go | 171 | 68 | ✅ |
| Java | 344 | 427 | ✅ |
| Ruby | 514 | 111 | ✅ |
| C# | 684 | 154 | ✅ |
| Kotlin | 534 | 146 | ✅ |
| PHP | 344 | 71 | ✅ |
| Rust | 171 | — | ✅ |
| Swift | 173 | — | ✅ |
| Elixir | 170 | — | ✅ |

## 📋 Sonraki Adım: AŞAMA 2 — Wrapper Class + İmza Doğrulama

### Önce İnternetten Araştırma Yap!
Aşama 2'ye başlamadan önce ZORUNLU:
1. Svix SDK'larını incele (Node.js, Python, Go referans)
2. Webhook signature verification best practices araştır
3. OpenAPI generated SDK wrapper pattern araştır
4. Güncel dependency sürümlerini kontrol et
5. Bulguları `.ai-context/sdk/RESEARCH-AŞAMA2.md`'ye kaydet
6. Kullanıcıya özet göster → onay → uygula

### Sıradaki görev (Aşama 2.1):
1. **Node.js wrapper class** — `new HookSniff(key)` → `client.endpoints.create()`
2. **Node.js imza doğrulama** — `verifySignature()` fonksiyonu
3. **Node.js HTTP library** — native `fetch` veya `node-fetch`

### Referans Implementasyon (Dashboard SDK Sayfası)
Dashboard SDK sayfası zaten `HookSniff` class ve `verifySignature` referans ediyor:
```typescript
import { HookSniff } from 'hooksniff-sdk';
const hr = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY! });
const endpoint = await hr.endpoints.create({...});
```

Bu implementasyon Aşama 2'de yapılacak.

---

## 📊 Workflow Kuralları (WORKFLOW.md)
- Her aşamaya başlarken internetten derin araştırma ZORUNLU
- Subagent'lerle paralel çalışma
- Version: 0.3.0-beta.3 → 0.3.0-rc.1 (Aşama 1.4 sonrası)
- Publish sadece kalite kontrol sonrası
