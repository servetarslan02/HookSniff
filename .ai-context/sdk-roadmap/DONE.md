# SDK — Tamamlanan İşler

> Son güncelleme: 2026-05-17 23:36 GMT+8

---

## ✅ Python SDK — Svix Mimarisi Uyarlaması — 2026-05-17

### Yapılan
1. **Svix SDK mimarisi benimsendi** — httpx, attrs, ApiBase pattern
2. **12 resource** — endpoint, message, authentication, api_key, team, alert, analytics, billing, health, search, notification, admin
3. **Sync + Async** — HookSniff (sync) + HookSniffAsync (async)
4. **Typed models** — dataclass-based, 80+ type
5. **Webhook verification** — standardwebhooks library
6. **PEP 561** — py.typed marker
7. **Tests** — respx mock-based, endpoint/message/auth/health testleri
8. **pyproject.toml** — hatchling build, httpx+attrs+standardwebhooks deps

### Dosya Yapısı
```
sdks/python/
├── hooksniff/
│   ├── __init__.py           # Ana export
│   ├── exceptions.py         # HttpError, WebhookVerificationError
│   ├── webhooks.py           # Webhook verify (standardwebhooks)
│   ├── py.typed              # PEP 561
│   ├── api/
│   │   ├── __init__.py       # Tüm exportlar
│   │   ├── client.py         # attrs-based Client
│   │   ├── common.py         # ApiBase (httpx, retry)
│   │   ├── hooksniff.py      # HookSniff + HookSniffAsync client
│   │   ├── errors/           # HttpError, HTTPValidationError
│   │   ├── endpoint.py       # Endpoint resource
│   │   ├── message.py        # Message resource
│   │   ├── authentication.py # Auth resource
│   │   ├── api_key.py        # API Key resource
│   │   ├── team.py           # Team resource
│   │   ├── alert.py          # Alert resource
│   │   ├── analytics.py      # Analytics resource
│   │   ├── billing.py        # Billing resource
│   │   ├── health.py         # Health resource
│   │   ├── search.py         # Search resource
│   │   ├── notification.py   # Notification resource
│   │   └── admin.py          # Admin resource
│   ├── models/
│   │   └── __init__.py       # 80+ dataclass type
│   └── resources/
│       ├── __init__.py
│       └── common.py         # Re-exports
├── tests/
│   └── test_hooksniff.py     # Tests
├── pyproject.toml
└── README.md
```

---

## ✅ Node.js SDK Rewrite — 2026-05-17

### Yapılan
1. **Svix tabanlı mimari** — OpenAPI Generator boilerplace kaldırıldı
2. **12 resource** — endpoints, webhooks, auth, apiKeys, teams, alerts, analytics, billing, health, search, notifications, admin
3. **80+ TypeScript type** — OpenAPI spec'ten
4. **Özellikler** — retry+backoff, auto-idempotency, auto-pagination, webhook verify, custom fetch, timeout
5. **Versiyon** — 0.4.0 → 0.5.0
6. **Kalite** — %55-60 → %70-75
