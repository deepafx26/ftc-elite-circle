import { createClient } from '@supabase/supabase-js'

// koneksi ke Supabase
const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ambil credential Myfxbook dari env
const email = process.env.MYFXBOOK_EMAIL
const password = process.env.MYFXBOOK_PASSWORD

export async function GET() {

 // login ke Myfxbook
 const login = await fetch(
  `https://www.myfxbook.com/api/login.json?email=${email}&password=${password}`
 )

 const loginData = await login.json()
 const session = loginData.session

 // ambil semua akun myfxbook
 const accountsRes = await fetch(
  `https://www.myfxbook.com/api/get-my-accounts.json?session=${session}`
 )

 const accounts = await accountsRes.json()


 // LOOP SETIAP ACCOUNT
 for (const account of accounts.accounts) {

  const accountId = account.id


  // ===============================
  // 1 INSERT / UPDATE TABLE TRADERS
  // ===============================

  const { data: traders } = await supabase
   .from("traders")
   .select("*")
   .eq("myfxbook_account_id", accountId)

  let trader

  if (!traders || traders.length === 0) {

   const { data } = await supabase
    .from("traders")
    .insert({
      myfxbook_account_id: accountId,
      trader_name: account.name,
      current_equity: account.equity,
      growth_percentage: account.gain,
      drawdown_percentage: account.drawdown
    })
    .select()

   trader = data[0]

  } else {

   trader = traders[0]

   await supabase
    .from("traders")
    .update({
      current_equity: account.equity,
      growth_percentage: account.gain,
      drawdown_percentage: account.drawdown,
      updated_at: new Date()
    })
    .eq("id", trader.id)

  }



  // ==================================
  // 2 AMBIL TRADE HISTORY MYFXBOOK
  // ==================================

  const tradeRes = await fetch(
   `https://www.myfxbook.com/api/get-history.json?session=${session}&id=${accountId}`
  )

  const tradeData = await tradeRes.json()

  if (tradeData.history) {

   for (const trade of tradeData.history) {

    await supabase
     .from("trade_history")
     .insert({
       trader_id: trader.id,
       ticket: trade.ticket,
       symbol: trade.symbol,
       type: trade.type,
       lots: trade.lots,
       profit: trade.profit,
       open_time: trade.openTime,
       close_time: trade.closeTime
     })

   }

  }



  // ==================================
  // 3 AMBIL EQUITY HISTORY
  // ==================================

  const equityRes = await fetch(
   `https://www.myfxbook.com/api/get-daily-gain.json?session=${session}&id=${accountId}`
  )

  const equityData = await equityRes.json()

  if (equityData.dailyGain) {

   for (const row of equityData.dailyGain) {

    await supabase
     .from("equity_history")
     .insert({
       trader_id: trader.id,
       date: row.date,
       equity: row.equity,
       balance: row.balance
     })

   }

  }


 }

 return Response.json({ status: "sync complete" })

}