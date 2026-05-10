# Deep UX/UI Audit — HookSniff Dashboard

**Date:** 2026-05-10  
**Auditor:** AI Agent (Subagent)  
**Scope:** All 30+ dashboard pages, shared components, sidebar/navigation, accessibility

---

## Executive Summary

The HookSniff dashboard is **well-structured overall** with consistent dark mode support, responsive layouts, and a clean visual language. However, there are several **critical UX gaps** — particularly around **error handling silence**, **inconsistent loading/empty states**, **missing confirmation dialogs**, and **accessibility deficiencies** — that should be addressed before production.

**Severity Breakdown:**
- 🔴 Critical (5): Silent failures, missing destructive confirmations, accessibility blockers
- 🟠 High (12): Inconsistent patterns, missing states, i18n gaps
- 🟡 Medium (11): Polish issues, minor UX friction
- 🟢 Low (6): Nice-to-haves, minor inconsistencies

---

## 🔴 Critical Issues

### C1. Silent API Failures Across Multiple Pages

**Pages affected:** Health, Alerts, Search, Schemas, Templates, Portal, Routing  
**Problem:** API errors are caught with empty `catch {}` blocks. Users see either stale data, empty states, or loading spinners that never resolve — with zero feedback about what went wrong.

```tsx
// health/page.tsx — lines ~50
} catch (e) {
  // Error handled silently
}

// alerts/page.tsx — lines ~40
} catch {
  // Error handled silently
}

// search/page.tsx
} catch (e) {
  // Error handled silently
}
```

**Impact:** Users have no way to distinguish "no data" from "API is down" from "your session expired." This is the single biggest UX problem in the dashboard.

**Recommendation:** Every page that fetches data must:
1. Show an error state with a "Retry" button
2. Distinguish between "empty" and "error" states
3. At minimum, show a toast notification on failure

---

### C2. Missing Confirmation Dialogs on Destructive Actions

**Pages affected:** Transforms (delete rule), Notifications (delete notification), Team (remove member)  
**Problem:** Several destructive actions fire immediately without any confirmation:

- **Transforms page** — `handleDelete` calls `transformsApi.delete()` immediately on click. No `ConfirmDialog`.
- **Notifications page** — `handleDelete` calls `notificationsApi.deleteNotification()` immediately.
- **Team page** — `handleRemoveMember` calls `teamsApi.removeMember()` immediately. No confirmation.
- **Endpoints page** — Bulk delete has no confirmation (just the button click). Single delete uses `ConfirmDialog` correctly.

**Recommendation:** Wrap all destructive actions with `ConfirmDialog`. The component already exists and is well-implemented — it just needs to be used consistently.

---

### C3. Sidebar Has 26+ Items With No Grouping or Sections

**File:** `dashboard/layout.tsx`  
**Problem:** The sidebar navigation contains **26 items** in a flat list with no visual grouping, sections, or dividers. Items like "🚀 Get Started", "📊 Dashboard", "🔗 Endpoints" are interspersed with advanced features like "🔐 SSO / SAML", "🌐 Custom Domain", "📋 Audit Log". There's no hierarchy — a first-time user sees everything at once.

**Impact:** Cognitive overload. Users can't find what they need. The sidebar scrolls significantly on smaller screens.

**Recommendation:**
- Group items into collapsible sections: **Core** (Dashboard, Endpoints, Deliveries, Logs), **Tools** (Playground, Signature Verifier, Webhook Builder, API Importer), **Advanced** (Transforms, Routing, Rate Limiting, Retry Policy, SSO), **Account** (Team, Billing, Settings, Notifications)
- Move infrequently-used items (SSO, Custom Domain, Audit Log, Portal Customize) behind an "Advanced" or "More" section
- Consider a "Favorites" or "Pinned" feature

---

### C4. No Error Boundary at Dashboard Level

