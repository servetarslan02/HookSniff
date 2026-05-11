import json

base = '/root/.openclaw/workspace/HookSniff/dashboard/src/messages'

with open(f'{base}/tr.json') as f:
    tr = json.load(f)
with open(f'{base}/en.json') as f:
    en = json.load(f)

# === SECURITY ===
sec_tr = tr.get('security', {})
sec_en = en.get('security', {})

pairs = [
    ('badge', 'Güvenlik & Uyumluluk', 'Security & Compliance'),
    ('heroTitle', 'Kurumsal düzeyde güvenlik,\ngirişim dostu fiyatlandırma', 'Enterprise-grade security,\nstartup-friendly pricing'),
    ('heroSubtitle', 'Güvenlik opsiyonel değildir. Her webhook imzalanır, her bağlantı şifrelenir ve her işlem kaydedilir.', 'Security is not optional. Every webhook is signed, every connection is encrypted, and every action is logged.'),
    ('featureTls', 'TLS 1.3 Her Yerde', 'TLS 1.3 Everywhere'),
    ('featureTlsDesc', 'Tüm veriler TLS 1.3 ile iletimde şifrelenir. HTTP yok, istisna yok.', 'All data encrypted in transit with TLS 1.3. No HTTP, no exceptions.'),
    ('featureHmac', 'HMAC-SHA256 İmzaları', 'HMAC-SHA256 Signatures'),
    ('featureHmacDesc', 'Her webhook gizli anahtarınızla imzalanır. Standart HMAC-SHA256 ile özgünlüğü doğrulayın.', 'Every webhook is signed with your secret. Verify authenticity with standard HMAC-SHA256.'),
    ('feature2fa', '2FA / TOTP', '2FA / TOTP'),
    ('feature2faDesc', 'Authenticator uygulamalarıyla iki faktörlü doğrulama. Hesabınızı şifrelerin ötesinde koruyun.', 'Two-factor authentication via authenticator apps. Protect your account beyond passwords.'),
    ('featureSso', 'SSO / SAML', 'SSO / SAML'),
    ('featureSsoDesc', 'Kurumsal tek oturum açma. Okta, Auth0, Google Workspace ve daha fazlasıyla entegre edin.', 'Enterprise single sign-on. Integrate with Okta, Auth0, Google Workspace, and more.'),
    ('featureIpWhitelist', 'IP Beyaz Liste', 'IP Whitelisting'),
    ('featureIpWhitelistDesc', "API erişimini belirli IP'lere veya CIDR aralıklarına kısıtlayın. Yetkisiz kaynakları engelleyin.", 'Restrict API access to specific IPs or CIDR ranges. Block unauthorized sources.'),
    ('featureSsrf', 'SSRF Koruması', 'SSRF Protection'),
    ('featureSsrfDesc', 'Dahili Sunucu Tarafı İstek Sahteciliği koruması yerleşik. Dahili ağ erişimini engelleyin.', 'Built-in Server-Side Request Forgery protection. Block internal network access.'),
    ('featureArgon2', 'Argon2 Parola Hashleme', 'Argon2 Password Hashing'),
    ('featureArgon2Desc', 'Argon2id ile sektör lideri parola hashleme. Düz metin yok, zayıf hash yok.', 'Industry-leading password hashing with Argon2id. No plaintext, no weak hashes.'),
    ('featureAuditLogs', 'Denetim Günlükleri', 'Audit Logs'),
    ('featureAuditLogsDesc', 'Her işlemi takip edin: kim, ne yaptı, ne zaman. Uyumluluk için tam denetim izi.', 'Track every action: who did what, when. Full audit trail for compliance.'),
    ('featureEuData', 'AB Veri İşleme', 'EU Data Processing'),
    ('featureEuDataDesc', "Veriler eu-central-1'de (Frankfurt) işlenir. Tasarıma uygun GDPR uyumlu.", 'Data processed in eu-central-1 (Frankfurt). GDPR compliant by design.'),
    ('featureKeyRotation', 'API Anahtar Döndürme', 'API Key Rotation'),
    ('featureKeyRotationDesc', 'API anahtarlarını kesinti olmadan döndürün. Eski anahtarlar anında geçersiz kılınır.', 'Rotate API keys without downtime. Old keys invalidated instantly.'),
    ('featureRateLimit', 'Hız Sınırlama', 'Rate Limiting'),
    ('featureRateLimitDesc', 'Anahtar başına hız sınırlama kötüye kullanımı önler. Plan bazlı yapılandırılabilir.', 'Per-key rate limiting prevents abuse. Configurable per plan.'),
    ('featureSecretRotation', 'Webhook Gizli Anahtar Döndürme', 'Webhook Secret Rotation'),
    ('featureSecretRotationDesc', 'Mevcut entegrasyonları bozmadan webhook gizli anahtarlarını döndürün. Çift gizli anahtar desteği.', 'Rotate webhook secrets without breaking existing integrations. Dual-secret support.'),
    ('complianceTitle', 'Uyumluluk & Standartlar', 'Compliance & Standards'),
    ('gdprDesc', 'AB veri işleme, veri dışa aktarma/silme, DPA mevcut', 'EU data processing, data export/deletion, DPA available'),
    ('soc2Desc', 'Güvenlik kontrolleri mevcut, Tip 1 denetim planlandı', 'Security controls in place, Type 1 audit planned'),
    ('ccpaDesc', 'California Tüketici Gizliliği Yasası uyumluluğu', 'California Consumer Privacy Act compliance'),
    ('kvkkDesc', 'Türk veri koruma kanunu uyumluluğu', 'Turkish data protection law compliance'),
    ('standardWebhooksDesc', 'Webhook imzaları ve teslimatı için açık standart', 'Open standard for webhook signatures and delivery'),
    ('cloudeventsDesc', 'Etkinlik veri birlikte çalışabilirliği için CNCF standardı', 'CNCF standard for event data interoperability'),
    ('compliant', 'Uyumlu', 'Compliant'),
    ('ready', 'Hazır', 'Ready'),
    ('supported', 'Destekleniyor', 'Supported'),
    ('responsibleDisclosure', 'Sorumlu Açıklama', 'Responsible Disclosure'),
    ('responsibleDisclosureDesc', 'Bir güvenlik açığı mı buldunuz? Sorumlu açıklamayı takdir ediyoruz. Lütfen ayrıntılarla bildirin.', 'Found a security vulnerability? We appreciate responsible disclosure. Please report with details.'),
    ('responsibleDisclosureCommit', 'Raporları 24 saat içinde kabul etmeyi ve 72 saat içinde düzeltme zaman çizelgesi sunmayı taahhüt ediyoruz.', 'We commit to acknowledging reports within 24 hours and providing a fix timeline within 72 hours.'),
    ('contactForm', 'iletişim formumuz', 'contact form'),
    ('ctaTitle', 'Güvenlik sorularınız mı var?', 'Security questions?'),
    ('ctaDesc', 'Ekibimiz güvenlik gereksinimlerinizi tartışmaktan memnuniyet duyar.', 'Our team is happy to discuss your security requirements.'),
    ('ctaContact', 'Bize ulaşın →', 'Contact us →'),
]

