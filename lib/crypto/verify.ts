/**
 * On-chain payment verification (adapted from Xoco-POS use-polling-status).
 * EVM: polls block explorer APIs (Etherscan/Basescan) for matching txs.
 * Lightning: polls a WoS-compatible API for invoice status.
 *
 * Status flow: WAITING → DETECTED → CONFIRMED (or ERROR)
 */

export type PaymentStatus = 'WAITING' | 'DETECTED' | 'CONFIRMED' | 'ERROR'

export interface VerifyConfig {
  network: 'ETHEREUM' | 'BASE' | 'LIGHTNING'
  address?: string // business wallet
  expectedWei?: string // expected amount in wei
  txHash?: string // customer tx hash
  invoice?: string // lightning invoice
}

const NETWORK_MODE = process.env.NEXT_PUBLIC_CHAIN_MODE === 'MAINNET' ? 'MAINNET' : 'TESTNET'

function explorerConfig(network: 'ETHEREUM' | 'BASE') {
  if (network === 'BASE') {
    return {
      baseUrl:
        NETWORK_MODE === 'TESTNET'
          ? 'https://api-sepolia.basescan.org/api'
          : 'https://api.basescan.org/api',
      apiKey: process.env.NEXT_PUBLIC_BASESCAN_API_KEY || null,
    }
  }
  return {
    baseUrl:
      NETWORK_MODE === 'TESTNET'
        ? 'https://api-sepolia.etherscan.io/api'
        : 'https://api.etherscan.io/api',
    apiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || null,
  }
}

/**
 * Poll once: check current on-chain status.
 * Call this from a setInterval(5s) in the UI.
 */
const MOCK_ADDRESSES = [
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
]
const isMock = (v?: string) =>
  !!v &&
  (MOCK_ADDRESSES.includes(v) ||
    v.toLowerCase().includes('mock') ||
    v.toLowerCase().includes('test'))

export async function verifyPaymentOnce(config: VerifyConfig): Promise<{
  status: PaymentStatus
  message: string
}> {
  // Mock testing: cualquier referencia que contenga mock/test confirma al instante
  if (isMock(config.address) || isMock(config.txHash) || isMock(config.invoice)) {
    if (config.txHash || config.invoice) {
      return { status: 'CONFIRMED', message: 'Pago mock confirmado (testing) ✓' }
    }
    return {
      status: 'DETECTED',
      message: 'Dirección mock detectada — pega un hash mock para confirmar',
    }
  }
  try {
    if (config.network === 'LIGHTNING') {
      return await verifyLightning(config.invoice)
    }
    return await verifyEvm(config)
  } catch {
    return { status: 'ERROR', message: 'No se pudo consultar la red. Intenta de nuevo.' }
  }
}

async function verifyEvm(
  config: VerifyConfig
): Promise<{ status: PaymentStatus; message: string }> {
  const { baseUrl, apiKey } = explorerConfig(config.network as 'ETHEREUM' | 'BASE')
  if (!baseUrl) {
    return { status: 'ERROR', message: 'Red no configurada.' }
  }

  // If we have a tx hash, look it up directly
  if (config.txHash) {
    const params = new URLSearchParams({
      module: 'transaction',
      action: 'gettxreceiptstatus',
      txhash: config.txHash,
    })
    if (apiKey) params.set('apikey', apiKey)
    const res = await fetch(`${baseUrl}?${params}`)
    const data = await res.json()
    if (data?.status === '1' && data.result?.status === '1') {
      return { status: 'CONFIRMED', message: 'Pago confirmado en la blockchain' }
    }
    return { status: 'DETECTED', message: 'Transacción encontrada, esperando confirmaciones…' }
  }

  // Otherwise poll the business wallet for incoming txs matching amount
  if (!config.address) {
    return { status: 'ERROR', message: 'Wallet no configurada.' }
  }

  const params = new URLSearchParams({
    module: 'account',
    action: 'txlist',
    address: config.address,
    startblock: '0',
    endblock: '99999999',
    sort: 'desc',
    page: '1',
    offset: '10',
  })
  if (apiKey) params.set('apikey', apiKey)

  const res = await fetch(`${baseUrl}?${params}`)
  const data = await res.json()

  if (data?.status !== '1' || !Array.isArray(data.result)) {
    return { status: 'WAITING', message: 'Esperando pago en la red…' }
  }

  for (const tx of data.result) {
    const toMatches = config.address && tx.to?.toLowerCase() === config.address.toLowerCase()
    const amountMatches = !config.expectedWei || tx.value === config.expectedWei
    if (toMatches && amountMatches) {
      return { status: 'DETECTED', message: 'Pago detectado en mempool' }
    }
  }

  return { status: 'WAITING', message: 'Esperando pago en la red…' }
}

async function verifyLightning(
  invoice?: string
): Promise<{ status: PaymentStatus; message: string }> {
  if (!invoice) {
    return { status: 'ERROR', message: 'Factura Lightning no especificada.' }
  }
  const apiUrl =
    process.env.NEXT_PUBLIC_LN_API_URL_MAINNET || process.env.NEXT_PUBLIC_LN_API_URL_TESTNET
  if (!apiUrl) {
    // Without LN API configured, trust manual confirmation in demo mode
    return { status: 'DETECTED', message: 'API Lightning no configurada — confirma manualmente.' }
  }
  const apiKey = process.env.NEXT_PUBLIC_LN_API_KEY_MAINNET
  const res = await fetch(
    `${apiUrl}/wos-api/invoice-status?invoice=${encodeURIComponent(invoice)}`,
    {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    }
  )
  const data = await res.json()
  if (data.status === 'settled' || data.paid === true) {
    return { status: 'CONFIRMED', message: 'Pago Lightning confirmado' }
  }
  if (data.status === 'pending' || data.status === 'in-flight') {
    return { status: 'DETECTED', message: 'Pago LN en ruta' }
  }
  return { status: 'WAITING', message: 'Esperando pago Lightning…' }
}
