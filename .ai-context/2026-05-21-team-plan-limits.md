# 2026-05-21 — Team-Based Plan Limits

## Sorun
SSO ile giriş yapan yeni müşteriye `plan = "free"` atanıyordu. Takım sahibi Enterprise planında olsa bile, üyeler free plan limitlerinde çalışıyordu (1.000 event/gün, 100 webhook limit).

## Çözüm
Plan limitlerini takım bazlı hale getirdik:

### `reserve_webhook_slot` değişikliği
- Yeni fonksiyon: `resolve_effective_webhook_limit(pool, customer, team_id)`
- Eğer `team_id` varsa → takım sahibinin `webhook_limit`'i kullanılır
- Yoksa → müşterinin kendi limiti kullanılır

### Değişen dosyalar
- `api/src/routes/webhooks.rs` — 43 satır eklendi, 5 satır silindi
  - `resolve_effective_webhook_limit()` — yeni helper fonksiyon
  - `reserve_webhook_slot()` — `team_id: Option<Uuid>` parametresi eklendi
  - `create_webhook`, `batch_webhooks`, `replay_webhook`, `batch_replay` — `ServiceTokenScope` eklendi

### Nasıl çalışır
```
Service token (API key) → ServiceTokenScope.team_id → reserve_webhook_slot(team_id)
  ↓
team_id varsa → teams.owner_id → customers.plan → webhook_limit
team_id yoksa → customer.webhook_limit (kendi planı)
```

### Hâlâ yapılması gereken
- `track_daily_event` fonksiyonu da takım bazlı olmalı (overage notifications)
- Endpoint creation limit (şu an tüm planlarda sınırsız, acil değil)
- Dashboard'da takım plan limitlerini gösterme

## Push
- Commit: `ded9fe76`
