# Agent 4: Settings & Configuration Pages — Code Review

Reviewed: 2026-05-10  
Pages: 7 (settings, team, api-keys, portal, portal-customize, sso, custom-domain)

---

## 1. `settings/page.tsx` — Settings Page

**Summary**: Comprehensive settings page with profile editing, password change, API key display, notification preferences, and account deletion. Uses `next-intl` translations and `useAuth` for auth state.

### Issues Found

| Severity | Issue | Details |
|----------|-------|---------|
| 🟡 Medium | **Hardcoded English strings** | `'New passwords do not match'` (line ~76), `'Password must be at least 8 characters'` (line ~80), `'Sign Out'` button (line ~215), `'✓ Copied!'` (line ~183), `'Copy'` button (line ~182), `'Plan: '` prefix (line ~133). All should use `t()` or `tc()`. |
| 🟡 Medium | **Toggle accessibility** | `ToggleRow` component uses a `<button>` without `role="switch"` or `aria-checked` attribute. Screen readers won't announce toggle state. |
| 🟢 Low | **Delete modal has no focus trap** | The delete account modal doesn't trap keyboard focus. Tab can escape behind the backdrop. |
| 🟢 Low | **Notification API field mismatch** | `email_on_success` is mapped to `emailNotifs` toggle, but the toggle label is "Email notifications" (generic). The field name suggests it's only for success events, which may confuse users. |
| 🟢 Low | **Missing `autoComplete` on confirm password** | The confirm password field lacks `autoComplete="new-password"`, which prevents password managers from auto-filling consistently. |
| 🟢 Low | **`weeklyDigest` state is local-only** | The `weeklyDigest` toggle is saved to API via `handleNotificationSave`, but the API payload doesn't include a `weekly_digest` field — it's silently dropped. |

### Specific Fixes
1. Replace hardcoded strings with translation keys: `t('passwordsNoMatch')`, `t('passwordMinLengthError')`, etc.
2. Add `role="switch"` and `aria-checked={checked}` to `ToggleRow`'s `<button>`.
3. Add `autoComplete="new-password"` to confirm password input.
4. Either include `weekly_digest` in the API payload or remove the toggle if not supported.

---

## 2. `team/page.tsx` — Team Management Page

**Summary**: Full team CRUD with member management — create teams, invite members, change roles, remove members. Uses `teamsApi` wrapper and `next-intl` translations.

### Issues Found

| Severity | Issue | Details |
|----------|-------|---------|
| 🔴 Critical | **No confirmation for member removal** | `handleRemoveMember` calls the API immediately on click. A misclick permanently removes a team member with no undo. |
| 🟡 Medium | **Hardcoded English strings (15+ instances)** | `'Manage your teams and collaborate with others'`, `'+ Create Team'`, `'Team Name'`, `'Description (optional)'`, `'Cancel'` (×2), `'Loading teams...'`, `'Email'`, `'Role'`, `'No members yet. Invite someone!'`, `'Select a team to view details'`, all error toast messages (`'Failed to load teams'`, `'Failed to create team'`, `'Failed to load members'`, `'Failed to invite member'`, `'Failed to remove member'`, `'Failed to update role'`). |
| 🟡 Medium | **Owner can demote themselves** | The role dropdown allows the owner to change their own role to `member` or `admin`, potentially locking themselves out. No guard checks `m.id === currentUser.id`. |
| 🟡 Medium | **No role-based permission checks** | Any member (even `member` role) can see and use the role change dropdown and remove button for other members. Should be restricted to `owner`/`admin`. |
| 🟢 Low | **Date formatting not locale-aware** | `new Date(team.created_at).toLocaleDateString()` uses browser locale, not the app's `[locale]` route param. |
| 🟢 Low | **No loading state for members panel** | When switching teams, members list has no loading indicator — it just shows stale data until new data arrives. |

### Specific Fixes
1. Add confirmation modal for member removal (reuse existing modal pattern).
2. Replace all hardcoded strings with `t()` / `tc()` keys.
3. Guard: prevent self-demotion by checking `m.id !== currentUser?.id` before showing role dropdown.
4. Add role-based visibility: hide invite/role-change/remove buttons unless current user is `owner` or `admin`.
5. Pass locale to `toLocaleDateString(locale)`.

---

## 3. `api-keys/page.tsx` — API Keys Management

**Summary**: CRUD page for API keys with create, rotate, delete functionality. Uses raw `fetch()` with cookie-based auth (`credentials: 'include'`).

