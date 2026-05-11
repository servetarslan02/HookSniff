# 🏗️ HookSniff — Uygulama Planı (Implementation Plan)

> **Tarih:** 2026-05-12 02:00 GMT+8
> **Kaynak:** FINAL-IMPLEMENTATION-REPORT.md + ALL-FINDINGS-CLEAN.txt + 15 screenshot
> **Toplam madde:** 359 kalan iş (⬜)
> **Kural:** Her madde tek satır, numaralı, dosya yolu ile birlikte

---

## AŞAMA 1 — KRİTİK GÜVENLİK (19/22 tamamlandı ✅)

### 1.1 Edge & Dashboard Security
1. ✅ Edge middleware auth yok — Dashboard HTML herkese servis ediliyor → `dashboard/src/middleware.ts` ✅ YAPILDI
2. ✅ CSRF protection yok — POST/PUT/DELETE'de CSRF token yok → `dashboard/src/lib/api.ts` ✅ YAPILDI
3. ✅ In-memory rate limit default — production warning added — restart'ta kaybolur → `api/src/rate_limit.rs`
4. ✅ IP spoofing via X-Forwarded-For — rate limit bypass → `api/src/rate_limit.rs` ✅ YAPILDI
5. ✅ Staging default fallback passwords → `docker-compose.staging.yml` ✅ YAPILDI

### 1.2 Async Rust Kritik
6. ✅ `std::sync::Mutex` held across `.await` — production hang → `api/src/middleware/mod.rs` ✅ YAPILDI
7. ✅ Unbounded auth cache growth — memory leak, OOM → `api/src/middleware/mod.rs` ✅ YAPILDI
8. ✅ Argon2 (CPU-bound) in async without `spawn_blocking` — thread starvation → `api/src/auth/jwt.rs` ✅ YAPILDI

### 1.3 Worker Kritik
9. ✅ No idempotency — webhooks can be duplicated → `worker/src/main.rs` ✅ YAPILDI
10. ✅ No response body size limit — memory bomb → `worker/src/delivery/http.rs` ✅ YAPILDI

### 1.4 Database Kritik
11. ✅ `password_hash` column allows NULL — migration 005 — account takeover → `api/migrations/`
12. 🟡 Missing migration files — migration 005 added (password_hash NOT NULL), remaining embedded migrations need export
13. ✅ Hardcoded DB credentials — removed from backup-cron.sh → `api/migrations/`

### 1.5 Frontend Kritik
14. ✅ Silent API failures — 7+ sayfada boş `catch {}` → Health, Alerts, Search, Schemas, Templates, Portal, Routing ✅ YAPILDI
15. ✅ Error Boundary dashboard'da kullanılmamış → `dashboard/src/app/[locale]/dashboard/layout.tsx` ✅ YAPILDI
16. ✅ `router.push` navigations locale prefix içermiyor → Dashboard, Endpoints, Deliveries ✅ YAPILDI
17. ✅ Hardcoded locale list in regex → `dashboard/src/app/[locale]/dashboard/layout.tsx` ✅ YAPILDI
18. ✅ API Request Missing Authorization Header → `dashboard/src/app/[locale]/dashboard/health/page.tsx` ✅ YAPILDI
19. ✅ `credentials: 'include'` inside headers object (API Keys) → `dashboard/src/app/[locale]/dashboard/api-keys/page.tsx` ✅ YAPILDI

### 1.6 i18n Kritik
20. ✅ Admin sidebar tamamen İngilizce (12 metin × 5 sayfa) → Admin layout ✅ YAPILDI
21. ✅ No i18n in Webhook Builder → `dashboard/src/app/[locale]/dashboard/webhook-builder/page.tsx` ✅ YAPILDI
22. ✅ No i18n in Signature Verifier → `dashboard/src/app/[locale]/dashboard/signature-verifier/page.tsx` ✅ YAPILDI

---

