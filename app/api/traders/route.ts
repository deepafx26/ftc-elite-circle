import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sortBy = url.searchParams.get("sortBy") || "growth_percentage";
    const order = url.searchParams.get("order") || "desc";

    const allowedSortColumns = [
      "growth_percentage",
      "drawdown_percentage",
      "current_equity",
      "trader_name",
      "rank",
    ];

    const safeSortBy = allowedSortColumns.includes(sortBy)
      ? sortBy
      : "growth_percentage";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("[API /traders] env check", {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      sortBy: safeSortBy,
      order,
    });

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing Supabase environment variables",
          hasSupabaseUrl: !!supabaseUrl,
          hasServiceRoleKey: !!serviceRoleKey,
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from("traders")
      .select("*")
      .order(safeSortBy, { ascending: order === "asc" });

    if (error) {
      console.error("[API /traders] Supabase error:", error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          details: error,
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );
    }

    console.log("[API /traders] success", {
      count: data?.length || 0,
    });

    return NextResponse.json(
      {
        ok: true,
        count: data?.length || 0,
        data,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("[API /traders] crash:", err);

    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Unknown server error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}