# 📄 Şablonlar (Templates)

> Sayfa: `dashboard/src/app/[locale]/dashboard/templates/page.tsx`
> Route: `/dashboard/templates`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- Template listesi (grid görünümü)
- Template interface: id, name, description, tags

## Özellikler
- ✅ Template listeleme (grid)
- ✅ Tag gösterimi
- ✅ Empty state
- ✅ Loading state
- ✅ i18n desteği

## Tespit Edilen Durumlar
### ⚠️ Potansiyel Sorunlar
- **Catch bloğu boş** — `.catch(() => {})` hata yutuluyor
- **Template detay sayfası yok** — Sadece listeleme
- **Template kullanma butonu yok** — Sadece kart gösterimi

### 🔴 Eksiklikler
- Template oluşturma formu
- Template düzenleme
- Template silme
- Template ile webhook oluşturma
- Template arama/filtreleme
- Template kategorileri

---

## 🔧 Backend & Frontend Uyumsuzluğu (2026-05-13)

### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Template uygulama | `POST /v1/templates/{id}/apply` (apply_template) | ❌ "Kullan" butonu yok | EKLENMELİ |
| Template detay | `GET /v1/templates/{id}` (get_template) | ❌ Detay sayfası yok | EKLENMELİ |

### Yapılacaklar
1. **"Kullan" Butonu** — Template'i endpoint'e uygulama
   - Backend: `POST /v1/templates/{id}/apply` zaten var
   - Frontend: Template kartına "Kullan" butonu + endpoint seçici modal
   - Akış: Template seç → Endpoint seç → Apply → Toast başarı mesajı
2. **Template Detay Sayfası** — Template'in detaylı görünümü
   - Backend: `GET /v1/templates/{id}` zaten var
   - Frontend: `/dashboard/templates/[id]` sayfası oluştur
   - İçerik: Açıklama, tag'ler, şema yapısı, örnek payload
3. **Template Arama/Filtreleme** — İsim ve tag ile arama
   - Frontend: Client-side arama input'u + tag filtreleri
4. **Template Kategorileri** — Kategori bazlı gruplama
   - Frontend: Kategori sekmeleri (e-commerce, saas, devops, vb.)