## AŞAMA 2 — YÜKSEK GÜVENLİK & ASYNC (🟡 18 madde)

### 2.1 Async Rust Yüksek
23. 🟡 `reqwest::Client` created per-request — connection leak → `api/src/`, `worker/src/`
24. 🟡 Blocking file I/O in async context → `worker/src/`
25. 🟡 Unbounded mpsc channel in WebSocket → `api/src/ws/`
26. 🟡 Poisoned mutex panics crash server → `api/src/`

### 2.2 Crypto & Auth Yüksek
27. ✅ Argon2id parametreleri OWASP altı → 46 MiB → `api/src/auth/jwt.rs`
28. ✅ Admin authorization — JWT claim + server-side verify → `dashboard/src/app/[locale]/admin/layout.tsx`
29. 🟡 Playground token localStorage'da → `dashboard/src/app/[locale]/dashboard/playground/page.tsx`
30. 🟡 Playground token URL path'te → `dashboard/src/app/[locale]/dashboard/playground/page.tsx`

### 2.3 Rate Limiting Yüksek
31. 🟡 API-level rate limit middleware gap → `api/src/rate_limit.rs`
32. 🟡 API rate limit middleware gap — bazÄ± endpoint'ler atlanıyor → `api/src/rate_limit.rs`

### 2.4 Worker Yüksek
33. ✅ Zombie reaper increments attempt count without delivery → `worker/src/main.rs`
34. 🟡 No retry for DB commit failures → `worker/src/main.rs`
35. ✅ Email delivery uses blocking I/O in async → tokio::fs → `worker/src/delivery/mod.rs`
36. ✅ Email delivery creates new HTTP client per call → shared → `worker/src/delivery/mod.rs`
37. 🟡 Fan-out bug — target config not used → `worker/src/delivery/mod.rs`

### 2.5 Infrastructure Yüksek
38. 🟡 No rollback strategy — deploy başarısız olursa geri dönüş yok → `.github/workflows/deploy.yml`
39. 🟡 Hardcoded secrets in Helm values.yaml → `deploy/helm/values.yaml`
40. 🟡 Git history'de OTEL credentials — BFG ile temizlenmeli → Git history
41. 🟡 DATABASE_URL local credentials git history'de → Git history
42. ✅ DNS rebinding SSRF → validate_url_and_resolve() → `api/src/ssrf.rs`

### 2.6 Destructive Actions
43. ✅ Destructive action'larda confirmation yok → ConfirmDialog (Transforms, Notifications, Team) → Çeşitli sayfalar
44. 🟡 No i18n in API Importer (partial — admin pages done) → `dashboard/src/app/[locale]/dashboard/api-importer/page.tsx`

---

## AŞAMA 3 — ADMIN PANEL ÇEVİRİ (⬜ 50 madde)

### 3.1 Sidebar (Tüm Sayfalar)
45. ⬜ "Admin Panel" → "Yönetim Paneli"
46. ⬜ "HookSniff Management" → "HookSniff Yönetimi"
47. ⬜ "Overview" → "Genel Bakış"
48. ⬜ "Users" → "Kullanıcılar"
49. ⬜ "Revenue" → "Gelir"
50. ⬜ "System" → "Sistem"
51. ⬜ "Settings" → "Ayarlar"
52. ⬜ "Back to Dashboard" → "Panele Dön"
53. ⬜ "Logout" → "Çıkış Yap"
54. ⬜ "Switch to dark mode" → "Karanlık moda geç"
55. ⬜ "Switch to light mode" → "Açık moda geç"
56. ⬜ "Open sidebar" → "Yan menüyü aç"
57. ⬜ "Admin" badge → "Yönetici" (TÜM sayfalarda)

