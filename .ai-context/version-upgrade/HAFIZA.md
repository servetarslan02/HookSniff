# Hafıza — Version Upgrade

> Son güncelleme: 2026-05-16 06:30 GMT+8
> Bu dosya: Version upgrade çalışmalarının hafızası

---

## Ne Yapıldı?

- Tüm sistem bileşenleri tarandı (8,093 dosya, ~70+ bileşen)
- 2 belge oluşturuldu:
  - `SISTEM-RAPORU.md` — Ne var ne yok (tek sayfa)
  - `UYGULAMA-PLANI.md` — 23 faz, 201 madde (tik atılabilir)
- Hiçbir güncelleme yapılmadı — sadece envanter ve plan hazırlandı

## Ne Durumda?

- [ ] Hiçbir faz başlamadı
- [ ] Servet onayı bekleniyor
- [ ] İlk yapılacak: Faz 1 (Hazırlık) → Faz 2 (Minor/Patch)

## Kritik Bilgiler

- Rust backend neredeyse güncel (sadece 1 minor patch)
- Dashboard'da 5 major güncelleme var (Next.js 16, Tailwind 4, TS 6, recharts 3, ESLint 10)
- 10 GitHub Action eski versiyonda
- 11 SDK'da çeşitli uyumsuzluklar
- 816 unwrap() var (Rust production risk)
- 1 E2E test var (çok az)
- Dependabot devre dışı
- 8 cargo audit ignore (RUSTSEC) — sqlx transitive
- SQL injection riski: webhooks.rs:65 team_id doğrudan format! ile SQL'e giriyor
- 4 dangerouslySetInnerHTML kullanımı (sanitize var ama kontrol gerekli)
- admin.rs 5130 satır (bölünmeli)
- Servet ek görevler: iyzico, domain, GCP SA key rotate, GitHub PAT rotate

## Servet'in Yapması Gereken

- Polar.sh Go Live (Stripe verification)
- GitHub Actions billing (dakikaları yenile)
- Grafana trial kararı (20 Mayıs'ta bitiyor)

## Dosya Konumu

```
.ai-context/version-upgrade/
├── SISTEM-RAPORU.md
├── UYGULAMA-PLANI.md
├── HAFIZA.md          ← Bu dosya
└── NEXT_SESSION.md    ← Bir sonraki oturum
```
