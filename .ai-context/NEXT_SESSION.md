# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 18:21 GMT+8

---

## ✅ BU OTURUMDA YAPILAN (Session 72)

### Tam Proje Denetimi
- 5 tur, 29 agent, 30 rapor
- ~35,000+ satır analiz
- Tüm raporlar `.ai-context/visual-bugs/` klasöründe

### Bulgular
- ~700+ sorun tespit edildi
- 25+ kritik, 100+ yüksek, 200+ orta, 100+ düşük seviye
- Master aksiyon planı: `.ai-context/ACTION-PLAN.md`

---

## 🔴 ACİL — Sonraki Oturum Görevleri

### 1. Dashboard Routing Düzeltmesi (EN KRİTİK)
16 dashboard sayfası yanlış içerik gösteriyor. Next.js route'larını düzelt.

### 2. Frontend-Backend API Uyumsuzluğu
Revenue, Billing Usage, Notifications, Auth Login, Teams — format mismatch.

### 3. Abonelik İptal Endpoint'i
`DELETE /billing/subscription` endpoint'i yok, cancel butonu 405 veriyor.

### 4. Dashboard'dan Hesap Silme
`DELETE /auth/me` çağrılıyor ama endpoint `DELETE /auth/account`.

### 5. Fiyat Uyumsuzluğu
Frontend $49/$149, backend $29/$99.

### 6. Kritik Delivery Index
`deliveries(customer_id, created_at DESC)` composite index eksik.

### 7. CSRF Koruması
Frontend'de CSRF token yok.

### 8. Hardcoded DB Credentials
`fix-migrations.js` ve `run-migrations.js`'de plaintext şifre.

---

## 📝 Demo Hesap Bilgileri
- Email: demo@hooksniff.com
- Şifre: Demo1234!
- Plan: Free
- Admin erişimi: Yok

## 📝 API Bilgileri
- API: hooksniff-api-1046140057667.europe-west1.run.app
- Dashboard: https://hooksniff.vercel.app