### 3.2 Overview Sayfası
58. ✅ "Admin Overview" → "Yönetici Genel Bakışı"
59. ✅ "Platform-wide metrics and recent activity" → "Platform genelinde metrikler ve son aktivite"
60. ✅ "No recent signups" → "Son kayıt yok"
61. ⬜ Document title → "HookSniff — Webhook Teslimat Servisi"
62. ⬜ Contrast fail: empty state text (2.54:1) → `text-gray-500`
63. ⬜ Contrast fail: subtitle text (2.54:1) → `text-gray-500`
64. ⬜ Contrast fail: logout butonu (2.54:1 light, 3.75:1 dark) → `text-gray-500`
65. ⬜ Dark mode toggle `type="submit"` → `type="button"`
66. ⬜ Mobil menü butonu `type="submit"` → `type="button"`
67. ⬜ "Plana Göre Kullanıcılar" kartı boş — placeholder grafik ekle
68. ⬜ SVG icon'larda `aria-label` eksik
69. ⬜ Emoji icon'lar `aria-hidden="true"` ile işaretlenmeli

### 3.3 Users Sayfası
70. ✅ Tablo başlıkları: Email→E-posta, Name→İsim, Status→Durum, Created→Oluşturulma, Actions→İşlemler
71. ✅ Butonlar: View→Görüntüle, Plan→Plan Değiştir, Ban→Yasakla
72. ✅ Badge'ler: free→Ücretsiz, active→Aktif, business→İş
73. ⬜ Tarih formatı MM/DD/YYYY → DD.MM.YYYY
74. ⬜ Zebra renklendirme ekle
75. ⬜ Hover efekti ekle
76. ⬜ `scope="col"` ekle header'lara
77. ⬜ Arama input label ekle
78. ⬜ Combobox label ekle
79. ⬜ Sayfalama ekle
80. ⬜ Kolon sıralama (sortable) ekle

### 3.4 Revenue Sayfası
81. ✅ "Revenue Dashboard" → "Gelir Paneli"
82. ✅ "Financial metrics and revenue breakdown" → "Finansal metrikler ve gelir dağılımı"
83. ✅ Grafik X ve Y ekseni etiketlerini ekle
84. ⬜ Pie chart legend ekle
85. ⬜ SVG `<title>` ve `<desc>` doldur
86. ⬜ Mobile responsive düzelt (375px)
87. ⬜ Sidebar offset mobile'da düzelt
88. ⬜ Chart container responsive yap
89. ✅ Para birimi $ → ₺ (locale-aware)
90. ⬜ Tarih aralığı seçici ekle
91. ⬜ Manuel refresh butonu ekle
92. ⬜ Boş state placeholder grafik/ikon ekle
93. ⬜ H1 hierarchy düzelt (ikinci H1 → H2)

