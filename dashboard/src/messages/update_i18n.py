import json

base = '/root/.openclaw/workspace/HookSniff/dashboard/src/messages'

# Load both files
with open(f'{base}/tr.json') as f:
    tr = json.load(f)
with open(f'{base}/en.json') as f:
    en = json.load(f)

# === SECURITY ===
sec_tr = tr.get('security', {})
sec_en = en.get('security', {})

new_security = {
    'badge': ('Güvenlik & Uyumluluk', 'Security & Compliance'),
    'heroTitle': ('Kurumsal d\u00fczeyde g\u00fcvenlik,\ngiri\u015fim dostu fiyatland\u0131rma', 'Enterprise-grade security,\nstartup-friendly pricing'),
    'heroSubtitle': ('G\u00fcvenlik opsiyonel de\u011fildir. Her webhook imzalan\u0131r, her ba\u011flant\u0131 \u015fifrelenir ve her i\u015flem kaydedilir.', 'Security is not optional. Every webhook is signed, every connection is encrypted, and every action is logged.'),
    'featureTls': ('TLS 1.3 Her Yerde', 'TLS 1.3 Everywhere'),
    'featureTlsDesc': ('T\u00fcm veriler TLS 1.3 ile iletimde \u015fifrelenir. HTTP yok, istisna yok.', 'All data encrypted in transit with TLS 1.3. No HTTP, no exceptions.'),
    'featureHmac': ('HMAC-SHA256 \u0130mzalar\u0131', 'HMAC-SHA256 Signatures'),
    'featureHmacDesc': ('Her webhook gizli anahtar\u0131n\u0131zla imzalan\u0131r. Standart HMAC-SHA256 ile \u00f6zg\u00fcnly\u011fi do\u011frulay\u0131n.', 'Every webhook is signed with your secret. Verify authenticity with standard HMAC-SHA256.'),
    'feature2fa': ('2FA / TOTP', '2FA / TOTP'),
    'feature2faDesc': ('Authenticator uygulamalar\u0131yla iki fakt\u00f6rl\u00fc do\u011frulama. Hesab\u0131n\u0131z\u0131 \u015fifrelerin \u00f6tesinde koruyun.', 'Two-factor authentication via authenticator apps. Protect your account beyond passwords.'),
    'featureSso': ('SSO / SAML', 'SSO / SAML'),
    'featureSsoDesc': ('Kurumsal tek oturum a\u00e7ma. Okta, Auth0, Google Workspace ve daha fazlas\u0131yla entegre edin.', 'Enterprise single sign-on. Integrate with Okta, Auth0, Google Workspace, and more.'),
    'featureIpWhitelist': ('IP Beyaz Liste', 'IP Whitelisting'),
    'featureIpWhitelistDesc': ('API eri\u015fimini belirli IP\'lere veya CIDR aral\u0131klar\u0131na k\u0131s\u0131tlay\u0131n. Yetkisiz kaynaklar\u0131 engelleyin.', 'Restrict API access to specific IPs or CIDR ranges. Block unauthorized sources.'),
    'featureSsrf': ('SSRF Korumas\u0131', 'SSRF Protection'),
    'featureSsrfDesc': ('Dahili Sunucu Taraf\u0131 \u0130stek Sahtecili\u011fi korumas\u0131 yerle\u015fik. Dahili a\u011f eri\u015fimini engelleyin.', 'Built-in Server-Side Request Forgery protection. Block internal network access.'),
    'featureArgon2': ('Argon2 Parola Hashleme', 'Argon2 Password Hashing'),
    'featureArgon2Desc': ('Argon2id ile sekt\u00f6r lideri parola hashleme. D\u00fcz metin yok, zay\u0131f hash yok.', 'Industry-leading password hashing with Argon2id. No plaintext, no weak hashes.'),
    'featureAuditLogs': ('Denetim G\u00fcnl\u00fckleri', 'Audit Logs'),
    'featureAuditLogsDesc': ('Her i\u015flemi takip edin: kim, ne yapt\u0131, ne zaman. Uyumluluk i\u00e7in tam denetim izi.', 'Track every action: who did what, when. Full audit trail for compliance.'),
    'featureEuData': ('AB Veri \u0130\u015fleme', 'EU Data Processing'),
    'featureEuDataDesc': ('Veriler eu-central-1\'de (Frankfurt) i\u015flenir. Tasar\u0131ma uygun GDPR uyumlu.', 'Data processed in eu-central-1 (Frankfurt). GDPR compliant by design.'),
    'featureKeyRotation': ('API Anahtar D\u00f6nd\u00fcrme', 'API Key Rotation'),
    'featureKeyRotationDesc': ('API anahtarlar\u0131n\u0131 kesinti olmadan d\u00f6nd\u00fcr\u00fcn. Eski anahtarlar an\u0131nda ge\u00e7ersiz k\u0131l\u0131n\u0131r.', 'Rotate API keys without downtime. Old keys invalidated instantly.'),
    'featureRateLimit': ('H\u0131z S\u0131n\u0131rlama', 'Rate Limiting'),
    'featureRateLimitDesc': ('Anahtar ba\u015f\u0131na h\u0131z s\u0131n\u0131rlama k\u00f6t\u00fcye kullan\u0131m\u0131 \u00f6nler. Plan bazl\u0131 yap\u0131land\u0131r\u0131labilir.', 'Per-key rate limiting prevents abuse. Configurable per plan.'),
    'featureSecretRotation': ('Webhook Gizli Anahtar D\u00f6nd\u00fcrme', 'Webhook Secret Rotation'),
    'featureSecretRotationDesc': ('Mevcut entegrasyonlar\u0131 bozmadan webhook gizli anahtarlar\u0131n\u0131 d\u00f6nd\u00fcr\u00fcn. \u00c7ift gizli anahtar deste\u011fi.', 'Rotate webhook secrets without breaking existing integrations. Dual-secret support.'),
    'complianceTitle': ('Uyumluluk & Standartlar', 'Compliance & Standards'),
    'gdprDesc': ('AB veri i\u015fleme, veri d\u0131\u015fa aktarma/silme, DPA mevcut', 'EU data processing, data export/deletion, DPA available'),
    'soc2Desc': ('G\u00fcvenlik kontrolleri mevcut, Tip 1 denetim planland\u0131', 'Security controls in place, Type 1 audit planned'),
    'ccpaDesc': ('California T\u00fcketici Gizlili\u011fi Yasas\u0131 uyumlulu\u011fu', 'California Consumer Privacy Act compliance'),
    'kvkkDesc': ('T\u00fcrk veri koruma kanunu uyumlulu\u011fu', 'Turkish data protection law compliance'),
    'standardWebhooksDesc': ('Webhook imzalar\u0131 ve teslimat\u0131 i\u00e7in a\u00e7\u0131k standart', 'Open standard for webhook signatures and delivery'),
    'cloudeventsDesc': ('Etkinlik veri birlikte \u00e7al\u0131\u015fabilirli\u011fi i\u00e7in CNCF standard\u0131', 'CNCF standard for event data interoperability'),
    'compliant': ('Uyumlu', 'Compliant'),
    'ready': ('Haz\u0131r', 'Ready'),
    'supported': ('Destekleniyor', 'Supported'),
    'responsibleDisclosure': ('Sorumlu A\u00e7\u0131klama', 'Responsible Disclosure'),
    'responsibleDisclosureDesc': ('Bir g\u00fcvenlik a\u00e7\u0131\u011f\u0131 m\u0131 buldunuz? Sorumlu a\u00e7\u0131klamay\u0131 takdir ediyoruz. L\u00fctfen ayr\u0131nt\u0131larla bildirin.', 'Found a security vulnerability? We appreciate responsible disclosure. Please report with details.'),
    'responsibleDisclosureCommit': ('Raporlar\u0131 24 saat i\u00e7inde kabul etmeyi ve 72 saat i\u00e7inde d\u00fczeltme zaman \u00e7izelgesi sunmay\u0131 taahh\u00fct ediyoruz.', 'We commit to acknowledging reports within 24 hours and providing a fix timeline within 72 hours.'),
    'contactForm': ('ileti\u015fim formumuz', 'contact form'),
    'ctaTitle': ('G\u00fcvenlik sorular\u0131n\u0131z m\u0131 var?', 'Security questions?'),
    'ctaDesc': ('Ekibimiz g\u00fcvenlik gereksinimlerinizi tart\u0131\u015fmaktan memnuniyet duyar.', 'Our team is happy to discuss your security requirements.'),
    'ctaContact': ('Bize ula\u015f\u0131n \u2192', 'Contact us \u2192'),
}