**File:** `dashboard/layout.tsx`  
**Problem:** The `ErrorBoundary` component exists (`components/ErrorBoundary.tsx`) but is **not used in the dashboard layout**. If any child component throws during render, the entire dashboard crashes with a white screen.

**Recommendation:** Wrap `{children}` in `DashboardShell` with `<ErrorBoundary>`.

---

### C5. Accessibility: Missing ARIA Labels on Interactive Elements

**Widespread across all pages.** Specific instances:

- **Sidebar links** — No `aria-label` or `aria-current` for active state. Screen readers can't distinguish active from inactive.
- **Toggle switches** (Settings, Portal Customize, Retry Policy) — Custom toggle uses `<button>` with visual-only state. No `role="switch"`, no `aria-checked`. Screen readers see a button, not a toggle.
- **Status dots** (Activity Feed, Health page) — Colored dots with no text alternative. `StatusDot` component has no `aria-label`.
- **Modal close buttons** — Some use `✕` text with no `aria-label` (e.g., Logs detail modal close button).
- **Pagination buttons** — "Previous" and "Next" have no `aria-label="Previous page"` / `aria-label="Next page"`.
- **Copy buttons** — Use clipboard icon SVG with no `aria-label="Copy to clipboard"`.

**Recommendation:** Add ARIA attributes to all interactive elements. Prioritize: sidebar navigation, modals, toggles, status indicators.

---

## 🟠 High Issues

### H1. Inconsistent Loading States

| Page | Loading State | Method |
|------|--------------|--------|
| Dashboard | ✅ Skeleton shimmer cards | Custom |
| Endpoints | ✅ Skeleton cards | Custom |
| Deliveries | ⚠️ Text-only "Loading deliveries..." | Plain text |
| Logs | ⚠️ Spinner + text | Inline SVG spinner |
| Health | ⚠️ Text-only "Loading..." | Plain text |
| Alerts | ⚠️ Text-only "Loading..." | Plain text |
| API Keys | ✅ Spinner + text | Inline SVG spinner |
| Analytics | ⚠️ Text-only "Loading..." (pulse) | animate-pulse text |
| Transforms | ⚠️ Skeleton card | Minimal skeleton |
| Inbound | ✅ Loading state exists | Via `_loading` (unused variable!) |
| Playground | ✅ LoadingSpinner component | Shared component |
| Settings | ❌ No loading state | N/A |
| Team | ⚠️ Text-only "Loading teams..." | Plain text |
| Billing | ⚠️ Mixed — spinner for invoices, custom for usage | Inconsistent |
| Notifications | ⚠️ Text-only "Loading notifications..." | Plain text |
| Search | ⚠️ Text-only "Searching..." | Plain text |
| Rate Limiting | ✅ Skeleton | Custom |
| SSO | ✅ Skeleton | Custom |
| Audit Log | ✅ Spinner + text | Good |
| Custom Domain | ❌ No loading state | N/A |
| Retry Policy | ✅ Skeleton | Custom |
| Routing | ⚠️ Plain text "Loading..." | Minimal |
| Schemas | ⚠️ Plain text "Loading..." | Minimal |
| Portal | ⚠️ Plain text "Loading..." | Minimal |
| Templates | ⚠️ Plain text "Loading..." | Minimal |
| Webhook Builder | ❌ No loading state | N/A |
| API Importer | ❌ No loading state | N/A |

**Problem:** The `LoadingSpinner` component and `SkeletonCard`/`SkeletonTable` components exist but are barely used. Most pages use ad-hoc loading text.

**Recommendation:** Standardize on `LoadingSpinner` for inline loading and `SkeletonCard`/`SkeletonTable` for page-level loading. Create a `PageSkeleton` component that matches the page layout.

---

### H2. Inconsistent Empty States

