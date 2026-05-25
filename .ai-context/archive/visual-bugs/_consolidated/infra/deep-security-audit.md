# HookSniff Dashboard — Deep Security Audit

**Date:** 2026-05-10  
**Scope:** `dashboard/src/` — all pages, components, lib files, middleware, config  
**Auditor:** Automated deep review  

---

## Executive Summary

The HookSniff dashboard has a **solid foundation** — auth cookies are HttpOnly (good), API keys are memory-only (good), and basic security headers are in place. However, there are several **medium-to-high severity gaps** that should be addressed before production: no edge-level auth enforcement, client-side-only admin guards, missing CSRF protection, overly permissive CSP, and a playground token stored in localStorage.

**Findings: 14 total** — 🔴 3 Critical · 🟡 7 Medium · 🟢 4 Low

---

## 1. Authentication & Authorization

### 🔴 CRITICAL: No Edge Middleware Authentication

**File:** `src/middleware.ts`

The middleware only handles i18n routing. There is **zero authentication enforcement at the edge**. Any unauthenticated user can load `/dashboard/*` and `/admin/*` pages — the HTML/JS bundles are served before any client-side auth check runs.

```typescript
// Current — i18n only
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
export default createMiddleware(routing);
```

**Impact:** The full dashboard UI code is shipped to unauthenticated users. Attackers can inspect the client bundle to understand the app structure, API endpoints, and admin functionality — even if they can't make API calls.

**Fix:**
```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check auth for protected routes
  const isProtected = pathname.match(/\/(dashboard|admin)(\/|$)/);
  if (isProtected) {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      const locale = pathname.match(/^\/(tr|de|ja|pt-BR|es|fr|ko)\//)?.[1] || '';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Admin routes: verify admin role via cookie or token introspection
  const isAdminRoute = pathname.match(/\/admin(\/|$)/);
  if (isAdminRoute) {
    // Option A: encode role in a signed cookie
    // Option B: lightweight token introspection call
    // For now, rely on API-level enforcement + client guard
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

---

### 🟡 MEDIUM: Admin Authorization Is Client-Side Only

**File:** `src/app/[locale]/admin/layout.tsx`

The admin layout checks `user?.is_admin` purely on the client side. This value comes from `localStorage` (cached user object) which can be **tampered with** by an attacker.

```typescript
// Current — client-only check
useEffect(() => {
  if (user && !user.is_admin) {
    router.push('/dashboard');
  }
}, [user, router]);

if (!user?.is_admin) {
  return <AccessDenied />;
}
```

**Impact:** A non-admin user could modify `localStorage`'s `hooksniff_user` to set `is_admin: true`, bypassing the client guard. The backend API should reject unauthorized admin calls, but the admin UI code/structure is still exposed.

**Fix:**
1. Add server-side middleware check (see above)
2. Add a server component wrapper that validates admin status on the server:

```typescript
// src/app/[locale]/admin/layout.tsx — add server-side validation
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side admin check via cookie introspection
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  
  if (!session) redirect('/login');
  
  // Validate admin role server-side (call backend or decode JWT)
  // const user = await validateSession(session);
  // if (!user?.is_admin) redirect('/dashboard');
  
  return <AdminShell>{children}</AdminShell>;
}
```

---

### 🟡 MEDIUM: Playground Token Stored in localStorage

**File:** `src/app/[locale]/playground/page.tsx`

```typescript
localStorage.setItem('hooksniff_playground_token', data.token);
localStorage.setItem('hooksniff_playground_url', data.url);
```

**Impact:** Any XSS vulnerability can steal this token. Playground tokens appear to be short-lived webhook receiver tokens, but they grant the ability to send webhooks to the user's endpoint.

**Fix:** Store in memory only (React state), or use sessionStorage with a short TTL. Clear on page unload:
```typescript
// Memory-only approach
const [token, setToken] = useState('');
// Don't persist to localStorage

