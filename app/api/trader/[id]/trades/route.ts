import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const traderId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('trade_history')
      .select('*', { count: 'exact' })
      .eq('trader_id', traderId)
      .eq('symbol', 'XAUUSD')
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: data || [],
      pagination: {
        current: page,
        total: totalPages,
        perPage: limit,
        count: count || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trade history' },
      { status: 500 }
    );
  }
}
