# 2026-05-14 — Inbound Page Build Fix

## Sorun
- Vercel build hatası: `Cannot find name 'API'` in `inbound/page.tsx:131`
- Son commit `e6d408da` ("centralize API_BASE + migrate admin pages to apiFetch") sırasında inbound sayfası atlanmış

## Root Cause
- `inbound/page.tsx` dosyasında `API` değişkeni kullanılmış ama hiç tanımlanmamış
- Diğer tüm sayfalar `API_BASE`'e migrate edilmiş ama bu sayfa unutulmuş

## Çözüm
1. `import { ... } from '@/lib/api'` satırına `API_BASE` eklendi
2. JSX içindeki `{API}/inbound/{p.id}` → `{API_BASE}/inbound/{p.id}` 
3. `clipboard.writeText` içindeki `${API}/inbound/${p.id}` → `${API_BASE}/inbound/${p.id}`

## Sonuç
- Local build: ✅ Başarılı (216+ sayfa)
- Commit: `2b035430` — main branch
- Push: ✅ Başarılı → Vercel otomatik deploy tetiklendi

## Dosya
- `dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx` — 3 satır değişti
