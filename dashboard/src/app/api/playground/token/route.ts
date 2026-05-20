import { NextResponse } from 'next/server';
import { playgroundSet } from '@/lib/redis';

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST() {
  try {
    const token = generateToken();

    // Initialize empty history for this token (24h TTL)
    await playgroundSet(`play:history:${token}`, [], 86400);

    return NextResponse.json({
      success: true,
      token,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hooksniff.vercel.app'}/playground-api/in/${token}`,
      expires_in: '24 hours',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate token' },
      { status: 500, headers: corsHeaders }
    );
  }
}