// OR: sessionStorage (cleared on tab close)
sessionStorage.setItem('hooksniff_playground_token', data.token);
```

---

### 🟢 LOW: User Object Cached in localStorage

**File:** `src/lib/store.tsx`

```typescript
localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u }));
```

The user object (id, email, name, plan, is_admin) is stored in localStorage. This is non-sensitive display data and is verified against the backend on mount — **acceptable pattern**. However, `is_admin` being in localStorage enables the client-side admin bypass described above.

**Fix:** Remove `is_admin` from the cached object; always fetch it fresh from the backend:
```typescript
const cacheUser = { id: u.id, email: u.email, name: u.name, plan: u.plan };
localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: cacheUser }));
```

---

## 2. API Security

### 🔴 CRITICAL: No CSRF Protection on State-Changing API Calls

**Files:** `src/lib/api.ts`, all dashboard pages

The app uses `credentials: 'include'` on all fetch calls (correct for cookie-based auth), but there is **no CSRF token** sent with any request. The only CSRF protection found is in `src/app/api/newsletter/route.ts` (a server-side route).

```typescript
// api.ts — no CSRF header
const res = await fetch(`${API_BASE}${path}`, {
  method,
  headers,
  credentials: 'include',
  body: body ? JSON.stringify(body) : undefined,
});
```

**Impact:** An attacker could craft a malicious page that makes authenticated POST/PUT/DELETE requests to the HookSniff API on behalf of a logged-in user (e.g., delete endpoints, change plans, ban users).

**Fix:** Implement a CSRF token pattern:

```typescript
// 1. Add to api.ts
function getCsrfToken(): string {
  // Read from meta tag or generate per-session
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

// 2. Include in all state-changing requests
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'X-CSRF-Token': getCsrfToken(),
};

// 3. Server should validate Origin/Referer header as fallback
// 4. Consider SameSite=Strict on session cookie
```

---

### 🟡 MEDIUM: Playground Token Exposed in URL Path

**File:** `src/app/[locale]/playground/page.tsx`

```typescript
const res = await fetch(`/api/playground/history/${token}?since=...`);
```

The playground token is embedded directly in the URL path. This means it will appear in:
- Server access logs
- Browser history
- Referrer headers
- Network monitoring tools

**Fix:** Send the token in a request header or body instead:
```typescript
const res = await fetch('/api/playground/history', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, since: lastPoll }),
});
```

---

### 🟡 MEDIUM: API Base URL Inconsistency Creates SSRF Surface

**Files:** Multiple pages, `src/lib/store.tsx`, `src/lib/api.ts`

The API base URL is resolved from `NEXT_PUBLIC_API_URL` with a fallback to `'http://localhost:3000/v1'` in many components. Some components use different fallback patterns:

```typescript
// api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? "/api" : "http://localhost:3000/v1");

// store.tsx (multiple instances)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');

// Some pages use hardcoded production URL
const API = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1';
```

**Impact:** Inconsistency could lead to requests going to unintended hosts. The hardcoded production URL in `status/page.tsx` and `contact/page.tsx` exposes the internal GCP Cloud Run endpoint.

**Fix:** Centralize API base URL in one file and import everywhere:
```typescript
// src/lib/config.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
```

---

### 🟡 MEDIUM: Missing Input Sanitization on API Parameters

**Files:** `src/app/[locale]/dashboard/search/page.tsx`, `src/app/[locale]/dashboard/audit-log/page.tsx`

User-controlled search/filter values are passed directly to URL query parameters:

```typescript
// search/page.tsx
if (query) params.set('q', query);
if (status) params.set('status', status);
```

While `URLSearchParams` handles URL encoding, there's no validation that `status` is an expected enum value, and `query` is passed directly to the backend without length limits.

**Fix:** Validate and constrain inputs:
```typescript
const ALLOWED_STATUSES = ['delivered', 'failed', 'pending'] as const;
if (status && ALLOWED_STATUSES.includes(status as any)) {
  params.set('status', status);
}
if (query) {
  params.set('q', query.slice(0, 200)); // Max length
}
```

---

### 🟢 LOW: Dual Auth Pattern (Cookie + Bearer Token)

**File:** `src/lib/api.ts`

The `apiFetch` function accepts an optional `token` parameter for Bearer auth, but also sends `credentials: 'include'` for cookie auth. The store sets `token = 'cookie'` as a sentinel value.

```typescript
if (token) {
  headers["Authorization"] = `Bearer ${token}`;
}
// ...
credentials: 'include',
```

When `token` is the string `'cookie'`, the header `Authorization: Bearer cookie` is sent — which is harmless but wasteful. The backend should ignore malformed Bearer tokens.

**Fix:** Only send Bearer header when token is a real JWT, not the sentinel:
```typescript
if (token && token !== 'cookie') {
  headers["Authorization"] = `Bearer ${token}`;
}
```

---

## 3. Client-Side Security

### 🔴 CRITICAL: Overly Permissive CSP Allows XSS Exploitation

**File:** `next.config.js`

```javascript
'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; ..."
```

`'unsafe-inline'` and `'unsafe-eval'` in `script-src` **completely negate CSP's XSS protection**. An attacker who finds any injection point can execute arbitrary JavaScript.

**Impact:** Any XSS vulnerability becomes immediately exploitable. The CSP provides zero protection.

**Fix:** Move to nonce-based CSP:
```javascript
// next.config.js
const crypto = require('crypto');

