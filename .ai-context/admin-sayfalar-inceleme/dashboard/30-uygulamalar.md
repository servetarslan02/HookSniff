# 📱 Uygulamalar (Applications)

> Sayfa: ❌ OLUŞTURULMALI
> Route: `/dashboard/applications`
> Backend: `api/src/routes/applications.rs` — CRUD mevcut
> İnceleme Tarihi: 2026-05-13

## Backend Durumu

### Mevcut Endpoint'ler
| Method | Route | Açıklama |
|--------|-------|----------|
| GET | `/v1/applications` | Uygulama listesi |
| POST | `/v1/applications` | Yeni uygulama oluşturma |
| GET | `/v1/applications/{id}` | Uygulama detayı |
| PUT | `/v1/applications/{id}` | Uygulama güncelleme |
| DELETE | `/v1/applications/{id}` | Uygulama silme |

## Frontend Yapılacaklar

### Sayfa Yapısı
1. **Uygulama Listesi** — Grid görünümü (kartlar)
   - Uygulama adı, açıklama, endpoint sayısı, oluşturulma tarihi
   - Durum göstergesi (aktif/pasif)
2. **Oluşturma Formu** — Modal veya yeni sayfa
   - Ad, açıklama, webhook URL
3. **Detay Sayfası** — `/dashboard/applications/[id]`
   - Endpoint'ler, teslimatlar, istatistikler
4. **Düzenleme** — Inline edit veya modal
5. **Silme** — ConfirmDialog ile

### Sidebar Ekleme
```typescript
// sections[?].items'a ekle:
{ name: t('applications'), href: '/applications', icon: '📱' }
```

### i18n Anahtarları (EN + TR)
- applications, applicationsDesc, createApplication, editApplication, deleteApplication
- applicationName, applicationDescription, noApplicationsYet

### Öncelik: 🟡 YÜKSEK — Müşteri birden fazla uygulama yönetebilmeli
