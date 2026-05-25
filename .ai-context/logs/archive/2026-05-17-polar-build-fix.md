# 2026-05-17 — Polar Build Fix (gcloud)

## Sorun
Google Cloud Build `hooksniff-api` derleme hatası — 6 Rust error:
- `E0449`: `pub` visibility trait impl içinde yasak
- `E0407`: `update_product_price` ve `sync_prices_to_polar` trait'te yok
- `E0599`: method `PolarProvider` struct'ında bulunamıyor

## Kök Neden
`api/src/billing/polar.rs` dosyasında `update_product_price` ve `sync_prices_to_polar` methodları
`impl PaymentProviderImpl for PolarProvider` bloğunun İÇİNE yazılmıştı, ama bu methodlar
`PaymentProviderImpl` trait tanımında yok. Trait impl'ına trait'te olmayan method eklenemez.

## Çözüm
Bu iki method trait impl bloğundan çıkarıldı, ayrı bir `impl PolarProvider` bloğuna taşındı.

**Değişen dosya:** `api/src/billing/polar.rs`
- `impl PaymentProviderImpl for PolarProvider` bloğu → sadece trait methodları kaldı
- Yeni `impl PolarProvider` bloğu → `update_product_price` ve `sync_prices_to_polar`

## Sonraki Adımlar
- Cloud Build tetikle ve başarılı derleme doğrula
- Admin ayarları sayfasından fiyat senkronizasyonu test et