// Generate nonce per request (in middleware or _document)
// For static config, use nonce middleware:
const nextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: [
          "default-src 'self'",
          "script-src 'self' 'nonce-{NONCE}' 'strict-dynamic'",
          "style-src 'self' 'unsafe-inline'", // Keep for Tailwind
          "img-src 'self' data: https:",
          "font-src 'self'",
          "connect-src 'self' https://*.run.app https://*.vercel.app",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; ') },
      ],
    }];
  },
};
```

Alternatively, use `next-safe` or `@next/csp` for automated nonce injection.

---

### 🟡 MEDIUM: dangerouslySetInnerHTML in Blog Posts

**File:** `src/app/[locale]/blog/[slug]/page.tsx`

```typescript
<code dangerouslySetInnerHTML={{ __html: highlighted }} />
```

The `tokenizeCode` function does HTML-escape (`&`, `<`, `>`) before applying regex-based syntax highlighting. This is **currently safe** because:
1. Blog content is hardcoded in the source (not user-generated)
2. HTML entities are escaped first

**However**, the regex-based highlighter is fragile. A malformed code block could potentially break out of the escaping.

**Risk level:** Low-medium since content is static. But if blog posts ever become dynamic/CMS-driven, this becomes critical.

**Fix:** Use a battle-tested library like `shiki` or `prism-react-renderer`:
```typescript
import { codeToHtml } from 'shiki';

