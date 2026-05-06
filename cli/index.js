#!/usr/bin/env node

/**
 * HookRelay CLI — Manage webhooks from your terminal.
 *
 * Usage:
 *   hookrelay auth login          # Login with API key
 *   hookrelay endpoints list      # List endpoints
 *   hookrelay endpoints create    # Create endpoint
 *   hookrelay send <event> <data> # Send a webhook
 *   hookrelay deliveries list     # List recent deliveries
 *   hookrelay deliveries get <id> # Get delivery details
 *   hookrelay deliveries replay <id> # Replay a delivery
 *   hookrelay listen <endpoint>   # Listen for incoming webhooks
 */

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

// ── Config ──
const CONFIG_DIR = path.join(os.homedir(), '.hookrelay');
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
  return config.api_url || process.env.HOOKRELAY_API_URL || 'http://localhost:3000/v1';
}

function getApiKey() {
  const config = loadConfig();
  const key = config.api_key || process.env.HOOKRELAY_API_KEY;
  if (!key) {
    console.error('❌ Not authenticated. Run: hookrelay auth login');
    process.exit(1);
  }
  return key;
}

function getToken() {
  const config = loadConfig();
  return config.token || process.env.HOOKRELAY_TOKEN;
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
    const apiKey = opts.apiKey || process.env.HOOKRELAY_API_KEY;
    const apiUrl = opts.apiUrl || process.env.HOOKRELAY_API_URL || 'http://localhost:3000/v1';

    if (!apiKey) {
      console.log('Usage: hookrelay auth login --api-key hr_live_YOUR_KEY');
      console.log('');
      console.log('Get your API key from: http://localhost:3001/dashboard/api-keys');
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
      console.error('   Make sure HookRelay is running: make dev');
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
      console.log('No endpoints. Create one with: hookrelay endpoints create');
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
            if (k.startsWith('x-hookrelay') || k.startsWith('webhook-')) {
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
      console.log(`🪝 HookRelay CLI — Listening for webhooks`);
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

// ── Parse ──
program
  .name('hookrelay')
  .description('🪝 HookRelay CLI — Manage webhooks from your terminal')
  .version('0.1.0');

program.parse();
