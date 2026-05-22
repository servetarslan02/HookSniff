# 2026-05-23 — RBAC Frontend Implementation

## Yapılan İşler

### 1. useTeamRole Hook (Yeni)
- `dashboard/src/hooks/useTeamRole.ts`
- Kullanıcının mevcut takımdaki rolünü getirir
- `teams.list()` → ilk takım → `teamDetail.owner_id` kontrol → `teamMembers` içinde rol bulma
- Hierarchy: owner(50) > admin(40) > developer(30) > analyst(20) > viewer(10)
- `roleLevel()` ve `hasMinRole()` helper fonksiyonları

### 2. usePermissions Hook (Yeni)
- `dashboard/src/hooks/usePermissions.ts`
- Role göre granüler yetkiler döndürür
- Backend RBAC mapping:
  - `require_team_admin` → canManageTeam, canManageWebhooks, canManageApiKeys, canManageIntegrations, canManageAlerts, canManageBilling, canManageDomains, canManageApplications, canManageOperationalWebhooks, canManageBackgroundTasks, canManageRouting, canManageRateLimits
  - `require_role("developer")` → canViewDevtools
  - `require_role("analyst")` → canViewObservability
  - `require_team_member` → canManageSettings

### 3. RoleGuard Component (Yeni)
- `dashboard/src/components/RoleGuard.tsx`
- `<RoleGuard require="canManageWebhooks">` — çocuk bileşenleri yetkiyle render eder
- `ReadOnlyBadge` — viewer/analyst roller için "Read-only" badge

### 4. Sidebar RBAC Filtreleme
- `dashboard/src/app/[locale]/(dashboard)/layout.tsx`
- `usePermissions()` import edildi
- Nav items artık rol bazlı filtreleniyor:
  - Admin Panel: platform admin (is_admin) — değişmedi
  - Core (Dashboard): herkes — değişmedi
  - Applications: canManageApplications (admin+)
  - Organization: herkes — değişmedi
  - Operational Webhooks: canManageOperationalWebhooks (admin+)
  - Observability: canViewObservability (analyst+)
  - DevTools: canViewDevtools (developer+)
  - Integrations: canManageIntegrations (admin+)
  - Custom Domain: canManageDomains (admin+)
  - Routing Config: canManageRouting (admin+)
  - Billing: canManageBilling (admin+)
  - Account: herkes — değişmedi

### 5. Endpoints Sayfası RBAC
- `dashboard/src/app/[locale]/(dashboard)/endpoints/EndpointsContent.tsx`
- "New Endpoint" butonu → `RoleGuard require="canManageWebhooks"`
- Bulk delete butonu → `RoleGuard require="canManageWebhooks"`
- Tekil delete butonu → `RoleGuard require="canManageWebhooks"`
- ReadOnlyBadge header'a eklendi

## TypeScript: ✅ 0 hata
## Push: `253d3086`
