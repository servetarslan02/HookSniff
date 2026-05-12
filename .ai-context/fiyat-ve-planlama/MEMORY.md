# 🧠 Fiyat ve Planlama — Hafıza

> Son güncelleme: 2026-05-13 00:50 GMT+8

---

## Kararlar

### 2026-05-13 — Plan Yapısı Kararı
- **Eski:** Free / Pro ($49) / Business ($99) / Enterprise
- **Yeni:** Developer ($0) / Startup ($29) / Pro ($49) / Enterprise (Custom)
- **Kaynak:** Hook0 ile aynı feature set, daha uygun fiyat
- **TRY:** Dolar bazına çevrilecek, kaldırılmayacak
- **Yıllık:** %20 indirimli
- **Never blocked:** Limit aşılınca event durmaz, ekstra ücret ($0.003/event Startup, $0.0001/event Pro)
- **Email bildirimi:** Limit yaklaşınca müşteriye mail gider
- **Dashboard ayarı:** Müşteri "engelle mi, öde mi" seçebilir

### 2026-05-13 — Feature Kararı
- **Application modeli eklenecek** — müşteri → application → endpoint hiyerarşisi
- **Event type limiti eklenecek** — plan bazlı max
- **Team member limiti eklenecek** — plan bazlı max
- **Statik IP ertelendi** — şimdilik gerek yok
- **SOC 2 ertelendi** — pahalı, şimdilik gerek yok

### 2026-05-13 — Mevcut Feature Kontrolü
- Event Replay ✅ zaten var (webhooks.rs, admin.rs)
- Plan bazlı dashboard upsell ✅ zaten var (billing page, admin settings)

---

## Sorunlar / Notlar

- Rust toolchain bu ortamda yok — cargo test/clippy çalıştırılamıyor
- `transforms.rs` ve `webhooks.rs`'deki endpoint SELECT sorguları farklı kolon seti kullanıyor, compile'da sorun çıkabilir
- Dashboard plan isimleri (Aşama 6'da güncellenecek)

---

## Oturum Logları

### Oturum 1 (2026-05-13 00:00 - 00:32 GMT+8)
- Servet ile fiyat ve planlama konuşması
- Hook0 karşılaştırması yapıldı
- Yeni plan yapısı belirlendi: Developer / Startup / Pro / Enterprise
- Feature ekleme kararları alındı
- Görev takip dosyası oluşturuldu (PLAN.md)

### Oturum 2 (2026-05-13 00:36 - 00:50 GMT+8)
- OpenClaw oturumu — Aşama 1: Application Modeli
- `013_applications.sql` migration oluşturuldu
- `models/application.rs` model dosyası oluşturuldu
- `routes/applications.rs` CRUD endpoint'leri oluşturuldu
- Plan enum güncellendi: Free→Developer, Business→Enterprise, Startup eklendi
- Yeni limit fonksiyonları eklendi (max_applications, max_event_types, vb.)
- Endpoint create'te application_id zorunlu kılındı
- Tüm endpoint SELECT sorgularına application_id eklendi (8+ dosya)
- `billing/mod.rs` test modülü yeni plan yapısına göre yeniden yazıldı
- `routes/mod.rs`'ye applications route eklendi
- `models/mod.rs`'ye application modülü eklendi