| Page | Empty State | Uses EmptyState component? |
|------|------------|---------------------------|
| Dashboard | ✅ "No deliveries yet" text | ❌ Custom text |
| Endpoints | ✅ "No endpoints yet" text | ❌ Custom text |
| Deliveries | ✅ "No deliveries found" | ❌ Custom text |
| Logs | ✅ Emoji + text | ❌ Custom |
| Health | ✅ "No endpoints yet" | ❌ Custom text |
| Alerts | ✅ "No alert rules yet" | ❌ Custom text |
| API Keys | ✅ Emoji + text | ❌ Custom |
| Analytics | ✅ "No data" in charts | ❌ Chart-level |
| Transforms | ✅ "Select an endpoint" / "No transform rules" | ❌ Custom text |
| Inbound | ❌ No empty state for configs | — |
| Team | ✅ Emoji + text | ❌ Custom |
| Notifications | ✅ Emoji + text | ❌ Custom |
| Search | ✅ "Enter a query" | ❌ Custom text |
| Audit Log | ✅ Emoji + detailed empty | ❌ Custom |
| Schemas | ✅ "No schemas registered" | ❌ Custom text |
| Templates | ✅ "No templates available" | ❌ Custom text |
| Portal | ❌ No empty state | — |
| Routing | ✅ "No endpoints configured" | ❌ Custom text |

**Problem:** The `EmptyState` component exists but is **never used**. Every page implements its own empty state with different patterns (some with emoji, some without, some with helpful descriptions, some with just a line of text).

**Recommendation:** Adopt `EmptyState` component across all pages. Enhance it with optional illustration/icon, description, and CTA button.

---

### H3. Inbound Page Has Unused Loading Variable

**File:** `inbound/page.tsx`  
```tsx
const [_loading, setLoading] = useState(true);
```
The underscore prefix means it's intentionally unused, but `setLoading` is still called. The page has no visible loading indicator — data just appears or doesn't.

---

### H4. Several Pages Skip Toast/Error Feedback on Actions

| Page | Action | Feedback |
|------|--------|----------|
| Alerts | Create alert | ❌ No toast on success/error |
| Alerts | Delete alert | ❌ No toast on success/error |
| Alerts | Test alert | ✅ Toast on success, silent on error |
| Transforms | Create rule | ✅ Toast |
| Transforms | Delete rule | ✅ Toast |
| Team | Remove member | ✅ Toast |
| Notifications | Mark as read | ❌ Silent |
| Notifications | Delete | ✅ Toast |
| Inbound | Create config | ✅ Toast |
| API Keys | Create key | ❌ No toast (but shows key banner) |
| API Keys | Delete key | ❌ No toast on success |

---

### H5. Settings Page Has No Loading Skeleton

The Settings page renders immediately with user data from the auth store, but if the store is empty momentarily, fields show as empty. No skeleton or loading state exists.

---

### H6. Sidebar Active State Only Matches Exact Path

```tsx
const isActive = cleanPath === item.href;
```

This means `/dashboard/endpoints/abc123` does NOT highlight "Endpoints" in the sidebar. Only `/dashboard/endpoints` exactly matches. Users navigating to a specific endpoint detail page lose their spatial orientation.

**Recommendation:** Use `startsWith` matching for parent routes, or `useSelectedLayoutSegment`.

---

### H7. Portal and Schemas Pages Use Different Layout Pattern

**Files:** `portal/page.tsx`, `schemas/page.tsx`, `routing/page.tsx`, `templates/page.tsx`  
These pages use `<div className="p-6 max-w-6xl mx-auto">` instead of the standard dashboard content area. They render their own padding/max-width, which conflicts with the layout's `<main className="p-4 md:p-8">`. This causes double-padding.

---

### H8. Sidebar Bottom Controls (LanguageSwitcher, ThemeToggle) Can Overlap Content

```tsx
<div className="absolute bottom-4 left-0 right-0 px-6 flex flex-col gap-2">
  <LanguageSwitcher className="w-full" />
  <ThemeToggle className="w-full" />
</div>
```

With 26+ nav items, the sidebar content can extend below the fold. The absolute-positioned bottom controls will overlap nav items when scrolling, with no scroll container or padding-bottom to prevent overlap.

