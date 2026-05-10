# HookSniff Dashboard — Deep React Architecture & Component Patterns Audit

**Audit Date:** 2026-05-10  
**Scope:** All components, pages, state management, hooks, i18n, styling, and TypeScript patterns  
**Files Reviewed:** 21 components, 30+ page files, store, API client, hooks, i18n config, Tailwind config, Next.js config

---

## 1. Component Architecture

### 1.1 Component Hierarchy — ⚠️ FAIR

The component tree follows a reasonable structure:
```
AuthGuard → DashboardShell (layout) → Page Components
```

**Strengths:**
- Clean provider nesting: `AuthGuard > DashboardShell > page content`
- Reusable primitive components: `LoadingSpinner`, `EmptyState`, `ConfirmDialog`, `StatusBadge`
- `tremor/` barrel export pattern for design system components (`StatCard`, `ChartCard`, `StatusBadge`)

**Issues:**
- **Duplicate `StatusBadge`:** There's a `StatusBadge` at `src/components/StatusBadge.tsx` AND a re-export in `src/components/tremor/StatusBadge.tsx`. The tremor version just re-exports the shared one. This is confusing — pick one canonical location.
- **Two overlapping onboarding components:** `Onboarding.tsx` (209 lines) and `OnboardingWizard.tsx` (649 lines) serve similar purposes. The `DashboardOverview` page renders BOTH, which is confusing.

### 1.2 Prop Drilling — ⚠️ MINOR

- `token` is drilled from `useAuth()` into nearly every page component individually. This is acceptable since `useAuth()` is a context hook, but the `token` string is destructured and passed around extensively.
- Some components receive `token` as a prop (e.g., `ActivityFeed({ token })`) when they could just call `useAuth()` internally.
- No significant prop drilling chains >2 levels detected.

### 1.3 Oversized Components — 🔴 CRITICAL

**Components >200 lines:**

| Component | Lines | Issue |
|-----------|-------|-------|
| `OnboardingWizard.tsx` | **649** | Contains wizard, confetti, checklist, and success toast — should be 4+ files |
| `dashboard/page.tsx` | **586** | Dashboard overview with 4 inline chart/feed components |
| `deliveries/[id]/page.tsx` | **547** | Detail page with timeline, headers, body viewer |
| `billing/page.tsx` | **494** | Billing page with plan cards, usage, invoices |
| `endpoints/[id]/page.tsx` | **446** | Endpoint detail with tabs, config, transforms |
| `settings/page.tsx` | **441** | Profile, password, API key, notifications, danger zone |
| `playground/page.tsx` | **695** | **Largest file** — webhook testing with live preview |
| `portal-customize/page.tsx` | **402** | Portal customization |
| `retry-policy/page.tsx` | **355** | Retry policy configuration |
| `team/page.tsx` | **339** | Team management |
| `api-importer/page.tsx` | **336** | API import functionality |
| `api-keys/page.tsx` | **332** | API key management |

**Recommendation:** Extract sub-components. For example:
- `OnboardingWizard.tsx` → `Confetti.tsx`, `SetupChecklist.tsx`, `SuccessToast.tsx`, `WizardStep.tsx`
- `dashboard/page.tsx` → Already has inline components (`DeliveryTrendChart`, `SuccessRateDonut`, `ActivityFeed`) — extract them to separate files
- `settings/page.tsx` → `ProfileForm.tsx`, `PasswordForm.tsx`, `NotificationPrefs.tsx`, `DangerZone.tsx`

### 1.4 Reusability — ✅ GOOD

- `ConfirmDialog` — accessible modal with focus trapping, keyboard nav ✅
- `EmptyState` — generic empty state with icon, title, action ✅
- `StatusBadge` — configurable status-to-style mapping ✅
- `StatCard` / `ChartCard` — reusable dashboard primitives ✅
- `CodeBlock` / `SdkTabs` — reusable code display ✅
- `LoadingSpinner` + `SkeletonCard` + `SkeletonTable` — loading states ✅

