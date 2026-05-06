import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.hooksniff.is-a.dev';

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/v1/status`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 10 }, // cache 10s
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          overall_status: 'down',
          uptime_30d: 0,
          components: [],
          checked_at: new Date().toISOString(),
          error: `API returned ${res.status}`,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        overall_status: 'down',
        uptime_30d: 0,
        components: [],
        checked_at: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Failed to reach API',
      },
      { status: 502 }
    );
  }
}
