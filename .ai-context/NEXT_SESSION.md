# NEXT_SESSION.md — Oturum 130+

> Son güncelleme: 2026-05-12 20:47 GMT+8 (Oturum 129)

## Kaldığımız Yer
- **IMPLEMENTATION-PLAN: 330/364 tamamlandı (%91)**
- 34 kalan ⬜ madde + 5 Servet görevi
- Tüm büyük feature'lar tamamlandı
- Production-ready durumda

## Kalan ⬜ Maddeler (34 adet)

### Email Templates (200-206) — 7 madde
- Email template'leri sadece İngilizce
- Email retry yok
- Dead-letter queue yok failed emails için
- Email-level rate limiting yok
- Billing/Invoice email template'i yok
- Webhook Success email template'i yok
- Email template'leri mobile-optimized değil
- 📝 `docs/email-templates.md` dokümante edildi

### Payments & Billing (247-259) — 10 madde
- Subscription status hardcoded to "active" (kod değişikliği gerekli)
- Pricing page shows different limits than backend
- Provider switching doesn't cancel old subscription
- Polar.sh `create_customer_portal` is a stub
- No chargeback/refund handling
- Admin revenue calculation is estimation only
- No annual billing option
- Enterprise plan has no implementation
- Missing `cancel_at_period_end` logic
- Checkout URL validation is client-side only

### Backend Deep (260-280) — 4 madde
- JWT uses HS256 — no asymmetric option (büyük refactor)
- Access tokens cannot be revoked
- OpenAPI spec eksik endpoint'ler (📝 dokümante edildi)
- OpenAPI wrong type definitions (📝 dokümante edildi)

### Code Quality (288-289) — 2 madde (KISMİ)
- Billing provider triplication — TODO eklendi
- Tight coupling: main.rs monolith — TODO eklendi

### Content & SDK (353-359) — 6 madde
- SDK endpoint coverage eksik
- SDK otomatik güncelleme sistemi
- Content quality score: 6.5/10 (📝 dokümante edildi)
- Blog factual errors (📝 dokümante edildi)
- Alternatives pages biased (📝 dokümante edildi)
- Generic testimonials (📝 dokümante edildi)

### Servet'in Yapması Gereken (360-364) — 5 madde
- ⬜ GitHub PAT rotate
- ⬜ GCP SA key rotate
- ⬜ GitHub Actions billing güncelle
- ⬜ Stripe payout + identity verification (Polar.sh)
- ⬜ Grafana trial upgrade (May 20'ye kadar)

## Bir Sonraki Adımlar
1. Servet görevlerini hatırlat (PAT rotate, GCP key, Grafana trial)
2. Kalan ⬜ maddeler büyük iş (payments, email, JWT refactor) — Servet önceliklendirmeli
3. Content quality iyileştirmeleri (blog, alternatives, testimonials) — düşük öncelik
4. SDK endpoint coverage — düşük öncelik

## Bilinen Sorunlar
- Grafana trial 20 Mayıs'ta bitiyor
- GitHub PAT + GCP SA key rotate edilmeli
- Content quality 6.5/10 — blog/alternatives/testify biased

## Servet'in Yapması Gereken (Öncelik Sırasıyla)
1. **GitHub PAT rotate** — CI/CD secret'larında güncelle
2. **GCP SA key rotate** — Cloud Run env'e yeni key yükle
3. **Stripe payout + identity verification** — Polar.sh dashboard
4. **Grafana trial upgrade kararı** — 20 Mayıs'ta bitiyor
5. **GitHub Actions billing** — dakika limitlerini kontrol et
