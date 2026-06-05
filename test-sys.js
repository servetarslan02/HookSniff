const jwt = require('jsonwebtoken');
const https = require('https');
const { execSync } = require('child_process');
const jwtSecret = execSync('gcloud secrets versions access latest --secret=hooksniff-jwt-secret --project=project-0d7b3b3f-2204-4957-909', { encoding: 'utf8' }).trim();
const token = jwt.sign({ sub: '03006b76-7c42-48e2-b379-29be0b11e283', email: 'servetarslan02@gmail.com', plan: 'enterprise', is_admin: true }, jwtSecret, { expiresIn: '1h' });

function req(label, path) {
  return new Promise((resolve) => {
    const r = https.request('https://hooksniff-api-e6ztf3x2ma-ew.a.run.app' + path, {
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const s = res.statusCode < 400 ? '✅' : '❌';
        console.log(s + ' ' + label + ': HTTP ' + res.statusCode);
        if (res.statusCode >= 400) console.log('   ' + d.substring(0, 200));
        resolve(res.statusCode);
      });
    });
    r.on('error', e => { console.error('❌ ' + label + ': ' + e.message); resolve(0); });
    r.end();
  });
}

(async () => {
  await req('Health', '/v1/health');
  await req('Alerts', '/v1/admin/alerts');
  await req('Queue Status', '/v1/admin/queue/status');
  await req('Failed Deliveries', '/v1/admin/deliveries/failed?limit=5&since=24h');
  await req('Dead Letters', '/v1/admin/deliveries/dead-letters?limit=5&since=24h');
  await req('Rate Limit Violations', '/v1/admin/rate-limit-violations?limit=5&since=24h');
  await req('API Latency', '/v1/admin/api-latency?period=24h');
})();