// In the component
const highlighted = await codeToHtml(rawCode, { lang: language, theme: 'github-dark' });
```

---

### 🟡 MEDIUM: Missing Strict-Transport-Security Header

**File:** `next.config.js`

The security headers include `X-Frame-Options`, `X-Content-Type-Options`, etc., but **HSTS is missing**:

```javascript
// Missing:
{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
```

**Impact:** First-load HTTP requests could be intercepted (MITM) before redirect to HTTPS. Users could be served a downgrade attack.

**Fix:** Add to headers array:
```javascript
{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
```

---

### 🟡 MEDIUM: Deprecated X-XSS-Protection Header

**File:** `next.config.js`

```javascript
{ key: 'X-XSS-Protection', value: '1; mode=block' }
```

This header is **deprecated** and can actually introduce vulnerabilities in older browsers (selective script blocking can be exploited). Modern browsers ignore it.

**Fix:** Remove it entirely — CSP handles XSS protection:
```javascript
// Remove this line:
// { key: 'X-XSS-Protection', value: '1; mode=block' },
```

---

### 🟢 LOW: Hardcoded Production API URL in Source

**Files:** `src/app/[locale]/status/page.tsx`, `src/app/[locale]/contact/page.tsx`

```typescript
const API = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1';
```

The GCP Cloud Run endpoint URL is hardcoded as a fallback. This exposes internal infrastructure details.

**Fix:** Always use the env var or `/api` proxy:
```typescript
const API = process.env.NEXT_PUBLIC_API_URL || '/api';
```

---

## 4. Supply Chain

### 🟢 LOW: Clean Dependencies — No Known Vulnerabilities

**File:** `package.json`

Dependencies are minimal and well-chosen:
- `next@^15.5.15` — current major version
- `react@^19.0.0` — current
- `recharts@^2.15.0` — charting library, no known issues
- `@upstash/redis@^1.38.0` — Redis client for playground feature
- `next-intl@^4.0.0` — i18n

**No unnecessary dependencies found.** The dependency tree is lean.

**Note:** Run `npm audit` periodically. The `@upstash/redis` package communicates with external services — ensure `UPSTASH_REDIS_REST_TOKEN` is never exposed to the client (it's server-only in the current setup).

---

## 5. Additional Observations

### 🟡 MEDIUM: Endpoint Detail Fetches All Endpoints

**File:** `src/app/[locale]/dashboard/endpoints/[id]/page.tsx`

```typescript
const all = await endpointsApi.list(token);
const ep = all.find((e) => e.id === id);
```

Instead of fetching a single endpoint by ID, the client fetches **all endpoints** and filters client-side. This is:
- Inefficient (N+1 pattern)
- An information disclosure risk (all endpoint URLs loaded into client memory)
- A potential IDOR vector if the backend doesn't enforce ownership on list endpoints

**Fix:** Add a dedicated `GET /endpoints/:id` call:
```typescript
const ep = await endpointsApi.get(token, id);
```

---

### 🟢 LOW: No Rate Limiting on Client-Side Login

**File:** `src/app/[locale]/login/page.tsx`

The login form has no client-side rate limiting or delay between attempts. While the backend should enforce rate limiting, adding a client-side delay reduces brute-force noise:

**Fix:** Add exponential backoff after failed attempts:
```typescript
const [loginAttempts, setLoginAttempts] = useState(0);
const delay = Math.min(1000 * Math.pow(2, loginAttempts), 30000);
await new Promise(r => setTimeout(r, delay));
```

---

## Summary Table

| # | Severity | Issue | File | Status |
|---|----------|-------|------|--------|
| 1 | 🔴 Critical | No edge middleware auth | `middleware.ts` | Needs fix |
| 2 | 🔴 Critical | No CSRF protection | `api.ts` | Needs fix |
| 3 | 🔴 Critical | Permissive CSP (unsafe-inline/eval) | `next.config.js` | Needs fix |
| 4 | 🟡 Medium | Client-only admin auth | `admin/layout.tsx` | Needs fix |
| 5 | 🟡 Medium | Playground token in localStorage | `playground/page.tsx` | Needs fix |
| 6 | 🟡 Medium | Playground token in URL path | `playground/page.tsx` | Needs fix |
| 7 | 🟡 Medium | Inconsistent API base URLs | Multiple files | Needs fix |
| 8 | 🟡 Medium | Missing input validation | `search/page.tsx` | Needs fix |
| 9 | 🟡 Medium | Missing HSTS header | `next.config.js` | Needs fix |
| 10 | 🟡 Medium | Deprecated X-XSS-Protection | `next.config.js` | Needs fix |
| 11 | 🟡 Medium | Endpoint list fetches all | `endpoints/[id]/page.tsx` | Needs fix |
| 12 | 🟢 Low | `is_admin` in localStorage | `store.tsx` | Improve |
| 13 | 🟢 Low | Hardcoded production API URL | `status/page.tsx` | Improve |
| 14 | 🟢 Low | No client-side login rate limit | `login/page.tsx` | Improve |

---

## Positive Findings ✅

Things done **right**:

1. **HttpOnly cookies for auth** — Session tokens are never stored in localStorage. The `token` state is just a `'cookie'` sentinel. Excellent.
2. **API key memory-only** — `setApiKey` explicitly avoids localStorage persistence. One-time display, then gone.
3. **401 auto-refresh** — `apiFetch` attempts token refresh on 401 before redirecting to login. Good UX + security.
4. **Security headers present** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy all configured.
5. **Blog XSS protection** — `tokenizeCode` HTML-escapes before regex highlighting. Defensive coding.
6. **Clean dependency tree** — No bloated or known-vulnerable packages.
7. **Credential hygiene** — `credentials: 'include'` used correctly, no tokens in URLs (except playground).
8. **AbortController with timeout** — API calls have 30s timeout preventing hung requests.

---

*End of audit.*
