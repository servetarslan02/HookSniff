import { NextResponse } from 'next/server';
import { playgroundLpush, playgroundLrange, getRedis, checkRateLimit } from '@/lib/redis';

const MAX_HISTORY = 100;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Event, X-HookSniff-Signature, Svix-ID, Svix-Timestamp, Svix-Signature',
};

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Capture any HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)
async function handleRequest(request: Request, id: string) {
  const ip = getClientIp(request);

  // Rate limit: 120 istek/dakika per IP (plan limitlerinden yemez)
  const { allowed, remaining, retryAfter } = await checkRateLimit(ip, 'request');

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retry_after: retryAfter },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  try {
    // Read request details
    const method = request.method;
    const url = new URL(request.url);
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Read body
    let body = '';
    try {
      body = await request.text();
    } catch {
      // Body might be empty for GET/DELETE
    }

    // Parse body as JSON if possible
    let bodyJson: unknown = null;
    if (body) {
      try {
        bodyJson = JSON.parse(body);
      } catch {
        bodyJson = null;
      }
    }

    // Build request record
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      headers,
      body: body || null,
      body_json: bodyJson,
      content_type: headers['content-type'] || null,
      content_length: body ? body.length : 0,
      ip,
      user_agent: headers['user-agent'] || null,
      timestamp: new Date().toISOString(),
    };

    // Store in history (keep last MAX_HISTORY)
    const key = `play:history:${id}`;
    const existing = (await playgroundLrange(key, 0, MAX_HISTORY - 1)) as unknown[];
    if (existing.length >= MAX_HISTORY) {
      await playgroundLpush(key, record, 86400);
      const r = getRedis();
      if (r) {
        await r.ltrim(key, 0, MAX_HISTORY - 1);
      }
    } else {
      await playgroundLpush(key, record, 86400);
    }

    // Return success — mimic real webhook endpoint behavior
    const forceStatus = url.searchParams.get('force_status_code');
    const echoBody = url.searchParams.get('echo_body');

    if (forceStatus) {
      const statusCode = parseInt(forceStatus, 10);
      if (statusCode >= 100 && statusCode <= 599) {
        return new NextResponse(
          echoBody === 'true' ? body : JSON.stringify({ error: `Forced status ${statusCode}` }),
          {
            status: statusCode,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': '60',
              'X-RateLimit-Remaining': String(remaining),
              ...corsHeaders,
            },
          },
        );
      }
    }

    return new NextResponse(
      echoBody === 'true' ? body : JSON.stringify({ received: true, id: record.id }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-HookSniff-Playground': 'true',
          'X-HookSniff-Delivery-Id': record.id,
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': String(remaining),
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    console.error('Playground receive error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders },
    );
  }
}

type RouteParams = { params: Promise<{ id: string }> };

async function resolveId(params: RouteParams['params']): Promise<string> {
  return (await params).id;
}

export async function GET(request: Request, ctx: RouteParams) {
  return handleRequest(request, await resolveId(ctx.params));
}
export async function POST(request: Request, ctx: RouteParams) {
  return handleRequest(request, await resolveId(ctx.params));
}
export async function PUT(request: Request, ctx: RouteParams) {
  return handleRequest(request, await resolveId(ctx.params));
}
export async function DELETE(request: Request, ctx: RouteParams) {
  return handleRequest(request, await resolveId(ctx.params));
}
export async function PATCH(request: Request, ctx: RouteParams) {
  return handleRequest(request, await resolveId(ctx.params));
}
export async function HEAD(request: Request, ctx: RouteParams) {
  return handleRequest(request, await resolveId(ctx.params));
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
