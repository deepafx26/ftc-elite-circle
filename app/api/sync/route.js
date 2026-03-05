import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.SUPABASE_SERVICE_ROLE_KEY
)

const email = process.env.MYFXBOOK_EMAIL
const password = process.env.MYFXBOOK_PASSWORD
    if (!email || !password) {
        return new Response("Missing Myfxbook credentials")
    }
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

  if (!traders || traders.length === 0) {

    await supabase
      .from("traders")
      .insert({
        myfxbook_account_id: accountId,
        name: account.name,
        current_equity: account.equity,
        growth_percentage: account.gain,
        drawdown_percentage: account.drawdown,
        created_at: new Date()
      })

  } else {

    const trader = traders[0]

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

}

 return Response.json({ status: "sync complete" })

}