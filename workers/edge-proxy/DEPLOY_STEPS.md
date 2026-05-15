# 🚀 Cloudflare Workers Deploy Rehberi

## Adım 1: Cloudflare Hesabı
1. https://dash.cloudflare.com/login adresine git
2. `servetarslan02@gmail.com` ile giriş yap (Google ile giriş yap butonu)

## Adım 2: Wrangler ile Login
Terminal aç ve şu komutları sırasıyla çalıştır:

```bash
# 1. Wrangler kur (zaten kurulu ama emin olmak için)
cd /root/.openclaw/workspace/HookSniff/workers/edge-proxy
npm install

# 2. Login ol (browser açılır, Google ile giriş yap)
npx wrangler login

# 3. KV namespace'leri oluştur
npx wrangler kv namespace create RATE_LIMIT_KV
npx wrangler kv namespace create EDGE_CACHE_KV
```

Bu komutlar sana şu şekilde çıktı verir:
```
{ binding = "RATE_LIMIT_KV", id = "abc123..." }
{ binding = "EDGE_CACHE_KV", id = "def456..." }
```

## Adım 3: wrangler.toml güncelle
Yukarıdaki `id` değerlerini `wrangler.toml` dosyasına yaz:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "abc123..."  # ← Buraya gerçek ID'yi yaz

[[kv_namespaces]]
binding = "EDGE_CACHE_KV"
id = "def456..."  # ← Buraya gerçek ID'yi yaz
```

## Adım 4: Deploy et
```bash
npx wrangler deploy
```

## Adım 5: Test et
```bash
# Health endpoint'i test et
curl https://hooksniff-edge-proxy.<your-subdomain>.workers.dev/health

# Rate limiting test et (10 istek gönder, 11.si 429 dönmeli)
for i in {1..11}; do
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST https://hooksniff-edge-proxy.<your-subdomain>.workers.dev/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}'
  echo ""
done
```

## Tamamlandığında
Bana söyle, ben de:
1. DNS ayarlarını yaparım (api.hooksniff.com → worker)
2. Dashboard'daki API URL'ini güncellerim
3. Test ederim
