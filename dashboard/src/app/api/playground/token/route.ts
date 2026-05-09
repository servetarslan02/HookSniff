import { NextResponse } from 'next/server';
import { playgroundSet } from '@/lib/redis';

// Generate a unique playground token
function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = 'hs_';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST() {
  try {
    const token = generateToken();

    // Initialize empty history for this token (24h TTL)
    await playgroundSet(`play:history:${token}`, [], 86400);

    return NextResponse.json({
      success: true,
      token,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hooksniff.vercel.app'}/api/playground/in/${token}`,
      expires_in: '24 hours',
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
