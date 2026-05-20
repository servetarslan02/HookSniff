import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-1046140057667.europe-west1.run.app';

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain');
  if (!domain) {
    return NextResponse.json({ sso_available: false, providers: [] });
  }

  try {
    const res = await fetch(`${API_URL}/v1/sso/providers?domain=${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ sso_available: false, providers: [] });
  }
}