---

### H9. Team Page — Remove Member Has No Confirmation

```tsx
const handleRemoveMember = async (memberId: string) => {
  // ... immediately calls API
  await teamsApi.removeMember(token, selectedTeam.id, memberId);
};
```

No `ConfirmDialog`. A misclick removes a team member instantly.

---

### H10. Billing Cancel Subscription — Escape Key Closes But Doesn't Reset State

The cancel modal uses a keyboard handler for Escape, but clicking the backdrop also closes. However, `setShowCancelModal(false)` doesn't reset `cancelling` state, so if a user cancels mid-request, the button stays disabled if they reopen.

---

### H11. Playground Page — Raw `fetch()` Instead of Authenticated API Client

The playground page constructs requests with `Authorization: 'Bearer YOUR_TOKEN'` — a placeholder string. This means every request from the playground will fail with a 401 unless the user manually replaces it. The page should use the actual auth token from the store.

---

### H12. Multiple Pages Use `fetch()` Directly Instead of `apiFetch()`

**Pages:** Health, API Keys, Search, Audit Log, Custom Domain, SSO, Portal, Playground  
These pages use raw `fetch()` with `credentials: 'include'` instead of the centralized `apiFetch()` utility. This means:
- No automatic auth token injection
- No consistent error handling
- No automatic retry on 401
- Duplicated URL construction logic

---

## 🟡 Medium Issues

### M1. Onboarding Wizard and Onboarding Component Both Render on Dashboard

The dashboard page renders both `<Onboarding />` and `<OnboardingWizard />` and `<SetupChecklist />`. Both have their own localStorage keys for dismissal. A new user could see two overlapping onboarding modals simultaneously.

---

### M2. ConfirmDialog Missing Dark Mode Styles

The `ConfirmDialog` component's inner dialog div uses `bg-white` but no `dark:bg-slate-900`. In dark mode, the dialog appears as a white box.

```tsx
<div className="relative bg-white rounded-2xl shadow-xl ...">
```

Should be `bg-white dark:bg-slate-900`.

---

### M3. Toast Component Missing Dark Mode Styles for Info Type

```tsx
t.type === 'info' && 'bg-gray-900 text-white'
```

This works in light mode but in dark mode, `bg-gray-900` on a `dark:bg-slate-950` background has minimal contrast.

---

### M4. Delivery Detail Page — "Replay" Button Uses `fetch()` Directly

