import { NextRequest, NextResponse } from 'next/server';

// Use same base URL logic as api.ts — always include /v1
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-499907444852.europe-west1.run.app';
const API_BASE = RAW_API_URL.endsWith('/v1') ? RAW_API_URL : `${RAW_API_URL}/v1`;

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain');
  if (!domain) {
    return NextResponse.json({ sso_available: false, providers: [] });
  }

  try {
    const res = await fetch(`${API_BASE}/sso/providers?domain=${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ sso_available: false, providers: [] });
  }
}
