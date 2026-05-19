# 2026-05-19 — Özel Alan Adı Sayfası Kapsamlı Denetim

## Yapılan İşler
Custom Domain sayfası detaylı incelendi. 14 sorun tespit edildi, hepsi düzeltildi.

## Tespit Edilen Sorunlar ve Düzeltmeler

### 🔴 Kritik (3)
1. **CNAME doğrulama mantığı hatalı** — Backend `hooksniff.app` arıyordu ama CNAME hedefi `cname.vercel-dns.com`. Düzeltme: `vercel-dns.com`, `hooksniff.app`, `hooksniff.com` üçünü de kabul edecek.
2. **DNS kayıtları sayfa yenilendeğinde kayboluyor** — Unverified domain'ler için DNS bilgisi sadece yeni eklenen domain'de gösteriliyordu, mevcut unverified domain'lerde de gösterilecek şekilde düzeltildi.
3. **Verify sonrası domain listesi yenilenmiyordu** — `fetchDomains()` çağrısı eklendi, artık SSL durumu doğru şekilde gösteriliyor.

### 🟡 Orta (6)
4. **Buton yazısı yanıltıcı** — "Verifying..." → "Adding..." olarak düzeltildi (domain eklerken)
5. **Loading skeleton yok** — Domain listesi yüklenirken skeleton gösteriliyor
6. **Empty state yok** — Hiç domain yokken bilgilendirici mesaj gösteriliyor
7. **İkon çakışması** — Environments sekmesi 🌐 → 📦 olarak değiştirildi
8. **Test import path yanlış** — `[username]` → `(dashboard)` düzeltildi
9. **Hardcoded Vercel credentials** — Fallback olarak hardcoded proje/takım ID'leri kaldırıldı

### 🟢 Düşük (5)
10. **http/https prefix engeli** — Kullanıcı yanlışlıkla protokol eklerse otomatik temizleniyor
11. **Silent fail** — Domain listesi yüklenemediğinde hata mesajı + retry butonu gösteriliyor
12. **İngilizce fallback** — `invalidDomain` mesajı artık tamamen i18n'den geliyor
13. **TXT record name kopyalanamıyor** — Artık hem name hem value kopyalanabiliyor
14. **Enter tuşu** — Domain input'ta Enter ile form gönderiliyor

## Değişilen Dosyalar
- `api/src/routes/custom_domains.rs` — CNAME doğrulama + Vercel credentials
- `dashboard/src/app/[locale]/(dashboard)/custom-domain/page.tsx` — 396 satır (tam yeniden yazım)
- `dashboard/src/app/[locale]/(dashboard)/routing-config/page.tsx` — İkon düzeltmesi
- `dashboard/src/messages/en.json` — 5 yeni key
- `dashboard/src/messages/tr.json` — 5 yeni key
- `dashboard/src/__tests__/custom-domain-page.test.tsx` — Import path

## Commit
`ef178b8d` — fix: custom-domain page comprehensive audit — 14 issues fixed

## 🧪 Yerel Test Sonuçları

### Vitest — 27/27 ✅
- Sayfa render, buton durumları, input validasyon
- Domain ekleme, DNS kayıtları gösterimi
- Verify başarı/başarısızlık senaryoları
- API hata yönetimi, loading/empty/error states
- Domain silme onay akışı

### Next.js Build — ✅
- TypeScript type check geçti
- Production build başarılı
- Ek olarak 6 pre-existing TypeScript hatası düzeltildi

### Ek Düzeltmeler (Build sırasında tespit edildi):
- `retry-policy/page.tsx`: Nullish coalescing operatör parantez sorunu
- `background-tasks/page.tsx`: Kullanılmayan `tc` import
- `message-poller/page.tsx`: Kullanılmayan `tc` import
- `team/TeamDetail.tsx`: `setLastInviteLink` tanımsız → local state
- `docs/changelog/page.tsx`: Kullanılmayan `tSdk`
- `docs/monitor-performance/page.tsx`: Kullanılmayan `Link` import

### Commit: `e2507674`
