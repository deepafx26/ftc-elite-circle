import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type traders = {
  id: string;
  trader_name: string;
  growth_percentage: number;
  drawdown_percentage: number;
  current_equity: number;
  created_at: string;
  updated_at: string;
};
