# 📊 Tüm SDK'lar — Kapsamlı Kaynak Karşılaştırması

> Son güncelleme: 2026-05-18 18:35 GMT+8
> Kaynak: Her SDK'nın GitHub repo'su (hooksniff-{dil})

---

## Gerekli Resource'lar (API'de Mevcut)

### Tema Resource'lar (7)
1. Authentication
2. Endpoint
3. EventType
4. Health
5. Message
6. MessageAttempt
7. Statistics

### Faz 8-15 Resource'ları (8)
8. Environment (Faz 8)
9. BackgroundTask (Faz 9)
10. OperationalWebhook (Faz 10)
11. MessagePoller (Faz 11)
12. Inbound (Faz 12)
13. Connector (Faz 13)
14. Integration (Faz 14)
15. Stream (Faz 15)

### Ek Resource'lar (18)
16. Application
17. ApiKey
18. Search
19. Alert
20. Analytics
21. Billing
22. Portal
23. Team
24. Notification
25. SSO
26. AuditLog
27. CustomDomain
28. RateLimit
29. Routing
30. Template
31. Schema
32. Playground
33. ServiceToken

---

## SDK Kaynak Karşılaştırması

### Tema Resource'lar (7)

| Resource | Node | Python | Go | Rust | Ruby | Java | Kotlin | PHP | C# | Elixir | Swift |
|----------|------|--------|-----|------|------|------|--------|-----|-----|--------|-------|
| Authentication | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Endpoint | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| EventType | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Health | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Message | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| MessageAttempt | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Statistics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |

### Faz 8-15 Resource'ları (8)

| Resource | Node | Python | Go | Rust | Ruby | Java | Kotlin | PHP | C# | Elixir | Swift |
|----------|------|--------|-----|------|------|------|--------|-----|-----|--------|-------|
| Environment | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| BackgroundTask | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| OperationalWebhook | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| MessagePoller | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Inbound | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Connector | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Integration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Stream | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |

### Ek Resource'lar (18)

| Resource | Node | Python | Go | Rust | Ruby | Java | Kotlin | PHP | C# | Elixir | Swift |
|----------|------|--------|-----|------|------|------|--------|-----|-----|--------|-------|
| Application | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| ApiKey | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Search | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Alert | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Analytics | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Billing | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Portal | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Team | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Notification | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| SSO | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| AuditLog | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| CustomDomain | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| RateLimit | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Routing | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Template | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Schema | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Playground | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| ServiceToken | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## SDK Bazlı Özet

| SDK | Tema (7) | Faz 8-15 (8) | Ek (18) | Toplam | Versiyon | Registry |
|-----|----------|-------------|---------|--------|----------|----------|
| **Ruby** | 7/7 ✅ | 8/8 ✅ | 18/18 ✅ | **33/33** | 1.2.0 | RubyGems ✅ |
| **C#** | 7/7 ✅ | 8/8 ✅ | 18/18 ✅ | **33/33** | 1.2.0 | NuGet ✅ |
| **Rust** | 7/7 ✅ | 8/8 ✅ | 1/18 | 16/33 | 1.1.0 | crates.io ✅ |
| **Node.js** | 7/7 ✅ | 8/8 ✅ | 0/18 | 15/33 | 1.1.0 | npm ✅ |
| **Python** | 7/7 ✅ | 8/8 ✅ | 0/18 | 15/33 | 1.1.0 | PyPI ✅ |
| **Java** | 6/7 ✅ | 8/8 ✅ | 0/18 | 14/33 | 1.1.2 | Maven ✅ |
| **Swift** | 4/7 | 2/8 | 4/18 | 10/33 | 1.1.0 | GitHub ✅ |
| **Elixir** | 3/7 | 0/8 | 5/18 | 8/33 | 1.1.1 | Hex ⏳ |
| **PHP** | 7/7 ✅ | 2/8 | 0/18 | 9/33 | 1.1.0 | Packagist ✅ |
| **Go** | 6/7 | 2/8 | 0/18 | 8/33 | 1.1.0 | GitHub ✅ |
| **Kotlin** | 3/7 | 2/8 | 0/18 | 5/33 | 1.1.0 | Maven ⏳ |

---

## 🔴 Kritik Eksiklikler

### 1. Kotlin — En Kötü Durum (5/33)
- Authentication ❌
- Endpoint ❌
- Health ❌
- Statistics ❌
- Environment ❌
- BackgroundTask ❌
- OperationalWebhook ❌
- MessagePoller ❌
- Inbound ❌
- Connector ❌
- **Build hatalı** — package çakışması

### 2. Go — Tema Eksik (8/33)
- Health ❌
- Environment ❌
- BackgroundTask ❌
- OperationalWebhook ❌
- MessagePoller ❌
- Inbound ❌
- Connector ❌

### 3. PHP — Faz 8-15 Eksik (9/33)
- Environment ❌
- BackgroundTask ❌
- OperationalWebhook ❌
- MessagePoller ❌
- Inbound ❌
- Connector ❌
- Stream ❌

### 4. Elixir — Tema + Faz Eksik (8/33)
- EventType ❌
- Message ❌
- MessageAttempt ❌
- Statistics ❌
- Faz 8-15'in hepsi ❌

### 5. Swift — Tema + Faz Eksik (10/33)
- EventType ❌
- Message ❌
- MessageAttempt ❌
- Statistics ❌
- Environment ❌
- BackgroundTask ❌
- OperationalWebhook ❌
- MessagePoller ❌
- Inbound ❌
- Connector ❌

### 6. Node.js, Python, Java — Ek Resource Eksik (0/18)
- Application, ApiKey, Search, Alert, Analytics, Billing, Portal, Team, Notification, SSO, AuditLog, CustomDomain, RateLimit, Routing, Template, Schema, Playground, ServiceToken — hepsi ❌

---

## 📋 Öncelik Sırası

### P0 — Acil (Build/Deploy Bloker)
1. **Kotlin** — Build fix + eksik resource'lar

### P1 — Yüksek (Registry Publish)
2. **Elixir** — Hex.pm publish

### P2 — Orta (Faz 8-15 Eksik)
3. **Go** — Health + 6 Faz resource
4. **PHP** — 7 Faz resource
5. **Swift** — 4 Tema + 6 Faz resource
6. **Elixir** — 4 Tema + 8 Faz resource

### P3 — Düşük (Ek Resource — Ruby/C# seviyesine çıkarma)
7. **Node.js** — 18 ek resource
8. **Python** — 18 ek resource
9. **Java** — 18 ek resource
10. **Rust** — 17 ek resource
11. **Go** — 18 ek resource
12. **PHP** — 18 ek resource
13. **Swift** — 14 ek resource
14. **Elixir** — 13 ek resource
15. **Kotlin** — 18 ek resource (önce build fix)
