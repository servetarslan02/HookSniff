# Fix Report: OnboardingWizard.tsx i18n

**Tarih:** 2026-05-12  
**Dosya:** `dashboard/src/components/OnboardingWizard.tsx`

## Yapılan Değişiklikler

### 1. ✅ Wizard Steps (steps array)
- `steps` array'i zaten component içindeydi, hardcoded İngilizce string'ler `t()` ile değiştirildi
- `welcomeTitle`, `welcomeWizardDesc`, `whatBuilding`, `whatBuildingDesc`, `chooseSdk`, `chooseSdkDesc`, `createFirstEndpoint`, `createFirstEndpointDesc`, `sendTestWebhook`, `sendTestWebhookDesc`, `allSetTitle`, `allSetDesc`

### 2. ✅ Welcome Step JSX
- `"Welcome, {user.name}!"` → `{t('welcome')} {user.name || ...}!`
- `"HookSniff handles webhook delivery..."` → `{t('welcomeDesc')}`
- `"✓ Free forever"` → `✓ {t('freeForever')}`
- `"✓ 11 SDKs"` → `✓ 11 SDK`
- `"✓ 5 min setup"` → `✓ 5 dk kurulum`

### 3. ✅ USE_CASES Array
- Component dışından içine taşındı
- `label` ve `desc` alanları `t()` ile değiştirildi
- Yeni key'ler: `useCasePayments`, `useCasePaymentsDesc`, `useCaseEmail`, `useCaseEmailDesc`, `useCaseEcommerce`, `useCaseEcommerceDesc`, `useCaseSaas`, `useCaseSaasDesc`, `useCaseAi`, `useCaseAiDesc`, `useCaseOther`, `useCaseOtherDesc`

### 4. ✅ SDK Step JSX
- `"Pick your language and copy the install command."` → `{t('chooseSdkDesc')}`
- `"Copy"` → `"Kopyala"`
- `"✓ Copied!"` → `"✓ Kopyalandı!"`

### 5. ✅ Endpoint Step JSX
- `"Enter the URL where you want to receive webhooks."` → `{t('createFirstEndpointDesc')}`
- `"Endpoint URL *"` → `{t('endpointUrl')} *`
- `"Description (optional)"` → `{t('descriptionOptional')}`
- `"💡 No real URL yet?"` → `💡 {t('noRealUrl')}` + `{t('usePlayground')}`
- Placeholder: `"https://myapp.com/webhooks"` → `{t('endpointUrlPlaceholder')}`

### 6. ✅ Test Step JSX
- `"Copy this command and run it in your terminal."` → `{t('sendTestWebhookDesc')}`
- `"Copy"` / `"✓ Copied!"` → `"Kopyala"` / `"✓ Kopyalandı!"`
- `"🧪 Open Playground"` → `🧪 {t('playground')}`
- `"✓ I've sent a test"` → `✓ {t('iveSentTest')}`

### 7. ✅ Done Step JSX
- `"You're all set!"` → `{t('allSetTitle')}`
- `"Your HookSniff workspace is ready..."` → `{t('allSetDesc')}`
- `"🚀 Go to Dashboard"` → `{t('goToDashboardBtn')}`

### 8. ✅ Action Buttons
- `"← Back"` → `← {t('back')}`
- `"Skip setup"` → `{t('skipSetup')}`
- `"Let's go →"` → `{t('letsGo')}`
- `"Continue →"` (3 yer) → `{t('continue')}`
- `"Creating..."` → `{t('creating')}`
- `"Create Endpoint →"` → `{t('createEndpointBtn')}`

### 9. ✅ SetupChecklist
- `"Dismiss checklist"` → `{t('dismissChecklist')}`

### 10. ✅ SuccessToast
- `"Success!"` → `{t('successTitle')}`
- Component'e `const t = useTranslations('onboarding');` eklendi

## Eklenen i18n Key'leri

### en.json (onboarding section)
| Key | Value |
|-----|-------|
| `freeForever` | "Free forever" |
| `noRealUrlYet` | "No real URL yet?" |
| `useCasePayments` | "Payments" |
| `useCasePaymentsDesc` | "Stripe, iyzico, payment events" |
| `useCaseEmail` | "Email / Notifications" |
| `useCaseEmailDesc` | "SendGrid, Resend, push notifications" |
| `useCaseEcommerce` | "E-commerce" |
| `useCaseEcommerceDesc` | "Order, shipping, inventory events" |
| `useCaseSaas` | "SaaS Platform" |
| `useCaseSaasDesc` | "User, subscription, usage events" |
| `useCaseAi` | "AI / Agents" |
| `useCaseAiDesc` | "Task completion, model events" |
| `useCaseOther` | "Other" |
| `useCaseOtherDesc` | "Custom webhook use case" |

### tr.json (onboarding section)
| Key | Value |
|-----|-------|
| `freeForever` | "Sonsuza kadar ücretsiz" |
| `noRealUrlYet` | "Henüz gerçek URL'niz yok mu?" |
| `useCasePayments` | "Ödemeler" |
| `useCasePaymentsDesc` | "Stripe, iyzico, ödeme olayları" |
| `useCaseEmail` | "E-posta / Bildirimler" |
| `useCaseEmailDesc` | "SendGrid, Resend, push bildirimleri" |
| `useCaseEcommerce` | "E-ticaret" |
| `useCaseEcommerceDesc` | "Sipariş, kargo, envanter olayları" |
| `useCaseSaas` | "SaaS Platformu" |
| `useCaseSaasDesc` | "Kullanıcı, abonelik, kullanım olayları" |
| `useCaseAi` | "AI / Agentlar" |
| `useCaseAiDesc` | "Görev tamamlama, model olayları" |
| `useCaseOther` | "Diğer" |
| `useCaseOtherDesc` | "Özel webhook kullanım senaryosu" |

## Doğrulama
- ✅ `tr.json` — geçerli JSON
- ✅ `en.json` — geçerli JSON
- ✅ TSX dosyası — parantez/brace dengeli (235/235, 269/269)
- ✅ `SDKS` array component dışında kaldı (dil adları evrensel, çeviri gerekmez)
- ✅ `USE_CASES` array component içine taşındı ve `t()` kullanıyor
- ✅ `steps` array component içinde kaldı ve `t()` kullanıyor
