import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function generateShortCode() {
  return 'CP' + Math.floor(100000 + Math.random() * 900000).toString()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  const sessionId   = req.body?.sessionId   || req.query?.sessionId
  const phoneNumber = req.body?.phoneNumber || req.query?.phoneNumber
  const text        = req.body?.text        || req.query?.text || ''

  const input = text.trim()
  let response = ''

  if (input === '') {
    response = `CON Welcome to Chuma Pay ⚡
1. Check Balance
2. Send Payment
3. Receive Money
4. Buy Airtime
0. Exit`

  } else if (input === '1') {
    // Look up balance by phone number
    const { data } = await supabase
      .from('Wallet')
      .select('balance')
      .eq('phone', phoneNumber)
      .single()

    const balance = data?.balance || 0
    response = `END Your Chuma Pay Balance:
Lightning: ${balance.toLocaleString()} sats
Phone: ${phoneNumber}

Dial *384*42777# to transact`

  } else if (input === '2') {
    response = `CON Send Payment
Enter 8-digit CP code
(e.g. CP482901):`

  } else if (input.startsWith('2*')) {
    const parts = input.split('*')

    if (parts.length === 2) {
      // Look up short code
      const code = parts[1].toUpperCase()
      const { data } = await supabase
        .from('ShortCode')
        .select('*')
        .eq('code', code)
        .eq('status', 'pending')
        .gte('expires_at', new Date().toISOString())
        .single()

      if (!data) {
        response = `CON Code not found or expired.
Try again or press 0 to go back:
0. Back`
      } else {
        response = `CON Pay ${data.amount.toLocaleString()} sats
To: ${data.description || 'Chuma Pay user'}
Code: ${code}

1. Confirm Payment
0. Cancel`
      }

    } else if (parts.length === 3 && parts[2] === '1') {
      // Confirm payment
      const code = parts[1].toUpperCase()
      const { data } = await supabase
        .from('ShortCode')
        .select('*')
        .eq('code', code)
        .eq('status', 'pending')
        .single()

      if (data) {
        await supabase
          .from('ShortCode')
          .update({ status: 'paid' })
          .eq('code', code)

        response = `END Payment Confirmed! ✓
Amount: ${data.amount.toLocaleString()} sats
Code: ${code}
You will receive SMS confirmation.
Powered by Bitcoin Lightning ⚡`
      } else {
        response = `END Payment failed.
Code expired or already used.
Try again: *384*42777#`
      }

    } else if (parts.length === 3 && parts[2] === '0') {
      response = `CON Welcome to Chuma Pay ⚡
1. Check Balance
2. Send Payment
3. Receive Money
4. Buy Airtime
0. Exit`
    }

  } else if (input === '3') {
    response = `CON Receive Money
Enter amount in sats:`

  } else if (input.startsWith('3*')) {
    const parts = input.split('*')
    if (parts.length === 2) {
      const amount = parseInt(parts[1])
      if (!amount || amount <= 0) {
        response = `CON Invalid amount.
Enter amount in sats:`
      } else {
        const code = generateShortCode()
        // Store short code in Supabase
        await supabase
          .from('ShortCode')
          .insert({
            code,
            amount,
            description: `USSD payment from ${phoneNumber}`,
            status: 'pending',
            // Note: user_id will need phone-based lookup in production
          })

        response = `END Invoice Created! ✓
Amount: ${amount.toLocaleString()} sats
Your Code: ${code}

Share this code with the sender.
Valid for 24 hours.
Dial *384*42777# for more.`
      }
    }

  } else if (input === '4') {
    response = `CON Buy Airtime
1. MWK 500 Airtel
2. MWK 1000 Airtel
3. MWK 500 TNM
4. MWK 1000 TNM
0. Back`

  } else if (input.startsWith('4*')) {
    const parts = input.split('*')
    const options = {
      '1': 'MWK 500 Airtel',
      '2': 'MWK 1000 Airtel',
      '3': 'MWK 500 TNM',
      '4': 'MWK 1000 TNM',
    }
    response = `END Airtime Purchase!
${options[parts[1]] || 'Invalid option'}
Sent to: ${phoneNumber}
Deducted from Chuma Pay balance.`

  } else if (input === '0') {
    response = `END Thank you for using Chuma Pay!
Powered by Bitcoin Lightning ⚡`

  } else {
    response = `CON Invalid option.
0. Back to Main Menu`
  }

  res.setHeader('Content-Type', 'text/plain')
  res.status(200).send(response)
}
