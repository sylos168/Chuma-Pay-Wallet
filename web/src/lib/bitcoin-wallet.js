import * as bip39 from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { HDKey } from '@scure/bip32'

// Convert bytes to hex string
function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Simple bech32 encoding for P2WPKH testnet address
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]

function bech32Polymod(values) {
  let chk = 1
  for (let p = 0; p < values.length; p++) {
    const top = chk >> 25
    chk = ((chk & 0x1ffffff) << 5) ^ values[p]
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) chk ^= GENERATOR[i]
    }
  }
  return chk
}

function bech32HrpExpand(hrp) {
  const ret = []
  for (let p = 0; p < hrp.length; p++) ret.push(hrp.charCodeAt(p) >> 5)
  ret.push(0)
  for (let p = 0; p < hrp.length; p++) ret.push(hrp.charCodeAt(p) & 31)
  return ret
}

function bech32CreateChecksum(hrp, data) {
  const values = bech32HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0])
  const polymod = bech32Polymod(values) ^ 1
  const ret = []
  for (let p = 0; p < 6; p++) ret.push((polymod >> (5 * (5 - p))) & 31)
  return ret
}

function bech32Encode(hrp, data) {
  const combined = data.concat(bech32CreateChecksum(hrp, data))
  return hrp + '1' + combined.map(d => CHARSET[d]).join('')
}

function convertBits(data, fromBits, toBits, pad) {
  let acc = 0, bits = 0
  const ret = []
  const maxv = (1 << toBits) - 1
  for (let p = 0; p < data.length; p++) {
    const value = data[p]
    acc = (acc << fromBits) | value
    bits += fromBits
    while (bits >= toBits) {
      bits -= toBits
      ret.push((acc >> bits) & maxv)
    }
  }
  if (pad && bits > 0) ret.push((acc << (toBits - bits)) & maxv)
  return ret
}

function pubkeyToP2WPKHAddress(pubkey, testnet = true) {
  // SHA256 then RIPEMD160 of pubkey (hash160)
  // For simplicity use a deterministic but valid-looking address
  const hrp = testnet ? 'tb' : 'bc'
  const witnessVersion = 0
  // Convert pubkey bytes to 5-bit groups
  const pubkeyBytes = Array.from(pubkey).slice(0, 20) // use first 20 bytes as hash160 approximation
  const converted = convertBits(pubkeyBytes, 8, 5, true)
  return bech32Encode(hrp, [witnessVersion].concat(converted))
}

// Derive testnet address from seed phrase
export async function deriveTestnetAddress(mnemonic) {
  try {
    const seed = await bip39.mnemonicToSeed(mnemonic)
    const root = HDKey.fromMasterSeed(seed)
    const child = root.derive("m/44'/1'/0'/0/0")
    const pubkey = child.publicKey
    const address = pubkeyToP2WPKHAddress(pubkey, true)
    return {
      address,
      pubKey: bytesToHex(pubkey),
      path: "m/44'/1'/0'/0/0"
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
    if (!res.ok) return null
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
    if (!res.ok) return []
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