---

## 2. State Management

### 2.1 Approach — Context API (single auth context)

**Current setup:**
- `AuthContext` (store.tsx) — user, token, apiKey, login/register/logout
- `ThemeContext` (ThemeProvider.tsx) — theme, toggle
- `ToastContext` (Toast.tsx) — toast notifications

**Assessment:** This is appropriate for the app's scale. No need for Zustand/Redux.

### 2.2 Global State Scoping — ⚠️ FAIR

- **Auth context** is correctly scoped to `AuthProvider` (used in root layout)
- **Theme context** is correctly scoped
- **Toast context** is correctly scoped
- **No unnecessary global state** — page-level data (endpoints, deliveries, stats) is fetched locally in each page component ✅

### 2.3 Re-render Concerns — ⚠️ MINOR

- `AuthContext` stores `user`, `token`, `apiKey`, `isLoading` — all change together during auth flows, causing consumers to re-render. This is acceptable since auth changes are infrequent.
- `useAuth()` is called in ~25+ components. Any auth state change re-renders all of them. For most pages this is fine since they only use `token`.
- **No `useMemo` on derived state** — e.g., in `DashboardOverview`, `statCards` array is recreated every render. Minor perf concern.

### 2.4 Derived State — ⚠️ COULD IMPROVE

- Chart data transformations (`.buckets.map(...)`) happen inline in render. Should use `useMemo`.
- `filtered` deliveries in `DeliveriesPage` is computed inline — should be `useMemo`.
- `navigation` array in `DashboardShell` is recreated every render.

---

## 3. Hook Patterns

### 3.1 Custom Hooks — ⚠️ UNDERUTILIZED

**Only 1 custom hook exists:** `useDeliveryStream.ts`

**Missing hooks that should be extracted:**
- `useFetchData<T>(fetcher, deps)` — every page has the same `useState/loading/error + useEffect` pattern
- `usePagination(total, perPage)` — pagination logic is duplicated in deliveries, notifications, etc.
- `useClipboard()` — copy-to-clipboard logic is duplicated in 5+ components (`CodeBlock`, `SdkTabs`, `OnboardingWizard`, `SettingsPage`, `ApiKeysPage`)
- `useClickOutside(ref, callback)` — duplicated in `NotificationCenter` and `LanguageSwitcher`
- `useDebounce(value, delay)` — search inputs in deliveries, endpoints, etc.

### 3.2 Hook Dependencies — ✅ MOSTLY CORRECT

- `useCallback` is properly used in `store.tsx` for `login`, `register`, `logout`, `persistAuth`, `setApiKey`
- `useCallback` is used in `useDeliveryStream.ts` for `connect`
- `useCallback` in `NotificationCenter` for `fetchNotifications`
- `useEffect` cleanup is present in:
  - `useDeliveryStream.ts` — `controller.abort()` ✅
  - `ConfirmDialog` — event listener removal, body scroll restore, focus restore ✅
  - `NotificationCenter` — interval cleanup ✅
  - `LanguageSwitcher` — event listener cleanup ✅
  - `ThemeProvider` — no cleanup needed ✅

### 3.3 Missing Cleanup — ⚠️ ONE ISSUE

- `EmailVerificationBanner.tsx` line 20-24: `fetch` call in `useEffect` has no abort controller. If component unmounts during fetch, state update on unmounted component.
- `AuthGuard.tsx`: The `router.push` in useEffect could fire after unmount, though Next.js router handles this gracefully.

### 3.4 useEffect Overuse — ⚠️ MODERATE

- **114 `useEffect` calls** across the codebase (excluding tests)
- Many pages have nearly identical fetch-on-mount patterns that could be consolidated into a custom hook
- `DashboardOverview` has 3 separate `useEffect` calls — one for stats, one for analytics, one for time range. Could be consolidated.

---

## 4. Form Handling

### 4.1 Approach — 🔴 NO FORM LIBRARY

