import 'dotenv/config'
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const email = process.env.MYFXBOOK_EMAIL;
const password = process.env.MYFXBOOK_PASSWORD;

async function syncPortfolio() {

  console.log("Login MyFxBook...");

  const login = await fetch(
    `https://www.myfxbook.com/api/login.json?email=${email}&password=${password}`
  );

  const loginData = await login.json();
  const session = loginData.session;

  console.log("Login berhasil");

  const accountsRes = await fetch(
    `https://www.myfxbook.com/api/get-my-accounts.json?session=${session}`
  );

  const accountsData = await accountsRes.json();

  const accounts = accountsData.accounts;

  console.log("Jumlah akun:", accounts.length);

  for (const acc of accounts) {

    const trader = {
      trader_name: acc.name,
      growth_percentage: acc.gain,
      drawdown_percentage: acc.drawdown,
      current_equity: acc.equity
    };

    await supabase.from("traders").upsert(trader);

    console.log("Trader diupdate:", acc.name);

  }

  await fetch(`https://www.myfxbook.com/api/logout.json?session=${session}`);

  console.log("Sync selesai");

}

syncPortfolio();