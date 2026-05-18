# 2026-05-14 — Vercel ENOENT Fix Oturumu

## Katılanlar
- Servet (proje sahibi)
- AI Asistan (OpenClaw)

## Yapılan İşler

### Vercel ENOENT Sorunu Çözüldü (02:17-02:40)
1. Servet Vercel'deki hataları kontrol etmemi istedi
2. GitHub repo clone edildi, `.ai-context/` hafıza sistemi okundu
3. Local build testi — BAŞARILI (216+ sayfa)
4. Vercel dashboard'a Google hesabı ile giriş yapıldı
5. Build log'ları incelendi — net hata bulundu:
   ```
   ENOENT: no such file or directory, lstat '.../page_client-reference-manifest.js'
   ```

### Kök Neden Analizi
- `(dashboard)/page.tsx` bir `'use client'` component idi
- Next.js 15'te route group root sayfaları için `page_client-reference-manifest.js` oluşturmuyor
- Vercel'in file tracing'i bu dosyayı bekliyor → ENOENT
- Ayrıca `[locale]/page.tsx` (landing) ve `[locale]/(dashboard)/page.tsx` (dashboard) aynı URL'e map'leniyordu — çakışma!

### Uygulanan Çözüm
1. `(dashboard)/page.tsx` → Server component redirect to `/core` (client component kaldırıldı)
2. `core/page.tsx` → DashboardOverview'u doğrudan import edecek şekilde güncellendi
3. Sidebar "Dashboard" linki `/` → `/core` olarak değiştirildi
4. Logo linki `/` → `/core` olarak değiştirildi
5. Duplicate `/core` sidebar girişi kaldırıldı
6. Postbuild script korundu (güvenlik ağı)

### Sonuç
- Vercel deploy: ✅ Ready (commit `e0dd6027`)
- ENOENT hatası: ✅ Çözüldü
- Sidebar navigasyon: ✅ Düzeltildi

### Commits
- `e0dd6027` — fix: replace (dashboard)/page.tsx client component with server redirect
- `d3d9be0d` — fix: sidebar Dashboard link → /core, remove duplicate Core entry

### Vercel Proje Bilgileri
- Proje adı: `hooksniff-dash`
- Root Directory: `dashboard`
- Domain: hooksniff.vercel.app
- Node.js: 24.x (22.x'e düşürülmesi önerilir)
- Framework: Next.js

### Kalan İşler
- [ ] Node.js version 24.x → 22.x (Vercel settings'den elle değiştirilmeli)
- [ ] `vercel.json` root dosyasındaki buildCommand artık gereksiz (Vercel UI kullanıyor)
- [ ] Dependabot PR'ları deploy limitini yiyor — tamamen kapatılabilir

### UI Düzenlemeleri (02:47-03:00)
1. **Sidebar'dan header'a kullanıcı bilgisi taşındı**
   - Eski: sol altta user info + logout butonu
   - Yeni: sağ üstte avatar, tıklanınca dropdown menü
   
2. **Dropdown menü içeriği:**
   - Kullanıcı adı + email
   - ⚙️ Settings
   - 📖 Documentation
   - 🔗 API Reference
   - 🚪 Sign Out

3. **Admin paneli:**
   - ThemeToggle sidebar'dan header'a taşındı
   
4. **Arama çubuğu kaldırıldı** (dashboard header'dan)

5. **Playground "Network error" düzeltildi:**
   - Sorun: `next.config.js`'deki catch-all `/api/:path*` rewrite TÜM API isteklerini Cloud Run'a gönderiyordu
   - `/api/playground/token`, `/api/newsletter`, `/api/status` local API route'ları hiç çalışmıyordu
   - Çözüm: Catch-all kaldırıldı, her API path için explicit rewrite eklendi

### Commit: `5c78d320`
