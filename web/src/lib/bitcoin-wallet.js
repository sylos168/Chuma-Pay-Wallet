import * as bip39 from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'
import { HDKey } from '@scure/bip32'

// Convert bytes to hex string
function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Derive testnet address from seed phrase
export async function deriveTestnetAddress(mnemonic) {
  try {
    const seed = await bip39.mnemonicToSeed(mnemonic)
    const root = HDKey.fromMasterSeed(seed)
    const child = root.derive("m/84'/1'/0'/0/0")
    const pubKeyHex = bytesToHex(child.publicKey)
    return {
      address: `tb1q${pubKeyHex.slice(2, 42)}`,
      pubKey: pubKeyHex,
      path: "m/84'/1'/0'/0/0"
    }
  } catch (e) {
    console.error('deriveTestnetAddress error:', e)
    return null
  }
}

// Check real testnet balance using Blockstream API
export async function getTestnetBalance(address) {
  try {
    const res = await fetch(`https://blockstream.info/testnet/api/address/${address}`)
    const data = await res.json()
    const confirmed = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum
    const unconfirmed = data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum
    return { confirmed, unconfirmed, total: confirmed + unconfirmed }
  } catch (e) {
    console.error('getTestnetBalance error:', e)
    return null
  }
}

// Get testnet transactions
export async function getTestnetTransactions(address) {
  try {
    const res = await fetch(`https://blockstream.info/testnet/api/address/${address}/txs`)
    const data = await res.json()
    return data.map(tx => ({
      id: tx.txid,
      confirmed: tx.status.confirmed,
      blockHeight: tx.status.block_height,
      date: tx.status.block_time ? new Date(tx.status.block_time * 1000) : new Date(),
    }))
  } catch (e) {
    console.error('getTestnetTransactions error:', e)
    return []
  }
}

// Generate new mnemonic using proper BIP39
export function generateBIP39Mnemonic() {
  try {
    return bip39.generateMnemonic(wordlist)
  } catch {
    return null
  }
}

// Validate mnemonic
export function validateMnemonic(mnemonic) {
  try {
    return bip39.validateMnemonic(mnemonic, wordlist)
  } catch {
    return false
  }
}
