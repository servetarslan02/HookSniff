# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-22 01:35 GMT+8 (Session 6 — Sitemap + Dunning/Pause Test)

## ✅ Bu Oturumda Yapılan İşler (Session 6)

### Google Search Console Sitemap Düzeltmesi
- İki hatalı sitemap silindi: `/blog/sitemap` (HTML hatası) ve `/sitemap.xml` (Getirilemedi)
- `/sitemap.xml` temiz olarak tekrar gönderildi
- Googlebot erişimi doğrulandı (200 OK, application/xml)

### Dunning + Pause/Resume Test — 3 Kritik Bug Düzeltildi
1. **Resume INTERNAL_ERROR** → checkout() kaldırıldı, DB'de plan restore ediliyor
2. **activate_paused_subscriptions çalışmıyor** → `paused_at IS NULL` koşulu kaldırıldı
3. **Yıllık dunning email gönderilemiyor** → CHECK constraint 1-7 → 1-30

### Session 5 — RBAC Enforcement (önceki oturum)

### Team Role-Based Access Control (RBAC) — Full Enforcement
- `require_team_developer` ve `require_team_analyst` artık aktif kullanılıyor
- 18 route dosyasına rol kontrolü eklendi (532+ satır)
- `check_user_team_role()` merkezi fonksiyon — TÜM takım üyeliklerini kontrol eder
- Viewer artık endpoint/webhook/API key oluşturamaz
- SSO `default_role` artık enforce ediliyor
- Rol hiyerarşisi: owner > admin(40) > developer(30) > analyst(20) > viewer(10)
- Write ops → developer, Destructive ops → admin
- Commits: `5b22428e` + `a9929b3a`

## 📋 Sonraki Adımlar

### Kısa Vadeli (1-2 oturum)
0. **⚠️ Migration 072 canlı DB'ye uygulanmalı** — CHECK constraint fix (days_remaining 1-7 → 1-30)
1. **Resume + activate_paused_subscriptions deploy edilmeli** — 3 bug fix commit
2. **Blog içerikleri yaz** — SEO için en kritik. Hedef anahtar kelimeler:
   - "webhooks explained" / "what is a webhook"
   - "webhook vs api" / "webhook vs polling"
   - "free webhook service 2026"
   - "svix alternative" / "hookdeck alternative"
   - "webhook best practices" / "webhook security"
   - "how to implement webhooks in node.js"
   - "stripe webhooks guide" / "github webhooks guide"
2. **Sitemap'e blog sayfalarını ekle** — Mevcut sitemap sadece ana sayfaları içeriyor
3. **Search Console performans** — 2-3 gün içinde veri gelmeye başlar, kontrol et
4. **Dashboard Billing Sayfası** — Frontend'de `billing-section` URL'i ile `dashboard/billing` tutarsızlığı var

### Orta Vadeli (3-5 oturum)
5. **Dunning Test** — E-posta hatırlatma sistemi test edilmeli (Polar sandbox)
6. **Pause/Resume Test** — Abonelik dondurma akışı end-to-end test
7. **Overage Faturası** — `track_daily_event` overage sayıyor ama fatura oluşturmuyor

### Uzun Vadeli
8. **Monitoring** — Billing webhook'ları için alert sistemi kurulmalı
9. **Polar SDK Migration** — Manuel HTTP çağrıları yerine `polar-sdk` Rust crate kullanılabilir
10. **RBAC Test** — Rol kontrollerinin doğru çalıştığını doğrulayan unit/integration testler yaz

## 🔧 Teknik Notlar

- GCloud SDK: `/opt/google-cloud-sdk/bin/gcloud`
- GCP key: `gcp-key.json` (repo root, .gitignore'da)
- Deploy: `gcloud builds submit --config cloudbuild.yaml --project hooksniff-app`
- Polar API: `https://api.polar.sh` (production), `https://sandbox-api.polar.sh` (test)
- Vercel dashboard: `https://hooksniff.vercel.app`
- API URL'ler: `hooksniff-api-1046140057667.{region}.run.app`
- RBAC: `find_primary_team()` helper endpoints.rs'te, JWT kullanıcıları için team bulma