### 3.5 System Sayfası
94. ⬜ Sağlık kontrolü API'sini düzelt (4 servis "Checking..." takılıyor)
95. ✅ "Monitor infrastructure services and system status" → "Altyapı hizmetlerini ve sistem durumunu izleyin"
96. ⬜ Tarih formatı → `Intl.DateTimeFormat('tr-TR')`
97. ✅ Servis rolleri: Database→Veritabanı, Cache→Önbellek, Monitoring→İzleme, Queue→Kuyruk
98. ⬜ Loading spinner ekle
99. ⬜ Retry butonu ekle
100. ⬜ Hata detayı ekle (banner'a)
101. ⬜ ARIA live region ekle
102. ⬜ Altyapı tablosu header ekle
103. ⬜ Uyarı banner'ı layout düzelt

### 3.6 Settings Sayfası
104. ✅ "Settings" → "Ayarlar"
105. ✅ "Configure platform-wide defaults and limits" → "Platform genelinde varsayılan ayarları ve limitleri yapılandırın"
106. ✅ "Default Plan" → "Varsayılan Plan"
107. ✅ "Free" → "Ücretsiz"
108. ✅ "Max Endpoints" → "Maks. Uç Nokta"
109. ✅ "Max Webhooks/Month" → "Maks. Webhook/Ay"
110. ✅ "Rate Limit (req/min)" → "Hız Limiti (istek/dk)"
111. ✅ "Retention (days)" → "Süre (gün)"
112. ✅ "Max Retry Attempts" → "Maks. Tekrar Deneme Sayısı"
113. ✅ "Failed to save settings" → "Ayarlar kaydedilemedi"
114. ⬜ Toggle'lara `role="switch"` ve `aria-checked` ekle
115. ⬜ Label'ları `htmlFor` ile input'lara bağla
116. ⬜ Number input'lara min/max sınırları ekle
117. ⬜ Toggle butonları `type="submit"` → `type="button"`
118. ⬜ Input stillerini tutarlı yap (py-2 vs py-3)
119. ⬜ Dark mode focus ring stillerini düzelt
120. ⬜ Success feedback mekanizması ekle
121. ⬜ Loading state (spinner) ekle
122. ⬜ Zorunlu alan işaretleri (*) ekle

### 3.7 Admin API & Genel
123. ⬜ `/admin/settings` endpoint'i backend'de ekle
124. ✅ Revenue response format uyumsuzluğunu düzelt
125. ⬜ Tablet layout düzelt (sayfa tamamen boş)
126. ✅ Heading hierarchy düzelt (2 tane h1)
127. ⬜ ARIA landmarks ekle
128. ⬜ Skip-to-content link'i ekle
129. ⬜ Border radius inconsistency düzelt
130. ⬜ Save button color mismatch düzelt

---

## AŞAMA 4 — FRONTEND DASHBOARD (⬜ 35 madde)

### 4.1 Kritik Frontend Fixler
131. ⬜ Silent API failures düzelt — tüm catch bloklarına error state + retry ekle
132. ⬜ Error Boundary dashboard layout'a ekle
133. ⬜ `router.push` locale prefix ekle (3 sayfa)
134. ⬜ Hardcoded locale regex düzelt
135. ⬜ Health page Authorization header ekle
136. ⬜ API Keys createKey credentials düzelt
137. ⬜ No retry logic for transient errors (502, 503, 504) → `api.ts`
138. ⬜ 401 refresh loop risk — shared refresh promise → `api.ts`

### 4.2 Team & Permission
139. ⬜ Owner can demote themselves — guard ekle → `team/page.tsx`
140. ⬜ No role-based permission checks → `team/page.tsx`
141. ⬜ Team member removal no confirmation → `team/page.tsx`

### 4.3 i18n Eksikler
142. 🟡 Hardcoded strings in 14+ dashboard pages (admin pages done) → Health, Alerts, Rate Limiting, SSO, Audit Log, Custom Domain, Retry Policy, Routing, Schemas, Templates, Portal
143. ⬜ ConfirmDialog hardcoded: "Confirm", "Cancel", "Processing..." → `ConfirmDialog.tsx`
144. ⬜ EmailVerificationBanner hardcoded → `EmailVerificationBanner.tsx`
145. ⬜ SdkTabs hardcoded: "Copy", "Copied!" → `SdkTabs.tsx`
146. ⬜ `getErrorMessage` raw English döndürüyor → `errors.ts`
147. ⬜ Toast messages translated değil → Çeşitli sayfalar

### 4.4 Component Fixler
148. ✅ ConfirmDialog dark mode ekle → `ConfirmDialog.tsx`
149. ⬜ Toast info variant dark mode düzelt → `Toast.tsx`
150. ⬜ Toast warning type ekle → `Toast.tsx`
151. ⬜ Toast dismiss button ekle → `Toast.tsx`
152. ⬜ Toast `role="alert"` ekle → `Toast.tsx`
153. ⬜ Loading states standardize et (SkeletonCard/LoadingSpinner) → Çeşitli
154. ⬜ EmptyState component kullan → Çeşitli
155. ⬜ Raw `fetch()` → `apiFetch()` dönüşümü → Health, API Keys, Search, Audit Log, Custom Domain, SSO, Portal, Playground
156. ⬜ Billing useRouter wrong module düzelt → `billing/page.tsx`
157. ⬜ `billingApi` duplicate `getInvoices` düzelt → `api.ts`
158. ⬜ `keyCount` broken pluralization düzelt → `api-keys/page.tsx`
159. ⬜ `weeklyDigest` state local-only — API'ye gönder → `settings/page.tsx`

### 4.5 Sidebar İyileştirme
160. ⬜ Sidebar 26 item gruplama (Core, Tools, Advanced, Account)
161. ⬜ Sidebar active state `startsWith` matching
162. ⬜ Schemas, Templates, Portal sidebar linkleri ekle
163. ⬜ Sidebar bottom controls overlap düzelt

### 4.6 CSS & Responsive
164. ⬜ 13 tablo `overflow-x-auto` ekle (docs, alternatives, privacy)
165. ⬜ 8 `<pre>` bloğu `overflow-x-auto` ekle
166. ⬜ `vh` → `dvh` mobilde (Deliveries, Logs, Blog)
167. ⬜ Grid layout mobilde kırılıyor (Portal page)
168. ⬜ Signature comparison not constant-time → `signature-verifier/page.tsx`

### 4.7 Error Handling
169. ⬜ No offline detection → `api.ts`
170. ⬜ ErrorBoundary console.log only → Sentry entegrasyonu
171. ⬜ ErrorBoundary shows raw error message → user-friendly
172. ⬜ Console.log/Debug kalıntıları temizle → Portal, Store, Email

---

## AŞAMA 5 — DATABASE (⬜ 22 madde)

### 5.1 Schema Fixler
173. ⬜ `password_hash` column NOT NULL yap
174. ⬜ Missing migration files (13 SQL) — embedded Rust'tan export et
175. ⬜ Hardcoded DB credentials temizle
176. ⬜ TOTP secret exposure — column encryption ekle

### 5.2 Foreign Key Fixler
177. ⬜ `dead_letters` FK on `delivery_id`
178. ⬜ `webhook_queue` FK on `delivery_id`
179. ⬜ `teams.owner_id` ON DELETE behavior
180. ⬜ `installed_agents` ON DELETE CASCADE
181. ⬜ `fanout_rules.target_ids` UUID array FK validation

### 5.3 Index Eksikler
182. ⬜ `deliveries(endpoint_id, status)` composite index
183. ⬜ `deliveries(created_at)` time-range index
184. ⬜ `delivery_attempts(created_at)` index
185. ⬜ `dead_letters(endpoint_id)` index
186. ⬜ `payment_transactions.amount_cents` INT → BIGINT

### 5.4 Cleanup & Maintenance
187. ⬜ `idempotency_keys` automatic cleanup
188. ⬜ `password_reset_tokens` expires_at index
189. ⬜ `refresh_tokens` expires_at index
190. ⬜ `email_verification_tokens` expires_at index
191. ⬜ `notifications` cleanup strategy
192. ⬜ İki migration sistemi senkron et
193. ⬜ Unbounded queries — LIMIT/OFFSET ekle
194. ⬜ `sso_configs.client_secret_encrypted` encryption verify

---

## AŞAMA 6 — İ18N & ÇEVİRİ (⬜ 13 madde)

### 6.1 Dashboard i18n
195. ⬜ Hardcoded strings in 14+ pages (Aşama 4.3'te)
196. ⬜ Blog, changelog, docs content İngilizce — /tr/ altında
197. ⬜ Alternatives sayfaları (8 sayfa) tamamen İngilizce
198. ⬜ getStarted.* section — 56 key eksik
199. ⬜ onboarding.* section — 32 key eksik

### 6.2 Email i18n
200. ⬜ Email template'leri sadece İngilizce → `api/src/email.rs`
201. ⬜ Email retry yok → `api/src/email.rs`
202. ⬜ Dead-letter queue yok failed emails için
203. ⬜ Email-level rate limiting yok
204. ⬜ Billing/Invoice email template'i yok
205. ⬜ Webhook Success email template'i yok
206. ⬜ Email template'leri mobile-optimized değil

### 6.3 Content
207. ⬜ Landing page zero social proof → `dashboard/src/app/[locale]/page.tsx`

---

## AŞAMA 7 — ERİŞİLEBİLİRLİK & SEO (⬜ 27 madde)

### 7.1 Kritik A11Y
208. ⬜ 23 yerde `<label>` + `<input>` `htmlFor`/`id` eşleşmesi eksik
209. ⬜ `aria-live` region hiç yok
210. ⬜ Icon-only butonlarda `aria-label` eksik (close, copy, pagination)
211. ⬜ Toggle'larda `role="switch"` yok
212. ⬜ Status dots text alternative yok
213. ⬜ Sidebar links `aria-current` yok
214. ⬜ Skip-to-content link'i yok
215. ⬜ `<div onClick>` keyboard erişilebilirliği yok (10+ yer)
216. ⬜ Modal close button `aria-label` eksik
217. ⬜ Pagination `aria-label` eksik
218. ⬜ Copy button `aria-label` eksik
219. ⬜ Heading hierarchy tutarsız
220. ⬜ Grafik SVG `<title>` ve `<desc>` boş
221. ⬜ Forms `aria-describedby` eksik
222. ⬜ Alert element boş render edilmiş
223. ⬜ Renk bağımlı bilgi (System sayfası)

### 7.2 Yüksek A11Y
224. ⬜ Contrast fail: `text-gray-400` empty state'lerde
225. ⬜ Contrast fail: logout butonu dark mode
226. ⬜ SkeletonCard/SkeletonTable dark mode desteği yok
227. ⬜ Form input autoComplete eksik (password fields)

### 7.3 SEO
228. ⬜ 71 sayfada metadata eksik (title, description)
229. ⬜ Document title Türkçe değil (Admin)
230. ⬜ JSON-LD structured data eksik
231. ⬜ Open Graph tags eksik
232. ⬜ Deprecated X-XSS-Protection header
233. ⬜ Missing Strict-Transport-Security header (bazı sayfalar)
234. ⬜ `dangerouslySetInnerHTML` (4 kullanım) — DOMPurify ekle

---

## AŞAMA 8 — GDPR & UYUMLULUK (⬜ 7 madde)

235. ⬜ Kayıt'ta consent mekanizması yok (ToS/Privacy Policy checkbox)
236. ⬜ Consent records tablosu yok
237. ⬜ Cookie consent banner yok
238. ⬜ Withdrawal of consent mekanizması yok
239. ⬜ `source_ip` ve `request_headers` deliveries'da PII — consent olmadan toplanıyor
240. ⬜ `user_agent` audit_log'da potentially excessive
241. ⬜ Data retention policy otomasyonu yok

---

## AŞAMA 9 — PERFORMANS (⬜ 5 madde)

242. ⬜ Recharts ~400KB eagerly loaded — lazy load → `dashboard/src/app/[locale]/dashboard/page.tsx`
243. ⬜ Tüm sayfalar 'use client' CSR — SSR/SSG düşün
244. ⬜ Caching yok, prefetching yok
245. ⬜ Suspense boundary eksik (29 sayfa)
246. ⬜ Endpoint detail fetches all endpoints — N+1 query

---

## AŞAMA 10 — PAYMENTS & BILLING (⬜ 13 madde)

247. ⬜ Subscription status hardcoded to "active" → `billing.rs`
248. ⬜ Pricing page shows different limits than backend
249. ⬜ Provider switching doesn't cancel old subscription
250. ⬜ Polar.sh `create_customer_portal` is a stub
251. ⬜ No chargeback/refund handling
252. ⬜ Admin revenue calculation is estimation only
253. ⬜ `webhook_count` uses i32 — overflow risk at 2.1B
254. ⬜ No webhook failure alerting
255. ⬜ No annual billing option
256. ⬜ Enterprise plan has no implementation
257. ⬜ Missing `cancel_at_period_end` logic
258. ⬜ Upgrade flow doesn't validate plan transition
259. ⬜ Checkout URL validation is client-side only

---

## AŞAMA 11 — BACKEND DERİN (⬜ 24 madde)

### 11.1 Crypto
260. ⬜ JWT uses HS256 — no asymmetric option
261. ⬜ Access tokens cannot be revoked
262. ⬜ Endpoint signing secrets use UUID not crypto random
263. ⬜ ENCRYPTION_KEY not validated at startup
264. ⬜ No PKCE for OAuth

### 11.2 Worker
265. ⬜ `avg_response_ms` overwritten, not averaged
266. ⬜ Dead letter customer ID is `Uuid::nil()`
267. ⬜ Zombie reaper runs without transaction
268. ⬜ Orphaned delivery reaper N+1 query pattern
269. ⬜ `process_pending` returns fetched count not processed
270. ⬜ Hardcoded default credentials in worker config
271. ⬜ Service account file read on every delivery

### 11.3 Rate Limiting
272. ⬜ Auth routes lack X-RateLimit headers
273. ✅ Redis failure = open floodgates → fail-closed
274. ⬜ Key collision risk with 15-char prefix
275. ⬜ Monthly reset is day-based not period-based
276. ⬜ Batch endpoint allows up to 100 webhooks per request

### 11.4 Database
277. ⬜ Single-queue design — head-of-line blocking
278. ⬜ `webhook_count` INT overflow risk
279. ⬜ OpenAPI spec eksik endpoint'ler
280. ⬜ OpenAPI wrong type definitions

### 11.5 Genel Backend
281. ⬜ No request ID / correlation ID
282. ⬜ No error catalog/enum on frontend
283. ⬜ `BadRequest` messages developer-facing
284. ⬜ No `409 Conflict` variant
285. ⬜ No dashboard tests in CI
286. ⬜ Broadcast channel overflow drops events

---

## AŞAMA 12 — CODE QUALITY & DEPS (⬜ 14 madde)

287. ⬜ Signing/crypto logic 6+ kez duplicated — shared crate oluştur
288. ⬜ Billing provider triplication — abstraction ekle
289. ⬜ Tight coupling: `api/src/main.rs` monolith — modüllere böl
290. ⬜ Missing shared crate between API and worker
291. ⬜ Excessive `clone()` — 190 occurrences
292. ⬜ `any` type usage — 15+ production code
293. ⬜ 67+ fonksiyon 100 satırı aşıyor
294. ⬜ Magic numbers — named constant yap
295. ⬜ Excessive `unwrap()` in production code
296. ⬜ Unused dependencies (cookie, async-stream, aes-gcm)
297. ⬜ `totp-rs` ve `base32` import yok
298. ⬜ Docker dev image version pin yok
299. ⬜ `opentelemetry-otlp` duplicate transport
300. ⬜ `recharts` ~200KB — alternatif düşün

---

## AŞAMA 13 — DÜŞÜK ÖNCELİK (⬜ 52 madde)

### 13.1 Mega Component Refactoring
301. ⬜ `playground/page.tsx` — 695 satır
302. ⬜ `OnboardingWizard.tsx` — 649 satır
303. ⬜ `dashboard/page.tsx` — 586 satır
304. ⬜ `deliveries/[id]/page.tsx` — 547 satır
305. ⬜ `billing/page.tsx` — 494 satır
306. ⬜ `endpoints/[id]/page.tsx` — 446 satır
307. ⬜ `settings/page.tsx` — 441 satır
308. ⬜ `portal-customize/page.tsx` — 402 satır
309. ⬜ `retry-policy/page.tsx` — 355 satır
310. ⬜ `team/page.tsx` — 339 satır
311. ⬜ `api-importer/page.tsx` — 336 satır
312. ⬜ `api-keys/page.tsx` — 332 satır
313. ⬜ `status/page.tsx` — 699 satır
314. ⬜ `playground/page.tsx` (public) — 911 satır

### 13.2 Frontend Düşük
315. ⬜ Inbound page unused loading variable
316. ⬜ Duplicate StatusBadge component
317. ⬜ Onboarding + OnboardingWizard overlap
318. ⬜ AnimatedCounter negative values
319. ⬜ Playground history localStorage size limit
320. ⬜ Route-level `loading.tsx` yok
321. ⬜ Endpoints detail hand-rolled modal
322. ⬜ Logs page status counts current page only
323. ⬜ Billing cancel modal state reset
324. ⬜ Notification API field mismatch
325. ⬜ Missing `autoComplete` on confirm password
326. ⬜ Mobile sidebar toggle `aria-expanded` eksik
327. ⬜ Date formatting not locale-aware
328. ⬜ 63 useEffect cleanup eksik
329. ⬜ `useEffect` dependency array eksiklikleri
330. ⬜ Portal/Schemas/Routing/Templates double-padding
331. ⬜ `getErrorMessage` inconsistent usage
332. ⬜ Schema registry'de enum/oneOf/format desteklenmiyor
333. ⬜ WebSocket'te server-initiated ping eksik
334. ⬜ Inbound page unused loading variable (tekrar)
335. ⬜ SuccessRateDonut fallback string
336. ⬜ ActivityFeed polls every 5s unconditionally
337. ⬜ StatusDot vs StatusBadge inconsistent

### 13.3 Backend Düşük
338. ⬜ Retry policy default'ları aggressive
339. ⬜ `BadRequest` messages developer-facing (tekrar)
340. ⬜ No `409 Conflict` (tekrar)
341. ⬜ `STRING` vs `TEXT` type inconsistency
342. ⬜ `VARCHAR` length limits arbitrary
343. ⬜ Custom headers don't validate header names
344. ⬜ `unwrap_or_default()` swallows errors
345. ⬜ Secret decoding fallback

### 13.4 Infra Düşük
346. ⬜ Base image not pinned to digest
347. ⬜ No `.dockerignore` awareness for dashboard
348. ⬜ `npm audit --continue-on-error: true`
349. ⬜ No release verification
350. ⬜ No Terraform state for HookSniff
351. ⬜ No HPA
352. ⬜ Worker no liveness/readiness probes

### 13.5 SDK Düşük
353. ⬜ SDK endpoint coverage eksik (Auth, API Keys, Alerts, Analytics, Notifications, Devices, Teams, Billing, Templates, Schemas, Routing)
354. ⬜ SDK otomatik güncelleme sistemi
355. ⬜ tracing-opentelemetry vendor patch

### 13.6 Content Düşük
356. ⬜ Content quality score: 6.5/10
357. ⬜ Blog factual errors
358. ⬜ Alternatives pages biased
359. ⬜ Generic testimonials

---

## SERVET'İN YAPMASI GEREKENLER

360. ⬜ GitHub PAT rotate (chat'te paylaşıldı)
361. ⬜ GCP SA key rotate (chat'te paylaşıldı)
362. ⬜ GitHub Actions billing güncelle
363. ⬜ Stripe payout + identity verification (Polar.sh)
364. ⬜ Grafana trial upgrade (May 20'ye kadar)

---

> **Toplam:** 364 madde (307 kalan iş + 5 Servet'in yapması gereken) — 52 madde tamamlandı (2026-05-12)
> **Son güncelleme:** 2026-05-12 03:24 GMT+8 — Oturum 119 (OpenClaw)
> **Kaynak:** 60+ rapor dosyası + 15 screenshot
> **Son güncelleme:** 2026-05-12 02:00 GMT+8