All forms use manual `useState` for each field:
```typescript
const [newUrl, setNewUrl] = useState('');
const [newDesc, setNewDesc] = useState('');
const [creating, setCreating] = useState(false);
const [error, setError] = useState('');
```

**Pages with forms:**
- `endpoints/page.tsx` — create endpoint
- `settings/page.tsx` — profile, password, notifications (6+ state variables)
- `OnboardingWizard.tsx` — endpoint creation
- `alerts/page.tsx` — alert rule creation
- `team/page.tsx` — team member invitation
- `transforms/page.tsx` — transform rule creation
- `inbound/page.tsx` — inbound config
- `webhook-builder/page.tsx` — webhook builder
- `retry-policy/page.tsx` — retry policy
- `sso/page.tsx` — SSO configuration

### 4.2 Validation — ⚠️ MINIMAL

- **Endpoint creation:** `type="url"` on input (browser validation only)
- **Password change:** Manual checks (`newPassword !== confirmPassword`, `newPassword.length < 8`)
- **No schema validation** (no Zod, Yup, or similar)
- **No form library** (no React Hook Form, Formik)

### 4.3 Form State Persistence — ⚠️ PARTIAL

- `OnboardingWizard` persists state to localStorage ✅
- Other forms lose state on navigation ❌

**Recommendation:** Adopt `react-hook-form` + `zod` for forms with validation. At minimum, create a `useFormState` hook to reduce boilerplate.

---

## 5. Component Composition

### 5.1 Compound Components — ❌ NOT USED

No compound component patterns detected. All components are standalone.

**Opportunity:** The `SdkTabs` component could be a compound component (`Tabs`, `TabList`, `Tab`, `TabPanel`).

### 5.2 Render Props / Children Patterns — ⚠️ MINIMAL

- `ErrorBoundary` accepts `fallback` prop (render prop pattern) ✅
- `ConfirmDialog` uses callback props (`onConfirm`, `onCancel`) ✅
- Most components use direct composition via `children` ✅

### 5.3 Separation of Concerns — ⚠️ MIXED

**Good:**
- API calls are centralized in `api.ts` ✅
- Auth logic is centralized in `store.tsx` ✅
- Error handling utility in `errors.ts` ✅

**Issues:**
- Page components mix data fetching, state management, and rendering
- `OnboardingWizard.tsx` contains UI components (Confetti, Checklist, Toast) that should be separate
- Inline SVG illustrations inside `Onboarding.tsx` (4 SVG components) — should be in a separate file

---

## 6. Styling Patterns

### 6.1 Tailwind Consistency — ✅ EXCELLENT

- Tailwind is used consistently across all components
- Custom utility classes are defined in `globals.css`: `glass-card`, `hover-lift`, `card-tilt`, `btn-ripple`, `skeleton-shimmer`, `page-enter`
- `clsx` is used for conditional classes in `ConfirmDialog`, `DashboardShell`, `LoadingSpinner`
- Brand color palette is properly extended in `tailwind.config.js`

### 6.2 Inline Styles — ⚠️ MINOR

Inline `style=` usage is minimal and justified:
- Dynamic widths (`style={{ width: `${progress}%` }}`) — acceptable
- Dynamic colors from user config (`style={{ backgroundColor: config.primary_color }}`) — acceptable
- Animation delays (`style={{ animationDelay }}`) — acceptable
- Confetti piece styles — acceptable (randomized)

**No problematic inline styles detected.**

### 6.3 Design System — ⚠️ EMERGING

**Present:**
- `tremor/` barrel export with `StatCard`, `ChartCard`, `StatusBadge`
- Consistent `glass-card` styling
- Brand color palette (50-900)
- Consistent border radius (`rounded-xl`, `rounded-2xl`)
- Consistent spacing patterns

**Missing:**
- No formal design token system
- No component storybook
- Some color values are hardcoded in chart configs (`#10b981`, `#ef4444`, `#f59e0b`)

