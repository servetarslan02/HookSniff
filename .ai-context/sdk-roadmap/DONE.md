# SDK — Tamamlanan İşler

> Son güncelleme: 2026-05-17 23:04 GMT+8

---

## ✅ Python SDK Rewrite — 2026-05-17

### Yapılan
1. **Svix tabanlı mimari** — OpenAPI Generator boilerplace kaldırıldı, el yapımı SDK
2. **12 resource** — endpoints, webhooks, auth, apiKeys, teams, alerts, analytics, billing, health, search, notifications, admin
3. **80+ Python type** — dataclass tabanlı, OpenAPI spec'ten
4. **Özellikler** — retry+backoff, auto-idempotency, auto-pagination, webhook verify, debug logging
5. **Versiyon** — 0.3.0 → 0.5.0
6. **Kalite** — %20-25 → %70-75
7. **Test** — 19 test, tümü geçiyor (webhook, request, pagination, client, exceptions)
8. **Paketleme** — pyproject.toml (hatchling), pip install -e ile çalışır
9. **Temizlik** — Eski OpenAPI Generator dosyaları kaldırıldı (pydantic, api_client, rest, serialization, 150+ auto-gen model)

### Dosyalar
```
sdks/python/
├── hooksniff/
│   ├── __init__.py          # Ana export
│   ├── client.py            # HookSniff client class
│   ├── request.py           # HTTP client + retry + backoff
│   ├── webhook.py           # HMAC-SHA256 signature verification
│   ├── pagination.py        # Auto-pagination iterator
│   ├── models.py            # 80+ dataclass type
│   ├── exceptions.py        # 7 custom exception class
│   └── resources/           # 12 resource module
│       ├── endpoints.py
│       ├── webhooks.py
│       ├── auth.py
│       ├── api_keys.py
│       ├── teams.py
│       ├── alerts.py
│       ├── analytics.py
│       ├── billing.py
│       ├── health.py
│       ├── search.py
│       ├── notifications.py
│       └── admin.py
├── tests/
│   └── test_hooksniff.py    # 19 test
├── pyproject.toml
├── README.md
└── .gitignore
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
