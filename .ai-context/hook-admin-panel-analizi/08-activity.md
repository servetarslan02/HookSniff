# 08 — Activity (Audit Log)

**Dosya:** `dashboard/src/app/[locale]/admin/activity/page.tsx`  
**Satır:** ~250  
**Amaç:** Tüm admin aksiyonlarını log olarak gösterme

---

## Sayfada Ne Var?

### Başlık
- "Activity Log" + açıklama
- Geri linki → `/admin`

### Action Filter
- Dropdown: All Actions + 11 aksiyon tipi
- Sayfa bilgisi: "Showing X to Y of Z"

### Tablo (Desktop — 5 kolon)
| Kolon | Genişlik | İçerik |
|-------|----------|--------|
| Action | col-span-3 | İkon + renkli badge |
| Resource | col-span-2 | Type + ID (truncated) |
| Admin | col-span-2 | Customer ID |
| Timestamp | col-span-2 | Türkçe format (dd.mm.yyyy HH:mm) |
| Details | col-span-3 | JSON (pre) + IP adresi |

### Pagination
- 20/sayfa
- "Page X / Y" bilgisi
- Previous/Next butonları

### Empty State
- 📋 ikonu + "No activity" mesajı

---

## Desteklenen Aksiyonlar

| Aksiyon | İkon | Renk |
|---------|------|------|
| LOGIN | 🔑 | Mavi |
| REGISTER | 👤 | Yeşil |
| ENDPOINT_CREATE | ➕ | Emerald |
| ENDPOINT_DELETE | 🗑️ | Kırmızı |
| ENDPOINT_UPDATE | ✏️ | Amber |
| API_KEY_CREATE | 🔐 | Mor |
| API_KEY_DELETE | 🗑️ | Kırmızı |
| IMPERSONATE | 👁️ | Turuncu |
| PASSWORD_CHANGE | 🔒 | Sarı |
| 2FA_ENABLE | 🛡️ | Yeşil |
| 2FA_DISABLE | 🛡️ | Kırmızı |

---

## Kullanılan Sistemler

| Sistem | Amaç |
|--------|------|
| `adminApi.getAuditLogs()` | Audit log listesi — GET /admin/audit-logs |
| `ACTION_COLORS` map | Renkli badge'ler |
| `ACTION_ICONS` map | Emoji ikonlar |
| `KNOWN_ACTIONS` array | Filtre seçenekleri |
| `useTranslations('admin')` | i18n |

## API Çağrıları

```typescript
const data = await adminApi.getAuditLogs(token, {
  limit: perPage,                    // 20
  offset: (page - 1) * perPage,      // offset-based pagination
  action: actionFilter || undefined,  // filtre
});
```

## State

```typescript
const [entries, setEntries] = useState<AuditLogEntry[]>([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(true);
const [actionFilter, setActionFilter] = useState('');
const [error, setError] = useState<string | null>(null);
```

---

## 🔴 Kritik Sorunlar

1. **Audit log silinemez** — Admin kendi izlerini silebilir mi? Bu bir güvenlik açığı olabilir. Immutable audit log olmalı.

2. **IP adresi gösteriliyor** — GDPR uyumluluğu için IP maskelenmeli.

## 🟡 Orta Seviye Sorunlar

3. **Action filtresi hardcoded** — `KNOWN_ACTIONS` array'i sabit. Yeni action eklenince kod değişmeli.

4. **Details JSON.stringify ile gösteriliyor** — Büyük detaylar DOM'u yavaşlatabilir.

5. **Pagination offset-based** — `offset: (page - 1) * perPage` — büyük dataset'lerde yavaş. Cursor-based olmalı.

6. **Tarih filtresi yok** — Sadece action filtresi, tarih aralığı yok.

7. **Export özelliği yok** — Audit log CSV/JSON olarak indirilemiyor.

8. **Detay modal'ı yok** — Sadece tablo satırı, tıklayınca detay açılmıyor.

## ✅ Olumlu

- 11 aksiyon tipi, her biri ikon + renk
- Action filtreleme
- Pagination
- IP adresi gösterimi
- JSON detay gösterimi
- Loading spinner
- Error state + retry
