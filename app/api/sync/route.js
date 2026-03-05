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

    const { error } = await supabase
     .from("traders")
     .insert({
      myfxbook_account_id: accountId,
      trader_name: account.name,
      current_equity: account.equity,
      growth_percentage: account.gain,
      drawdown_percentage: account.drawdown,
      created_at: new Date()
     })

    // Log jika insert gagal
    if (error) {
     console.error("INSERT ERROR:", error)
    } else {
     console.log("INSERT SUCCESS:", account.name)
    }

   }

   // Jika trader SUDAH ADA → UPDATE data terbaru
   else {

    const trader = traders[0]

    const { error } = await supabase
     .from("traders")
     .update({
      current_equity: account.equity,
      growth_percentage: account.gain,
      drawdown_percentage: account.drawdown,
      updated_at: new Date()
     })
     .eq("id", trader.id)

    // Log jika update gagal
    if (error) {
     console.error("UPDATE ERROR:", error)
    } else {
     console.log("UPDATE SUCCESS:", trader.name)
    }

   }

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