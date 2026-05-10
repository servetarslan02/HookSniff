# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 15:10 GMT+8

---

## ✅ BU OTURUMDA YAPILAN (Session 70 — DEVAM EDİYOR)

### OpenClaw Entegrasyonu
1. HookSniff repo OpenClaw workspace'ine klonlandı
2. `.ai-context/` hafıza sistemi incelendi
3. MEMORY.md güncellendi — Session 70 eklendi
4. NEXT_SESSION.md güncellendi
5. GitHub push yapılacak

---

## ⚠️ Kalan İşler (Önceki Oturumlardan)

### 🟡 Orta
1. **Billing modal focus trapping** — billing/page.tsx'teki upgrade ve cancel modalleri ConfirmDialog kullanmıyor, kendi inline modal'ı var
2. **Onboarding window.location** — router.push ile değiştirilmeli
3. **NotificationCenter window.location** — router.push ile değiştirilmeli

### 🟢 Düşük
4. **Dashboard icon buttons** — Bazı dashboard sayfalarında icon-only butonlar (copy, remove) aria-label eksik
5. **Portal customize aria-labels** — copy/remove butonları
6. **Signature verifier aria-labels** — copy butonu

---

## 🟡 Servet'in Yapması Gereken
- OAuth test et
- GitHub PAT rotate
- Vercel rebuild kontrol
- iyzico hesap aç
- **ENCRYPTION_KEY env var** — production'da ayarlanmalı (64 hex karakter)
