import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.SUPABASE_SERVICE_ROLE_KEY
)

const email = process.env.MYFXBOOK_EMAIL
const password = process.env.MYFXBOOK_PASSWORD

export async function GET() {

 const login = await fetch(
  `https://www.myfxbook.com/api/login.json?email=${email}&password=${password}`
 )

 const loginData = await login.json()
 const session = loginData.session

 const accountsRes = await fetch(
  `https://www.myfxbook.com/api/get-my-accounts.json?session=${session}`
 )

 const accounts = await accountsRes.json()

 for (const account of accounts.accounts) {

  const accountId = account.id

  const { data: traders } = await supabase
   .from("traders")
   .select("*")
   .eq("myfxbook_account_id", accountId)

  if (!traders.length) continue

  const trader = traders[0]

  const historyRes = await fetch(
   `https://www.myfxbook.com/api/get-history.json?session=${session}&id=${accountId}`
  )

  const historyData = await historyRes.json()

  for (const trade of historyData.history) {

   await supabase
    .from("trades")
    .upsert({
     ticket: trade.ticket,
     trader_id: trader.id,
     symbol: trade.symbol,
     type: trade.type,
     lots: trade.lots,
     open_price: trade.openPrice,
     close_price: trade.closePrice,
     profit: trade.profit,
     open_time: trade.openTime,
     close_time: trade.closeTime
    })

  }

  await supabase
   .from("traders")
   .update({
    growth_percentage: account.gain,
    drawdown_percentage: account.drawdown,
    current_equity: account.equity,
    balance: account.balance,
    updated_at: new Date()
   })
   .eq("id", trader.id)

 }

 return Response.json({ status: "sync complete" })

}