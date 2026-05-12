# 🧠 Fiyat ve Planlama — Hafıza

> Son güncelleme: 2026-05-13 00:32 GMT+8

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

- (Henüz bir sorun yok)

---

## Oturum Logları

### Oturum 1 (2026-05-13 00:00 - 00:32 GMT+8)
- Servet ile fiyat ve planlama konuşması
- Hook0 karşılaştırması yapıldı
- Yeni plan yapısı belirlendi: Developer / Startup / Pro / Enterprise
- Feature ekleme kararları alındı
- Görev takip dosyası oluşturuldu (PLAN.md)
