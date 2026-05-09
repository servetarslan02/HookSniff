# 💡 HookSniff — Ürün İyileştirme Önerileri

> Tarih: 2026-05-08 19:46 GMT+8
> Oturum: 9 (Soru-Cevap)
> ⚠️ **ARŞİV:** Bu dosya 2026-05-08 tarihli. Bazı öneriler uygulandı, bazıları `market/FEATURE_PLAN.md`'ye taşındı.

---

## ✅ Uygulananlar

- ~~AI Center SDK'dan kaldırılacak~~ → ✅ Kaldırıldı (Node + Python'dan çıkarıldı)
- ~~npm + PyPI yayınla~~ → ✅ 11/11 SDK yayınlandı
- ~~PHP hatası düzelt~~ → ✅ Düzeltildi

## 🔄 Güncel Durum

Güncel ürün planı için `market/FEATURE_PLAN.md`'ye bakın.

---

## 🔴 Kritik: SDK Feature Parity

### Sorun
Node ve Python SDK'larında AI Center modülü var ama Go, Java, PHP, Ruby'de yok.

| Özellik | Node | Python | Go | Java | PHP | Ruby |
|---------|------|--------|-----|------|-----|------|
| Endpoints CRUD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Webhooks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI Center | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Webhook Handler | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Export | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Çözüm
Go, Java, PHP, Ruby SDK'larına AI Center modülü ekle.
Ayrıca Java, PHP, Ruby'ye Webhook Handler pattern ekle.

---

## 💡 Ürün Önerileri

### ⚠️ KRİTİK: AI Center SDK'dan Kaldırılacak
**Sorun:** Node ve Python SDK'larında `client.ai.*` modülü var ama backend'de `/ai/*` endpoint'leri hiç tanımlanmıs değil. 404 döner.
**Karar:** SDK'lardan AI Center kodu çıkarılacak. Olmayan özelliği sunuyormuş gibi görünmek güven kaybettirir.
**Dosyalar:**
- `sdks/node/src/index.ts` → `AiCenterResource` sınıfı + `this.ai` satırı kaldırılacak
- `sdks/node/src/types.ts` → `AiStatus`, `AiEvent`, `RiskScore`, `AiAction`, `AiProvider` tipleri kaldırılacak
- `sdks/python/hooksniff/client.py` → `_AiCenterResource` sınıfı + `self.ai` satırı kaldırılacak
- `sdks/python/hooksniff/models.py` → `AiStatus`, `AiEvent`, `RiskScore`, `AiAction` modelleri kaldırılacak
**Not:** Go, Java, PHP, Ruby SDK'larında zaten yok. Sadece Node ve Python'dan çıkarılacak.
**Öncelik:** Yayından önce yapılmalı.

---

### 1. 🏆 "Try It" Butonu — Svix Play Benzeri
**Ne:** Dashboard'da tek tıkla geçici webhook endpoint oluşturup test etme.
**Neden:** Svix'in en popüler özelliği. HookSniff'te yok.
**SDK tarafı:** `client.webhooks.createTestEndpoint()` fonksiyonu. 10 dakika sonra otomatik silinsin.
**Etki:** Svix'ten müşteri çalmanın en kolay yolu.

### 2. 🏆 Quick Start Fonksiyonu
**Ne:** SDK'yı tek satırda başlatma.
```python
from hooksniff import quickstart
client = quickstart()  # API key sorar, endpoint oluşturur, test webhook gönderir
```
**Neden:** İlk deneyim 30 saniyeye iner. Geliştiriciler bunu sever.
**Zorluk:** Kolay.

### 3. 🟡 Webhook Simulator (SDK İçinde)
**Ne:** SDK'ya gömülü test sunucusu.
```python
from hooksniff import WebhookSimulator
sim = WebhookSimulator(port=9000)
sim.on("order.created", lambda e: print(e))
sim.start()  # localhost:9000'de webhook dinler
```
**Neden:** Geliştirici kendi makinesinde webhook test edebilir. Rakiplerde yok.
**Zorluk:** Orta.

### 4. 🟡 Changelog + Migration Guide
**Ne:** Her SDK'da CHANGELOG.md ve MIGRATION.md.
**Neden:** Versiyon atladığında kullanıcı kaybetmemek için.
**Zorluk:** Kolay.

### 5. 🟡 TypeScript Tip Desteği Aktifleştirme
**Ne:** Node SDK'sında tanımlı event tiplerini (OrderCreatedPayload vs.) `send()` metodunda kullanılabilir yapma.
**Neden:** Tipler var ama işlevsiz. TypeScript kullanıcıları için büyük avantaj.
**Zorluk:** Kolay.

---

## Öncelik Sırası

| # | Ne | Neden | Zorluk |
|---|---|---------|--------|
| 1 | PHP hatası düzelt | Kod çalışmıyor | 2 dk |
| 2 | Feature parity (AI Center + Handler ekle) | Yarım ürün hissi | Orta |
| 3 | Quick Start fonksiyonu | İlk deneyim kötü | Kolay |
| 4 | Webhook Simulator | Farklılaştırıcı | Orta |
| 5 | npm + PyPI yayınla | Ulaşılabilir değil | Kolay |
| 6 | Changelog + Migration | Kullanıcı kaybı | Kolay |
| 7 | TypeScript tipleri aktifleştir | Developer experience | Kolay |

---

## Not: AI Center Nedir?

AI Center, HookSniff'in bir modülü. API'ye gelen webhook'ları analiz ediyor:
- Anormal trafik tespiti (ani spike'lar)
- Risk skorlama (şüpheli endpoint'ler)
- Otomatik aksiyon alma (şüpheli endpoint'leri bloklama)
- Event log + alert sistemi

Yani "webhook güvenliği + zeka" katmanı. Rakiplerde olmayan bir özellik.
SDK'da `client.ai.status()`, `client.ai.events()`, `client.ai.risks()` gibi fonksiyonlarla erişiliyor.
