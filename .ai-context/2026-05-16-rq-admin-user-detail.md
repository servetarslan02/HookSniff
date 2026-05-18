# React Query Migration: Admin User Detail Page

**Date:** 2026-05-16  
**Page:** `dashboard/src/app/[locale]/admin/users/[id]/page.tsx`

## Summary

Converted the admin user detail page from manual `useState` + `useEffect` data fetching to React Query hooks. This was the most complex page in the codebase with ~31 API calls.

## Files Changed

### 1. `dashboard/src/schemas/api.ts` (+207 lines)
Added 14 new Zod schemas for admin user detail API responses:
- `UserEndpointsResponseSchema`
- `UserWebhooksResponseSchema`
- `UserApiKeysResponseSchema`
- `UserApplicationsResponseSchema`
- `UserUsageResponseSchema`
- `UserAnalyticsResponseSchema`
- `UserPlanHistoryResponseSchema`
- `NotesResponseSchema`
- `TagsResponseSchema`
- `CommunicationsResponseSchema`
- `UserInvoicesResponseSchema`
- `UserPaymentsResponseSchema`
- `UserRefundsResponseSchema`
- `DeliveryDetailResponseSchema` / `DeliveryAttemptResponseSchema`

### 2. `dashboard/src/hooks/useAdminData.ts` (+371 lines)
Added 20 new hooks:

**Query hooks (15):**
- `useAdminUserAnalytics(userId, days)` — user delivery analytics
- `useAdminUserPlanHistory(userId)` — plan change history
- `useAdminUserEndpoints(userId)` — user's endpoints
- `useAdminUserWebhooks(userId, params)` — paginated webhooks
- `useAdminUserApiKeys(userId)` — API keys
- `useAdminUserApplications(userId)` — applications
- `useAdminUserUsage(userId)` — usage statistics
- `useAdminUserNotes(userId)` — admin notes
- `useAdminUserTags(userId)` — customer tags
- `useAdminUserCommunications(userId, params)` — paginated communications
- `useAdminUserInvoices(userId, params)` — paginated invoices
- `useAdminUserPayments(userId, perPage)` — payment transactions
- `useAdminUserRefunds(userId, perPage)` — refund history
- `useDeliveryDetail(deliveryId)` — single delivery detail (modal)
- `useDeliveryAttempts(deliveryId)` — delivery retry attempts (modal)

**Mutation hooks (8):**
- `useAdminSendEmail()` — send email to user
- `useAdminImpersonate()` — impersonate user
- `useAdminRefundUser()` — process refund
- `useAdminGdprExport()` — export user data
- `useAdminGdprDelete()` — delete user data (GDPR)
- `useAdminUserTestWebhook()` — test webhook per-user
- `useAdminAddNote()` — add admin note
- `useAdminAddTag()` / `useAdminRemoveTag()` — tag management
- `useAdminReplayDelivery()` — replay webhook delivery

### 3. `dashboard/src/app/[locale]/admin/users/[id]/page.tsx` (rewritten)

**Before:** 1620 lines, 25+ useState for data, 3 useEffect, 2 useCallback  
**After:** 1552 lines, 25 useState (all UI-only), 1 useEffect (plan sync), 0 useCallback

## What Was Converted

| Pattern | Before | After |
|---------|--------|-------|
| Data fetching | `useState` + `useEffect` + `fetchDetail()` | `useAdminUserDetail(id)` + `useAdminUserAnalytics(id)` + `useAdminUserPlanHistory(id)` |
| Tab data loading | `fetchTabData()` + `useEffect` | Individual query hooks with React Query caching |
| Loading state | Manual `setLoading(true/false)` | `isLoading` from `useAdminUserDetail` |
| Delivery modal | Manual `setDeliveryDetail` + `setDeliveryLoading` | `useDeliveryDetail(id)` + `useDeliveryAttempts(id)` with `selectedDeliveryId` state |
| Mutations | Manual `async` handlers with try/catch | Mutation hooks (`useUpdateUserPlan`, `useAdminSendEmail`, etc.) with `mutateAsync` |
| Pending states | Manual `setEmailSending`, `setRefundProcessing`, etc. | `mutation.isPending` from React Query |
| Cache invalidation | Manual `fetchDetail()` / `fetchTabData()` calls | Automatic via `onSettled` in mutation hooks |

## What Was Preserved (UI State)

All UI-only state remains as `useState`:
- `activeTab` — tab selection
- `newPlan` — plan dropdown value
- Modal visibility (`showEmailModal`, `showRefundModal`, `showGdprDeleteModal`, `showTestWebhookModal`)
- Form fields (`emailSubject`, `emailBody`, `refundAmount`, `refundReason`, `gdprDeleteReason`, `newNote`, `newTag`)
- Pagination (`webhooksPage`, `commsPage`, `invoicesPage`)
- Filters (`webhookFilter`, `commFilter`, `invoiceFilter`)
- Test webhook form (`testWebhookUrl`, `testWebhookEvent`, `testWebhookPayload`, `testWebhookResult`)

## Key Design Decisions

1. **Tab data always loaded**: Unlike the original which only fetched tab data when the tab was active, all queries run immediately (enabled by default). React Query's `staleTime` prevents unnecessary refetches. This simplifies the code and means instant tab switching.

2. **Delivery modal uses query**: Instead of manual fetch + state, uses `selectedDeliveryId` state to drive `useDeliveryDetail` and `useDeliveryAttempts` queries. Modal opens when `selectedDeliveryId` is set.

3. **Mutations use `mutateAsync`**: Allows try/catch pattern for toast notifications while still getting React Query benefits (isPending, cache invalidation).

4. **All queries Zod-validated**: Every new query hook uses the `validated()` wrapper with Zod schemas for runtime type safety.
