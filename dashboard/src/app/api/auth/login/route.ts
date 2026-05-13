import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const apiRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json(data, { status: apiRes.status });
    }

    // Create response with the data
    const response = NextResponse.json(data);

    // Set cookies on the dashboard domain (same-origin)
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOpts = [
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      `Max-Age=${24 * 60 * 60}`, // 24h
    ].join('; ');

    // Access token cookie
    if (data.token) {
      response.headers.append('Set-Cookie', `hooksniff_token=${data.token}; ${cookieOpts}`);
    }

    // Refresh token cookie (if returned in response)
    if (data.refresh_token) {
      const refreshOpts = [
        'Path=/',
        'HttpOnly', 
        'Secure',
        'SameSite=Lax',
        `Max-Age=${30 * 24 * 60 * 60}`, // 30d
      ].join('; ');
      response.headers.append('Set-Cookie', `hooksniff_refresh=${data.refresh_token}; ${refreshOpts}`);
    }

    return response;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Login failed' } },
      { status: 500 }
    );
  }
}
