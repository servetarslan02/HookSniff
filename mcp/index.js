#!/usr/bin/env node
/**
 * HookSniff MCP Server
 * 
 * Allows AI agents (Claude, Cursor, etc.) to manage HookSniff webhooks
 * via the Model Context Protocol.
 * 
 * Usage:
 *   npx @hooksniff/mcp-server
 * 
 * Environment:
 *   HOOKSNIFF_API_KEY  — Your HookSniff API key (required)
 *   HOOKSNIFF_BASE_URL — API base URL (default: https://api.hooksniff.com/v1)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_KEY = process.env.HOOKSNIFF_API_KEY;
const BASE_URL = process.env.HOOKSNIFF_BASE_URL || 'https://api.hooksniff.com/v1';

if (!API_KEY) {
  console.error('Error: HOOKSNIFF_API_KEY environment variable is required');
  process.exit(1);
}

// ─── API Client ───

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'hooksniff-mcp-server/0.1.0',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HookSniff API error (HTTP ${res.status}): ${body}`);
  }

  return res.json();
}

// ─── Tools ───

const TOOLS = [
  {
    name: 'list_endpoints',
    description: 'List all webhook endpoints. Returns endpoint ID, URL, status, and description.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'create_endpoint',
    description: 'Create a new webhook endpoint. Use this when setting up webhook delivery for a new service.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to deliver webhooks to (must be HTTPS)' },
        description: { type: 'string', description: 'Human-readable description' },
      },
      required: ['url'],
    },
  },
  {
    name: 'delete_endpoint',
    description: 'Delete a webhook endpoint by ID. This will stop all webhook delivery to this endpoint.',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint_id: { type: 'string', description: 'The endpoint ID to delete' },
      },
      required: ['endpoint_id'],
    },
  },
  {
    name: 'send_webhook',
    description: 'Send a webhook to an endpoint. Use this to test webhook delivery or trigger events.',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint_id: { type: 'string', description: 'Target endpoint ID' },
        event: { type: 'string', description: 'Event type (e.g., order.created, payment.completed)' },
        data: { type: 'object', description: 'Webhook payload data' },
      },
      required: ['endpoint_id', 'event', 'data'],
    },
  },
  {
    name: 'list_deliveries',
    description: 'List recent webhook deliveries. Shows status, attempts, and timestamps.',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint_id: { type: 'string', description: 'Filter by endpoint ID (optional)' },
        status: { type: 'string', description: 'Filter by status: delivered, failed, pending (optional)' },
        limit: { type: 'number', description: 'Number of results (default: 20, max: 100)' },
      },
      required: [],
    },
  },
  {
    name: 'get_delivery',
    description: 'Get detailed information about a specific webhook delivery, including all retry attempts.',
    inputSchema: {
      type: 'object',
      properties: {
        delivery_id: { type: 'string', description: 'The delivery ID' },
      },
      required: ['delivery_id'],
    },
  },
  {
    name: 'replay_delivery',
    description: 'Replay a failed webhook delivery. Useful for retrying after fixing an endpoint issue.',
    inputSchema: {
      type: 'object',
      properties: {
        delivery_id: { type: 'string', description: 'The delivery ID to replay' },
      },
      required: ['delivery_id'],
    },
  },
  {
    name: 'get_stats',
    description: 'Get webhook delivery statistics: total deliveries, success rate, latency percentiles.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'list_api_keys',
    description: 'List all API keys. Shows prefix and creation date (not the full key).',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'create_api_key',
    description: 'Create a new API key. The full key is only shown once — save it immediately.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Human-readable name for the key' },
      },
      required: [],
    },
  },
];

// ─── Server ───

const server = new Server(
  { name: 'hooksniff-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_endpoints': {
        const endpoints = await apiFetch('/endpoints');
        return {
          content: [{ type: 'text', text: JSON.stringify(endpoints, null, 2) }],
        };
      }

      case 'create_endpoint': {
        const endpoint = await apiFetch('/endpoints', {
          method: 'POST',
          body: JSON.stringify({ url: args.url, description: args.description }),
        });
        return {
          content: [{ type: 'text', text: `Endpoint created:\n${JSON.stringify(endpoint, null, 2)}` }],
        };
      }

      case 'delete_endpoint': {
        await apiFetch(`/endpoints/${args.endpoint_id}`, { method: 'DELETE' });
        return {
          content: [{ type: 'text', text: `Endpoint ${args.endpoint_id} deleted successfully.` }],
        };
      }

      case 'send_webhook': {
        const delivery = await apiFetch('/webhooks', {
          method: 'POST',
          body: JSON.stringify({
            endpoint_id: args.endpoint_id,
            event: args.event,
            data: args.data,
          }),
        });
        return {
          content: [{ type: 'text', text: `Webhook sent:\n${JSON.stringify(delivery, null, 2)}` }],
        };
      }

      case 'list_deliveries': {
        const params = new URLSearchParams();
        if (args.endpoint_id) params.set('endpoint_id', args.endpoint_id);
        if (args.status) params.set('status', args.status);
        if (args.limit) params.set('limit', args.limit.toString());
        const deliveries = await apiFetch(`/webhooks?${params}`);
        return {
          content: [{ type: 'text', text: JSON.stringify(deliveries, null, 2) }],
        };
      }

      case 'get_delivery': {
        const delivery = await apiFetch(`/webhooks/${args.delivery_id}`);
        return {
          content: [{ type: 'text', text: JSON.stringify(delivery, null, 2) }],
        };
      }

      case 'replay_delivery': {
        await apiFetch(`/webhooks/${args.delivery_id}/replay`, { method: 'POST' });
        return {
          content: [{ type: 'text', text: `Delivery ${args.delivery_id} replayed successfully.` }],
        };
      }

      case 'get_stats': {
        const stats = await apiFetch('/stats');
        return {
          content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }],
        };
      }

      case 'list_api_keys': {
        const keys = await apiFetch('/api-keys');
        return {
          content: [{ type: 'text', text: JSON.stringify(keys, null, 2) }],
        };
      }

      case 'create_api_key': {
        const key = await apiFetch('/api-keys', {
          method: 'POST',
          body: JSON.stringify({ name: args.name }),
        });
        return {
          content: [{ type: 'text', text: `API Key created (save this — it won't be shown again):\n${JSON.stringify(key, null, 2)}` }],
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// ─── Start ───

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('HookSniff MCP server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
