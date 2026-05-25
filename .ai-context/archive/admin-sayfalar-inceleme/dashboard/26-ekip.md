# 👥 Ekip (Team)

> Sayfa: `dashboard/src/app/[locale]/dashboard/team/page.tsx`
> Route: `/dashboard/team`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- TeamList — Ekip listesi
- TeamDetail — Ekip detayı (üyeler)
- CreateTeamModal — Ekip oluşturma
- InviteMemberModal — Üye davet
- ConfirmDialog — Üye çıkarma onayı

### Rol Sistemi
- owner > admin > member
- canInvite: owner veya admin
- canRemove: owner veya admin
- canChangeRole: sadece owner

## Özellikler
- ✅ Ekip listeleme
- ✅ Ekip oluşturma
- ✅ Üye davet
- ✅ Üye çıkarma (onay ile)
- ✅ Rol bazlı yetkilendirme
- ✅ Owner demote koruması

## Tespit Edilen Durumlar
### ✅ İyi Yönler
- Rol bazlı yetkilendirme
- Bileşenlere ayrılmış yapı
- ConfirmDialog ile silme onayı
- Owner demote guard

### 🔴 Eksiklikler
- Rol değiştirme
- Ekip silme
- Üye profili görüntüleme
- Ekip activity log

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Ekip Detay Sayfası Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/team/page.tsx`
- **Backend:** `GET /v1/teams/{id}` — ekip detayı
- **Sorun:** `teamsApi.get` api.ts'de tanımlı ama hiçbir sayfa çağırmıyor. Ekip detay sayfası yok.
- **Adımlar:**
  1. `dashboard/src/app/[locale]/(dashboard)/team/[id]/page.tsx` oluştur
  2. Ekip bilgileri, üye listesi, davet geçmişi
  3. `teamsApi.get(token, teamId)` çağrısı
  4. i18n key: `teamDetails`, `teamMembers`, `teamHistory`

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/team/page.tsx`
- **Sorun:** 3 useEffect, 15 fetch var ama abort yok.
- **Adımlar:**
  1. Her useEffect başında `const controller = new AbortController()` oluştur
  2. `apiFetch` çağrısına `{ signal: controller.signal }` ekle
  3. useEffect return'ünde `return () => controller.abort()` ekle
