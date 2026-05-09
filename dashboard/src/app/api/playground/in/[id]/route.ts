import { NextResponse } from 'next/server';
import { playgroundLpush, playgroundLrange, getRedis } from '@/lib/redis';

const MAX_HISTORY = 100;

// Capture any HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)
async function handleRequest(request: Request, id: string) {
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
      ip: headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
      user_agent: headers['user-agent'] || null,
      timestamp: new Date().toISOString(),
    };

    // Store in history (keep last MAX_HISTORY)
    const key = `play:history:${id}`;
    const existing = (await playgroundLrange(key, 0, MAX_HISTORY - 1)) as unknown[];
    if (existing.length >= MAX_HISTORY) {
      // Trim to MAX_HISTORY - 1 before adding new
      await playgroundLpush(key, record, 86400);
      // Trim excess
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
            headers: { 'Content-Type': 'application/json' },
          }
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
        },
      }
    );
  } catch (error) {
    console.error('Playground receive error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id);
}
export async function POST(request: Request, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id);
}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id);
}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id);
}
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id);
}
export async function HEAD(request: Request, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id);
}
export async function OPTIONS(request: Request, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id);
}
