#!/usr/bin/env node

/**
 * HookSniff CLI — Manage webhooks from your terminal.
 *
 * Usage:
 *   hooksniff auth login          # Login with API key
 *   hooksniff endpoints list      # List endpoints
 *   hooksniff endpoints create    # Create endpoint
 *   hooksniff send <event> <data> # Send a webhook
 *   hooksniff deliveries list     # List recent deliveries
 *   hooksniff deliveries get <id> # Get delivery details
 *   hooksniff deliveries replay <id> # Replay a delivery
 *   hooksniff listen <endpoint>   # Listen for incoming webhooks
 */

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

// ── Config ──
const CONFIG_DIR = path.join(os.homedir(), '.hooksniff');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveConfig(config) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function getApiBase() {
  const config = loadConfig();
  return config.api_url || process.env.HOOKSNIFF_API_URL || 'https://api.hooksniff.com/v1';
}

function getApiKey() {
  const config = loadConfig();
  const key = config.api_key || process.env.HOOKSNIFF_API_KEY;
  if (!key) {
    console.error('❌ Not authenticated. Run: hooksniff auth login');
    process.exit(1);
  }
  return key;
}

function getToken() {
  const config = loadConfig();
  return config.token || process.env.HOOKSNIFF_TOKEN;
}

async function apiRequest(method, path, body = null) {
  const url = `${getApiBase()}${path}`;
  const headers = {
    'Authorization': `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  };

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    console.error(`❌ Error ${res.status}: ${data.error?.message || JSON.stringify(data)}`);
    process.exit(1);
  }

  return data;
}

// ── Auth Commands ──
program
  .command('auth')
  .description('Authentication commands')
  .command('login')
  .description('Login with API key')
  .option('--api-key <key>', 'API key')
  .option('--api-url <url>', 'API base URL')
  .action(async (opts) => {
    const apiKey = opts.apiKey || process.env.HOOKSNIFF_API_KEY;
    const apiUrl = opts.apiUrl || process.env.HOOKSNIFF_API_URL || 'https://api.hooksniff.com/v1';

    if (!apiKey) {
      console.log('Usage: hooksniff auth login --api-key hr_live_YOUR_KEY');
      console.log('');
      console.log('Get your API key from: https://hooksniff.vercel.app/dashboard/api-keys');
      return;
    }

    // Verify the key works
    try {
      const res = await fetch(`${apiUrl}/endpoints`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (!res.ok) {
        console.error('❌ Invalid API key or server unreachable');
        process.exit(1);
      }

      saveConfig({ api_key: apiKey, api_url: apiUrl });
      console.log('✅ Logged in successfully');
      console.log(`   API: ${apiUrl}`);
      console.log(`   Key: ${apiKey.slice(0, 15)}...`);
    } catch (e) {
      console.error(`❌ Cannot reach API at ${apiUrl}`);
      console.error('   Make sure HookSniff is running: make dev');
      process.exit(1);
    }
  });

// ── Endpoint Commands ──
const endpoints = program.command('endpoints').description('Manage webhook endpoints');

endpoints
  .command('list')
  .description('List all endpoints')
  .action(async () => {
    const data = await apiRequest('GET', '/endpoints');
    if (data.length === 0) {
      console.log('No endpoints. Create one with: hooksniff endpoints create');
      return;
    }
    console.log(`\n🔗 Endpoints (${data.length}):\n`);
    data.forEach((ep, i) => {
      console.log(`  ${i + 1}. ${ep.url}`);
      console.log(`     ID: ${ep.id}`);
      console.log(`     Status: ${ep.is_active ? '✅ Active' : '❌ Inactive'}`);
      console.log(`     Strategy: ${ep.routing_strategy}`);
      console.log('');
    });
  });

endpoints
  .command('create')
  .description('Create a new endpoint')
  .requiredOption('--url <url>', 'Endpoint URL')
  .option('--description <desc>', 'Description')
  .action(async (opts) => {
    const body = { url: opts.url };
    if (opts.description) body.description = opts.description;

    const ep = await apiRequest('POST', '/endpoints', body);
    console.log('✅ Endpoint created:');
    console.log(`   ID:  ${ep.id}`);
    console.log(`   URL: ${ep.url}`);
    console.log(`   Secret: ${ep.signing_secret}`);
  });

endpoints
  .command('delete <id>')
  .description('Delete an endpoint')
  .action(async (id) => {
    await apiRequest('DELETE', `/endpoints/${id}`);
    console.log('✅ Endpoint deleted');
  });

// ── Webhook Commands ──
const webhooks = program.command('webhooks').description('Manage webhook deliveries');

webhooks
  .command('send')
  .description('Send a webhook')
  .requiredOption('--endpoint <id>', 'Endpoint ID')
  .requiredOption('--event <event>', 'Event type (e.g., order.created)')
  .option('--data <json>', 'Payload JSON', '{}')
  .action(async (opts) => {
    let data;
    try {
      data = JSON.parse(opts.data);
    } catch {
      console.error('❌ Invalid JSON in --data');
      process.exit(1);
    }

    const wh = await apiRequest('POST', '/webhooks', {
      endpoint_id: opts.endpoint,
      event: opts.event,
      data,
    });

    console.log('✅ Webhook sent:');
    console.log(`   ID:     ${wh.id}`);
    console.log(`   Status: ${wh.status}`);
    console.log(`   Event:  ${wh.event}`);
  });

webhooks
  .command('list')
  .description('List recent deliveries')
  .option('--page <n>', 'Page number', '1')
  .option('--status <s>', 'Filter by status')
  .action(async (opts) => {
    const params = new URLSearchParams({ page: opts.page });
    if (opts.status) params.set('status', opts.status);

    const data = await apiRequest('GET', `/webhooks?${params}`);
    if (data.deliveries.length === 0) {
      console.log('No deliveries found.');
      return;
    }

    console.log(`\n📦 Deliveries (${data.total} total, page ${data.page}):\n`);
    data.deliveries.forEach((d) => {
      const status = d.status === 'delivered' ? '✅' : d.status === 'failed' ? '❌' : '⏳';
      console.log(`  ${status} ${d.id.slice(0, 12)}…  ${d.event || '—'}  ${d.status}  ${d.attempt_count} attempts`);
    });
    console.log('');
  });

webhooks
  .command('get <id>')
  .description('Get delivery details')
  .action(async (id) => {
    const d = await apiRequest('GET', `/webhooks/${id}`);
    console.log('\n📦 Delivery Details:\n');
    console.log(`  ID:        ${d.id}`);
    console.log(`  Event:     ${d.event || '—'}`);
    console.log(`  Status:    ${d.status}`);
    console.log(`  Endpoint:  ${d.endpoint_id}`);
    console.log(`  Attempts:  ${d.attempt_count}/${d.max_attempts || '?'}`);
    console.log(`  Created:   ${d.created_at}`);
    console.log('');
  });

webhooks
  .command('replay <id>')
  .description('Replay a delivery')
  .action(async (id) => {
    const d = await apiRequest('POST', `/webhooks/${id}/replay`);
    console.log('✅ Webhook replayed:');
    console.log(`   New ID: ${d.id}`);
    console.log(`   Status: ${d.status}`);
  });

// ── Listen Command (Webhook Receiver) ──
program
  .command('listen')
  .description('Start a local webhook receiver for testing')
  .option('--port <n>', 'Local port', '9999')
  .option('--path <p>', 'URL path', '/webhook')
  .action((opts) => {
    const port = parseInt(opts.port);
    const urlPath = opts.path;

    const server = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === urlPath) {
        let body = '';
        req.on('data', (chunk) => body += chunk);
        req.on('end', () => {
          const timestamp = new Date().toISOString();
          console.log(`\n📩 ${timestamp} ${req.method} ${req.url}`);
          console.log(`   Headers:`);
          Object.entries(req.headers).forEach(([k, v]) => {
            if (k.startsWith('x-hooksniff') || k.startsWith('webhook-')) {
              console.log(`     ${k}: ${v}`);
            }
          });
          try {
            const json = JSON.parse(body);
            console.log(`   Body:`);
            console.log(`     ${JSON.stringify(json, null, 2).split('\n').join('\n     ')}`);
          } catch {
            console.log(`   Body: ${body.slice(0, 200)}`);
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ received: true }));
        });
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(port, () => {
      console.log(`🪝 HookSniff CLI — Listening for webhooks`);
      console.log(`   URL: http://localhost:${port}${urlPath}`);
      console.log(`   Press Ctrl+C to stop\n`);
    });
  });

