import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE = 'https://hooksniff-api-sdjufmaqka-ew.a.run.app';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /api/health → Cloud Run /health
  if (pathname === '/api/health') {
    const url = `${API_BASE}/health`;
    return NextResponse.rewrite(url);
  }

  // /api/* → Cloud Run /v1/*
  if (pathname.startsWith('/api/')) {
    const path = pathname.replace('/api/', '');
    const url = `${API_BASE}/v1/${path}`;
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