```tsx
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '...'}/endpoints/${id}/rotate-secret`, ...);
```

Should use `apiFetch` for consistency.

---

### M5. Endpoint Settings Page — Custom Modal Instead of ConfirmDialog

The "Rotate Secret" confirmation uses a hand-rolled modal instead of the shared `ConfirmDialog` component. While functional, it lacks focus trapping, Escape key handling, and consistent styling.

---

### M6. Logs Page — Status Counts Are Calculated From Current Page Only

```tsx
const statusCounts = {
  all: total,
  delivered: deliveries.filter((d) => d.status === 'delivered').length,
  // ...
};
```

The "delivered", "failed", "pending" counts only reflect the current page's deliveries, not the total. This is misleading — a user sees "3 Failed" but there might be 100 failed deliveries total.

---

### M7. Search Page — Auto-Searches on Every Keystroke (via `useEffect`)

```tsx
useEffect(() => {
  search(page);
}, [page, search]);
```

The `search` function is recreated on every `query` change, triggering a search on every keystroke. This should use a debounced approach or require explicit submission.

---

### M8. Billing Page — `useRouter` Imported from Wrong Module

```tsx
import { useRouter } from 'next/navigation';
```

Should be `import { useRouter } from '@/i18n/navigation'` for i18n consistency (the project uses next-intl).

---

### M9. Toggle Switches Aren't Keyboard Accessible

The custom toggle components (Settings, Portal Customize, Retry Policy) use `<button>` or `<div>` with click handlers. While they work visually, the underlying `<input type="checkbox" className="sr-only">` pattern used in SSO page is better for accessibility. The Settings page toggle uses a `<button>` without `role="switch"`.

---

### M10. Inbound Page — `t('active')` and `t('disabled')` Use Root Namespace

```tsx
const t = useTranslations(); // root namespace
// ...
{cfg.enabled ? t('active') : t('disabled')}
```

These translation keys are at the root level, which may not exist. Should use `tc` (common namespace) or define in a page-specific namespace.

---

### M11. API Keys Page — Delete Modal Has No Focus Trap

The delete confirmation modal in API Keys uses a custom modal (not `ConfirmDialog`). It lacks:
- Focus trapping (Tab key escapes the modal)
- `aria-modal="true"`
- `aria-labelledby`
- Escape key handling

---

## 🟢 Low Issues

### L1. Sidebar Navigation Order Could Be Improved

The current order mixes primary actions with secondary features:
1. 🚀 Get Started
2. 📊 Dashboard
3. 🔗 Endpoints
4. 📦 Deliveries
5. 📋 Logs
6. 🔍 Search
7. 💓 Health
8. 🔔 Alerts
9. 🔑 API Keys
10. 🧪 Playground
11. 📈 Analytics
12. 🔄 Transforms
13. 📨 Inbound
14. ⚡ Rate Limiting
...

"Schemas", "Templates", and "Portal" are missing from the sidebar entirely, though their pages exist.

---

### L2. Footer Component Not Used in Dashboard

The `Footer` component is defined but not rendered in the dashboard layout. This is fine for a dashboard (footers are typically for marketing pages), but worth noting for completeness.

---

### L3. Email Verification Banner Position ✅ Correct

`<EmailVerificationBanner />` is correctly rendered before `{children}` inside `<main>`. No issue here.

---

### L4. AnimatedCounter Doesn't Handle Negative Values

The `AnimatedCounter` component uses `Math.round(start + diff * eased)` which works for positive numbers but could display odd intermediate values for negative numbers.

---

### L5. Playground History Uses localStorage Without Size Limits

History is capped at 10 entries, but the `body` field stores the full request payload. Large payloads could quickly exhaust localStorage.

---

### L6. No Route-Level `loading.tsx` for Dashboard

There's a `loading.tsx` at the `[locale]` level but none at `dashboard/`. Next.js uses `loading.tsx` for automatic Suspense boundaries during navigation. Without one, navigating between dashboard pages shows no transition indicator — the user just waits.

### L7. Several Pages Have Hardcoded English Strings

Despite using `useTranslations()`, many pages have hardcoded English strings:
- Health: "Monitor the health and performance..."
- Alerts: "Get notified when webhooks fail..."
- Rate Limiting: All strings
- Signature Verifier: All strings
- SSO: All strings
- Audit Log: All strings
- Custom Domain: All strings
- Retry Policy: All strings
- Routing: All strings
- Schemas: All strings
- Templates: All strings
- Portal: All strings
- Webhook Builder: All strings
- API Importer: All strings

Only the core pages (Dashboard, Endpoints, Deliveries, Logs, Settings, Team, Billing, Notifications, API Keys, Playground, Search, Analytics, Inbound) use i18n properly.

---

## Shared Component Assessment

### Onboarding.tsx ✅
- Well-implemented multi-step wizard with progress bar
- Skippable, localStorage-persisted
- Good illustrations
- **Issue:** Renders as fixed overlay, blocks all interaction until dismissed

### OnboardingWizard.tsx ✅
- More comprehensive than Onboarding (6 steps vs 4)
- Includes SDK selection, endpoint creation, test webhook
- Good confetti animation on completion
- **Issue:** Both Onboarding and OnboardingWizard can render simultaneously
- **Issue:** Uses `<a href>` instead of `<Link>` for internal navigation in the "Done" step

### EmptyState.tsx ⚠️
- Clean component with icon, title, description, action
- **Issue:** Never actually used in any page
- **Issue:** Button uses `btn-ripple` CSS class that may not be defined

### LoadingSpinner.tsx ✅
- Clean, size-variant spinner
- Also exports `SkeletonCard` and `SkeletonTable`
- **Issue:** `SkeletonCard` and `SkeletonTable` don't support dark mode (`bg-gray-200` without `dark:bg-slate-700`)

### Toast.tsx ✅
- Context-based provider pattern
- Auto-dismiss after 4 seconds
- Success/error/info variants
- **Issue:** No dark mode styles for info variant
- **Issue:** No dismiss button (user must wait 4s)
- **Issue:** No animation for removal (only slide-up on add)

### ConfirmDialog.tsx ✅
- Focus trapping implemented
- Escape key closes
- Body scroll lock
- Focus restoration on close
- **Issue:** Missing dark mode on inner dialog (`bg-white` only)
- **Issue:** No `aria-describedby` linking message to dialog

### Footer.tsx ✅
- Well-organized 4-column layout
- Proper external link handling (`target="_blank" rel="noopener noreferrer"`)
- i18n support for link text
- **Issue:** Some links point to non-existent pages (e.g., `/blog`)

### ErrorBoundary.tsx ✅
- Class component error boundary
- Shows error message and retry button
- **Issue:** Not used in dashboard layout
- **Issue:** "Try again" button resets error state but doesn't re-fetch data

---

## Sidebar/Navigation Assessment

### ✅ What Works
- Active page highlighting (exact match)
- Mobile hamburger menu with overlay
- Smooth slide animation
- Logo links to home
- Admin panel link conditionally shown
- Language switcher and theme toggle in sidebar
- User email and logout in header

### ❌ What Needs Improvement
- No grouped sections (26 flat items)
- Active state only matches exact path
- No "Schemas", "Templates", or "Portal" links in sidebar
- Bottom controls can overlap nav items on scroll
- No search/filter for navigation items
- Emoji icons may render differently across platforms
- No keyboard shortcut for toggling sidebar on desktop

---

## Accessibility Summary

| Category | Status | Notes |
|----------|--------|-------|
| ARIA labels | ❌ Poor | Missing on most interactive elements |
| Color contrast | ⚠️ Fair | Dark mode generally good; some gray-on-gray issues |
| Keyboard navigation | ⚠️ Fair | Tab works on most elements; custom toggles problematic |
| Focus management | ✅ Good | ConfirmDialog has focus trap; modals restore focus |
| Screen reader | ❌ Poor | Status dots, icons have no text alternatives |
| Skip navigation | ❌ Missing | No "Skip to content" link |
| Heading hierarchy | ⚠️ Fair | Most pages start with h1; some use h2/h3 inconsistently |
| Form labels | ✅ Good | All form inputs have associated labels |
| Error messages | ⚠️ Fair | Some errors announced, most are visual-only |

---

## Recommendations Priority

### Immediate (Pre-Launch)
1. **Fix silent API failures** — Add error states to all data-fetching pages
2. **Add ConfirmDialog to all destructive actions** — Transforms, Notifications, Team, bulk deletes
3. **Wrap dashboard layout in ErrorBoundary**
4. **Fix ConfirmDialog dark mode** — Add `dark:bg-slate-900`
5. **Fix sidebar active state** — Use `startsWith` or segment matching

### Short-Term (v1.1)
6. Group sidebar navigation into sections
7. Standardize loading states using shared components
8. Standardize empty states using `EmptyState` component
9. Add ARIA labels to all interactive elements
10. Migrate raw `fetch()` calls to `apiFetch()`
11. Fix double-padding on Portal/Schemas/Routing/Templates pages

### Medium-Term (v1.2)
12. Complete i18n for all pages
13. Add skip navigation link
14. Add debounced search
15. Consolidate Onboarding + OnboardingWizard
16. Add toast dismiss button and dark mode styles
17. Add keyboard shortcuts for common actions
