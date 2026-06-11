import { NextResponse } from 'next/server';
import { insertPlaygroundRequest } from '@/lib/neon';

const MAX_HISTORY = 100;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Event, X-HookSniff-Signature, Svix-ID, Svix-Timestamp, Svix-Signature',
};

async function handleRequest(request: Request, id: string) {
  try {
    const method = request.method;
    const url = new URL(request.url);
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let body = '';
    try {
      body = await request.text();
    } catch {
      // Body might be empty
    }

    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      token: id,
      method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      headers,
      body: body || null,
      content_length: body ? body.length : 0,
      ip: headers['x-forwarded-for']?.split(',')[0]?.trim() || headers['x-real-ip'] || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Store in Neon (non-blocking)
    try {
      await insertPlaygroundRequest(record);
    } catch (err) {
      console.warn('Neon write failed, returning record in response:', err);
    }

    const forceStatus = url.searchParams.get('force_status_code');
    const echoBody = url.searchParams.get('echo_body');

    if (forceStatus) {
      const statusCode = parseInt(forceStatus, 10);
      if (statusCode >= 100 && statusCode <= 599) {
        return new NextResponse(
          echoBody === 'true' ? body : JSON.stringify({ error: `Forced status ${statusCode}` }),
          {
            status: statusCode,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    }

    return new NextResponse(
      echoBody === 'true' ? body : JSON.stringify({
        received: true,
        id: record.id,
        request: {
          id: record.id,
          method: record.method,
          path: record.path,
          query: record.query,
          headers: record.headers,
          body: record.body,
          content_length: record.content_length,
          ip: record.ip,
          timestamp: record.timestamp,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-HookSniff-Playground': 'true',
          'X-HookSniff-Delivery-Id': record.id,
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Playground receive error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
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
