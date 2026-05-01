export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  const { sessionId, serviceCode, phoneNumber, text } = req.body

  let response = ''
  const input = text.trim()

  if (input === '') {
    // Main menu
    response = `CON Welcome to Chuma Pay ⚡
1. Check Balance
2. Send Money
3. Receive Money
4. Buy Airtime
0. Exit`

  } else if (input === '1') {
    // Balance — in real app query Supabase here
    response = `END Your Chuma Pay Balance:
Lightning: 0 sats
Onchain: 0 sats
    
Dial *384*1# to transact`

  } else if (input === '2') {
    response = `CON Send Money
Enter recipient phone number:`

  } else if (input.startsWith('2*')) {
    const parts = input.split('*')
    if (parts.length === 2) {
      response = `CON Send to ${parts[1]}
Enter amount in sats:`
    } else if (parts.length === 3) {
      response = `END Payment of ${parts[2]} sats
Queued for ${parts[1]}
You will receive SMS confirmation.`
    }

  } else if (input === '3') {
    response = `CON Receive Money
Enter amount in sats:`

  } else if (input.startsWith('3*')) {
    const parts = input.split('*')
    response = `END Invoice created!
Amount: ${parts[1]} sats
Share code: CP${Date.now().toString().slice(-6)}
Valid for 24 hours`

  } else if (input === '4') {
    response = `CON Buy Airtime
1. MWK 500 (Airtel)
2. MWK 1000 (Airtel)
3. MWK 500 (TNM)
4. MWK 1000 (TNM)
0. Back`

  } else if (input === '0') {
    response = `END Thank you for using Chuma Pay!
Powered by Bitcoin Lightning ⚡`

  } else {
    response = `CON Invalid option. Try again.
0. Back to Main Menu`
  }

  res.setHeader('Content-Type', 'text/plain')
  res.status(200).send(response)
}
