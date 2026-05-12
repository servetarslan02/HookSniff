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
