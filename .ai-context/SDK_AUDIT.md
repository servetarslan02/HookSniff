# 🔍 HookSniff — SDK Denetim Raporu

> Tarih: 2026-05-08 19:40 GMT+8
> Oturum: 9 (Soru-Cevap)
> Durum: Tespit edildi, düzeltilmedi

---

## Genel Bakış

| SDK | Versiyon | Bağımlılık | Test | Publish | Kod Kalitesi |
|-----|----------|------------|------|---------|--------------|
| Node.js | 0.2.0 | 0 (fetch) | ❌ | ❌ npm'de yok | ✅ İyi |
| Python | 0.4.0 | 1 (requests) | ❌ | ❌ PyPI'de yok | ✅ İyi |
| Go | 0.2.0 | 0 (net/http) | ❌ | ❌ | ✅ İyi |
| Java | 0.1.0 | 1 (Gson 2.10.1) | ❌ | ❌ | ✅ İyi |
| PHP | 0.2.0 | 0 (curl) | ❌ | ❌ | ⚠️ Hata var |
| Ruby | 0.1.0 | 0 (net/http) | ❌ | ❌ | ✅ İyi |

---

## 🐛 Tespit Edilen Hatalar (Düzeltilecek)

### 1. PHP SDK — `send()` metodunda duplicate satır
**Dosya:** `sdks/php/src/HookSniffClient.php`
**Sorun:** `send()` metodunda fazla satır var:
```php
$body = ['endpoint_id' => $endpointId, 'data' => $data];> $data];
```
`> $data];` kısmı düzenleme hatası. Bu kod çalışmaz.
**Çözüm:** Fazla kısmı sil, sadece `$body = ['endpoint_id' => $endpointId, 'data' => $data];` kalmalı.

### 2. Tüm SDK'lar — Yanlış base URL
**Sorun:** Tüm SDK'larda varsayılan URL `https://api.hooksniff.io/v1` ama asıl API GCP Cloud Run'da.
**Etkilenen dosyalar:**
- `sdks/node/src/index.ts` → `https://api.hooksniff.is-a.dev/v1` (eski domain)
- `sdks/python/hooksniff/client.py` → `https://api.hooksniff.io/v1`
- `sdks/go/hooksniff.go` → `https://api.hooksniff.io/v1`
- `sdks/java/src/.../HookSniffClient.java` → `https://api.hooksniff.io/v1`
- `sdks/php/src/HookSniffClient.php` → `https://api.hooksniff.io/v1`
- `sdks/ruby/lib/hooksniff/client.rb` → `https://api.hooksniff.io/v1`
**Çözüm:** Domain kararı verildikten sonra tüm SDK'ların default URL'leri güncellenecek.

### 3. Java SDK — Gson eski sürüm
**Dosya:** `sdks/java/pom.xml`
**Sorun:** Gson `2.10.1` kullanıyor, güncel sürüm `2.11.0`.
**Çözüm:** `<gson.version>2.11.0</gson.version>` yap.

### 4. Go SDK — Eski Go versiyonu
**Dosya:** `sdks/go/go.mod`
**Sorun:** `go 1.21` minimum. Güncel Go `1.22`. Go 1.21 desteği yakında bitebilir.
**Çözüm:** `go 1.22` yap.

### 5. Versiyon tutarsızlığı
**Sorun:** Node 0.2.0, Python 0.4.0, Go 0.2.0, Java 0.1.0, PHP 0.2.0, Ruby 0.1.0 — hepsi farklı.
**Çözüm:** Tüm SDK'lar aynı versiyona getirilmeli (örn. 0.1.0 veya 1.0.0).

---

## ✅ İyi Yapılmış Şeyler

- Minimal bağımlılık (Go, Ruby, PHP sıfır bağımlılık)
- Standard Webhooks HMAC-SHA256 uyumluluğu
- Constant-time comparison (timing saldırılarına karşı)
- Svix header desteği (webhook-* + svix-*)
- Tutarlı resource pattern (endpoints, webhooks)
- Structured error sınıfları

---

## ⚠️ Eksikler (Gelecekte yapılacak)

| Eksik | Açıklama |
|-------|----------|
| Unit test yok | Hiçbir SDK'da test dosyası yok |
| CI workflow yok | SDK'lar için GitHub Actions yok |
| Publish yok | npm/PyPI/Maven/RubyGems'te yayınlanmamış |
| Retry mekanizması yok | SDK tarafında otomatik retry yok |
| Rate limit handling yok | 429'da otomatik bekleme yok |
| Async destek yok | Python/Node'da async/await yok |
| CHANGELOG yok | Versiyon geçişleri takip edilemiyor |

---

## 🔧 Düzeltme Sırası (Bir sonraki oturumda)

1. PHP duplicate satır düzeltmesi (acil — kod çalışmaz)
2. Base URL'lerin güncellenmesi (domain kararı sonrası)
3. Gson ve Go versiyon güncelleme
4. Versiyon senkronizasyonu
5. Minimal test eklenmesi
6. CI workflow oluşturulması
7. Dependabot kurulumu
