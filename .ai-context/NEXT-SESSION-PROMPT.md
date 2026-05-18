# 🚀 Yeni Oturum Başlangıç Prompt'u

> Bu metni yeni oturumun ilk mesajı olarak yapıştır.

---

Selam, ben Servet. HookSniff projesi üzerinde çalışıyoruz. Kod bilmiyorum, teknik işler sende.

## Hemen Yapman Gerekenler (Sırasıyla)

### 1. Repo'yu Clone Et
```bash
cd /root/.openclaw/workspace
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff
```

### 2. Hafıza Dosyalarını Oku (SIRASI ÖNEMLİ)
```bash
# Bu dosyalar GitHub'da kalıcı hafıza. Sırasıyla oku:
cat .ai-context/MEMORY.md          # Proje geçmişi, hesap bilgileri
cat .ai-context/NEXT_SESSION.md    # Son oturumda ne yapıldı, sırada ne var
cat .ai-context/NAV-RESTRUCTURE-PLAN.md  # Navigation yeniden yapılandırma planı (DETAYLI)
```

### 3. Git Ayarlarını Yap
```bash
git config user.email "servetarslan02@users.noreply.github.com"
git config user.name "AI Agent"
```

### 4. Navigation Restructure'ı Uygula

`.ai-context/NAV-RESTRUCTURE-PLAN.md` dosyasını oku. Orada 8 adım var, hepsini uygula.

**Kısa özet:**
- Sidebar'da 8 section olacak: Core, Deliveries, Schema & Content, DevTools, Observability, Security, Routing, Account
- Applications ve API Keys → Core'a taşınacak
- Search ve Logs → Deliveries'e taşınacak
- Team, Notifications, Billing, Settings, Portal → Account'a birleştirilecek
- Eski URL'ler redirect edilecek (middleware.ts)

**ÖNEMLİ:** Component'ler ayrı dosyalarda yaşıyor. Mesela `team/page.tsx` dosyasında. Yeni sayfalar bu dosyaları dynamic import ile çağırır. Mevcut component dosyalarına dokunma!

### 5. Her Adımdan Sonra Push Et
```bash
git add -A && git commit -m "feat: ..." && git push origin main
```

## Hesap Bilgileri
- Admin: servetarslan02@gmail.com (şifre: .sdk-tokens.env'de saklı)
- Dashboard: https://hooksniff.vercel.app
- API: https://hooksniff-api-1046140057667.europe-west1.run.app

## Kurallar
- Oturumlar 1 saat sürüyor, yetişmezse GitHub'a push et
- `.ai-context/` klasörüne önemli bilgileri yaz (kalıcı hafıza)
- Değişiklikleri commit et: `git add -A && git commit && git push`
- Türkçe konuş, teknik terimleri açıkla
- Emin olmadığın şeyleri yapma, sor

## Oturum 173 — Neon DB Bağlantı
- Neon HTTP API endpoint: `https://ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/sql`
- Header: `Neon-Connection-String: postgresql://neondb_owner:npg_HUw5KmSC2nQL@...`
- psql yok, Node.js https modülü ile SQL çalıştır
- Neon free tier compute limiti aşılmış olabilir — bağlantılarda timeout olursa bekle

## Proje Yapısı
- API: Rust + Axum (api/ klasörü)
- Dashboard: Next.js 15 (dashboard/ klasörü)
- Worker: Rust (worker/ klasörü)
- DB: PostgreSQL (Neon)
- Hosting: Vercel (dashboard) + Cloud Run (API)
