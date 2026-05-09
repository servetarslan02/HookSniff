# .ai-context — AI Session Memory

Bu klasör AI助手 tarafından oturum bilgilerini korumak için kullanılır.
Tüm dosyalar GitHub'da saklanır — workspace silinse bile korunur.

## Klasör Yapısı

```
.ai-context/
├── MEMORY.md              ← Uzun vadeli hafıza (ana oturum)
├── NEXT_SESSION.md        ← Sonraki oturum planı
├── ONBOARDING.md          ← Yeni oturum rehberi
│
├── audit/                 ← Kod denetim ve sistem analiz raporları
│   ├── AUDIT_REPORT_2026-05-08.md
│   ├── AUDIT_REPORT_2026-05-09.md
│   ├── CODEBASE_AUDIT.md
│   ├── CODEBASE_REVIEW_2026-05-09.md
│   ├── FULL_SYSTEM_AUDIT.md
│   ├── SYSTEM_ANALYSIS.md
│   ├── SECURITY_TRUST_REPORT.md
│   └── DASHBOARD_ISSUES.md
│
├── mobile/                ← Mobil uygulama planları
│   ├── MASTER_PLAN.md
│   ├── DECISIONS.md
│   ├── APP_AUDIT.md
│   ├── PERFORMANCE.md
│   └── RESOURCES.md
│
├── sdk/                   ← SDK strateji ve rehberler
│   ├── STRATEGY.md
│   ├── AUDIT.md
│   ├── PUBLISH_GUIDE.md
│   └── MANAGEMENT_RESEARCH.md
│
├── market/                ← Pazar, rekabet, müşteri analizi
│   ├── COMPETITIVE_ANALYSIS.md
│   ├── CUSTOMER_INSIGHTS.md
│   ├── MARKET_RESEARCH.md
│   ├── MASTER_RECOMMENDATIONS.md
│   ├── PRODUCT_IMPROVEMENTS.md
│   ├── FEATURE_PLAN.md
│   └── RESOURCES.md
│
├── logs/                  ← Günlük oturum logları
│   ├── 2026-05-08.md
│   ├── 2026-05-09.md
│   ├── 2026-05-10.md
│   └── 2026-05-08-review-notes.md
│
├── strategy/              ← Strateji raporları (31 dosya)
│   ├── 01-launch/
│   ├── 02-growth/
│   ├── 03-product/
│   ├── 04-security/
│   ├── 05-business/
│   ├── 06-analytics/
│   └── 07-legal/
│
└── README.md              ← Bu dosya
```

## Yeni Oturumda İlk Okunacak

1. **`MEMORY.md`** — Proje durumu, servisler, oturum geçmişi
2. **`NEXT_SESSION.md`** — Öncelikli yapılacaklar
3. **`ONBOARDING.md`** — Genel rehber

## Hafıza Akışı

```
Oturum başı:
  git pull → MEMORY.md oku → NEXT_SESSION.md oku → devam et

Oturum sırasında:
  Değişiklik yap → MEMORY.md/NEXT_SESSION.md güncelle

Oturum sonunda:
  git add .ai-context/ && git commit && git push
```
