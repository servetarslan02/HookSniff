const fs = require('fs');

// Add missing docsSso.apiReference to EN
let en = fs.readFileSync('src/messages/en.json', 'utf8');
if (!en.includes('"apiReference"')) {
  // Find docsSso section end - look for closing } after listProviders
  const listProvidersIdx = en.indexOf('"listProviders"');
  if (listProvidersIdx > 0) {
    const lineEnd = en.indexOf('\n', listProvidersIdx);
    // Check if there's already apiReference after listProviders
    const nextLine = en.substring(lineEnd + 1, lineEnd + 50);
    if (!nextLine.includes('apiReference')) {
      en = en.substring(0, lineEnd + 1) + '    "apiReference": "API Reference",\n' + en.substring(lineEnd + 1);
      fs.writeFileSync('src/messages/en.json', en, 'utf8');
      console.log('EN: added apiReference');
    }
  }
}

// Add all missing docsSso keys to TR
let tr = fs.readFileSync('src/messages/tr.json', 'utf8');
const trDocsSsoIdx = tr.indexOf('"docsSso"');
if (trDocsSsoIdx > 0) {
  // Find the opening { of docsSso
  const openBrace = tr.indexOf('{', trDocsSsoIdx);
  // Find the matching closing }
  let depth = 1;
  let closeBrace = openBrace + 1;
  while (depth > 0 && closeBrace < tr.length) {
    if (tr[closeBrace] === '{') depth++;
    if (tr[closeBrace] === '}') depth--;
    closeBrace++;
  }
  const docsSsoSection = tr.substring(openBrace, closeBrace);
  
  // Check which keys are missing
  const neededKeys = [
    'azureStep1', 'azureStep2Name', 'azureStep3', 'azureStep4', 'azureStep5', 'azureStep6',
    'providerOidc', 'issuerUrl', 'clientId', 'clientSecret', 'clickSaveTest',
    'googleStep1', 'googleStep2', 'googleStep3', 'googleStep4',
    'oktaStep1', 'oktaStep2', 'oktaStep3', 'oktaStep4',
    'keycloakStep1', 'keycloakStep2', 'keycloakStep3', 'keycloakStep4', 'keycloakStep5', 'keycloakStep6',
    'oneloginStep1', 'oneloginStep2', 'oneloginStep3', 'oneloginStep4',
    'domainVerificationTitle', 'addTxtRecord', 'afterVerify',
    'autoTeamJoinTitle', 'autoTeamJoinDesc',
    'roleViewerDesc', 'roleAnalystDesc', 'roleDeveloperDesc', 'roleAdminDesc',
    'troubleshooting',
    'q1', 'a1', 'q2', 'a2', 'q3', 'a3', 'q4', 'a4', 'q5', 'a5',
    'apiReference', 'getConfig', 'createUpdateConfig', 'deleteConfig',
    'testConnection', 'initiateLogin', 'listProviders',
    'clickSaveTest', 'clientId', 'clientSecret'
  ];
  
  const missingKeys = neededKeys.filter(k => !docsSsoSection.includes('"' + k + '"'));
  
  if (missingKeys.length > 0) {
    // Add missing keys before the closing }
    const newEntries = {
      'azureStep1': 'Azure Portal > Azure Active Directory > Uygulama kayitlari > Yeni kayit',
      'azureStep2Name': 'Ad: HookSniff',
      'azureStep3': 'Yönlendirme URI\'si: https://your-api.trycloudflare.com/v1/sso/oidc/callback',
      'azureStep4': 'Uygulama (istemci) Kimligi ve Dizin (kiraci) Kimligi kopyalayin',
      'azureStep5': 'Sertifikalar ve gizlilik > Yeni istemci gizliligi > degeri kopyalayin',
      'azureStep6': 'HookSniff SSO sayfasinda: Saglayici: OIDC, Issuer URL, Client ID, Client Secret girin',
      'providerOidc': 'Saglayici: OIDC',
      'issuerUrl': 'Issuer URL',
      'clientId': 'Client ID',
      'clientSecret': 'Client Secret',
      'clickSaveTest': 'Kaydet > Test Baglantisi > SSO\'yu Etkinlestir tiklayin',
      'googleStep1': 'Google Cloud Console > API\'ler ve Hizmetler > Kimlik Bilgileri > OAuth 2.0 Istemci Kimligi Olusturun',
      'googleStep2': 'Uygulama turu: Web uygulamasi',
      'googleStep3': 'Yetkili yonlendirme URI\'si: https://your-api.trycloudflare.com/v1/sso/oidc/callback',
      'googleStep4': 'Client ID ve Client Secret kopyalayin',
      'oktaStep1': 'Okta Admin > Uygulamalar > Uygulama Olusturun',
      'oktaStep2': 'Oturum acma yontemi: OIDC - OpenID Connect',
      'oktaStep3': 'Uygulama turu: Web Uygulamasi',
      'oktaStep4': 'Client ID ve Client Secret kopyalayin',
      'keycloakStep1': 'Yeni bir Realm olusturun (veya mevcut olani kullanin)',
      'keycloakStep2': 'Musteriler > Istemci olusturun',
      'keycloakStep3': 'Istemci turu: OpenID Connect',
      'keycloakStep4': 'Istemci Kimligi: hooksniff',
      'keycloakStep5': 'Gecerli yeniden yonlendirme URI\'lari: https://your-api.trycloudflare.com/v1/sso/oidc/callback',
      'keycloakStep6': 'Kimlik Bilgileri sekmesine gidin > Istemci Gizliligini kopyalayin',
      'oneloginStep1': 'Uygulamalar > Uygulama Ekle > SAML Ozel Baglayici (Gelismis)',
      'oneloginStep2': 'ACS URL: https://your-api.trycloudflare.com/v1/sso/saml/callback',
      'oneloginStep3': 'Varlik Kimligi: urn:hooksniff:sp',
      'oneloginStep4': 'HookSniff SSO sayfasinda: Saglayici: SAML, Metadata URL girin',
      'domainVerificationTitle': 'Alan Adi Dogrulama',
      'addTxtRecord': 'TXT kaydi ekleyin',
      'afterVerify': 'Dogrulama sonrasi SSL sertifikasi otomatik olarak saglanir',
      'autoTeamJoinTitle': 'Otomatik Ekibe Katilma',
      'autoTeamJoinDesc': 'SSO ile oturum actiginizda, e-posta alan adiniza gore otomatik olarak bir ekibe katilabilirsiniz.',
      'roleViewerDesc': 'Salt okunur erisim',
      'roleAnalystDesc': 'Analitik ve raporlama erisimi',
      'roleDeveloperDesc': 'Gelistirme erisimi',
      'roleAdminDesc': 'Tam yonetici erisimi',
      'troubleshooting': 'Sorun Giderme',
      'q1': 'Hangi saglayicilari destekliyorsunuz?',
      'a1': 'Azure AD, Google Workspace, Okta, Keycloak, Auth0, OneLogin ve herhangi bir SAML 2.0 veya OIDC saglayicisini destekliyoruz.',
      'q2': 'SSO\'yu devre disi birakabilir miyim?',
      'a2': 'Evet, ancak Enterprise planinda. SSO etkinlestirildiginde, tum ekip uyeleri kimlik dogrulama icin kullanmak zorundadir.',
      'q3': 'SCIM otomatik provizyonlama destekliyor musunuz?',
      'a3': 'Evet. SCIM 2.0 destegi Enterprise planinda mevcuttur.',
      'q4': 'SSO kurulumu ne kadar suruyor?',
      'a4': 'Tipik olarak 10-15 dakika. Adim adim kılavuzumuz sureci boyunca size yol gosterir.',
      'q5': 'SSO ile cok faktorlu kimlik dogrulama kullanabilir miyim?',
      'a5': 'Evet. Cogu IdP MFA destekler. HookSniff ayrica TOTP tabanli 2FA da saglar.',
      'apiReference': 'API Referansi',
      'getConfig': 'Yapilandirmayi al',
      'createUpdateConfig': 'Yapilandirma olustur/guncelle',
      'deleteConfig': 'Yapilandirmayi sil',
      'testConnection': 'Baglantiyi test et',
      'initiateLogin': 'Giris baslat',
      'listProviders': 'Saglayicilari listele'
    };
    
    // Insert missing keys before the closing brace of docsSso
    const insertPoint = closeBrace - 1;
    const newLines = missingKeys
      .filter(k => newEntries[k])
      .map(k => `    "${k}": "${newEntries[k]}"`)
      .join(',\n');
    
    tr = tr.substring(0, insertPoint) + ',\n' + newLines + '\n  ' + tr.substring(insertPoint);
    fs.writeFileSync('src/messages/tr.json', tr, 'utf8');
    console.log('TR: added ' + missingKeys.length + ' missing docsSso keys');
  } else {
    console.log('TR: no missing docsSso keys');
  }
}

// Verify
const enCheck = fs.readFileSync('src/messages/en.json', 'utf8');
const trCheck = fs.readFileSync('src/messages/tr.json', 'utf8');
try { JSON.parse(enCheck); console.log('EN JSON: VALID'); } catch(e) { console.log('EN JSON: INVALID - ' + e.message); }
try { JSON.parse(trCheck); console.log('TR JSON: VALID'); } catch(e) { console.log('TR JSON: INVALID - ' + e.message); }
