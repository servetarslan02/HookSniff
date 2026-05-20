import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    const apiRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Forwarded-For': clientIp,
        'X-Real-IP': clientIp,
      },
      body: JSON.stringify(body),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json(data, { status: apiRes.status });
    }

    // Create response with the data
    const response = NextResponse.json(data);

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
