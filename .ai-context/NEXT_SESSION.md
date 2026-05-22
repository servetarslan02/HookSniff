# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-23 GMT+8

## ✅ RBAC Frontend Tamamlandı (2026-05-23)

Frontend RBAC implementasyonu yapıldı. 5 dosya, 260 satır.
- useTeamRole, usePermissions, RoleGuard, ReadOnlyBadge
- Sidebar filtreleme + Endpoints sayfası RBAC
- Push: `bf8e9682`
- Detay: `.ai-context/2026-05-23-rbac-frontend.md`

## 🔴 Öncelik 1: Cloud Build Doğrula

Push yapıldı, Cloud Build otomatik tetiklenmeli. Build başarılı olursa deploy gerçekleşecek.
- Build log: https://console.cloud.google.com/cloud-build/history?project=hooksniff-app
- Eğer build yine başarısızsa, logları kontrol et

## 🔴 Öncelik 2: Keycloak ile Gerçek SSO Test

Mock IdP testleri geçti. Şimdi gerçek Keycloak ile test gerekli:
- Docker kur (veya mevcut ortamda Keycloak çalıştır)
- SAML + OIDC akışlarını gerçek IdP ile test et
- Auto-join, rol atama, domain verification test et

## 🟡 Öncelik 3: RBAC — Kalan Sayfalar (Kısmen Tamamlandı)

RBAC altyapısı kuruldu. Uygulanan sayfalar:
- ✅ Endpoints — create/delete → admin+
- ✅ Integrations — create/edit/delete/toggle → admin+
- ✅ Alerts — create/edit/delete/toggle → admin+
- ✅ Custom Domain — add/delete → admin+
- ✅ API Keys — create/rotate/delete → admin+
- ✅ Service Tokens — create/edit/delete → admin+
- ✅ Team — owner detection fix

Kalan sayfalar (düşük öncelik):
- Background Tasks → create/edit/delete
- Operational Webhooks → create/edit/delete
- Connectors → create/edit/delete
- Inbound → config değişiklikleri
- Routing Config → değişiklikler
- Rate Limiting → değişiklikler

## 🟢 Öncelik 4: Alert Evaluation Worker

`alert_rules` tablosu var, CRUD API var ama background worker yok.
Kurallar tetiklenmiyor — worker implementasyonu gerekli.

## 🟢 Öncelik 5: Redis State Migration

SSO state şu an in-memory (HashMap). Production'da Redis'e taşınmalı.
`SsoStateStore` zaten Redis destekliyor, sadece connection sağlanmalı.
