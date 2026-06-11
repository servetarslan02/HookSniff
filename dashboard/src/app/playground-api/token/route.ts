import { NextResponse } from 'next/server';
import { playgroundSet, checkRateLimit } from '@/lib/redis';

// Generate a cryptographically secure playground token
function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const randomValues = new Uint8Array(20);
  crypto.getRandomValues(randomValues);
  let result = 'hs_';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // Rate limit: 10 tokens per hour per IP (plan limitlerinden yemez)
  const { allowed, remaining, retryAfter } = await checkRateLimit(ip, 'token');

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Rate limit exceeded. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        retry_after: retryAfter,
      },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  try {
    const token = generateToken();

    // Initialize empty history for this token (24h TTL)
    await playgroundSet(`play:history:${token}`, [], 86400);

    return NextResponse.json(
      {
        success: true,
        token,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hooksniff.vercel.app'}/playground-api/in/${token}`,
        expires_in: '24 hours',
      },
      {
        headers: {
          ...corsHeaders,
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': String(remaining),
        },
      },
    );
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate token' },
      { status: 500, headers: corsHeaders },
    );
  }
}
