// Import client Supabase
import { createClient } from '@supabase/supabase-js'

// Membuat koneksi ke database Supabase menggunakan environment variable
const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.SUPABASE_SERVICE_ROLE_KEY
)
export const dynamic = "force-dynamic"
// Endpoint API /api/sync
export async function GET() {

 try {

  console.log("===== START SYNC =====")

  // login Myfxbook
  const loginRes = await fetch(
   `https://www.myfxbook.com/api/login.json?email=${process.env.MYFXBOOK_EMAIL}&password=${process.env.MYFXBOOK_PASSWORD}`
  )

  const loginData = await loginRes.json()
  const session = loginData.session

  if (!session) {
   console.error("MYFXBOOK LOGIN FAILED")
   return Response.json({ error: "login failed" })
  }

  console.log("MYFXBOOK LOGIN SUCCESS")

  // ambil list account
  const accountRes = await fetch(
   `https://www.myfxbook.com/api/get-my-accounts.json?session=${session}`
  )

  const accounts = await accountRes.json()

  if (!accounts.accounts) {
   console.error("NO ACCOUNTS FOUND")
   return Response.json({ error: "no accounts" })
  }

  console.log("TOTAL ACCOUNTS:", accounts.accounts.length)

  // ==============================
  // LOOP SEMUA ACCOUNT
  // ==============================

  for (const account of accounts.accounts) {

   const accountId = account.id
   let traderId = null

   console.log("================================")
   console.log("PROCESS ACCOUNT:", account.name)

   // cek trader
   const { data: traders } = await supabase
    .from("traders")
    .select("*")
    .eq("myfxbook_account_id", accountId)

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
     .single()

    if (error) {
     console.error("INSERT TRADER ERROR:", error)
     continue
    }

    traderId = data.id
    console.log("TRADER INSERTED:", traderId)

   } else {

    traderId = traders[0].id

    await supabase
     .from("traders")
     .update({
      current_equity: account.equity,
      growth_percentage: account.gain,
      drawdown_percentage: account.drawdown,
      updated_at: new Date()
     })
     .eq("id", traderId)

    console.log("TRADER UPDATED:", traderId)

   }

   // ==============================//
   // UPDATE trader_details         //
   // ==============================//

   await supabase
    .from("trader_details")
    .upsert({
     trader_id: traderId,
     current_balance: account.balance,
     total_deposit: account.balance,
     updated_at: new Date()
    }, { onConflict: "trader_id" })

   console.log("DETAIL UPDATED")

    // ==============================//
    // EQUITY HISTORY                //
    // ==============================//

try {

 const equityRes = await fetch(
  `https://www.myfxbook.com/api/get-daily-gain.json?session=${session}&id=${accountId}`
 )

 const equityData = await equityRes.json()

 if (equityData?.dailyGain?.length) {

  console.log("EQUITY ROWS:", equityData.dailyGain.length)

  for (const row of equityData.dailyGain) {

   await supabase
 .from("equity_history")
 .upsert({
  trader_id: traderId,
  date: row.date,
  equity: account.equity
 }, { onConflict: "trader_id,date" })

  }

 } else {

  console.log("NO EQUITY DATA:", account.name)

 }

} catch (err) {

 console.error("EQUITY ERROR:", err)

}


// ==============================
// TRADE HISTORY
// ==============================

try {

 const tradeRes = await fetch(
  `https://www.myfxbook.com/api/get-history.json?session=${session}&id=${accountId}`
 )

 const tradeData = await tradeRes.json()

 if (tradeData?.history?.length) {

  console.log("TRADE ROWS:", tradeData.history.length)

  for (const trade of tradeData.history) {

   const { error } = await supabase
 .from("trade_history")
 .upsert({
  trader_id: traderId,
  ticket: trade.ticket,
  symbol: trade.symbol,
  type: trade.action,
  lot: trade.lots,
  entry_price: trade.openPrice,
  exit_price: trade.closePrice,
  profit: trade.profit,
  date: trade.closeTime
 }, { onConflict: "ticket" })

if (error) {
 console.error("TRADE INSERT ERROR:", error)
} else {
 console.log("TRADE INSERTED:", trade.ticket)
}

  }

 } else {

  console.log("NO TRADE HISTORY:", account.name)

 }

} catch (err) {

 console.error("TRADE ERROR:", err)

}

  }

  console.log("===== SYNC COMPLETE =====")

  return Response.json({ status: "sync selesai" })

 } catch (error) {

  console.error("SYNC ERROR:", error)
  return Response.json({ error: "sync gagal" })

 }

}