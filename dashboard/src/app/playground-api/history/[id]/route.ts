import { NextResponse } from 'next/server';
import { getPlaygroundHistory, deletePlaygroundHistory } from '@/lib/neon';

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

    // Parse query params
    const url = new URL(request.url);
    const since = url.searchParams.get('since');
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);

    // Frontend sends Date.now() (Unix ms as string)
    const sinceMs = since ? Number(since) : undefined;
    const records = await getPlaygroundHistory(id, sinceMs, limit);

    return NextResponse.json({
      success: true,
      count: records.length,
      requests: records,
    }, {
      headers: {
        'Cache-Control': 'no-store',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Playground history error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history', requests: [] },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deletePlaygroundHistory(id);

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
