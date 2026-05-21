# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-22 03:02 GMT+8

## 🔴 Öncelik 1: Keycloak ile SSO Test

1. Docker kur: `apt install docker.io`
2. Keycloak başlat: `docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev`
3. Keycloak'ta realm + kullanıcı oluştur
4. HookSniff dashboard'dan SSO config gir (OIDC veya SAML)
5. Login sayfasında SSO ile giriş dene
6. Auto-team join test et
7. RBAC rollerini test et (viewer, developer, admin)

## 🟡 Öncelik 2: Dashboard RBAC Frontend

Backend'de 164 RBAC check var ama frontend'de rol bazlı UI yok:
- Viewer: sadece okuma butonlarını göster, yazma butonlarını gizle
- Developer: tüm butonları göster
- Admin: yönetim butonlarını göster

## 🟢 Öncelik 3: Blog İçerikleri

SEO için kritik:
- "webhooks explained"
- "free webhook service 2026"
- "svix alternative"
