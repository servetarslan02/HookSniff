# 2026-05-21 — Invoice (Fatura) Sistemi Fix

## Sorun
Müşteri satın alma yaptığında billing sayfasının altındaki fatura listesinde Polar'dan oluşturulan faturalar görünmüyordu.

## Kök Neden — 3'lü Sorun

### 1. Provider Default 'stripe'
- `invoices` tablosunda `provider` kolonunun default değeri `'stripe'`
- Polar webhook handler fatura oluştururken `provider` belirtmiyordu
- Sonuç: Tüm Polar faturaları `provider = 'stripe'` olarak kaydediliyordu

### 2. Amount Yanlış Parse Ediliyor
- Polar order.completed event'inde `amount` alanı 100% indirim kuponu kullanınca `0` geliyor
- Gerçek ödenen miktar `total_amount` alanında
- Orijinal fiyat `subtotal_amount` alanında
- Fallback zinciri yoktu → `amount_cents: 0` kaydediliyordu

### 3. Invoice Number Kaydedilmiyor
- Polar'ın ürettiği fatura numarası (örn: `SERVET-ARSLAN-UDWXOAIHPR-0002`) kaydedilmiyordu
- `provider_invoice_id` alanı boş kalıyordu

## Yapılan Değişiklikler

### Backend (Rust)
| Dosya | Değişiklik |
|-------|-----------|
| `api/src/billing/polar.rs` | Amount fallback: `total_amount → net_amount → amount → subtotal_amount` |
| `api/src/billing/polar.rs` | `invoice_number` extraction from order data |
| `api/src/billing/provider.rs` | `WebhookResult::PaymentSucceeded`'a `invoice_number` field eklendi |
| `api/src/routes/billing/webhooks.rs` | Invoice INSERT: `provider`, `provider_invoice_id`, `paid_at` eklendi |
| `api/src/routes/billing/subscription.rs` | Coupon faturasına `provider` eklendi |
| `api/src/billing/iyzico.rs` | `invoice_number: None` eklendi |

### DB Düzeltmesi
- Mevcut 18 fatura `provider: 'stripe'` → `provider: 'polar'` güncellendi
- En son faturaya Polar invoice number eklendi

## Commit
`fde85005` — main branch'e push edildi

## Not
TEST100 kuponu ile test yapıldığı için `total_amount: 0`. Gerçek ödeme yapıldığında doğru miktar görünecek.