for k, trv, env in pairs:
    sec_tr[k] = sec_tr.get(k, trv)
    sec_en[k] = sec_en.get(k, env)

tr['security'] = sec_tr
en['security'] = sec_en

# === WHAT IS WEBHOOK ===
wh_tr = tr.get('whatIsWebhook', {})
wh_en = en.get('whatIsWebhook', {})

wh_pairs = [
    ('title', 'Webhook Nedir?', 'What is a Webhook?'),
    ('subtitle', "Webhook'lar hakkında eksiksiz bir rehber — nasıl çalışırlar, neden önemlidirler ve nasıl kullanılırlar.", 'A complete guide to webhooks — how they work, why they matter, and how to use them.'),
    ('thinkOfIt', 'Şöyle düşünün:', 'Think of it like this:'),
    ('pizzaWebhookDesc', '= Pizza hazır olduğunda pizza dükkanı SİZİ arar.', '= The pizza place calls YOU when your pizza is ready.'),
    ('pizzaPollingDesc', '= Pizza yerini aramaya devam edersiniz "Pizzam hazır mı?"', '= You keep calling the pizza place asking "Is my pizza ready?"'),
    ('step1', 'Bir URL kaydedersiniz', 'You register a URL'),
    ('step1Desc', "Bir servise şunu söylersiniz: \"Bir şey olduğunda, veriyi bu URL'ye gönder.\"", 'You tell a service "When something happens, send data to this URL."'),
    ('step2', 'Bir şey olur', 'Something happens'),
    ('step2Desc', 'Bir ödeme başarılı olur, bir kullanıcı kaydolur, bir sipariş gönderilir.', 'A payment succeeds, a user signs up, an order ships.'),
    ('step3', 'Servis bir POST isteği gönderir', 'The service sends a POST request'),
    ('step3Desc', "Olay verisini (payload) URL'nize gönderir.", 'It sends the event data (payload) to your URL.'),
    ('step4', 'Sunucunuz işler', 'Your server processes it'),
    ('step4Desc', 'Veriyi alırsınız ve işlem yaparsınız (veritabanını güncelle, e-posta gönder, vb.).', 'You receive the data and take action (update database, send email, etc.).'),
    ('ucPayment', 'Ödeme bildirimleri', 'Payment notifications'),
    ('ucPaymentDesc', 'Stripe, ödeme başarılı veya başarısız olduğunda bir webhook gönderir.', 'Stripe sends a webhook when a payment succeeds or fails.'),
    ('ucCiCd', "CI/CD pipeline'ları", 'CI/CD pipelines'),
    ('ucCiCdDesc', 'GitHub, kod itildiğinde bir webhook göndererek derlemeyi tetikler.', 'GitHub sends a webhook when code is pushed, triggering a build.'),
    ('ucChatbots', 'Sohbet botları', 'Chat bots'),
    ('ucChatbotsDesc', 'Slack/Discord, bir mesaj gönderildiğinde bir webhook gönderir.', 'Slack/Discord sends a webhook when a message is posted.'),
    ('ucEcommerce', 'E-ticaret', 'E-commerce'),
    ('ucEcommerceDesc', 'Sipariş oluşturuldu, gönderildi, teslim edildi — her biri bir webhook tetikler.', 'Order created, shipped, delivered — each triggers a webhook.'),
    ('ucAi', 'AI ajanları', 'AI agents'),
    ('ucAiDesc', 'Bir AI ajanı, bir görev tamamlandığında webhook gönderir.', 'An AI agent sends a webhook when a task completes.'),
    ('ucMonitoring', 'İzleme', 'Monitoring'),
    ('ucMonitoringDesc', 'Bir uyarı sistemi, sunucu çöktüğünde webhook gönderir.', 'An alert system sends a webhook when a server goes down.'),
    ('securityDesc', "Webhook'lar HTTP üzerinden gönderilir, bu yüzden herkes URL'nize istek gönderebilir. İsteğin gerçekten beklenen servisten geldiğini doğrulamanız gerekir.", 'Webhooks are sent over HTTP, so anyone can send a request to your URL. You need to verify that the request actually came from the expected service.'),
    ('gettingStartedDesc', "Webhook'lar ile başlamanın en kolay yolu:", 'The easiest way to start with webhooks:'),
    ('gsStep1', 'Sunucunuzda bir endpoint oluşturun (POST isteklerini kabul eden bir URL)', 'Create an endpoint on your server (a URL that accepts POST requests)'),
    ('gsStep2', "Bu URL'yi webhook gönderecek servise kaydedin", 'Register that URL with the service that will send webhooks'),
    ('gsStep3', "Endpoint'inizde webhook imzasını doğrulayın", 'Verify the webhook signature in your endpoint'),
    ('gsStep4', 'Olay verisini işleyin ve işlem yapın', 'Process the event data and take action'),
    ('gsStep5', 'Alındıyı onaylamak için 200 durum kodu döndürün', 'Return a 200 status code to acknowledge receipt'),
    ('proTip', 'İpucu:', 'Pro tip:'),
    ('proTipDesc', 'Yeniden denemeler, güvenlik ve izleme ile ilgilenmesi için HookSniff gibi bir webhook servisi kullanın — böylece ürününüze odaklanabilirsiniz.', 'Use a webhook service like HookSniff to handle retries, security, and monitoring — so you can focus on your product.'),
    ('ctaTitle', 'Webhook kullanmaya hazır mısınız?', 'Ready to use webhooks?'),
    ('ctaDesc', 'HookSniff webhook teslimatını kolaylaştırır. Ücretsiz başlayın.', 'HookSniff makes webhook delivery simple. Start free.'),
    ('ctaButton', 'Hemen başlayın →', 'Get started →'),
]

