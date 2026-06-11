import { NextResponse } from 'next/server';
import { playgroundLrange, playgroundDelete } from '@/lib/redis';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const key = `play:history:${id}`;

    // Parse query params for pagination
    const url = new URL(request.url);
    const since = url.searchParams.get('since'); // timestamp to get only new entries
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);

    const records = (await playgroundLrange(key, 0, limit - 1)) as unknown[];

    // Filter by timestamp if 'since' param provided
    let filtered = records;
    if (since) {
      filtered = records.filter((r: unknown) => {
        const rec = r as { timestamp: string };
        return rec.timestamp > since;
      });
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      total: records.length,
      data: filtered,
    }, {
      headers: {
        'Cache-Control': 'no-store',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Playground history error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const key = `play:history:${id}`;
    await playgroundDelete(key);

    return NextResponse.json({
      success: true,
      message: 'History cleared',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Playground delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear history' },
      { status: 500, headers: corsHeaders }
    );
  }
}
