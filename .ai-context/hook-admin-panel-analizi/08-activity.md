# 08 — Activity (Audit Log)

**Dosya:** `dashboard/src/app/[locale]/admin/activity/page.tsx`  
**Satır:** ~250  
**Amaç:** Tüm admin aksiyonlarını log olarak gösterme

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

## Tablo Kolonları (Desktop)
| Kolon | Genişlik | İçerik |
|-------|----------|--------|
| Action | col-span-3 | İkon + renkli badge |
| Resource | col-span-2 | Type + ID (truncated) |
| Admin | col-span-2 | Customer ID |
| Timestamp | col-span-2 | Türkçe format |
| Details | col-span-3 | JSON (pre) + IP adresi |

## Filtreleme
- Action bazlı dropdown
- "All Actions" varsayılan
- Sayfa başına 20 kayıt

## Pagination
- "Showing X to Y of Z" bilgisi
- Previous/Next butonları

## API Çağrıları
```typescript
const data = await adminApi.getAuditLogs(token, {
  limit: perPage,
  offset: (page - 1) * perPage,
  action: actionFilter || undefined,
});
```

## State
```typescript
const [entries, setEntries] = useState<AuditLogEntry[]>([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
const [actionFilter, setActionFilter] = useState('');
```

## Empty State
- �📋 ikonu + "No activity" mesajı
