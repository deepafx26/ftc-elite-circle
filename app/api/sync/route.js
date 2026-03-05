// Import Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("===== START SYNC =====");

    // login Myfxbook
    const loginRes = await fetch(
      `https://www.myfxbook.com/api/login.json?email=${process.env.MYFXBOOK_EMAIL}&password=${process.env.MYFXBOOK_PASSWORD}`
    );
    const loginData = await loginRes.json();
    const session = loginData.session;

    if (!session) {
      console.error("MYFXBOOK LOGIN FAILED");
      return Response.json({ error: "login failed" });
    }

    console.log("MYFXBOOK LOGIN SUCCESS");

    // ambil list account
    const accountRes = await fetch(
      `https://www.myfxbook.com/api/get-my-accounts.json?session=${session}`
    );
    const accounts = await accountRes.json();

    if (!accounts.accounts) {
      console.error("NO ACCOUNTS FOUND");
      return Response.json({ error: "no accounts" });
    }

    console.log("TOTAL ACCOUNTS:", accounts.accounts.length);

    for (const account of accounts.accounts) {
      const accountId = account.id;
      let traderId = null;

      console.log("================================");
      console.log("PROCESS ACCOUNT:", account.name);

      // cek trader
      const { data: traders } = await supabase
        .from("traders")
        .select("*")
        .eq("myfxbook_account_id", accountId);

      if (!traders || traders.length === 0) {
        const { data, error } = await supabase
          .from("traders")
          .insert({
            myfxbook_account_id: accountId,
            trader_name: account.name,
            current_equity: account.equity,
            growth_percentage: account.gain,
            drawdown_percentage: account.drawdown,
            created_at: new Date()
          })
          .select()
          .single();

        if (error) {
          console.error("INSERT TRADER ERROR:", error);
          continue;
        }

        traderId = data.id;
        console.log("TRADER INSERTED:", traderId);
      } else {
        traderId = traders[0].id;

        await supabase
          .from("traders")
          .update({
            current_equity: account.equity,
            growth_percentage: account.gain,
            drawdown_percentage: account.drawdown,
            updated_at: new Date()
          })
          .eq("id", traderId);

        console.log("TRADER UPDATED:", traderId);
      }

      // update trader_details
      await supabase
        .from("trader_details")
        .upsert({
          trader_id: traderId,
          current_balance: account.balance,
          total_deposit: account.balance,
          updated_at: new Date()
        }, { onConflict: "trader_id" });

      console.log("DETAIL UPDATED");

      // equity history
      try {
        const equityRes = await fetch(
          `https://www.myfxbook.com/api/get-daily-gain.json?session=${session}&id=${accountId}`
        );
        const equityData = await equityRes.json();

        if (equityData?.dailyGain?.length) {
          console.log("EQUITY ROWS:", equityData.dailyGain.length);

          for (const row of equityData.dailyGain) {
            await supabase
              .from("equity_history")
              .upsert({
                trader_id: traderId,
                date: row.date,
                equity: account.equity
              }, { onConflict: "trader_id,date" });
          }
        } else {
          console.log("NO EQUITY DATA:", account.name);
        }
      } catch (err) {
        console.error("EQUITY ERROR:", err);
      }

      // trade history
      try {
        const tradeRes = await fetch(
          `https://www.myfxbook.com/api/get-history.json?session=${session}&id=${accountId}`
        );
        const tradeData = await tradeRes.json();

        if (tradeData?.history?.length) {
          console.log("TRADE ROWS:", tradeData.history.length);

          for (const trade of tradeData.history) {
            // skip non-trade events
            if (['Deposit','Withdrawal'].includes(trade.action)) {
              console.log("NON-TRADE SKIPPED:", trade);
              continue;
            }

            // ambil lot dari sizing.value
            const lot = parseFloat(trade.sizing?.value || trade.lots);
            if (!trade.action || isNaN(lot) || lot <= 0) {
              console.warn("TRADE SKIPPED (invalid type/lot):", trade);
              continue;
            }

            // sesuaikan type dengan enum DB ('Buy','Sell')
              const type = trade.action.charAt(0).toUpperCase() + trade.action.slice(1).toLowerCase();
              if (!['Buy','Sell'].includes(type)) {
                console.warn("TRADE SKIPPED (invalid type enum):", trade);
                continue;
              }

            // pastikan symbol ada
            if (!trade.symbol) {
              console.warn("TRADE SKIPPED (missing symbol):", trade);
              continue;
            }

            const { error } = await supabase.from("trade_history").upsert({
              trader_id: traderId,
              ticket: trade.ticket,
              symbol: trade.symbol,
              type: type,
              lot: lot,
              entry_price: trade.openPrice || 0,
              exit_price: trade.closePrice || 0,
              profit: trade.profit || 0,
              date: trade.closeTime
            }, { onConflict: "ticket" });

            if (error) console.error("TRADE INSERT ERROR:", error);
            else console.log("TRADE INSERTED:", trade.ticket);
          }
        } else {
          console.log("NO TRADE HISTORY:", account.name);
        }
      } catch (err) {
        console.error("TRADE ERROR:", err);
      }
    }

    console.log("===== SYNC COMPLETE =====");
    return Response.json({ status: "sync selesai" });
  } catch (error) {
    console.error("SYNC ERROR:", error);
    return Response.json({ error: "sync gagal" });
  }
}