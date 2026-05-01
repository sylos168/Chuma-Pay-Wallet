export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  // Africa's Talking sends form data not JSON
  const sessionId   = req.body?.sessionId   || req.query?.sessionId
  const serviceCode = req.body?.serviceCode || req.query?.serviceCode
  const phoneNumber = req.body?.phoneNumber || req.query?.phoneNumber
  const text        = req.body?.text        || req.query?.text || ''

  const callerPhone = phoneNumber
  const input = text.trim()

  let response = ''

  if (input === '') {
    response = `CON Welcome to Chuma Pay ⚡
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
Enter recipient phone number:`

  } else if (input.startsWith('2*')) {
    const parts = input.split('*')
    if (parts.length === 2) {
      response = `CON Send to ${parts[1]}
Enter amount in sats:`
    } else if (parts.length === 3) {
      response = `END Payment Queued!
From: ${callerPhone}
To: ${parts[1]}
Amount: ${parts[2]} sats
SMS confirmation coming.`
    }

  } else if (input === '3') {
    response = `CON Receive Money
Enter amount in sats:`

  } else if (input.startsWith('3*')) {
    const parts = input.split('*')
    response = `END Invoice Created!
Amount: ${parts[1]} sats
Code: CP${Date.now().toString().slice(-6)}
Valid for 24 hours`

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
Sent to: ${callerPhone}
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
