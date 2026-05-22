# 2026-05-23 — RBAC Frontend (Part 2)

## Yapılan İşler

### 1. Integrations Sayfası RBAC
- `dashboard/src/app/[locale]/(dashboard)/integrations/IntegrationsContent.tsx`
- Create butonu → `RoleGuard require="canManageIntegrations"`
- Edit/Toggle/Delete butonları → `RoleGuard require="canManageIntegrations"`
- Empty state create butonu → `RoleGuard require="canManageIntegrations"`
- ReadOnlyBadge header'a eklendi

### 2. Alerts Sayfası RBAC
- `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`
- Create butonu → `RoleGuard require="canManageAlerts"`
- Toggle/Edit butonları → `RoleGuard require="canManageAlerts"`
- Delete butonu → `RoleGuard require="canManageAlerts"`
- Test butonu → herkes görebilir (değişmedi)
- ReadOnlyBadge header'a eklendi

### 3. Custom Domain Sayfası RBAC
- `dashboard/src/app/[locale]/(dashboard)/custom-domain/CustomDomainContent.tsx`
- Add Domain section → `RoleGuard require="canManageDomains"`
- Delete butonları → `RoleGuard require="canManageDomains"`
- Verify butonu → herkes görebilir (değişmedi)
- ReadOnlyBadge header'a eklendi

### 4. API Keys Sayfası RBAC
- `dashboard/src/app/[locale]/(dashboard)/api-keys/page.tsx`
- Create Key section → `RoleGuard require="canManageApiKeys"`
- Rotate/Delete butonları → `RoleGuard require="canManageApiKeys"`
- ReadOnlyBadge header'a eklendi

### 5. Service Tokens Sayfası RBAC
- `dashboard/src/app/[locale]/(dashboard)/service-tokens/page.tsx`
- Create Token butonu → `RoleGuard require="canManageApiKeys"`
- Edit/Delete butonları → `RoleGuard require="canManageApiKeys"`
- ReadOnlyBadge header'a eklendi

### 6. Team Sayfası Owner Fix
- `dashboard/src/app/[locale]/(dashboard)/team/page.tsx`
- `isOwner` değişkeni çakışması düzeltildi → `isTeamOwner` olarak yeniden adlandırıldı
- `isAdmin` artık owner'ı da kapsıyor: `currentRole === 'admin' || isTeamOwner`
- `canInvite`, `canRemove`, `canChangeRole` artık owner tarafından da kullanılabilir

## TypeScript: ✅ 0 hata
## Push: `2d8d7181`
