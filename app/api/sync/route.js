// Import client Supabase
import { createClient } from '@supabase/supabase-js'

// Membuat koneksi ke database Supabase menggunakan environment variable
const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Endpoint API /api/sync
export async function GET() {

 try {

  // Ambil credential Myfxbook dari environment variable
  const email = process.env.MYFXBOOK_EMAIL
  const password = process.env.MYFXBOOK_PASSWORD

  // Cek apakah credential tersedia
  if (!email || !password) {
   return new Response("Missing Myfxbook credentials")
  }

  // Login ke API Myfxbook
  const login = await fetch(
   `https://www.myfxbook.com/api/login.json?email=${email}&password=${password}`
  )

  // Convert response login menjadi JSON
  const loginData = await login.json()

  // Ambil session token dari Myfxbook
  const session = loginData.session

  // Mengambil daftar account trading dari Myfxbook
  const accountsRes = await fetch(
   `https://www.myfxbook.com/api/get-my-accounts.json?session=${session}`
  )

  // Convert response account menjadi JSON
  const accounts = await accountsRes.json()

      
  // Loop semua account yang ditemukan
  for (const account of accounts.accounts) {

    
  // ID trader yang akan dipakai oleh semua table
  let traderId = null

   // ID account Myfxbook
   const accountId = account.id

   // Cek apakah account ini sudah ada di table traders
   const { data: traders, error: findError } = await supabase
    .from("traders")
    .select("*")
    .eq("myfxbook_account_id", accountId)

   // Jika query error tampilkan di log
   if (findError) {
    console.error("CHECK ERROR:", findError)
    continue
   }

   // Jika trader BELUM ADA di database → INSERT
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


    // Log jika insert gagal
    if (error) {
     console.error("INSERT ERROR:", error)
    } else {
      traderId = data.id
     console.log("INSERT SUCCESS:", account.name)
    }

   }

   // Jika trader SUDAH ADA → UPDATE data terbaru
   else {

    const trader = traders[0]
      traderId = trader.id

    const { error } = await supabase
     .from("traders")
     .update({
      current_equity: account.equity,
      growth_percentage: account.gain,
      drawdown_percentage: account.drawdown,
      updated_at: new Date()
     })
     .eq("id", traderId)

    // Log jika update gagal
    if (error) {
     console.error("UPDATE ERROR:", error)
    } else {
     console.log("UPDATE SUCCESS:", trader.name)
    }

   }

   // ambil equity history per akun
let equityData = null

try {

 const equityRes = await fetch(
  `https://www.myfxbook.com/api/get-daily-gain.json?session=${session}&id=${accountId}`
 )

 equityData = await equityRes.json()

} catch (err) {

 console.error("EQUITY FETCH ERROR:", err)

}

// Simpan equity history ke table equity_history
if (equityData && equityData.dailyGain) {
   for (const row of equityData.dailyGain) {

  await supabase
    .from("equity_history")
    .insert({
      trader_id: traderId,
      date: row.date,
      equity: row.equity,
      balance: row.balance
    })
  }
}

// ambil trade history per akun
let tradeData = null


try {

 const tradeRes = await fetch(
  `https://www.myfxbook.com/api/get-history.json?session=${session}&id=${accountId}`
 )

 tradeData = await tradeRes.json()

} catch (err) {

 console.error("TRADE FETCH ERROR:", err)

}



// Simpan trade history ke table trade_history
if (tradeData && tradeData.history) {
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
await new Promise(resolve => setTimeout(resolve, 1500))

  console.log("TRADER ID:", traderId)
  
  
  }
  console.log("ACCOUNTS:", accounts)
  // Response jika proses sync selesai
  return Response.json({ status: "sync complete" })

 } catch (error) {

  // Tangkap error global supaya server tidak crash
  console.error("SYNC ERROR:", error)

  return Response.json({
   error: error.message
  })

 }

}