for k, trv, env in wh_pairs:
    wh_tr[k] = wh_tr.get(k, trv)
    wh_en[k] = wh_en.get(k, env)

tr['whatIsWebhook'] = wh_tr
en['whatIsWebhook'] = wh_en

# === STARTUPS ===
st_tr = tr.get('startups', {})
st_en = en.get('startups', {})

st_pairs = [
    ('badge', '🚀 Startup Programı', '🚀 Startup Program'),
    ('subtitle', 'Erken aşama girişimler için özel fiyatlandırma. Ürününüze odaklanın, webhook altyapısına değil.', 'Special pricing for early-stage startups. Focus on your product, not webhook infrastructure.'),
    ('benefit50Title', '%50 indirimli Pro', '50% off Pro'),
    ('benefit50Desc', "Seri A öncesi girişimler Pro planı ayda $14.50'a alır ($29 yerine).", 'Pre-Series A startups get Pro plan for $14.50/mo (instead of $29).'),
    ('benefitFreeTitle', 'Genişletilmiş ücretsiz katman', 'Extended free tier'),
    ('benefitFreeDesc', 'Ücretsiz kademede ayda 10.000 etkinlik.', '10,000 events/month on free tier.'),
    ('benefitPriorityTitle', 'Öncelikli destek', 'Priority support'),
    ('benefitPriorityDesc', 'Onboarding yardımı için mühendislik ekibimizle doğrudan Slack kanalı.', 'Direct Slack channel with our engineering team for onboarding help.'),
    ('whoQualifies', 'Kimler uygundur?', 'Who qualifies?'),
    ('qualify1', 'Seri A öncesi girişimler', 'Pre-Series A startups'),
    ('qualify2', "$1M'den az yatırım", 'Less than $1M in funding'),
    ('qualify3', "10'dan az çalışan", 'Less than 10 employees'),
    ('qualify4', 'Ürün geliştirme (yan proje değil)', 'Building a product (not a side project)'),
    ('qualify5', 'Kayıtlı şirket veya aktif şirket kurulumu', 'Registered company or active incorporation'),
    ('ctaDesc', 'Girişiminizden bahsedin. Genellikle 24 saat içinde yanıt veririz.', 'Tell us about your startup. We usually respond within 24 hours.'),
    ('ctaButton', 'Şimdi başvurun →', 'Apply now →'),
]

