# 🌐 Çıkış IP'leri (Outbound IPs)

> Sayfa: ❌ OLUŞTURULMALI
> Route: `/dashboard/outbound-ips`
> Backend: `api/src/routes/outbound_ips.rs` — mevcut
> İnceleme Tarihi: 2026-05-13

## Backend Durumu

### Mevcut Endpoint'ler
| Method | Route | Açıklama |
|--------|-------|----------|
| GET | `/v1/outbound-ips` | Çıkış IP listesi |

## Frontend Yapılacaklar

### Sayfa Yapısı
1. **IP Listesi** — Tüm çıkış IP'leri (tablo)
2. **Kopyalama** — Tek tek ve toplu kopyalama butonu
3. **Format Seçici** — CIDR, tekil IP, firewall rule formatı
4. **Bilgi Kartı** — "Bu IP'leri firewall whitelist'inize ekleyin" açıklaması

### Neden Önemli?
- Enterprise müşteriler webhook almak için IP whitelist yapar
- HookSniff'in hangi IP'lerden webhook gönderdiğini bilmeleri gerekir
- Svix ve Hookdeck bu bilgiyi dashboard'da gösteriyor

### Sidebar Ekleme
```typescript
// sections.config.items'a ekle:
{ name: t('outboundIps'), href: '/outbound-ips', icon: '🌐' }
```

### i18n Anahtarları (EN + TR)
- outboundIps, outboundIpsDesc, copyAll, copied, firewallNote, cidrFormat, singleIpFormat

### Öncelik: 🔴 KRİTİK — Enterprise müşteriler firewall whitelist yapamıyor