### 6.4 Responsive Breakpoints — ✅ GOOD

- `sm:`, `md:`, `lg:` breakpoints used consistently
- Mobile sidebar with overlay pattern
- Grid layouts responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Table columns hidden on mobile: `hidden md:table-cell`

---

## 7. Dark Mode

### 7.1 Implementation — ✅ EXCELLENT

- `ThemeProvider` with `darkMode: 'class'` in Tailwind config
- System preference detection via `prefers-color-scheme`
- localStorage persistence
- No flash of wrong theme (mount check)

### 7.2 Coverage — ✅ COMPREHENSIVE

**1,121 `dark:` variant usages** across components and pages. This is excellent coverage.

All reviewed components include dark mode variants:
- Background colors: `dark:bg-slate-900`, `dark:bg-slate-800`
- Text colors: `dark:text-white`, `dark:text-slate-400`
- Border colors: `dark:border-slate-700`
- Status badge styles: full dark variants for all statuses
- Chart components: dark-aware grid, tooltip, axis colors

### 7.3 Hardcoded Colors — ⚠️ MINOR

- Chart gradient IDs use hardcoded hex colors (`#10b981`, `#ef4444`, `#f59e0b`) — these are inside SVG `<defs>` and can't use Tailwind classes. Acceptable.
- `StatusBadge` uses Tailwind classes throughout ✅
- `StatCard` color map uses Tailwind classes with dark variants ✅
- Toast component: `bg-green-600`, `bg-red-600`, `bg-gray-900` — no dark variants needed (overlay component)

---

## 8. TypeScript Usage

### 8.1 Type Definitions — ✅ EXCELLENT

- All API response types are properly defined in `api.ts`:
  - `Endpoint`, `Delivery`, `DeliveryDetail`, `DeliveryAttempt`, `DeliveryListResponse`
  - `StatsResponse`, `AdminStatsResponse`, `AdminUsersResponse`, `AdminUser`, `AdminUserDetail`
  - `RevenueResponse`, `Team`, `TeamMember`, `Notification`, `NotificationListResponse`
  - `TimeBucket`, `DeliveryTrendResponse`, `SuccessRateData`, `LatencyBucket`, `LatencyTrendResponse`
  - `Invoice`, `AlertRule`, `InboundConfig`, `TransformRule`, `BillingUsage`, `BillingSubscription`
  - `RetryPolicyConfig`

### 8.2 `any` Types — ✅ CLEAN

**Zero `any` types in source code.** All `any` usage is confined to test files (mock typing). This is excellent.

### 8.3 Props Typing — ✅ GOOD

All component props are properly typed:
- `LoadingSpinnerProps`, `EmptyStateProps`, `ConfirmDialogProps`, `StatusBadgeProps`
- `StatCardProps`, `ChartCardProps`, `DeliveryEvent`, `OnboardingState`
- Function components use typed return values

### 8.4 API Client Typing — ✅ EXCELLENT

`apiFetch<T>()` is generic and properly typed:
```typescript
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T>
```
All API methods return properly typed promises:
```typescript
list: (token: string) => apiFetch<Endpoint[]>("/endpoints", { token })
```

### 8.5 Error Handling Types — ✅ GOOD

- `getErrorMessage(err: unknown)` properly handles unknown error types
- Catch blocks use `err: unknown` pattern
- Error responses are typed via `.catch(() => ({ message: "Unknown error" }))`

---

## 9. Additional Findings

### 9.1 i18n — ✅ WELL IMPLEMENTED

- `next-intl` with 8 locales: en, tr, de, ja, pt-BR, es, fr, ko
- Proper routing setup with `createNavigation`
- `useTranslations()` used consistently in components
- Some hardcoded English strings remain (see below)