for k, (trv, env) in new_security.items():
    if k not in sec_tr:
        sec_tr[k] = trv
    if k not in sec_en:
        sec_en[k] = env

tr['security'] = sec_tr
en['security'] = sec_en

# === WHAT IS WEBHOOK ===
wh_tr = tr.get('whatIsWebhook', {})
wh_en = en.get('whatIsWebhook', {})

new_wh = {
    'title': ('Webhook Nedir?', 'What is a Webhook?'),
    'subtitle': ('Webhook\'lar hakk\u0131nda eksiksiz bir rehber \u2014 nas\u0131l \u00e7al\u0131\u015f\u0131rlar, neden \u00f6nemlidirler ve nas\u0131l kullan\u0131l\u0131rlar.', 'A complete guide to webhooks \u2014 how they work, why they matter, and how to use them.'),
    'thinkOfIt': ('\u015e\u00f6yle d\u00fc\u015f\u00fcn\u00fcn:', 'Think of it like this:'),
    'pizzaWebhookDesc': ('= Pizza haz\u0131r oldu\u011funda pizza d\u00fckkan\u0131 S\u0130Z\u0130 arar.', '= The pizza place calls YOU when your pizza is ready.'),
    'pizzaPollingDesc': ('= Pizza yerini aramaya devam edersiniz "Pizzam haz\u0131r m\u0131?"', '= You keep calling the pizza place asking "Is my pizza ready?"'),
    'step1': ('Bir URL kaydedersiniz', 'You register a URL'),
    'step1Desc': ('Bir servise \u015funu s\u00f6ylersiniz: "Bir \u015fey oldu\u011funda, veriyi bu URL\'ye g\u00f6nder."', 'You tell a service "When something happens, send data to this URL."'),
    'step2': ('Bir \u015fey olur', 'Something happens'),
    'step2Desc': ('Bir \u00f6deme ba\u015far\u0131l\u0131 olur, bir kullan\u0131c\u0131 kaydolur, bir sipari\u015f g\u00f6nderilir.', 'A payment succeeds, a user signs up, an order ships.'),
    'step3': ('Servis bir POST iste\u011fi g\u00f6nderir', 'The service sends a POST request'),
    'step3Desc': ('Olay verisini (payload) URL\'nize g\u00f6nderir.', 'It sends the event data (payload) to your URL.'),
    'step4': ('Sunucunuz i\u015fler', 'Your server processes it'),
    'step4Desc': ('Veriyi al\u0131rs\u0131n\u0131z ve i\u015flem yapars\u0131n\u0131z (veritaban\u0131n\u0131 g\u00fcncelle, e-posta g\u00f6nder, vb.).', 'You receive the data and take action (update database, send email, etc.).'),
    'ucPayment': ('\u00d6deme bildirimleri', 'Payment notifications'),
    'ucPaymentDesc': ('Stripe, \u00f6deme ba\u015far\u0131l\u0131 veya ba\u015far\u0131s\u0131z oldu\u011funda bir webhook g\u00f6nderir.', 'Stripe sends a webhook when a payment succeeds or fails.'),
    'ucCiCd': ('CI/CD pipeline\'lar\u0131', 'CI/CD pipelines'),
    'ucCiCdDesc': ('GitHub, kod itildi\u011finde bir webhook g\u00f6ndererek derlemeyi tetikler.', 'GitHub sends a webhook when code is pushed, triggering a build.'),
    'ucChatbots': ('Sohbet botlar\u0131', 'Chat bots'),
    'ucChatbotsDesc': ('Slack/Discord, bir mesaj g\u00f6nderildi\u011finde bir webhook g\u00f6nderir.', 'Slack/Discord sends a webhook when a message is posted.'),
    'ucEcommerce': ('E-ticaret', 'E-commerce'),
    'ucEcommerceDesc': ('Sipari\u015f olu\u015fturuldu, g\u00f6nderildi, teslim edildi \u2014 her biri bir webhook tetikler.', 'Order created, shipped, delivered \u2014 each triggers a webhook.'),
    'ucAi': ('AI ajanlar\u0131', 'AI agents'),
    'ucAiDesc': ('Bir AI ajan\u0131, bir g\u00f6rev tamamland\u0131\u011f\u0131nda webhook g\u00f6nderir.', 'An AI agent sends a webhook when a task completes.'),
    'ucMonitoring': ('\u0130zleme', 'Monitoring'),
    'ucMonitoringDesc': ('Bir uyar\u0131 sistemi, sunucu \u00e7\u00f6kt\u00fc\u011f\u00fcnde webhook g\u00f6nderir.', 'An alert system sends a webhook when a server goes down.'),
    'securityDesc': ('Webhook\'lar HTTP \u00fczerinden g\u00f6nderilir, bu y\u00fczden herkes URL\'nize istek g\u00f6nderebilir. \u0130ste\u011fin ger\u00e7ekten beklenen servisten geldi\u011fini do\u011frulaman\u0131z gerekir.', 'Webhooks are sent over HTTP, so anyone can send a request to your URL. You need to verify that the request actually came from the expected service.'),
    'gettingStartedDesc': ('Webhook\'lar ile ba\u015flaman\u0131n en kolay yolu:', 'The easiest way to start with webhooks:'),
    'gsStep1': ('Sunucunuzda bir endpoint olu\u015fturun (POST isteklerini kabul eden bir URL)', 'Create an endpoint on your server (a URL that accepts POST requests)'),
    'gsStep2': ('Bu URL\'yi webhook g\u00f6nderecek servise kaydedin', 'Register that URL with the service that will send webhooks'),
    'gsStep3': ('Endpoint\'inizde webhook imzas\u0131n\u0131 do\u011frulay\u0131n', 'Verify the webhook signature in your endpoint'),
    'gsStep4': ('Olay verisini i\u015fleyin ve i\u015flem yap\u0131n', 'Process the event data and take action'),
    'gsStep5': ('Al\u0131nd\u0131y\u0131 onaylamak i\u00e7in 200 durum kodu d\u00f6nd\u00fcr\u00fcn', 'Return a 200 status code to acknowledge receipt'),
    'proTip': ('\u0130pucu:', 'Pro tip:'),
    'proTipDesc': ('Yeniden denemeler, g\u00fcvenlik ve izleme ile ilgilenmesi i\u00e7in HookSniff gibi bir webhook servisi kullan\u0131n \u2014 b\u00f6ylece \u00fcr\u00fcn\u00fcze odaklanabilirsiniz.', 'Use a webhook service like HookSniff to handle retries, security, and monitoring \u2014 so you can focus on your product.'),
    'ctaTitle': ('Webhook kullanmaya haz\u0131r m\u0131s\u0131n\u0131z?', 'Ready to use webhooks?'),
    'ctaDesc': ('HookSniff webhook teslimat\u0131n\u0131 kolayla\u015ft\u0131r\u0131r. \u00dccretsiz ba\u015flay\u0131n.', 'HookSniff makes webhook delivery simple. Start free.'),
    'ctaButton': ('Hemen ba\u015flay\u0131n \u2192', 'Get started \u2192'),
}

