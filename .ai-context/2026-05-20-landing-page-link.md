# 2026-05-20 — Landing Page Link Fix

## Sorun
Kullanıcı ve admin panelinde sol üstteki "HookSniff" logosu ve "Yönetim Genel Bakışı" başlığı tıklandığında ana sayfaya (landing page) gitmiyordu. Giriş yapıldıktan sonra landing page'e ulaşmanın bir yolu yoktu.

## Çözüm
1. **Dashboard layout** (`(dashboard)/layout.tsx`): HookSniff logosu `/core` yerine `https://hooksniff.vercel.app/` adresine linklendi
2. **Admin layout** (`admin/layout.tsx`): Admin panel başlığı `<div>` yerine `<a href="https://hooksniff.vercel.app/">` ile değiştirildi, hover efekti eklendi

## Değişen Dosyalar
- `dashboard/src/app/[locale]/(dashboard)/layout.tsx`
- `dashboard/src/app/[locale]/admin/layout.tsx`

## Notlar
- Remote'da icon değişikliği yapılmıştı (⚡ emoji → `<Zap>` Lucide icon), rebase sırasında birleştirildi
- Commit: `1d537eb3`
