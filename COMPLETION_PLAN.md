# 🪝 HookRelay — Kapsamlı Tamamlama Planı
> Oluşturulma: 2026-05-06
> Hedef: Tüm eksik panelleri, hataları ve eksik özellikleri tamamla

---

## Faz 1: Mevcut Hataları Düzelt (Öncelik)
- [ ] Billing sayfası: Duplicate `const API` tanımı → sil
- [ ] Landing page: Business plan fiyatı $199 → $149
- [ ] Billing: Mock fatura verisi → gerçek API'den çek
- [ ] Logs/Endpoints: Tekrarlanan StatusBadge → ortak component

## Faz 2: Settings API Endpoint'leri
- [ ] `PUT /v1/auth/profile` — İsim ve email güncelleme
- [ ] `PUT /v1/auth/password` — Şifre değiştirme
- [ ] `GET /v1/auth/me` — Mevcut kullanıcı bilgisi

## Faz 3: Admin Paneli (Backend)
- [ ] `GET /v1/admin/users` — Tüm kullanıcıları listele
- [ ] `GET /v1/admin/users/:id` — Kullanıcı detayı
- [ ] `PUT /v1/admin/users/:id/plan` — Plan değiştir
- [ ] `PUT /v1/admin/users/:id/status` — Banla/aktif et
- [ ] `GET /v1/admin/stats` — Sistem geneli istatistikler
- [ ] `GET /v1/admin/revenue` — Gelir takibi
- [ ] Admin middleware — sadece admin kullanıcılar erişebilir

## Faz 4: Admin Paneli (Frontend)
- [ ] `/admin` layout — ayrı sidebar, ayrı auth guard
- [ ] `/admin` ana sayfa — sistem istatistikleri
- [ ] `/admin/users` — kullanıcı listesi + arama/filtre
- [ ] `/admin/users/[id]` — kullanıcı detay sayfası
- [ ] `/admin/revenue` — gelir dashboard'u
- [ ] `/admin/system` — sistem sağlık durumu

## Faz 5: Team Management
- [ ] `teams` tablosu (PostgreSQL migration)
- [ ] `team_members` tablosu (rol ile)
- [ ] `POST /v1/teams` — takım oluştur
- [ ] `POST /v1/teams/:id/invite` — üye davet et
- [ ] `GET /v1/teams/:id/members` — üyeleri listele
- [ ] `DELETE /v1/teams/:id/members/:uid` — üye çıkar
- [ ] Dashboard: team sayfası

## Faz 6: API Dokümantasyonu
- [ ] utoipa ekle (Cargo.toml)
- [ ] Route'lara OpenAPI attribute'ları ekle
- [ ] Swagger UI endpoint'i (`/docs/swagger`)
- [ ] OpenAPI spec dosyası oluştur

## Faz 7: Bildirim Sistemi
- [ ] `notifications` tablosu
- [ ] `GET /v1/notifications` — bildirimleri listele
- [ ] `PUT /v1/notifications/:id/read` — okundu işaretle
- [ ] Dashboard: notification bell + dropdown

## Faz 8: GitHub'a Güncelle
- [ ] Tüm değişiklikleri commit et
- [ ] Push et
- [ ] CI/CD kontrol et

## Faz 9: Final Kontrol
- [ ] Tüm sayfaları test et
- [ ] Eksik import'ları kontrol et
- [ ] TypeScript hatalarını düzelt
- [ ] Rust derleme hatalarını düzelt
