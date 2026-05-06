# HookRelay — Repo Analiz Özeti

## 📅 Tarih: 2026-05-06
## 🎯 Amaç: Açık kaynak repolardan HookRelay'e entegre edilebilecek kod/pattern'leri belirleme

---

## ✅ Lisans Durumu

| Repo | Lisans | Kullanılabilir? |
|------|--------|----------------|
| svix/svix-webhooks | MIT | ✅ Evet |
| standard-webhooks/standard-webhooks | Apache 2.0 | ✅ Evet |
| cloudevents/sdk-rust | Apache 2.0 | ✅ Evet |
| hookdeck/outpost | Apache 2.0 | ✅ Evet (Go, pattern olarak) |
| frain-dev/convoy | Elastic 2.0 | ❌ SaaS olarak kullanılamaz |
| hook0/hook0 | AGPL-3.0 | ❌ Açık kaynak yapmanı gerektirir |

---

## 🔍 Analiz Sonuçları

### 1. signing.rs — Zaten Uyumlu! ✅
HookRelay'in `signing.rs` dosyası **Standard Webhooks spesifikasyonuna tam uyumlu**:
- ✅ `whsec_` prefix ile secret
- ✅ `msg_id.timestamp.payload` formatı
- ✅ HMAC-SHA256 + base64
- ✅ `v1,<signature>` formatı
- ✅ Multi-signature desteği (space-separated)
- ✅ Constant-time XOR fold comparison
- ✅ 5 dakika timestamp tolerance
- ✅ Svix-branded + unbranded header desteği
- ✅ Svix test vector'ü ile uyumlu

**Sonuç:** signing.rs'i değiştirmeye gerek yok. Svix library eklemeye de gerek yok — mevcut kod zaten battle-tested ve referans implementasyonla uyumlu.

### 2. CloudEvents — Kısmi Uyum
- Mevcut `events/cloudevents.rs` var
- `specversion` ve `source` attribute'ları kontrol edilmeli
- CloudEvents SDK'yı doğrudan kullanma — fazla karmaşık

### 3. Outpost — Mimari Referans
- Multi-tenant pattern → HookRelay'de zaten var (customer_id)
- Redis RSMQ retry queue → PostgreSQL queue'dan daha performanslı (gelecekte düşünülebilir)
- User portal → Henüz yok, önemli bir eksik
- SSRF protection → Henüz yok, acil eklenmeli

---

## 🎯 Öncelik Sıralaması

### Acil (Bu Hafta)
1. **SSRF koruması** — Internal IP'leri blokla (smokescreen proxy veya basit IP filtreleme)
2. **410 Gone handling** — Endpoint'i otomatik devre dışı bırak
3. **429 throttle handling** — Rate limit response'larını düzgün işle

### Kısa Vadeli (1-2 Hafta)
4. **Standard Webhooks retry schedule** — Önerilen schedule'ı uygula
5. **CloudEvents v1.0 uyumluluğu** — specversion/source ekle
6. **User portal** — Customer dashboard'u

### Orta Vadeli (1 Ay)
7. **Multi-destination routing** — EventBridge, SQS, S3
8. **Redis-based retry queue** — PostgreSQL'den Redis'e geçiş
9. **Failure alerts** — Email notification

---

## 📁 Oluşturulan Dosyalar

```
hooksniff/research/
├── ANALYSIS-SVIX.md              # Svix Rust SDK analizi
├── ANALYSIS-STANDARD-WEBHOOKS.md # Standard Webhooks spesifikasyonu
├── ANALYSIS-CLOUDEVENTS.md       # CloudEvents SDK analizi
├── ANALYSIS-OUTPOST.md           # Outpost mimari analizi
├── svix-webhooks/                # Svix repo (clone)
├── standard-webhooks/            # Standard Webhooks repo (clone)
├── cloudevents-sdk-rust/         # CloudEvents SDK repo (clone)
├── outpost/                      # Outpost repo (clone)
└── convoy/                       # Convoy repo (clone, lisans nedeniyle kullanılmayacak)
```

---

## 💡 Kritik Bulgu

**HookRelay'in signing.rs'i zaten Standard Webhooks uyumlu!** Bu büyük bir avantaj — Svix veya herhangi bir external library eklemeye gerek yok. Mevcut kod production-ready.

Asıl eksiklikler:
1. SSRF koruması (güvenlik)
2. User portal (müşteri deneyimi)
3. Multi-destination (feature genişletme)
