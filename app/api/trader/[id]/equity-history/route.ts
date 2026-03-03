import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const traderId = params.id;

    const { data, error } = await supabase
      .from('equity_history')
      .select('*')
      .eq('trader_id', traderId)
      .order('date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch equity history' },
      { status: 500 }
    );
  }
}
