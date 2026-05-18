# 🔄 HookSniff — Workflow & Versiyonlama Kuralları

> **Oluşturulma:** 2026-05-11 22:35 GMT+8
> **Kural:** Tüm agentlar bu dosyaya uymak zorundadır.

---

## 📌 Versiyonlama Stratejisi

### Semver Kullanımı
```
MAJOR.MINOR.PATCH-prerelease
  │     │     │       │
  │     │     │       └── beta.1, beta.2, rc.1, rc.2
  │     │     └── Hata düzeltmeleri, audit fix'leri
  │     └── Yeni özellikler (yeni modeller, yeni endpoint'ler)
  └── Breaking changes (API değişiklikleri, silinen endpoint'ler)
```

### Aşama → Versiyon Eşleştirmesi

| Aşama | Versiyon | Ne Zaman | Publish? |
|-------|----------|----------|----------|
| Aşama 1.1 | v0.3.0-beta.1 | Eksik modeller tespit edildi | ❌ |
| Aşama 1.2 | v0.3.0-beta.2 | 148 schema tamamlandı | ❌ |
| Aşama 1.3 | v0.3.0-beta.3 | SDK regen + audit fix | ❌ |
| Aşama 1.4 | v0.3.0-rc.1 | SDK kalite kontrol + test | ✅ Beta publish |
| Aşama 1.5 | v0.3.0-rc.2 | Final düzeltmeler | ✅ RC publish |
| Aşama 2.0 | v0.3.0 | Final release | ✅ Full publish |

### Kural: Ne Zaman Publish?

```
⚠️ DURUM: Şu an kullanıcı yok. Strateji buna göre ayarlandı.

❌ Publish ETME:
  - Schema değişikliği (openapi.yaml düzenleme)
  - SDK regeneration (openapi-generator ile yeniden üretme)
  - Audit fix (required field ekleme, type düzeltme)
  - Dokümantasyon değişikliği
  - Test ekleme
  - Henüz kalite kontrol yapılmadıysa

✅ Publish ET:
  - Kalite kontrol tamamlandıktan sonra (Aşama 1.4+)
  - Kullanıcı yokken breaking change serbest → minor bump yeterli
  - Kullanıcı olunca: breaking change → major bump
```

### Kullanıcı Yokken Özel Kurallar
- Version bump agresif olabilir (0.3.0 → 0.4.0 → 0.5.0 sorun değil)
- Breaking change endişesi yok
- Hızlı iterate et → publish et → geri bildirim al
- Kalite kontrol sonrası tek seferde publish yeterli

---

## 🔧 SDK Güncelleme İş Akışı

### Adım 1: Schema Değişikliği
```bash
# openapi.yaml'da değişiklik yap
# Version bump: YOK (henüz publish yok)
git add docs/openapi.yaml && git commit -m "feat(schema): ..."
```

### Adım 2: SDK Regeneration
```bash
# openapi-generator ile tüm SDK'ları regenerate et
# Version bump: YOK (henüz publish yok)
git add sdks/ && git commit -m "feat(sdk): regenerate ..."
```

### Adım 3: Audit & Fix
```bash
# openapi.yaml'da düzeltme yap
# SDK'ları tekrar regenerate et
# Version bump: YOK (henüz publish yok)
git add . && git commit -m "fix(sdk): ..."
```

### Adım 4: Kalite Kontrol (Aşama 1.4)
```bash
# SDK'ları test et, kontrol et
# Version bump: 0.3.0-beta.X → 0.3.0-rc.1
# Beta publish yap
```

### Adım 5: Final Publish (Aşama 2.0)
```bash
# Version bump: 0.3.0-rc.X → 0.3.0
# Full publish yap
```

---

## 📦 Publish Komutları (Referans)

### Beta Publish
```bash
# Node.js
npm publish --tag beta

# Python
python setup.py sdist bdist_wheel
twine upload --repository testpypi dist/*

# Go
git tag v0.3.0-beta.3
git push origin v0.3.0-beta.3

# Ruby
gem build hooksniff-sdk.gemspec
gem push hooksniff-sdk-0.3.0.beta.3.gem

# C#
dotnet pack -p:PackageVersion=0.3.0-beta.3
dotnet push *.nupkg --source nuget.org

# Rust
cargo publish

# PHP
composer publish

# Swift
# GitHub release ile
```

### Final Publish
```bash
# Yukarıdaki komutlar ama versiyon: 0.3.0 (prerelease yok)
```

---

## 🤖 Subagent Yönetimi

### Paralel İş Bölme Kuralı
```
İş > 3 SDK → Subagent'lere böl
İş ≤ 3 SDK → Tek agent yapar

Örnek: 11 SDK regeneration
  Subagent 1 → Node + Python + Go + Java (4 SDK)
  Subagent 2 → Ruby + C# + Kotlin (3 SDK)
  Subagent 3 → PHP + Rust + Swift + Elixir (4 SDK)
```

### Subagent Akışı
1. Ana agent işi parçalara böler
2. Subagent'leri spawn eder (sessions_yield ile)
3. Subagent'ler paralel çalışır
4. Biten sonuçları toplar
5. Tek commit ile kaydeder

### Bittikten Sonra
- Subagent bitince → Yeni işe ata veya diğerine yardım et
- Tüm subagent'ler bitince → Ana agent rapor verir

---

## 📋 Aşama Takibi

Her aşamanın sonunda:
1. ✅ Bu dosyada aşamayı işaretle
2. ✅ `SDK-PUBLISH-STATUS.md`'yi güncelle
3. ✅ `SESSION-PLAN.md`'yi güncelle
4. ✅ Git commit + push
5. ✅ Kullanıcıya rapor ver

---

## 🔍 Aşama Başlangıcı Araştırma Kuralı

**Her yeni aşamaya başlarken ZORUNLU:**

1. **İnternetten derin araştırma yap**
   - İlgili teknolojinin güncel sürümü
   - Best practices (en iyi uygulamalar)
   - Referans implementasyonlar (Svix, Stripe, Twilio SDK'ları)
   - Yaygın hatalar ve çözümleri
   
2. **Bulguları özetle**
   - `.ai-context/sdk/RESEARCH-{AŞAMA}.md` dosyasına kaydet
   - Hangi sürüm kullanılacak?
   - Hangi pattern takip edilecek?
   - Dikkat edilecek noktalar neler?

3. **Önce kullanıcıya göster**
   - Araştırmanın özetini paylaş
   - Onay al
   - Sonra uygulamaya başla

### Örnek Akış
```
Aşama 2 başlıyor →
  1. "Wrapper class araştırması yapıyorum..."
  2. Svix Node.js SDK'sını incele
  3. Güncel node-fetch/undici sürümlerini kontrol et
  4. TypeScript best practices araştır
  5. Özet çıkar → kullanıcıya göster
  6. Onay → uygula
```

---

## 🚨 Kritik Kurallar

1. **openapi.yaml'ı ASLA manuel publish etme** — Önce regenerate, sonra publish
2. **Farklı SDK'ları farklı version publish ETME** — Hepsi aynı version olmalı
3. **Beta/RC olmadan final publish ETME** — Kalite kontrol şart
4. **Breaking change varsa minor bump YAPMA** — Major bump yap
5. **Her schema değişikliği sonrası SDK regenerate ET** — Tutarsızlık olmasın

---

*Son güncelleme: 2026-05-11 22:35 GMT+8*
