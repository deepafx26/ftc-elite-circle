import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);

  const sortBy = searchParams.get("sortBy") || "growth_percentage";
  const order = searchParams.get("order") || "desc";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("traders")
    .select("*")
    .order(sortBy, { ascending: order === "asc" });

  if (error) {
    return Response.json({ error: error.message });
  }

  return Response.json({ data });
}