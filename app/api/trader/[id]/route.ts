import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const traderId = params.id;

    const { data: trader, error: traderError } = await supabase
      .from('traders')
      .select('*')
      .eq('id', traderId)
      .maybeSingle();

    if (traderError) {
      return NextResponse.json({ error: traderError.message }, { status: 500 });
    }

    if (!trader) {
      return NextResponse.json({ error: 'Trader not found' }, { status: 404 });
    }

    const { data: details, error: detailsError } = await supabase
      .from('trader_details')
      .select('*')
      .eq('trader_id', traderId)
      .maybeSingle();

    if (detailsError) {
      return NextResponse.json({ error: detailsError.message }, { status: 500 });
    }

    const { data: allTradersForRank, error: rankError } = await supabase
      .from('traders')
      .select('id, growth_percentage')
      .order('growth_percentage', { ascending: false });

    if (rankError) {
      return NextResponse.json({ error: rankError.message }, { status: 500 });
    }

    const rank =
      allTradersForRank?.findIndex((t) => t.id === traderId) + 1 || 0;

    return NextResponse.json({
      trader,
      details,
      rank,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trader' },
      { status: 500 }
    );
  }
}
