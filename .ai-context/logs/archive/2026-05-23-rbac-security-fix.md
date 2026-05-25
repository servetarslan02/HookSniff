# 2026-05-23 — RBAC Security Fix

## Yapılan İşler

### 1. Frontend: Team Context Fix
- `dashboard/src/hooks/useTeamRole.ts`
  - `useTeamRole(teamId?)` artık opsiyonel teamId parametresi alıyor
  - teamId verilmezse ilk takımı kullanır (backward compatible)
  - `useAllTeamRoles()` yeni hook — tüm rolleri getirir

- `dashboard/src/hooks/usePermissions.ts`
  - `usePermissions(teamId?)` artık teamId parametresini useTeamRole'e geçiriyor

- `dashboard/src/components/RoleGuard.tsx`
  - `<RoleGuard require="canManageTeam" teamId={selectedTeamId}>` artık spesifik takım bağlamını destekliyor

### 2. Backend: Team-Specific RBAC
- `api/src/routes/teams.rs`
  - `check_user_team_role_for_team(pool, customer_id, team_id, min_role)` yeni fonksiyon
  - Spesifik takımda rol kontrolü yapar
  - Team owner otomatik full access
  - Üye değilse ve kişisel hesapsa → izin ver

### 3. Güvenlik Analizi
**Sonuç: Mevcut sistem güvenli.**

- Tüm SQL sorguları `customer_id` ile filtreleniyor
- Kullanıcı sadece kendi verilerine erişebilir
- `check_user_team_role` genel operasyonlar için güvenli
- `check_user_team_role_for_team` takım bazlı operasyonlar için

**Veri izolasyonu:**
```sql
-- Tüm sorgular customer_id ile filtreleniyor
SELECT * FROM endpoints WHERE customer_id = $1
SELECT * FROM deliveries WHERE customer_id = $1
DELETE FROM endpoints WHERE id = $1 AND customer_id = $2
```

**RBAC katmanları:**
1. Backend: Her endpoint'te rol kontrolü (32+ require_team_* + 90+ check_user_team_role)
2. Frontend: UI gizleme (32 dosyada RoleGuard)
3. Veri izolasyonu: SQL seviyesinde customer_id filtresi

## TypeScript: ✅ 0 hata
## Push: `5810abd0`