### Issues Found

| Severity | Issue | Details |
|----------|-------|---------|
| 🔴 Critical | **`credentials: 'include'` inside `headers` object in `createKey`** | Line ~54–58: `credentials: 'include'` is placed **inside the `headers` object** instead of at the top-level fetch options. This sends a literal HTTP header `credentials: include` (meaningless) and cookies are NOT sent. The create key request will fail with 401 for cookie-auth users. Other functions (`fetchKeys`, `deleteKey`, `rotateKey`) correctly place `credentials` at the top level. |
| 🟡 Medium | **`useAuth()` destructures nothing** | `const { } = useAuth();` — empty destructure. The page doesn't use the auth token at all. This means if the API requires a Bearer token (not just cookies), this page silently fails. Other pages use `const { token } = useAuth()`. |
| 🟡 Medium | **`keyCount` translation has broken pluralization** | Translation is `"{count} key{plural}"` but no `plural` variable is passed: `{ count: keys.length }`. Renders as `"3 key"` instead of `"3 keys"`. Should pass `{ count: keys.length, plural: keys.length !== 1 ? 's' : '' }`. |
| 🟡 Medium | **Silent error swallowing in `fetchKeys`** | `catch (e) { // Error handled silently }` — the user sees no error if key loading fails. They just see an empty list with no indication something went wrong. |
| 🟢 Low | **`NEXT_PUBLIC_API_URL` fallback inconsistency** | Falls back to `'http://localhost:3000/v1'` but `apiFetch` uses a different default (`/api` in production). Could cause issues in dev vs prod. |
| 🟢 Low | **No loading spinner for key creation** | While `creating` is true, button shows spinner text, but there's no visual feedback on the form itself (e.g., disabled inputs). |

### Specific Fixes
1. **Fix `createKey`**: Move `credentials: 'include'` out of `headers` to top-level fetch options:
   ```js
   const res = await fetch(`${API}/api-keys`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({ name: keyName || undefined }),
   });
   ```
2. Either use `const { token } = useAuth()` and pass to `apiFetch`, or document that cookie-only auth is intentional.
3. Fix pluralization: `t('keyCount', { count: keys.length, plural: keys.length !== 1 ? 's' : '' })`.
4. Add error toast or banner when `fetchKeys` fails.

---

## 4. `portal/page.tsx` — Customer Portal

**Summary**: Displays customer profile and webhook usage stats. Fetches from `/portal/me` and `/portal/usage` endpoints.

### Issues Found

| Severity | Issue | Details |
|----------|-------|---------|
| 🔴 Critical | **Zero i18n — no translations at all** | Does not import `useTranslations`. Every single string is hardcoded English: `'Loading...'`, `'👤 Customer Portal'`, `'Profile'`, `'Email'`, `'Plan'`, `'Member since'`, `'Webhook limit'`, `'/month'`, `'Usage'`, `'Webhooks used'`, `'Endpoints'`, `'API calls today'`. The `portal` translation namespace is **missing from ALL locale files**. |
| 🟡 Medium | **No dark mode for loading state** | Loading div uses `text-gray-500` without `dark:text-slate-400` variant. |
| 🟡 Medium | **Inconsistent card styling** | Uses raw `bg-white dark:bg-slate-800 rounded-xl p-6 border` instead of `glass-card` used by every other page in the app. |
| 🟡 Medium | **Missing responsive grid** | `grid grid-cols-2` (profile) and `grid grid-cols-3` (usage) will overflow on mobile. Should be `grid-cols-1 sm:grid-cols-2` and `grid-cols-1 sm:grid-cols-3`. |
| 🟢 Low | **`toLocaleDateString()` not locale-aware** | Uses browser locale instead of app locale. |
| 🟢 Low | **No empty state for zero usage** | If `webhooks_used` is `undefined`/`0`, shows `0` without context. |
| 🟢 Low | **Missing page title tag** | No `<title>` or `metadata` export for SEO. |

### Specific Fixes
1. Add `useTranslations('portal')` and create `portal` namespace in all 8 locale files.
2. Use `glass-card` class for consistent styling.
3. Fix responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
4. Add dark mode variant to loading state.

---

## 5. `portal-customize/page.tsx` — Portal Customization

**Summary**: Rich customization page for embedded webhook portal — branding (colors, logo, fonts), feature toggles, allowed events filter, live preview, and embed code snippets.

