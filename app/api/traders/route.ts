import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);

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
      console.error(error);
      return Response.json({ data: [] });
    }

    return Response.json({ data });

  } catch (err) {
    console.error("API ERROR:", err);
    return Response.json({ data: [] });
  }
}