for k, trv, env in st_pairs:
    st_tr[k] = st_tr.get(k, trv)
    st_en[k] = st_en.get(k, env)

tr['startups'] = st_tr
en['startups'] = st_en

# === PRICING (additional keys) ===
pr_tr = tr.get('pricing', {})
pr_en = en.get('pricing', {})

pr_pairs = [
    ('securityItem1Title', 'TLS 1.3', 'TLS 1.3'),
    ('securityItem1Desc', 'Tüm veriler iletimde şifrelenir', 'All data encrypted in transit'),
    ('securityItem2Title', 'SOC 2 Hazır', 'SOC 2 Ready'),
    ('securityItem2Desc', 'Güvenlik kontrolleri mevcut', 'Security controls in place'),
    ('securityItem3Title', 'GDPR Uyumlu', 'GDPR Compliant'),
    ('securityItem3Desc', 'AB veri işleme (eu-central-1)', 'EU data processing (eu-central-1)'),
    ('securityItem4Title', 'HMAC-SHA256', 'HMAC-SHA256'),
    ('securityItem4Desc', 'Her webhook imzası doğrulanır', 'Every webhook signature verified'),
    ('securityItem5Title', '2FA / TOTP', '2FA / TOTP'),
    ('securityItem5Desc', 'İki faktörlü doğrulama', 'Two-factor authentication'),
    ('securityItem6Title', 'Denetim Günlükleri', 'Audit Logs'),
    ('securityItem6Desc', 'Her işlemi takip edin', 'Track every action'),
    ('securityItem7Title', 'SSO / SAML', 'SSO / SAML'),
    ('securityItem7Desc', 'Kurumsal tek oturum açma', 'Enterprise single sign-on'),
    ('securityItem8Title', 'IP Beyaz Liste', 'IP Whitelisting'),
    ('securityItem8Desc', 'IP/CIDR ile kısıtlayın', 'Restrict by IP/CIDR'),
]

