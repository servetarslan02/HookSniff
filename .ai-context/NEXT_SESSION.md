# NEXT_SESSION.md — Oturum 132+

> Son güncelleme: 2026-05-12 22:20 GMT+8 (Oturum 131)

## Kaldığımız Yer
- **IMPLEMENTATION-PLAN: 359/364 tamamlandı (%99)**
- 5 kalan ⬜ madde — TAMAMI Servet görevleri

## Kalan ⬜ Maddeler (5 adet — Hepsi Servet)

### Servet'in Yapması Gereken
- ⬜ 360: GitHub PAT rotate — güvenlik acil (token chat'te paylaşıldı, revoke edilmeli)
- ⬜ 361: GCP SA key rotate — güvenlik acil
- ⬜ 362: GitHub Actions billing güncelle
- ⬜ 363: Stripe/Polar identity verification (KYC)
- ⬜ 364: Grafana trial upgrade (20 Mayıs'ta bitiyor — 8 gün!)

## Bir Sonraki Adımlar
1. Servet görevlerini hatırlat (PAT rotate, GCP key, Grafana trial)
2. Proje %99 tamamlandı — production-ready
3. Kalan teknik iş yok (sıfır ⬜ benim yapabileceğim)
4. Servet'in yapması gereken dış servis ayarları var

## Bilinen Sorunlar
- ⚠️ Grafana trial 20 Mayıs'ta bitiyor (8 gün!)
- ⚠️ GitHub PAT + GCP key rotate edilmeli
- ⚠️ iyzico hesap açılacak (vergi levhası + banka hesabı)
- Rust toolchain sandbox'ta yok — cargo test local'de çalıştırılmalı

## JWT RS256 Notları (Item 260 — Yeni)
- RSA key pair gerekiyor: `openssl genrsa -out jwt_private.pem 2048`
- Env vars: JWT_PRIVATE_KEY, JWT_PUBLIC_KEY, JWT_KEY_ID
- Backward compatible: eski HS256 token'lar otomatik doğrulanır
- Yeni token'lar RS256 ile imzalanır (eğer RSA key varsa)
- Cloud Run'a RSA key secret olarak eklenmeli
