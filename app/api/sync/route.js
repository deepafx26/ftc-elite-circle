import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

export async function GET() {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const email = process.env.MYFXBOOK_EMAIL;
  const password = process.env.MYFXBOOK_PASSWORD;

  const login = await fetch(
    `https://www.myfxbook.com/api/login.json?email=${email}&password=${password}`
  );

  const loginData = await login.json();
  const session = loginData.session;

  const accountsRes = await fetch(
    `https://www.myfxbook.com/api/get-my-accounts.json?session=${session}`
  );

  const accountsData = await accountsRes.json();

  for (const acc of accountsData.accounts) {

    await supabase.from("traders").insert({
      trader_name: acc.name,
      growth_percentage: acc.gain,
      drawdown_percentage: acc.drawdown,
      current_equity: acc.equity
    });

  }

  await fetch(`https://www.myfxbook.com/api/logout.json?session=${session}`);

  return Response.json({
    status: "sync selesai",
    accounts: accountsData.accounts.length
  });

}