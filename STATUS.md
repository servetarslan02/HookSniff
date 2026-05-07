# 🪝 HookSniff — Durum Özeti

> Son güncelleme: 2026-05-08 04:15

---

## 🌐 URL'ler

### Şimdilik Kullanılabilir (Ücretsiz)
| Servis | URL | Durum |
|--------|-----|-------|
| **Dashboard** | https://hooksniff.vercel.app | ✅ Çalışıyor |
| **API** | https://hooksniff-api-sdjufmaqka-ew.a.run.app | ✅ Çalışıyor |
| **Worker** | https://hooksniff-worker-1046140057667.europe-west1.run.app | ✅ Çalışıyor |

### Hedef (Domain Alınca)
| Servis | Hedef URL | Yönlendirme |
|--------|-----------|-------------|
| **Dashboard** | `hooksniff.eu.org` | Vercel |
| **API** | `api.hooksniff.eu.org` | Cloud Run |
| **Worker** | — | Sadece dahili (müşteri görmez) |

---

## 🏗️ Altyapı

| Bileşen | Servis | Durum | Not |
|---------|--------|-------|-----|
| **Frontend** | Vercel | ✅ | Next.js dashboard |
| **API** | Google Cloud Run | ✅ | Rust (Axum) |
| **Worker** | Google Cloud Run | ✅ | Webhook delivery |
| **Database** | Neon PostgreSQL | ✅ | Serverless, ücretsiz |
| **Cache** | Upstash Redis | ✅ | Serverless, ücretsiz |
| **Email** | Resend | ⏳ | Domain doğrulama bekliyor |
| **Monitoring** | Grafana Cloud | ⏳ | OTEL headers hazır |
| **Storage** | Cloudflare R2 | ⏳ | Token hazır |
| **CDN** | Cloudflare | ⏳ | Domain bekliyor |

---

## 💰 Maliyet (Şimdilik $0/ay)

| Servis | Free Tier | Limit |
|--------|-----------|-------|
| Vercel | ✅ | 100GB bant genişliği |
| Cloud Run | ✅ | 2M istek/ay |
| Neon | ✅ | 512MB PostgreSQL |
| Upstash | ✅ | 10K komut/gün |
| Resend | ✅ | 100 email/gün |
| Grafana | ✅ | 10K log/ay |
| R2 | ✅ | 10GB depolama |

---

## 🔑 Domain Planı

### Seçenek A: eu.org (Ücretsiz, Tavsiye Edilen)
- [ ] https://nic.eu.org/arf/en/ adresinden kayıt ol
- [ ] `hooksniff.eu.org` için başvur
- [ ] Nameserver: `ns1.cloudflare.com` / `ns2.cloudflare.com`
- [ ] Onay beklenir (1-2 gün)
- [ ] Onaylanınca Cloudflare DNS kurulur
- [ ] Cloud Run custom domain mapping yapılır

### Seçenek B: .com Domain ($12/yıl)
- [ ] Cloudflare Registrar'dan `hooksniff.com` al
- [ ] DNS otomatik kurulur
- [ ] Cloud Run custom domain mapping yapılır

---

## 📋 Yapılacaklar (Öncelik Sırasıyla)

### 🔴 Acil
- [ ] Domain başvurusu (eu.org veya .com)
- [ ] Resend domain doğrulama (domain gelince)
- [ ] Credential yenileme (tüm token'lar ifşa oldu)

### 🟡 Orta
- [ ] Cloudflare DNS kurulumu (domain gelince)
- [ ] Cloud Run custom domain mapping
- [ ] Resend email template'leri
- [ ] Grafana monitoring dashboard

### 🟢 Sonra
- [ ] SDK publish (Node.js, Python)
- [ ] API dokümantasyonu (OpenAPI)
- [ ] Beta kullanıcı bul

---

## 🔗 Önemli Linkler

- **GitHub:** https://github.com/servetarslan02/HookSniff
- **Vercel Dashboard:** https://hooksniff.vercel.app
- **GCP Console:** https://console.cloud.google.com/run?project=hooksniff-app
- **is-a.dev PR:** #37726 (kapatıldı — ticari kullanıma uygun değil)

---

## 📁 Dosya Yapısı

```
HookSniff/
├── api/                    # Rust API (Axum)
├── worker/                 # Webhook delivery worker
├── dashboard/              # Next.js frontend
├── sdks/                   # SDK'lar (Node, Python, Go)
├── deploy/                 # Deploy scriptleri
├── .ai-context/            # AI agent hafıza dosyaları
├── MEMORY.md               # Uzun vadeli hafıza
├── TODO.md                 # Yapılacaklar
├── SESSION_NOTES.md        # Oturum notları
├── CONTEXT.md              # Proje bağlamı
└── STATUS.md               # ← BU DOSYA (genel durum)
```
