# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-22 06:35 GMT+8

## ✅ SAML XML Parsing İyileştirme Tamamlandı (2026-05-22)

String-based XML parsing → quick-xml crate geçişi yapıldı.
5 fonksiyon yeniden yazıldı, 12 yeni test eklendi.
Commit: `c1b168d8`
Detay: `.ai-context/2026-05-22-saml-xml-refactor.md`

## 🔴 Öncelik 1: Keycloak ile Gerçek SSO Test

Mock IdP testleri geçti. Şimdi gerçek Keycloak ile test gerekli:
- Docker kur (veya mevcut ortamda Keycloak çalıştır)
- SAML + OIDC akışlarını gerçek IdP ile test et
- Auto-join, rol atama, domain verification test et

## 🟡 Öncelik 2: Dashboard RBAC Frontend

Backend'de 164 RBAC check var ama frontend'de rol bazlı UI yok.
- Kullanıcı rolüne göre menü öğelerini gizle/göster
- Developer: sadece webhook + endpoint erişimi
- Analyst: sadece okuma erişimi
- Admin: tam erişim

## 🟢 Öncelik 3: Alert Evaluation Worker

`alert_rules` tablosu var, CRUD API var ama background worker yok.
Kurallar tetiklenmiyor — worker implementasyonu gerekli.

## 🟢 Öncelik 4: Redis State Migration

SSO state şu an in-memory (HashMap). Production'da Redis'e taşınmalı.
`SsoStateStore` zaten Redis destekliyor, sadece connection sağlanmalı.