### Issues Found

| Severity | Issue | Details |
|----------|-------|---------|
| 🔴 Critical | **Zero i18n — no translations at all** | Does not import `useTranslations`. ~40+ hardcoded English strings throughout: headers, labels, descriptions, button text, placeholder text, toast messages, embed code comments. |
| 🟡 Medium | **`next/image` for external logo URLs** | Uses `<Image src={config.logo_url}>` for arbitrary external URLs. Next.js requires domains to be configured in `next.config.js` `images.remotePatterns`. Unknown URLs will cause runtime errors. Should use `<img>` or add error boundary. |
| 🟡 Medium | **No unsaved changes warning** | User can make many changes and navigate away without any warning. No dirty-state tracking. |
| 🟡 Medium | **`embedCode` includes hardcoded domain** | `https://portal.hooksniff.dev/embed` is hardcoded. Should use an environment variable or the current domain. |
| 🟡 Medium | **React integration code uses `config.primary_color` directly in string template** | If `primary_color` contains a quote character, the generated JSX code will be malformed. Should escape or use a safer template. |
| 🟢 Low | **No font preview** | Font dropdown shows font names but the dropdown itself uses the default font, not the selected font. |
| 🟢 Low | **Toggle checkboxes use `sr-only` pattern** | The `<input type="checkbox" className="sr-only">` is inside a `<label>` but the visual toggle div is not the checkbox — accessibility is fragile. Should use `role="switch"` pattern. |
| 🟢 Low | **No reset to defaults** | No button to reset configuration to defaults. |

### Specific Fixes
1. Add `useTranslations('portalCustomize')` and create the namespace in all locale files.
2. Replace `<Image>` with `<img>` for external logos, or wrap in error boundary.
3. Use `process.env.NEXT_PUBLIC_PORTAL_URL` for embed code domain.
4. Add beforeunload warning when config is dirty.
5. Escape `primary_color` in template strings.

---

## 6. `sso/page.tsx` — SSO / SAML Configuration

**Summary**: Enterprise SSO configuration page supporting SAML 2.0 and OpenID Connect. Allows admins to configure identity provider settings and enable/disable SSO.

### Issues Found

| Severity | Issue | Details |
|----------|-------|---------|
| 🔴 Critical | **Zero i18n — no translations at all** | Does not import `useTranslations`. All strings hardcoded: `'🔐 SSO / SAML'`, `'Configure Single Sign-On...'`, `'Provider'`, `'SAML 2.0'`, `'OpenID Connect'`, all field labels, button text, info banner text. The `sso` namespace is **missing from ALL locale files**. |
| 🟡 Medium | **Shared state between SAML and OIDC** | The `certificate` state serves double duty: X.509 certificate for SAML and client secret for OIDC. Switching providers doesn't clear the field, so a user switching from OIDC to SAML could accidentally save an OIDC client secret as a SAML certificate. |
| 🟡 Medium | **No field validation** | No validation before saving. User can save empty required fields (e.g., SAML with no metadata URL or entity ID). No URL format validation on SSO URL / Issuer URL. |
| 🟡 Medium | **No plan gate** | Info banner says "Business plan required" but there's no actual check. Users on free/starter plans can configure SSO and click Save, which will either silently fail or succeed when it shouldn't. |
| 🟡 Medium | **Hardcoded pricing link** | `<a href="/pricing">` doesn't include the locale prefix. Should use the i18n-aware `Link` component: `<Link href="/pricing">`. |
| 🟢 Low | **No test connection button** | No way to validate SSO config before enabling it for all team members. |
| 🟢 Low | **Certificate textarea has no monospace font hint** | Unlike other code-like inputs, the certificate textarea doesn't have a visual hint that it expects PEM format. |

### Specific Fixes
1. Add `useTranslations('sso')` and create the namespace in all locale files.
2. Clear/reset `certificate` state when switching providers: `useEffect(() => setCertificate(''), [provider])`.
3. Add validation: require at least metadata URL (SAML) or issuer URL + client ID (OIDC) before save.
4. Check user's plan before showing the form; show upgrade CTA for non-business plans.
5. Use locale-aware link: `import Link from '@/i18n/navigation'`.

---

## 7. `custom-domain/page.tsx` — Custom Domain

**Summary**: Allows users to add a custom domain for the webhook portal, shows DNS records to configure, and verifies domain ownership.

### Issues Found

