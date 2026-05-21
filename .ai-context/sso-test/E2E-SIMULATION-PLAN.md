# SSO E2E Şirket Simülasyonu Test Planı
> Tarih: 2026-05-22 06:02 GMT+8

## Amaç
Gerçek bir şirket gibi tüm üyeleri tek tek test et, her rolün yapması gereken işleri yap,
sistem doğru çalışıyor mu, müşteri zorlanıyor mu raporla.

## Test Kullanıcıları
| # | Email | Rol | Görev |
|---|-------|-----|-------|
| 1 | servetarslan02@gmail.com | Admin (sahip) | Takım yönetimi, SSO kurulumu, fatura |
| 2 | admin@hooksniff.dev | Admin | SSO config, kullanıcı yönetimi |
| 3 | dev@hooksniff.dev | Developer | Endpoint oluştur, webhook gönder, SDK |
| 4 | analyst@hooksniff.dev | Analist | Analytics, raporlar |
| 5 | viewer@hooksniff.dev | Viewer | Salt okunur erişim |
| 6 | newuser@hooksniff.dev | Yeni üye | İlk giriş, onboarding |

## Adımlar
1. Servet (sahip) → SSO kurulumu, takım oluşturma
2. Admin → SSO config, kullanıcı davet
3. Developer → Endpoint + webhook + delivery kontrol
4. Analyst → Analytics sayfası kontrol
5. Viewer → Yetki sınırı testi
6. New User → İlk SSO girişi, otomatik takım katılma
7. Hata senaryoları → Yanlış şifre, süresi dolmuş token
8. Rapor → Bulgular + öneriler
