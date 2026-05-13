import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1';

export async function POST(request: NextRequest) {
  try {
    // Forward the auth cookie to the API
    const cookie = request.headers.get('cookie') || '';
    const token = cookie.split(';').find(c => c.trim().startsWith('hooksniff_token='))?.trim().split('=')[1];

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const apiRes = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers,
    });

    const data = await apiRes.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: apiRes.status });

    // Clear cookies on the dashboard domain
    response.headers.append('Set-Cookie', 'hooksniff_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    response.headers.append('Set-Cookie', 'hooksniff_refresh=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

    return response;
  } catch (error) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Logout failed' } }, { status: 500 });
  }
}
