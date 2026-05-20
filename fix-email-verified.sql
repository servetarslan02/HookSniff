-- HookSniff: email_verified düzeltmesi
-- Neon DB Console > SQL Editor'da çalıştır: https://console.neon.tech

-- 1. Servet'in hesabını doğrula
UPDATE customers SET email_verified = true, updated_at = NOW() 
WHERE email = 'servetarslan02@gmail.com';

-- 2. Demo hesabını doğrula
UPDATE customers SET email_verified = true, updated_at = NOW() 
WHERE email = 'demo@hooksniff.com';

-- 3. Kontrol
SELECT email, email_verified FROM customers 
WHERE email IN ('servetarslan02@gmail.com', 'demo@hooksniff.com');
