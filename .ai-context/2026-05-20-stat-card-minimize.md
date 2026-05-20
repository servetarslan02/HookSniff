# 2026-05-20 — Stat Card Minimalizasyonu

## Oturum: 18:24–18:30 GMT+8

### Kullanıcı: Servet Arslan (servetarslan02)

---

## Yapılan İşler

### Stat Kartları Kompaktlaştırma
Dashboard ana sayfasındaki (Toplam Teslimat, Başarı Oranı, Aktif Endpoint, Başarısız Teslimatlar) kartları minimalize edildi.

### Değişiklikler:

**StatCard.tsx (shared component):**
- Padding: `p-6` → `p-4`
- İkon boyutu: `w-11 h-11 rounded-xl` → `w-9 h-9 rounded-lg`
- Değer metni: `text-3xl` → `text-2xl`
- Label metni: `text-sm` → `text-xs`
- Trend metni: `text-sm` → `text-xs`
- Trend ikonu: `w-4 h-4` → `w-3.5 h-3.5`
- Spacing: `mb-4` → `mb-2`, `mb-1` → `mb-0.5`

**DashboardOverview.tsx:**
- Grid gap: `gap-6` → `gap-4`
- Genel spacing: `space-y-8` → `space-y-6`
- Chart yüksekliği: `h-72` → `h-56`
- Quick stats panel: `p-6` → `p-4`, başlık `text-lg` → `text-base`
- Recent deliveries: `p-6` → `p-4`, başlık `text-lg` → `text-base`
- Quick links: `mt-6 pt-4` → `mt-4 pt-3`

**core/page.tsx (skeleton):**
- Skeleton yüksekliği: `h-28` → `h-24`

### Değişen Dosyalar:
- `dashboard/src/components/tremor/StatCard.tsx`
- `dashboard/src/app/[locale]/(dashboard)/DashboardOverview.tsx`
- `dashboard/src/app/[locale]/(dashboard)/core/page.tsx`
