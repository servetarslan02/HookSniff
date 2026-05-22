# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-22 16:55 GMT+8

## ✅ Build Fix Tamamlandı (2026-05-22)

47 Rust compile hatası + 21 TypeScript hatası düzeltildi.
Cloud Build tetiklenmeli (push `f76161f8` → main).
Detay: `.ai-context/2026-05-22-build-fix.md`

## 🔴 Öncelik 1: Cloud Build Doğrula

Push yapıldı, Cloud Build otomatik tetiklenmeli. Build başarılı olursa deploy gerçekleşecek.
- Build log: https://console.cloud.google.com/cloud-build/history?project=hooksniff-app
- Eğer build yine başarısızsa, logları kontrol et

## 🔴 Öncelik 2: Keycloak ile Gerçek SSO Test

Mock IdP testleri geçti. Şimdi gerçek Keycloak ile test gerekli:
- Docker kur (veya mevcut ortamda Keycloak çalıştır)
- SAML + OIDC akışlarını gerçek IdP ile test et
- Auto-join, rol atama, domain verification test et

## 🟡 Öncelik 3: Dashboard RBAC Frontend

Backend'de 164 RBAC check var ama frontend'de rol bazlı UI yok.
- Kullanıcı rolüne göre menü öğelerini gizle/göster
- Developer: sadece webhook + endpoint erişimi
- Analyst: sadece okuma erişimi
- Admin: tam erişim

## 🟢 Öncelik 4: Alert Evaluation Worker

`alert_rules` tablosu var, CRUD API var ama background worker yok.
Kurallar tetiklenmiyor — worker implementasyonu gerekli.

## 🟢 Öncelik 5: Redis State Migration

SSO state şu an in-memory (HashMap). Production'da Redis'e taşınmalı.
`SsoStateStore` zaten Redis destekliyor, sadece connection sağlanmalı.
