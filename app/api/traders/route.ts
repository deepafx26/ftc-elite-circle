import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
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
      .from("traders")
      .select("*")
      .order(sortBy, { ascending: order === "asc" });

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