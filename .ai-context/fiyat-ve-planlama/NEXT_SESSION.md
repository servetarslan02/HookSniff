# 📋 Fiyat ve Planlama — Sonraki Adımlar

> Son güncelleme: 2026-05-13 00:50 GMT+8

## Sıradaki İş

**Aşama 2: Event Type Limiti** — plan bazlı max event type kontrolü

1. Mevcut `event_schemas` tablosunu kontrol et (veya yeni `event_types` tablosu)
2. API: Event type oluştururken limit kontrolü (Developer:10, Startup:50, Pro:sınırsız)
3. Test: Unit testler

## Tamamlanan

### Aşama 1: Application Modeli ✅
- Migration: `013_applications.sql` (applications tablosu + endpoints FK)
- Model: `models/application.rs` (Application, CreateApplicationRequest, UpdateApplicationRequest, ApplicationResponse)
- API: `routes/applications.rs` (CRUD: list, get, create, update, delete)
- Plan enum: Developer/Startup/Pro/Enterprise (eski Free→Developer, Business→Enterprise)
- Yeni limit fonksiyonları: max_applications, max_event_types, max_team_members, max_subscriptions, max_events_per_day, overage_price, allows_overage
- Endpoint create: application_id zorunlu + ownership doğrulama
- Tüm endpoint SELECT sorgularına application_id eklendi

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

## ⚠️ Dikkat

- `cargo test` ve `cargo clippy` bu ortamda çalıştırılamıyor (Rust toolchain yok)
- GitHub push sonrası Cloud Build'te compile doğrulanacak
- `transforms.rs` ve `webhooks.rs`'deki endpoint SELECT sorguları farklı kolon seti kullanıyor — compile hatası gelirse düzeltilecek