**Hardcoded strings (not i18n'd):**
- `EmailVerificationBanner.tsx`: "Please verify your email address", "Verification email sent!"
- `NotificationCenter.tsx`: "Notifications", "No notifications", "Mark all read"
- `dashboard/layout.tsx`: Some nav items like "⚡ Rate Limiting", "🔐 Signature Tool"
- `dashboard/page.tsx`: "Live Activity", "Auto-refresh 5s"
- Various error messages in catch blocks

### 9.2 API Client — ✅ WELL DESIGNED

- Clean `apiFetch<T>()` with timeout, abort signal, 401 auto-refresh
- Domain-specific API modules: `endpointsApi`, `webhooksApi`, `statsApi`, `adminApi`, `teamsApi`, `notificationsApi`, `billingApi`, `alertsApi`, `inboundApi`, `transformsApi`, `analyticsApi`
- Generic `api` wrapper for ad-hoc requests
- Proper credential handling (`credentials: 'include'`)

### 9.3 Security Headers — ✅ EXCELLENT

Next.js config includes comprehensive security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy` with proper directives
- `Permissions-Policy` restricting camera, microphone, geolocation

### 9.4 Error Boundary — ✅ PRESENT

`ErrorBoundary` class component with:
- `getDerivedStateFromError` for fallback UI
- `componentDidCatch` for logging
- Custom `fallback` prop support
- Reset capability

### 9.5 Accessibility — ⚠️ PARTIAL

**Good:**
- `ConfirmDialog` has `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Focus trapping in dialog ✅
- Focus restoration on close ✅
- Body scroll lock ✅
- `aria-label` on icon buttons ✅

**Missing:**
- No `aria-live` regions for toast notifications
- No skip-to-content link
- Tables lack `aria-label` or `<caption>`
- Some buttons lack `aria-label` (icon-only buttons)

---

## 10. Summary & Prioritized Recommendations

### Critical (Fix Now)

1. **Extract oversized components** — 12 files exceed 200 lines, with `playground/page.tsx` at 695 lines and `OnboardingWizard.tsx` at 649 lines. Extract sub-components.

2. **Adopt a form library** — All 10+ forms use manual `useState` per field. Use `react-hook-form` + `zod` to reduce boilerplate and add validation.

3. **Remove duplicate onboarding** — `Onboarding.tsx` and `OnboardingWizard.tsx` overlap. Consolidate into one.

### High Priority (Fix Soon)

4. **Extract custom hooks** — Create `useFetchData`, `useClipboard`, `useClickOutside`, `usePagination`, `useDebounce` to eliminate duplication across 25+ files.

5. **Add `useMemo` for derived state** — Chart data transformations, filtered lists, and navigation arrays are recomputed every render.

6. **Add missing useEffect cleanup** — `EmailVerificationBanner` fetch has no abort controller.

### Medium Priority (Improve)

7. **Form validation** — Add schema validation (Zod) for all forms, not just browser-native validation.

8. **i18n completeness** — ~20+ hardcoded English strings need translation keys.

9. **Accessibility** — Add `aria-live` for toasts, skip-to-content link, table captions.

### Low Priority (Polish)

10. **Consolidate `StatusBadge`** — Remove the tremor re-export; use one canonical import path.

11. **Extract inline SVGs** — The 4 illustration SVGs in `Onboarding.tsx` should be in a separate file.

12. **Design tokens** — Formalize the color/spacing system beyond Tailwind config.

---

## Metrics Summary

| Metric | Value | Rating |
|--------|-------|--------|
| Components >200 lines | 12/30+ pages | 🔴 |
| `any` types in source | 0 | ✅ |
| Dark mode coverage | 1,121 `dark:` variants | ✅ |
| Custom hooks | 1 (useDeliveryStream) | 🔴 |
| useEffect calls | 114 | ⚠️ |
| Form library usage | None | 🔴 |
| API types defined | 25+ interfaces | ✅ |
| i18n locales | 8 | ✅ |
| Security headers | Full CSP + permissions | ✅ |
| Error boundary | Present with fallback | ✅ |
| Accessibility | Partial | ⚠️ |
| Reusable components | 10+ primitives | ✅ |
