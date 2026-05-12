# 📋 Fiyat ve Planlama — Sonraki Adımlar

> Son güncelleme: 2026-05-13 00:32 GMT+8

## Sıradaki İş

**Aşama 1: Application Modeli** — yeni tablo + API

1. Migration: `applications` tablosu
2. Migration: `endpoints` tablosuna `application_id` FK
3. Model: Application struct (Rust)
4. API: CRUD endpoint'leri
5. API: Plan bazlı limit kontrolü

## Dosya Konumu

Tüm takip bu klasörde:
```
.ai-context/fiyat-ve-planlama/
├── PLAN.md       ← Görev takibi
├── MEMORY.md     ← Hafıza
└── NEXT_SESSION.md ← Bu dosya
```

## Hatırlatmalar

- Her aşama sonrası `cargo test --lib` çalıştır
- Her aşama sonrası PLAN.md'de ilgili maddeleri ✅ yap
- Oturum sonunda `.ai-context/` push et
- Değişiklikleri commit et: `feat:` veya `fix:` prefix kullan
