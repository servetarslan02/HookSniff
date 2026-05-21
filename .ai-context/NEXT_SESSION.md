# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-22 06:15 GMT+8

## ✅ SSO Analiz + 6 Düzeltme Tamamlandı (2026-05-22)

14 sorun tespit edildi, 6'sı düzeltildi. 103 test çalıştırıldı (100 PASS).
Detay: `.ai-context/sso-test/SSO-ANALYSIS-REPORT.md`
Commit: `d6666e30`

## 🔴 Öncelik 1: Keycloak ile Gerçek SSO Test

Mock IdP testleri geçti. Şimdi gerçek Keycloak ile test gerekli:
- Docker kur (veya mevcut ortamda Keycloak çalıştır)
- SAML + OIDC akışlarını gerçek IdP ile test et
- Auto-join, rol atama, domain verification test et

## 🟡 Öncelik 2: SAML XML Parsing İyileştirme

String-based XML parsing → `quick-xml` crate. 1-2 saat.

## 🟢 Öncelik 3: Dashboard RBAC Frontend

Backend'de 164 RBAC check var ama frontend'de rol bazlı UI yok.
