import { useState, useEffect } from 'react'

export function useBTCPrice() {
  const [price, setPrice] = useState(null)
  const [change, setChange] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Try Coinbase API first
        const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot')
        const data = await res.json()
        const usdPrice = parseFloat(data.data.amount)

        // MWK rate — 1 USD ≈ 1730 MWK
        const MWK_RATE = 1730
        const mwkPrice = usdPrice * MWK_RATE

        setPrice({ usd: usdPrice, mwk: mwkPrice })
        setChange(0)
      } catch (e) {
        try {
          // Fallback to blockchain.info
          const res = await fetch('https://blockchain.info/ticker')
          const data = await res.json()
          const usdPrice = data.USD.last
          setPrice({ usd: usdPrice, mwk: usdPrice * 1730 })
          setChange(0)
        } catch (e2) {
          setPrice(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000)
    return () => clearInterval(interval)
  }, [])

  return { price, change, loading }
}
