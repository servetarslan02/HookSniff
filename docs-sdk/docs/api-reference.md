---
sidebar_position: 3
---

# API Reference

## Base URL

```
https://hooksniff-api-1046140057667.europe-west1.run.app
```

## Authentication

All API requests require a Bearer token in the Authorization header:

```
Authorization: Bearer hr_live_your_api_key
```

## Resources

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/endpoints` | List all endpoints |
| POST | `/v1/endpoints` | Create endpoint |
| GET | `/v1/endpoints/:id` | Get endpoint |
| PUT | `/v1/endpoints/:id` | Update endpoint |
| DELETE | `/v1/endpoints/:id` | Delete endpoint |
| POST | `/v1/endpoints/:id/rotate-secret` | Rotate signing secret |

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/webhooks` | Send webhook |
| GET | `/v1/webhooks/:id` | Get delivery |
| GET | `/v1/webhooks` | List deliveries |
| POST | `/v1/webhooks/:id/replay` | Replay delivery |
| POST | `/v1/webhooks/batch` | Batch send |

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/auth/register` | Register |
| POST | `/v1/auth/login` | Login |
| POST | `/v1/auth/verify-email` | Verify email |
| POST | `/v1/auth/2fa/verify` | Verify 2FA |
| POST | `/v1/auth/forgot-password` | Forgot password |
| POST | `/v1/auth/reset-password` | Reset password |

### API Keys

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/api-keys` | List keys |
| POST | `/v1/api-keys` | Create key |
| DELETE | `/v1/api-keys/:id` | Delete key |

### Analytics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/analytics/stats` | Overview stats |
| GET | `/v1/analytics/trends` | Delivery trends |
| GET | `/v1/analytics/success-rate` | Success rate |
| GET | `/v1/analytics/latency` | Latency stats |

### Billing

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/billing/plans` | List plans |
| POST | `/v1/billing/upgrade` | Upgrade plan |
| POST | `/v1/billing/portal` | Customer portal |
| GET | `/v1/billing/usage` | Usage stats |

### Teams

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/teams/members` | List members |
| POST | `/v1/teams/invite` | Invite member |
| DELETE | `/v1/teams/members/:id` | Remove member |
| PUT | `/v1/teams/members/:id/role` | Change role |

### Alerts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/alerts/rules` | List rules |
| POST | `/v1/alerts/rules` | Create rule |
| PUT | `/v1/alerts/rules/:id` | Update rule |
| DELETE | `/v1/alerts/rules/:id` | Delete rule |

### Search

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/search` | Search deliveries |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/health` | Health check |

## Rate Limits

| Plan | Requests/min | Endpoints |
|------|-------------|-----------|
| Free | 60 | 5 |
| Pro | 600 | 50 |
| Business | 6000 | 500 |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Rate Limited |
| 500 | Internal Server Error |
