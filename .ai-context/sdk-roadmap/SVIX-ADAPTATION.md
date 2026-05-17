# TODO — Svix'ten Adaptasyon Gereken İşler

> Son güncelleme: 2026-05-17 23:11 GMT+8
> Bu dosya bir sonraki oturumda okunacak.

---

## ⚠️ KRİTİK: Python SDK Svix'ten Doğrudan Çevrilmedi

Mevcut Python SDK (v0.5.0) **Node.js SDK referans alınarak** yazıldı. Svix Python SDK'dan doğrudan çevrilmedi. Bu yüzden bazı Svix-specific Python patterns kaçırılmış olabilir.

### Yapılması Gereken

1. **Svix Python SDK'sını bul ve incele**
   - GitHub: `https://github.com/svix/svix-python` veya `svix/svix-libs`
   - Mevcut HookSniff Python SDK ile karşılaştır
   - Kaçırılan özellikleri tespit et

2. **Karşılaştırılacak alanlar:**
   - [ ] `svix/api/` → async/await desteği var mı?
   - [ ] `svix/models/` → Pydantic mi dataclass mı? Hangisi daha iyi?
   - [ ] HTTP client → `httpx` mi `urllib` mi? Svix hangisini kullanıyor?
   - [ ] Webhook verification → timing-safe compare, edge case'ler
   - [ ] Pagination → generator pattern aynı mı?
   - [ ] Error handling → exception hierarchy
   - [ ] Type hints → `TypedDict`, `Protocol`, generics kullanımı
   - [ ] `__init__.py` exports → ne export ediyor?
   - [ ] `py.typed` → PEP 561 compliance
   - [ ] CLI integration → var mı?

3. **Node.js SDK de Svix'ten çevrilmedi — sadece pattern olarak kullanıldı**
   - Aynı kontrol Node.js için de yapılabilir
   - Ama Python öncelik

4. **Dosya bazlı kontrol listesi:**

| HookSniff Dosyası | Svix Karşılığı | Kontrol |
|---|---|---|
| `hooksniff/client.py` | `svix/client.py` | Config, constructor pattern |
| `hooksniff/request.py` | `svix/api.py` veya `http_client.py` | HTTP handling, retry logic |
| `hooksniff/webhook.py` | `svix/webhooks.py` | Signature verification edge cases |
| `hooksniff/pagination.py` | `svix/pagination.py` | Iterator pattern |
| `hooksniff/models.py` | `svix/models/` | Type definitions, serialization |
| `hooksniff/exceptions.py` | `svix/exceptions.py` | Error hierarchy |
| `hooksniff/resources/*.py` | `svix/api/*.py` | Resource method signatures |

5. **Bilinen potansiyel eksiklikler (şu anki SDK'da):**
   - [ ] Async/await desteği yok (Svix'te olabilir)
   - [ ] `httpx` yerine `urllib` kullanılıyor (daha basit ama daha az modern)
   - [ ] Pydantic yerine dataclass (daha hafif ama daha az validasyon)
   - [ ] Type stubs (.pyi) yok
   - [ ] `__all__` exports eksik olabilir
   - [ ] Custom `fetch` (HTTP client injection) desteği yok
   - [ ] Rate limit header parsing eksik (429'da `Retry-After` okunuyor ama expose edilmiyor)
   - [ ] Streaming/SSE desteği yok
   - [ ] JSDoc/docstring examples eksik

---

## 🔄 Svix'ten Çevrilmesi Gereken Tüm SDK'lar

| SDK | Svix Repo | Durum |
|---|---|---|
| Python | `svix/svix-python` | ⬜ Çevrilecek |
| Go | `svix/svix-go` | ⬜ Çevrilecek |
| Rust | `svix/svix-rust` | ⬜ Çevrilecek |
| Ruby | `svix/svix-ruby` | ⬜ Çevrilecek |
| Java | `svix/svix-libs` (java/) | ⬜ Çevrilecek |
| Kotlin | `svix/svix-libs` (kotlin/) | ⬜ Çevrilecek |
| PHP | `svix/svix-php` | ⬜ Çevrilecek |
| C# | `svix/svix-dotnet` | ⬜ Çevrilecek |
| Swift | `svix/svix-swift` | ⬜ Çevrilecek |
| Elixir | `svix/svix-elixir` | ⬜ Çevrilecek |

---

## 📋 Her SDK İçin Takip Edilecek Adımlar

1. Svix kaynak kodunu GitHub'dan oku
2. HookSniff API endpoint'lerine göre uyarla
3. Svix branding kaldır (svix_ → hooksniff_, webhook-id header'ları)
4. Mevcut HookSniff resource'ları ile eşle
5. Test yaz (webhook verify, pagination, retry, error handling)
6. pyproject.toml / Cargo.toml / go.mod güncelle
7. README yaz
8. Commit + push
9. `.ai-context/sdk-roadmap/STATUS.md` güncelle

---

## 📝 Notlar

- Svix open-source: https://github.com/svix/svix-libs (tüm SDK'lar tek repo'da olabilir)
- Svix Python: `pip install svix` — mevcut paketi inceleyebiliriz
- HookSniff API = Svix API'nin büyük kısmı ile uyumlu ama bazı farklılıklar var (admin, billing, teams)
- Svix'te olmayan endpoint'ler için mevcut kodu koru
