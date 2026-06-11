import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-e6ztf3x2ma-ew.a.run.app/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    const apiRes = await fetch(`${API_BASE}/auth/register`, {
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

    // Set HttpOnly cookies if registration returns tokens (auto-login)
    if (data.token) {
      const cookieOpts = [
        'Path=/',
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
        `Max-Age=${24 * 60 * 60}`, // 24h
      ].join('; ');
      response.headers.append('Set-Cookie', `hooksniff_token=${data.token}; ${cookieOpts}`);
    }

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
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } }, { status: 500 });
  }
}
