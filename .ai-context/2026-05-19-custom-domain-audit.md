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

---

# 2026-05-19 — Ortamlar Sayfası Kapsamlı Denetim + Upgrade

## Yapılan İşler
Environments sayfası detaylı incelendi. Backend'de tam CRUD + variable yönetimi varken frontend'de büyük eksikler tespit edildi. Sayfa baştan yeniden yazıldı.

## Tespit Edilen Sorunlar ve Düzeltmeler

### 🔴 Kritik (3)
1. **Edit fonksiyonu yoktu** → Edit modal eklendi (name, description, color, set default)
2. **Variable yönetimi yoktu** → Slide-over panel eklendi (list, create, delete variables)
3. **Delete onayı yoktu** → Confirmation modal eklendi (default env uyarısı ile)

### 🟡 Orta (3)
4. **"Set as default" sadece creation'da** → Edit modalında da checkbox eklendi
5. **Loading skeleton yoktu** → 3 kart skeleton eklendi
6. **Hata durumu + retry yoktu** → Error state + retry butonu eklendi

### 🟢 Düşük (1)
7. **Boş durum butonu yoktu** → CTA butonu eklendi ("Create your first")

## Yeni Özellikler
- Renk seçici (preset swatch'lar + custom color picker)
- Secret değişkenler gizli gösterim (••••••••)
- Variable panelinde hover-reveal delete butonu
- Default ortam silme uyarısı

## Değişilen Dosyalar
- `dashboard/.../environments/page.tsx` — Tam yeniden yazım
- `dashboard/src/messages/en.json` — 22 yeni key
- `dashboard/src/messages/tr.json` — 22 yeni key
- `dashboard/src/__tests__/environments-page.test.tsx` — 17 test

## Test Sonuçları
- Vitest: 17/17 ✅
- Build: ✅

## Commit: `ed7d7715`

---

# 2026-05-19 — Bildirimler Sayfası Denetim

## Yapılan İşler
Notifications sayfası detaylı incelendi. 7 sorun tespit edildi, hepsi düzeltildi.

## Tespit Edilen ve Düzeltilen Sorunlar

### 🔴 Kritik (1)
1. **API hatası durumu yoktu** → Fail'de "Bildirim bulunamadı" gösteriyordu (yanıltıcı). Error state + retry butonu eklendi.

### 🟡 Orta (3)
2. **`handleMarkAsRead` hata yönetimi yoktu** → Artık toast gösteriyor
3. **Loading skeleton yoktu** → 5 satır skeleton eklendi
4. **`unread_count` type'da eksikti** → `NotificationListResponse`'a eklendi

### 🟢 Düşük (3)
5. **Type badge `_` → ` ` sadece ilkini değiştiriyordu** → `formatType()` fonksiyonu: "Webhook Failed"
6. **"Tümünü okundu işaretle" boş listede görünüyordu** → Artık sadece unread > 0'da gösteriliyor
7. **Relative time yoktu** → "5m ago", "1h ago", "1d ago" gösterimi eklendi

## Ek Düzeltmeler (Build)
- `api-importer/SpecInputPanel.tsx`: Kullanılmayan `sampleYaml` kaldırıldı
- `api-importer/parser.ts`: Null type düzeltmesi

## Değişilen Dosyalar
- `dashboard/.../notifications/page.tsx` — Yeniden yazım
- `dashboard/src/lib/api-types.ts` — `unread_count` eklendi
- `dashboard/src/__tests__/notifications-page.test.tsx` — 18 test
- `dashboard/.../api-importer/SpecInputPanel.tsx` — Unused var
- `dashboard/.../api-importer/parser.ts` — Type fix

## Test Sonuçları
- Vitest: 18/18 ✅
- Build: ✅

## Commit: `14be5d42`

---

# 2026-05-19 — Bildirim Sistemi Düzeltmeleri

## Yapılan İşler
Bildirim sistemi trace edildi. 3 kritik sorun tespit edildi, hepsi düzeltildi.

## Sorunlar ve Düzeltmeler

### 1. Webhook Başarısızlık Bildirimi Oluşturulmuyordu 🔴
- Worker'da `dead_letter_delivery` çağrısından sonra in-app notification oluşturulmuyordu
- `notify_delivery_failed()` fonksiyonu vardı ama çağrılmıyordu
- **Düzeltme:** `create_delivery_failure_notification()` fonksiyonu eklendi, her dead letter'da çağrılıyor
- Tip: `webhook_failed`, link: `/deliveries/{id}`

### 2. "View all notifications" Linki Yanlış 🟡
- NotificationCenter'daki link `/team-mgmt`'e gidiyordu
- **Düzeltme:** `/notifications` sayfasına yönlendiriyor

### 3. Invite Token Extraction Yanlış 🟡
- `invite=` arıyordu ama backend `invite_token=` gönderiyordu
- **Düzeltme:** Regex düzeltildi

### 4. Eksik i18n Key'leri 🟢
- `nav` namespace'inde 6 key eksikti
- **Düzeltme:** EN + TR eklendi

## Değişilen Dosyalar
- `worker/src/main.rs` — `create_delivery_failure_notification()` + 2 çağrı noktası
- `dashboard/src/components/NotificationCenter.tsx` — Link + regex fix
- `dashboard/src/messages/en.json` — 6 nav key
- `dashboard/src/messages/tr.json` — 6 nav key

## Commit: `498e0e87`
