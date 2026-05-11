# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 22:12 GMT+8

---

## ✅ AŞAMA 1.1 + 1.2 TAMAMLANDI

- **MISSING_MODELS.md** — 32 kategori, 76 eksik model tespit edildi ✅
- **openapi.yaml** — 83 → 148 schema (+65 yeni model) ✅
- **SVIX_REFERENCE.md** — Svix OpenAPI referansı kaydedildi ✅
- **QUALITY_ROADMAP.md** — 14 kural eklendi ✅
- **Push:** `b612372` — main branch

## 📋 Sonraki Adım: AŞAMA 1.3 — SDK'ları Yeniden Üret

6 dil için SDK'ları yeni openapi.yaml'dan yeniden üret:
1. Node.js (typescript-node)
2. Python (python)
3. Go (go)
4. Java (java)
5. Ruby (ruby)
6. C# (csharp)

### Komut
```bash
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g <generator> \
  -o sdks/<lang> \
  --additional-properties=<props>
```

### Dikkat Edilecekler
- Mevcut SDK yapısını koru (wrapper class, retry logic)
- Yeni modelleri ekle, eski modelleri bozma
- Her SDK için compile test et
- `openapi-generator-cli` kurulu değilse kur

## ⚠️ Kurallar
1. Eksik iş bırakılmayacak
2. Yarım iş yapılmayacak
3. Kolaya kaçılmayacak
4. Kusursuz olmazsa düzeltilecek
5. Her dilde aynı standart
6. Backward compatibility
7. Test zorunlu
8. Yanlış bulgu yok
9. Her oturum sonunda sync
10. Sor, tahmin yürütme
11. Tek seferde doğru yap
12. Sadece görsel değil, işlev de tam olacak
13. Bir dili yapıp diğerini salmayacağız
14. Gerektiğinde agent kullanılacak
15. İnternetten derin araştırma yapılacak
