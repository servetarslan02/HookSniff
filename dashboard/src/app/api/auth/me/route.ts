import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1';

export async function GET(request: NextRequest) {
  try {
    // Read token from HttpOnly cookie set by /api/auth/login
    const token = request.cookies.get('hooksniff_token')?.value;

    if (!token) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No token' } }, { status: 401 });
    }

    const apiRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch (error) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Auth check failed' } }, { status: 500 });
  }
}