for k, (trv, env) in new_wh.items():
    if k not in wh_tr:
        wh_tr[k] = trv
    if k not in wh_en:
        wh_en[k] = env

tr['whatIsWebhook'] = wh_tr
en['whatIsWebhook'] = wh_en

# === STARTUPS ===
st_tr = tr.get('startups', {})
st_en = en.get('startups', {})

new_startups = {
    'badge': ('\U0001f680 Startup Program\u0131', '\U0001f680 Startup Program'),
    'subtitle': ('Erken a\u015fama giri\u015fimler i\u00f6zel fiyatland\u0131rma. \u00dcr\u00fcn\u00fcze odaklan\u0131n, webhook altyap\u0131s\u0131na de\u011fil.', 'Special pricing for early-stage startups. Focus on your product, not webhook infrastructure.'),
    'benefit50Title': ('%50 indirimli Pro', '50% off Pro'),
    'benefit50Desc': ('Seri A \u00f6ncesi giri\u015fimler Pro plan\u0131 ayda $14.50\'a al\u0131r ($29 yerine).', 'Pre-Series A startups get Pro plan for $14.50/mo (instead of $29).'),
    'benefitFreeTitle': ('Geni\u015fletilmi\u015f \u00fccretsiz katman', 'Extended free tier'),
    'benefitFreeDesc': ('\u00dccretsiz kademede ayda 10.000 etkinlik.', '10,000 events/month on free tier.'),
    'benefitPriorityTitle': ('\u00d6ncelikli destek', 'Priority support'),
    'benefitPriorityDesc': ('Onboarding yard\u0131m\u0131 i\u00e7in m\u00fchendislik ekibimizle do\u011frudan Slack kanal\u0131.', 'Direct Slack channel with our engineering team for onboarding help.'),
    'whoQualifies': ('Kimler uygundur?', 'Who qualifies?'),
    'qualify1': ('Seri A \u00f6ncesi giri\u015fimler', 'Pre-Series A startups'),
    'qualify2': ('$1M\'den az yat\u0131r\u0131m', 'Less than $1M in funding'),
    'qualify3': ('10\'dan az \u00e7al\u0131\u015fan', 'Less than 10 employees'),
    'qualify4': ('\u00dcr\u00fcn geli\u015ftirme (yan proje de\u011fil)', 'Building a product (not a side project)'),
    'qualify5': ('Kay\u0131tl\u0131 \u015firket veya aktif \u015firket kurulumu', 'Registered company or active incorporation'),
    'ctaDesc': ('Giri\u015fiminizden bahsedin. Genellikle 24 saat i\u00e7inde yan\u0131t veririz.', 'Tell us about your startup. We usually respond within 24 hours.'),
    'ctaButton': ('\u015eimdi ba\u015fvurun \u2192', 'Apply now \u2192'),
}