for k, trv, env in pr_pairs:
    pr_tr[k] = pr_tr.get(k, trv)
    pr_en[k] = pr_en.get(k, env)

# Add array keys for support features
if 'supportFreeFeatures' not in pr_tr:
    pr_tr['supportFreeFeatures'] = ['GitHub Issues', "Topluluk Discord'u", 'Dokümantasyon', 'Stack Overflow']
if 'supportFreeFeatures' not in pr_en:
    pr_en['supportFreeFeatures'] = ['GitHub Issues', 'Community Discord', 'Documentation', 'Stack Overflow']
if 'supportProFeatures' not in pr_tr:
    pr_tr['supportProFeatures'] = ['E-posta desteği', '48 saat yanıt süresi', 'Hata düzeltme önceliği', 'Özellik istekleri']
if 'supportProFeatures' not in pr_en:
    pr_en['supportProFeatures'] = ['Email support', '48h response time', 'Bug fix priority', 'Feature requests']
if 'supportBusinessFeatures' not in pr_tr:
    pr_tr['supportBusinessFeatures'] = ['Özel hesap yöneticisi', 'Slack Connect kanalı', '24 saat yanıt süresi', 'Özel entegrasyonlar', 'Onboarding görüşmesi']
if 'supportBusinessFeatures' not in pr_en:
    pr_en['supportBusinessFeatures'] = ['Dedicated account manager', 'Slack Connect channel', '24h response time', 'Custom integrations', 'Onboarding call']

# Testimonial keys
test_pairs = [
    ('testimonial1Quote', "Kendi webhook'larımızı geliştirmekten HookSniff'e geçtik. Bize 3 ay mühendislik zamanı ve ayda $2K altyapı maliyeti kazandırdı.", 'We switched from building our own webhooks to HookSniff. Saved us 3 months of engineering time and $2K/month in infrastructure costs.'),
    ('testimonial1Author', 'CTO', 'CTO'),
    ('testimonial1Company', 'SaaS Girişimi', 'SaaS Startup'),
    ('testimonial2Quote', 'FIFO teslimat özelliği sipariş işleme hattımız için bir devrim. Olaylar her zaman sırayla geliyor.', 'The FIFO delivery feature is a game-changer for our order processing pipeline. Events arrive in order, every time.'),
    ('testimonial2Author', 'Baş Geliştirici', 'Lead Developer'),
    ('testimonial2Company', 'E-ticaret Platformu', 'E-commerce Platform'),
    ('testimonial3Quote', 'Girişimler için gerçekten çalışan ücretsiz katman. Ayda 8K webhook işliyoruz tek kuruş ödemeden. Svix $490 istiyordu.', 'Free tier that actually works for startups. We process 8K webhooks/month without paying a cent. Svix wanted $490.'),
    ('testimonial3Author', 'Solo Kurucu', 'Solo Founder'),
    ('testimonial3Company', 'Bağımsız Geliştirici', 'Indie Hacker'),
]

for k, trv, env in test_pairs:
    pr_tr[k] = pr_tr.get(k, trv)
    pr_en[k] = pr_en.get(k, env)

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