// ── API Keys Commands ──
const apiKeys = program.command('api-keys').description('Manage API keys');

apiKeys
  .command('list')
  .description('List API keys')
  .action(async () => {
    const data = await apiRequest('GET', '/api-keys');
    if (data.length === 0) {
      console.log('No API keys found.');
      return;
    }
    console.log(`\n🔑 API Keys (${data.length}):\n`);
    data.forEach((k, i) => {
      console.log(`  ${i + 1}. ${k.prefix}...`);
      console.log(`     ID: ${k.id}`);
      console.log(`     Status: ${k.is_active ? '✅ Active' : '❌ Inactive'}`);
      console.log(`     Created: ${k.created_at}`);
      console.log('');
    });
  });

apiKeys
  .command('create')
  .description('Create a new API key')
  .option('--name <name>', 'Key name')
  .action(async (opts) => {
    const body = {};
    if (opts.name) body.name = opts.name;
    const data = await apiRequest('POST', '/api-keys', body);
    console.log('✅ API key created:');
    console.log(`   ID:  ${data.id}`);
    console.log(`   Key: ${data.key}`);
    console.log(`   ⚠️  Save this key — it won't be shown again.`);
  });

apiKeys
  .command('delete <id>')
  .description('Delete an API key')
  .action(async (id) => {
    await apiRequest('DELETE', `/api-keys/${id}`);
    console.log('✅ API key deleted');
  });

