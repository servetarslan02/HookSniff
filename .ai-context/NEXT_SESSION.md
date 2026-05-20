# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-21 01:10 GMT+8

## ⚠️ KRİTİK: API Deploy Gerekli

7 fix push edildi ama API (Cloud Run) hala eski kodu çalışıyor:
- `d18c5301` — SSO critical bugs — 7 fixes

**Yapılacak:** Cloud Build tetikle veya manuel deploy
```bash
gcloud builds submit --config cloudbuild.yaml --substitutions=_DEPLOY_TARGET=api
```

## Yapılan Fix'ler (Bu Oturum)

### 1. DB Migration 082 — Multi-team SSO ✅ (Neon'da çalıştırıldı)
- `customer_id UNIQUE` constraint kaldırıldı
- Artık aynı kullanıcı farklı takımlarda SSO oluşturabilir

### 2. Dashboard SSO Form Fix ✅
- `verified_domain` → API'ye gönderiliyor
- `admin_bypass` → API'ye gönderiliyor
- `enabled` → mevcut config durumunu koruyor (hardcoded false değil)
- `domainInput` ve `adminBypass` → config'den populate ediliyor

### 3. Login Page SSO Detection ✅
- Email input'a yazarken 500ms debounce ile SSO providers kontrolü
- SSO varsa "Login with SSO (OIDC/SAML)" butonu görünüyor
- `/api/sso-check` proxy route oluşturuldu

### 4. i18n Fix ✅
- `sso.generateTxt` → EN+TR eklendi
- `sso.autoTeamJoinWarning` → EN+TR eklendi

### 5. DELETE Endpoint Fix ✅
- Team_id doğrulama eklendi
- Takım üyeliği kontrolü eklendi

### 6. API testSso/deleteSso ✅
- Artık teamId parametresi alıyor

### 7. SSO Config Restore
- MegaCorp SSO config eski DELETE bug tarafından silindi, geri yüklendi

## Sıradaki
1. **Cloud Build deploy** — API fix'leri canlıya al
2. **Dashboard deploy** — Vercel otomatik tetikleyecek
3. **Test Connection butonu** — Config yüklendikten sonra aktif olmalı (düzeltildi, deploy bekliyor)
4. **SSO callback handler** — Gerçek OIDC token exchange test
5. **SSO enforce modal** — "Tüm ekip üyeleri SSO ile giriş yapacak" onayı