| Severity | Issue | Details |
|----------|-------|---------|
| 🔴 Critical | **Zero i18n — no translations at all** | Does not import `useTranslations`. All strings hardcoded: `'🌐 Custom Domain'`, `'Use your own domain...'`, `'Add Domain'`, `'DNS Records'`, all table headers, step descriptions, button text, toast messages. The `customDomain` namespace is **missing from ALL locale files**. |
| 🟡 Medium | **No loading of existing domain on mount** | Page has no `useEffect` to fetch existing domain configuration. If user already added a domain and refreshes, they see an empty form with no record of their domain. Should fetch from `GET /custom-domains` on mount. |
| 🟡 Medium | **No domain deletion** | No way to remove/delete a custom domain once added. |
| 🟡 Medium | **No domain listing** | Only supports one domain at a time with no UI to show existing domains. If the API supports multiple domains, the UI doesn't reflect this. |
| 🟡 Medium | **`handleAddDomain` overwrites state without warning** | If a domain is already configured, calling `handleAddDomain` again silently overwrites `dnsRecords` and `domainId` without any confirmation. |
| 🟢 Low | **DNS record copy only copies value, not name** | The copy button copies `rec.value` but users might want to copy the `rec.name` field too. |
| 🟢 Low | **No loading state on initial mount** | Page doesn't show a loading state while checking for existing domains (because it doesn't check at all). |
| 🟢 Low | **`'Verify Domain'` button text inconsistent** | Uses `'✓ Verify Domain'` with checkmark prefix — other pages use emoji or plain text. |

### Specific Fixes
1. Add `useTranslations('customDomain')` and create the namespace in all locale files.
2. Add `useEffect` to fetch existing domain configuration from `GET /custom-domains` on mount.
3. Add domain deletion capability (with confirmation modal).
4. Add loading state for initial domain fetch.
5. Warn or confirm before overwriting existing domain.

---

## Cross-Cutting Issues

### 🔴 Missing Translation Namespaces (Critical)

Three entire pages have **zero i18n support**. The following namespaces are missing from ALL 8 locale files:

| Namespace | Used by | Strings affected |
|-----------|---------|-----------------|
| `portal` | `portal/page.tsx` | ~15 strings |
| `portalCustomize` | `portal-customize/page.tsx` | ~40 strings |
| `sso` | `sso/page.tsx` | ~25 strings |
| `customDomain` | `custom-domain/page.tsx` | ~20 strings |

**Total: ~100 hardcoded English strings across 4 pages.** Any non-English locale will display English text for these pages.

### 🟡 Missing Translation Key in Non-English Locales

`settings.apiDesc` is missing from 6 non-English locales: **de, fr, ja, es, ko, pt-BR**. Present in `en` and `tr` only.

### 🟡 Inconsistent API Patterns

- **Settings page**: Uses `api.put()` / `api.delete()` wrapper from `@/lib/api` with Bearer token
- **Team page**: Uses `teamsApi` wrapper from `@/lib/api` with Bearer token
- **API Keys page**: Uses raw `fetch()` with `credentials: 'include'` (cookie auth)
- **Portal page**: Uses `apiFetch()` with token option
- **Portal Customize**: Uses `apiFetch()` with token option
- **SSO page**: Uses `apiFetch()` with token option
- **Custom Domain**: Uses `apiFetch()` with token option

The API Keys page is the only one using raw `fetch()`, which led to the `credentials` placement bug. Should migrate to `apiFetch()` for consistency.

### 🟢 Common Accessibility Gaps

- Modals (settings, team, api-keys) lack focus trapping
- Toggle switches lack `role="switch"` and `aria-checked`
- Delete confirmation in team page has no confirmation dialog at all
- Color-only status indicators (active/inactive badges) lack text alternatives

---

## Priority Summary

| Priority | Count | Examples |
|----------|-------|---------|
| 🔴 Critical | 6 | `credentials` in headers bug, zero i18n on 4 pages, no removal confirmation |
| 🟡 Medium | 18 | Hardcoded strings in partially-translated pages, shared state bugs, missing validation |
| 🟢 Low | 14 | Date locale, focus traps, minor UX polish |

**Recommended fix order:**
1. Fix `createKey` credentials bug (immediate — auth is broken)
2. Add missing translation namespaces for portal/sso/customDomain pages
3. Add confirmation dialog for team member removal
4. Fix hardcoded strings in settings/team pages
5. Add domain loading on mount for custom-domain page
6. Add SSO plan gating and field validation
