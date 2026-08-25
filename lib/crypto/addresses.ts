/**
 * Business crypto wallets for receiving payments.
 * Addresses come from env vars (user will provide API keys/addresses later).
 * Graceful fallbacks for demo mode.
 */

export type NetworkKey = 'ETHEREUM' | 'BASE' | 'LIGHTNING'

export interface WalletConfig {
  network: NetworkKey
  label: string
  address: string
  icon: string
  hint: string
}

const EVM_WALLET =
  process.env.NEXT_PUBLIC_CRYPTO_WALLET_EVM || '0xd717d02a2434f8506b14143f60d998337d6f5649'
const LIGHTNING_WALLET =
  process.env.NEXT_PUBLIC_CRYPTO_WALLET_LIGHTNING || 'amaxing@walletofsatoshi.com'

export const WALLETS: WalletConfig[] = [
  {
    network: 'ETHEREUM',
    label: 'Ethereum / EVM',
    address: EVM_WALLET,
    icon: '⟠',
    hint: 'ETH, USDT, USDC y tokens ERC-20 en mainnet o testnet',
  },
  {
    network: 'BASE',
    label: 'Base',
    address: EVM_WALLET,
    icon: '🔵',
    hint: 'Comisiones mínimas, ideal para montos pequeños',
  },
  {
    network: 'LIGHTNING',
    label: 'Lightning Network',
    address: LIGHTNING_WALLET,
    icon: '⚡',
    hint: 'Pagos instantáneos con BTC, casi sin comisión',
  },
]

// ---------- Reference validation (from Xoco-POS patterns) ----------

export function looksLikeEvmAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}

export function looksLikeEnsName(value: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(eth|xyz|luxe)$/i.test(value.trim())
}

export function looksLikeLightningInvoice(value: string): boolean {
  const v = value.trim().toLowerCase()
  return v.startsWith('lnbc') || v.startsWith('lntb') || v.startsWith('lnurl')
}

export function looksLikeTxHash(value: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(value.trim())
}

export function classifyPaymentReference(
  value: string
): 'evm_address' | 'ens_name' | 'lightning_invoice' | 'tx_hash' | 'unknown' {
  if (looksLikeTxHash(value)) return 'tx_hash'
  if (looksLikeEvmAddress(value)) return 'evm_address'
  if (looksLikeEnsName(value)) return 'ens_name'
  if (looksLikeLightningInvoice(value)) return 'lightning_invoice'
  return 'unknown'
}