for k, (trv, env) in new_startups.items():
    if k not in st_tr:
        st_tr[k] = trv
    if k not in st_en:
        st_en[k] = env

tr['startups'] = st_tr
en['startups'] = st_en

# === PRICING (additional keys) ===
pr_tr = tr.get('pricing', {})
pr_en = en.get('pricing', {})

new_pricing = {
    'securityItem1Title': ('TLS 1.3', 'TLS 1.3'),
    'securityItem1Desc': ('T\u00fcm veriler iletimde \u015fifrelenir', 'All data encrypted in transit'),
    'securityItem2Title': ('SOC 2 Haz\u0131r', 'SOC 2 Ready'),
    'securityItem2Desc': ('G\u00fcvenlik kontrolleri mevcut', 'Security controls in place'),
    'securityItem3Title': ('GDPR Uyumlu', 'GDPR Compliant'),
    'securityItem3Desc': ('AB veri i\u015fleme (eu-central-1)', 'EU data processing (eu-central-1)'),
    'securityItem4Title': ('HMAC-SHA256', 'HMAC-SHA256'),
    'securityItem4Desc': ('Her webhook imzas\u0131 do\u011frulan\u0131r', 'Every webhook signature verified'),
    'securityItem5Title': ('2FA / TOTP', '2FA / TOTP'),
    'securityItem5Desc': ('\u0130ki fakt\u00f6rl\u00fc do\u011frulama', 'Two-factor authentication'),
    'securityItem6Title': ('Denetim G\u00fcnl\u00fckleri', 'Audit Logs'),
    'securityItem6Desc': ('Her i\u015flemi takip edin', 'Track every action'),
    'securityItem7Title': ('SSO / SAML', 'SSO / SAML'),
    'securityItem7Desc': ('Kurumsal tek oturum a\u00e7ma', 'Enterprise single sign-on'),
    'securityItem8Title': ('IP Beyaz Liste', 'IP Whitelisting'),
    'securityItem8Desc': ('IP/CIDR ile k\u0131s\u0131tlay\u0131n', 'Restrict by IP/CIDR'),
    'supportFreeFeatures': ['GitHub Issues', 'Topluluk Discord\'u', 'Dok\u00fcantasyon', 'Stack Overflow'],
    'supportProFeatures': ['E-posta deste\u011fi', '48 saat yan\u0131t s\u00fcresi', 'Hata d\u00fczeltme \u00f6nceli\u011fi', '\u00d6zellik istekleri'],
    'supportBusinessFeatures': ['\u00d6zel hesap y\u00f6neticisi', 'Slack Connect kanal\u0131', '24 saat yan\u0131t s\u00fcresi', '\u00d6zel entegrasyonlar', 'Onboarding g\u00f6r\u00fc\u015fmesi'],
    'testimonial1Quote': ('Kendi webhook\'lar\u0131m\u0131z\u0131 geli\u015ftirmekten HookSniff\'e ge\u00e7tik. Bize 3 ay m\u00fchendislik zaman\u0131 ve ayda $2K altyap\u0131 maliyeti kazand\u0131rd\u0131.', 'We switched from building our own webhooks to HookSniff. Saved us 3 months of engineering time and $2K/month in infrastructure costs.'),
    'testimonial1Author': ('CTO', 'CTO'),
    'testimonial1Company': ('SaaS Giri\u015fimi', 'SaaS Startup'),
    'testimonial2Quote': ('FIFO teslimat \u00f6zelli\u011fi sipari\u015f i\u015fleme hatt\u0131m\u0131z i\u00e7in bir devrim. Olaylar her zaman s\u0131rayla geliyor.', 'The FIFO delivery feature is a game-changer for our order processing pipeline. Events arrive in order, every time.'),
    'testimonial2Author': ('Ba\u015f Geli\u015ftirici', 'Lead Developer'),
    'testimonial2Company': ('E-ticaret Platformu', 'E-commerce Platform'),
    'testimonial3Quote': ('Giri\u015fimler i\u00e7in ger\u00e7ekten \u00e7al\u0131\u015fan \u00fccretsiz katman. Ayda 8K webhook i\u015fliyoruz tek kuru\u015f \u00f6demeden. Svix $490 istiyordu.', 'Free tier that actually works for startups. We process 8K webhooks/month without paying a cent. Svix wanted $490.'),
    'testimonial3Author': ('Solo Kurucu', 'Solo Founder'),
    'testimonial3Company': ('Ba\u011f\u0131ms\u0131z Geli\u015ftirici', 'Indie Hacker'),
}

for k, (trv, env) in new_pricing.items():
    if k not in pr_tr:
        pr_tr[k] = trv
    if k not in pr_en:
        pr_en[k] = env

tr['pricing'] = pr_tr
en['pricing'] = pr_en

# Save
with open(f'{base}/tr.json', 'w') as f:
    json.dump(tr, f, ensure_ascii=False, indent=2)
    f.write('\n')
with open(f'{base}/en.json', 'w') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)
    f.write('\n')

print('Done! Keys added.')
print(f"security: {len(tr['security'])} keys in tr")
print(f"whatIsWebhook: {len(tr['whatIsWebhook'])} keys in tr")
print(f"startups: {len(tr['startups'])} keys in tr")
print(f"pricing: {len(tr['pricing'])} keys in tr")
