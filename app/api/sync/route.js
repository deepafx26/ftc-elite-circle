import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {

 try {

  const email = process.env.MYFXBOOK_EMAIL
  const password = process.env.MYFXBOOK_PASSWORD

  const login = await fetch(
   `https://www.myfxbook.com/api/login.json?email=${email}&password=${password}`
  )

  const loginData = await login.json()
  const session = loginData.session

  const accountsRes = await fetch(
   `https://www.myfxbook.com/api/get-my-accounts.json?session=${session}`
  )

  const accounts = await accountsRes.json()

  console.log("ACCOUNTS:", accounts)

  return Response.json(accounts)

 } catch (error) {

  console.error("SYNC ERROR:", error)

  return Response.json({
   error: error.message
  })

 }

}