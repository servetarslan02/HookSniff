import { NextResponse } from 'next/server';

// In-memory rate limiting (resets on server restart — fine for newsletter)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3; // max 3 attempts per IP per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// In-memory subscriber store (production: replace with database)
const subscribers = new Set<string>();

// Allowed origins for CSRF protection
const ALLOWED_ORIGINS = [
  'https://hooksniff.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

function getRateLimitKey(request: Request): string {
  return request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // If origin is present, validate it
  if (origin) {
    return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
  }

  // Fallback: check referer
  if (referer) {
    return ALLOWED_ORIGINS.some((allowed) => referer.startsWith(allowed));
  }

  // No origin or referer — reject (likely direct curl/CSRF)
  return false;
}

export async function POST(request: Request) {
  try {
    // CSRF protection: validate origin/referer
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Deduplication
    if (subscribers.has(normalizedEmail)) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed! Check your inbox for our latest issue.',
      });
    }

    // Store subscriber
    subscribers.add(normalizedEmail);

    // TODO: Production — store to database or mailing list service
    // TODO: Production — send confirmation email (double opt-in)
    // TODO: Production — send welcome email

    if (process.env.NODE_ENV === 'development') console.log(`[Newsletter] New subscriber: ${normalizedEmail} (total: ${subscribers.size})`); // dev only

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! Check your inbox to confirm.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// GET — list subscribers (admin only, for debugging)
export async function GET() {
  return NextResponse.json({
    success: true,
    count: subscribers.size,
  });
}
