# 2026-05-20 — SSO Test + Bug Fixes (Session 2)

## Oturum: 20:51–21:19 GMT+8

### Kullanıcı: Servet Arslan (servetarslan02)

---

## Yapılan İşler

### 1. SSO Sistemi Gerçek Kullanıcı Testi
- Demo hesabı (demo@hooksniff.com, Enterprise plan) ile giriş yapıldı
- Organization sayfası → SSO sekmesi incelendi
- API'den SSO config başarıyla döndü (OIDC, Google, megacorp.com)
- 10 kişilik MegaCorp Engineering takımı doğrulandı (11 üye)
- SSO login redirect test edildi (307 → Google OAuth)
- SSO connection test başarılı (OIDC discovery)
- Edge case'ler test edildi (geçersiz domain, boş email, public domain)

### 2. Bulunan ve Düzeltilen Bug'lar

| # | Bug | Öncelik | Durum |
|---|-----|---------|-------|
| 1 | DNS doğrulama Cloud Run'da çalışmıyor (dig/nslookup/python3 yok) | Yüksek | ✅ trust-dns-resolver |
| 2 | SSO callback 500 hatası veriyor (kullanıcıya Internal Server Error) | Yüksek | ✅ 400 açıklayıcı mesaj |
| 3 | SSO config yüklenmiyor — form boş kalıyor | Kritik | ✅ teamId prop geçirildi |
| 4 | Eksik i18n: sso.generateTxt, verifiedDomain vb. | Orta | ✅ EN+TR eklendi |
| 5 | Eksik i18n: team.deleteTeam, leaveTeam | Orta | ✅ EN+TR eklendi |
| 6 | Eksik i18n: applications.edit | Düşük | ✅ EN+TR eklendi |
| 7 | rate-limit-violations 500 hatası | Orta | ✅ unwrap_or_default + migration |

### 3. Değişen Dosyalar

**API (2 dosya):**
- `api/src/routes/sso.rs` — DNS verification + error messages
- `api/src/routes/admin/monitoring.rs` — rate-limit-violations resilient query

**Dashboard (3 dosya):**
- `dashboard/src/app/[locale]/(dashboard)/sso/page.tsx` — teamId prop fix
- `dashboard/src/messages/en.json` — 20+ yeni i18n key
- `dashboard/src/messages/tr.json` — 20+ yeni i18n key

**Migrations (1 dosya):**
- `migrations/079_rate_limit_violations_ensure.sql` — ensure table exists

**Dependencies:**
- `api/Cargo.toml` — trust-dns-resolver eklendi

### 4. SSO Test Senaryosu (MegaCorp)

```
✅ Admin giriş (demo@hooksniff.com, Enterprise)
✅ Organization → MegaCorp Engineering (11 üye)
✅ SSO sekmesi → OIDC (Google) yapılandırması
✅ API: /sso/config?team_id=... → veri doğru döndü
✅ API: /sso/providers?domain=megacorp.com → sso_available: true
✅ API: /sso/login?email=ayse.kaya@megacorp.com → 307 redirect
✅ API: /sso/test → OIDC valid, endpoints doğru
❌ SSO formu boş → teamId prop geçirilmiyordu (DÜZELTİLDİ)
❌ rate-limit-violations 500 → tablo yok (DÜZELTİLDİ)
```

### 5. Push'lanan Commit'ler

1. `34a0d193` — DNS verification fix (trust-dns-resolver)
2. `d8ef60e9` — SSO callback error messages
3. `d5ba2309` — SSO teamId prop + i18n keys
4. `af1d983e` — remaining i18n + rate-limit fix + migration
