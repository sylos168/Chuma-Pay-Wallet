export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  const { sessionId, serviceCode, phoneNumber, text } = req.body

  // phoneNumber is automatically provided by Africa's Talking
  const callerPhone = phoneNumber

  let response = ''
  const input = text.trim()

  if (input === '') {
    // Main menu
    response = `CON Welcome to Chuma Pay ⚡
Hi ${callerPhone}!
1. Check Balance
2. Send Money
3. Receive Money
4. Buy Airtime
0. Exit`

  } else if (input === '1') {
    response = `END Your Chuma Pay Balance:
Lightning: 0 sats
Onchain: 0 sats

Dial *384*42777# to transact`

  } else if (input === '2') {
    response = `CON Send Money
Enter recipient phone number:
(Your number: ${callerPhone})`

  } else if (input.startsWith('2*')) {
    const parts = input.split('*')
    if (parts.length === 2) {
      response = `CON Send to +${parts[1]}
Enter amount in sats:`
    } else if (parts.length === 3) {
      response = `END Payment Queued!
From: ${callerPhone}
To: +${parts[1]}
Amount: ${parts[2]} sats
You will receive SMS confirmation.`
    }

  } else if (input === '3') {
    response = `CON Receive Money
Enter amount in sats:`

  } else if (input.startsWith('3*')) {
    const parts = input.split('*')
    response = `END Invoice Created!
Amount: ${parts[1]} sats
Your number: ${callerPhone}
Code: CP${Date.now().toString().slice(-6)}
Valid for 24 hours`

  } else if (input === '4') {
    response = `CON Buy Airtime
1. MWK 500 (Airtel)
2. MWK 1000 (Airtel)
3. MWK 500 (TNM)
4. MWK 1000 (TNM)
0. Back`

  } else if (input.startsWith('4*')) {
    const parts = input.split('*')
    const options = {
      '1': 'MWK 500 Airtel',
      '2': 'MWK 1000 Airtel', 
      '3': 'MWK 500 TNM',
      '4': 'MWK 1000 TNM'
    }
    response = `END Airtime Purchase!
${options[parts[1]] || 'Invalid option'}
Sent to: ${callerPhone}
Payment deducted from your Chuma Pay balance.`

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
