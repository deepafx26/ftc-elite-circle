import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    // Log untuk cek environment variable
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY);

    const url = new URL(request.url);
    const sortBy = url.searchParams.get("sortBy") || "growth_percentage";
    const order = url.searchParams.get("order") || "desc";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("Supabase env missing");
      return Response.json({ data: [] });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

const { data, error } = await supabase
  .from('traders')
  .select('*')
  .limit(1); // Ambil hanya 1 data buat tes

console.log('Test Query Data:', data);
console.error('Test Query Error:', error);
    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ data: [] });
    }

    return Response.json({ data });
  } catch (err) {
    console.error("API traders crash:", err);
    return Response.json({ data: [] });
  }
}