apiKeys
  .command('rotate <id>')
  .description('Rotate an API key')
  .action(async (id) => {
    const data = await apiRequest('POST', `/api-keys/${id}/rotate`);
    console.log('✅ API key rotated:');
    console.log(`   ID:  ${data.id}`);
    console.log(`   Key: ${data.key}`);
    console.log(`   ⚠️  Save the new key — it won't be shown again.`);
  });

// ── Stats Command ──
program
  .command('stats')
  .description('Show delivery statistics')
  .action(async () => {
    const data = await apiRequest('GET', '/stats');
    console.log('\n📊 Delivery Statistics:\n');
    console.log(`  Total deliveries: ${data.total_deliveries}`);
    console.log(`  ✅ Delivered:     ${data.delivered}`);
    console.log(`  ❌ Failed:        ${data.failed}`);
    console.log(`  ⏳ Pending:       ${data.pending}`);
    console.log(`  Success rate:     ${data.success_rate.toFixed(1)}%`);
    console.log(`  Endpoints:        ${data.endpoints_count}`);
    console.log('');
  });

// ── Status Command ──
program
  .command('status')
  .description('Show HookSniff service status')
  .action(async () => {
    const url = getApiBase().replace('/v1', '') + '/status';
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log('\n🪝 HookSniff Status:\n');
      console.log(`  Status:    ${data.status || 'unknown'}`);
      console.log(`  Version:   ${data.version || 'unknown'}`);
      console.log(`  Uptime:    ${data.uptime || 'unknown'}`);
      console.log(`  Database:  ${data.database || 'unknown'}`);
      console.log(`  Redis:     ${data.redis || 'unknown'}`);
      console.log('');
    } catch {
      console.error('❌ Cannot reach HookSniff API');
      console.error(`   URL: ${url}`);
    }
  });

// ── Whoami Command ──
program
  .command('whoami')
  .description('Show current authenticated user')
  .action(async () => {
    const data = await apiRequest('GET', '/auth/me').catch(() => null);
    if (data) {
      console.log('\n👤 Current User:\n');
      console.log(`  Email: ${data.email}`);
      console.log(`  Plan:  ${data.plan}`);
      console.log(`  ID:    ${data.id}`);
      console.log('');
    } else {
      console.log('Not authenticated. Run: hooksniff auth login --api-key YOUR_KEY');
    }
  });

// ── Tail Command (live delivery stream) ──
program
  .command('tail')
  .description('Watch deliveries in real-time (polls every 3s)')
  .option('--status <s>', 'Filter by status')
  .action(async (opts) => {
    console.log('🪝 Tailing deliveries... (Ctrl+C to stop)\n');
    let lastId = null;

    const poll = async () => {
      try {
        const params = new URLSearchParams({ page: '1' });
        if (opts.status) params.set('status', opts.status);
        const data = await apiRequest('GET', `/webhooks?${params}`);
        const deliveries = data.deliveries || [];

        for (const d of deliveries) {
          if (d.id === lastId) break;
          const status = d.status === 'delivered' ? '✅' : d.status === 'failed' ? '❌' : '⏳';
          const time = new Date(d.created_at).toLocaleTimeString();
          console.log(`${status} ${time}  ${d.event || '—'}  ${d.id.slice(0, 10)}…  → ${d.endpoint_id?.slice(0, 8)}…`);
        }

        if (deliveries.length > 0) lastId = deliveries[0].id;
      } catch {
        // ignore poll errors
      }
    };

    await poll();
    setInterval(poll, 3000);
  });

// ── Parse ──
program
  .name('hooksniff')
  .description('🪝 HookSniff CLI — Manage webhooks from your terminal')
  .version('0.1.0');

program.parse();
