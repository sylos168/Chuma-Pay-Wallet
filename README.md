# Chuma Pay Wallet 🪙⚡

A secure, offline-first Bitcoin Lightning wallet designed for rural connectivity in Malawi.
Enables instant payments via SMS and USSD even without internet access.

## Features

- ⚡ **Lightning Node** — LND testnet integration, channel management, invoice generation
- 📱 **USSD Wallet** — Africa's Talking gateway, Chichewa language support
- 🏪 **Merchant Dashboard** — POS terminal, QR stands, Chichewa onboarding guide
- 📡 **Offline Relay** — SMS encoding protocol + BLE proximity payments
- 🍓 **Relay Network** — Raspberry Pi nodes in rural Malawi communities

## Project Structure

```
chuma-pay/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx          # Main wallet overview
│   │   ├── Transact.jsx           # Send & Receive Lightning
│   │   ├── MerchantDashboard.jsx  # Merchant POS tools
│   │   ├── OfflineQueue.jsx       # Offline payment queue
│   │   ├── USSDSimulator.jsx      # USSD phone simulator
│   │   ├── RelayNetwork.jsx       # Relay node management
│   │   └── WalletSettings.jsx     # Wallet configuration
│   ├── components/
│   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   ├── Header.jsx             # Top header bar
│   │   └── ui.jsx                 # Reusable UI components
│   ├── lib/
│   │   ├── wallet-store.jsx       # React context state store
│   │   └── utils.js               # Helpers: formatSats, drawQR, etc.
│   ├── App.jsx                    # Root with routing
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Tailwind + CSS variables
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Connecting to a Real LND Testnet Node

Edit `src/lib/wallet-store.jsx` and replace the mock state with real LND REST API calls:

```js
// LND REST API base
const LND_HOST = 'https://your-lnd-node:8080'
const MACAROON = 'your-admin-macaroon-hex'

// Example: get balance
const res = await fetch(`${LND_HOST}/v1/balance/channels`, {
  headers: { 'Grpc-Metadata-macaroon': MACAROON }
})
const { local_balance } = await res.json()
```

## USSD Integration (Africa's Talking)

1. Sign up at [africastalking.com](https://africastalking.com)
2. Register a USSD service code (e.g. `*483#`)
3. Set your callback URL to your deployed server
4. Handle `POST` requests with `sessionId`, `serviceCode`, `phoneNumber`, `text`

## Relay Node Setup (Raspberry Pi)

```bash
# On your Pi
git clone https://github.com/your-org/chuma-pay-relay
cd chuma-pay-relay
pip install -r requirements.txt
cp config.example.yml config.yml
# Edit config.yml with your LND credentials and SIM settings
python relay.py
```

## Testnet Faucets

- Bitcoin Testnet: https://testnet-faucet.mempool.co
- Lightning Testnet: https://faucet.lightning.community
- Mutinynet: https://faucet.mutinynet.com

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Toasts**: Sonner
- **Lightning**: LND REST API
- **USSD**: Africa's Talking SDK
- **Offline**: Custom SMS encoding + BLE Web API

## License

MIT — Built for Bitcoin Developers Malawi 🇲🇼
