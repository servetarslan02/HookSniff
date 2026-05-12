# 📋 Denetim Günlüğü (Audit Log)

> Sayfa: `dashboard/src/app/[locale]/dashboard/audit-log/page.tsx`
> Route: `/dashboard/audit-log`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- AuditEntry — Denetim kaydı
- Action icons map (17 farklı aksiyon)

### AuditEntry
- id, timestamp, actor, actor_email, action, resource_type, resource_id
- details, ip_address, user_agent

### Action Icons
| Aksiyon | İkon |
|---------|------|
| auth.login | 🔑 |
| auth.logout | 👋 |
| auth.register | 👤 |
| endpoint.create | 🔗 |
| endpoint.update | ✏️ |
| endpoint.delete | 🗑️ |
| apikey.create | 🔑 |
| apikey.rotate | 🔄 |
| apikey.delete | 🗑️ |
| webhook.send | 📦 |
| webhook.replay | 🔄 |
| team.invite | 👥 |
| team.remove | 👋 |
| settings.update | ⚙️ |
| billing.update | 💳 |
| schema.create | 📋 |
| portal.update | 🖼️ |

## Özellikler
- ✅ Sayfalama (50 kayıt/sayfa, has_more)
- ✅ Aksiyon filtresi
- ✅ Aksiyon ikonları
- ✅ Tarih/saat gösterimi
- ✅ IP ve User Agent
- ✅ Empty state
- ✅ Loading state

## Tespit Edilen Durumlar
### ✅ İyi Yönler
- 17 farklı aksiyon ikonu
- Sayfalama (load more pattern)
- Filtreleme
- Error handling (endpoint yoksa empty state)

### 🔴 Eksiklikler

### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **Session management** — Aktif oturum listesi ve sonlandırma
- **2FA zorunlu** — Admin kullanıcılar için 2FA zorunluluğu
- **IP whitelist** — Admin paneline erişim IP kısıtlaması
- **Login history** — Giriş denemeleri kaydı (başarılı/başarısız)
- **Anomali tespiti** — Olağandışı aktivite uyarısı
- **SSRF attempt log** — Güvenlik olaylarını izleme
- **Spoofing attempt log** — Sahte webhook tespit log'u
- **Replay attempt log** — Replay saldırı tespit log'u
- **Endpoint disable log** — Endpoint devre dışı kalma geçmişi
- **Support Agent erişim log** — Destek ekibi portal erişim kaydı (Svix ✅)
- **Quick filter** — Log listesinde tek tıkla filtre (Hookdeck ✅)
- Export (CSV/JSON)
- Tarih aralığı filtresi
- Actor bazlı filtreleme
- Resource bazlı filtreleme
- IP bazlı filtreleme
