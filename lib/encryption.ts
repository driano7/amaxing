'use client'

const ENCODER = new TextEncoder()
const DECODER = new TextDecoder()

function assertBrowserCrypto(): Crypto {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API not available')
  }
  return window.crypto
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

const AES_KEY_SIZE = 32

function deriveKeyMaterialFromId(userId: string): Uint8Array {
  const sanitizedId = userId.trim()
  if (!/^\d{7}$/.test(sanitizedId)) {
    throw new Error('User ID must be exactly 7 digits')
  }
  const encodedId = ENCODER.encode(sanitizedId)
  const keyMaterial = new Uint8Array(AES_KEY_SIZE)
  for (let i = 0; i < AES_KEY_SIZE; i += 1) {
    keyMaterial[i] = encodedId[i % encodedId.length]
  }
  return keyMaterial
}

async function importKeyFromUserId(userId: string): Promise<CryptoKey> {
  const cryptoApi = assertBrowserCrypto()
  const keyMaterial = deriveKeyMaterialFromId(userId)
  return cryptoApi.subtle.importKey('raw', keyMaterial, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
}

export interface EncryptedPayload {
  ciphertext: string
  iv: string
  createdAt: string
}

export async function encryptWithUserId(
  userId: string,
  data: Record<string, unknown>
): Promise<EncryptedPayload> {
  const cryptoApi = assertBrowserCrypto()
  const key = await importKeyFromUserId(userId)
  const iv = cryptoApi.getRandomValues(new Uint8Array(12))
  const encoded = ENCODER.encode(JSON.stringify(data))
  const encrypted = await cryptoApi.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return {
    ciphertext: bufferToBase64(encrypted),
    iv: bufferToBase64(iv.buffer),
    createdAt: new Date().toISOString(),
  }
}

export async function decryptWithUserId<T = Record<string, unknown>>(
  userId: string,
  payload: EncryptedPayload
): Promise<T> {
  const key = await importKeyFromUserId(userId)
  const cryptoApi = assertBrowserCrypto()
  const iv = new Uint8Array(base64ToArrayBuffer(payload.iv))
  const decryptedBuffer = await cryptoApi.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    base64ToArrayBuffer(payload.ciphertext)
  )
  return JSON.parse(DECODER.decode(decryptedBuffer)) as T
}

export function generateLocalUserId(): string {
  const cryptoApi = assertBrowserCrypto()
  const random = cryptoApi.getRandomValues(new Uint32Array(1))[0]
  const base = 1000000 + (random % 9000000)
  return base.toString().padStart(7, '0').slice(0, 7)
}

export async function encryptSensitiveFields(
  userId: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const sensitiveFields = ['firstName', 'lastName', 'phone', 'email', 'address', 'city', 'country']
  const toEncrypt: Record<string, unknown> = {}
  const result: Record<string, unknown> = { ...data }

  for (const field of sensitiveFields) {
    if (data[field] && typeof data[field] === 'string' && data[field].length > 0) {
      toEncrypt[field] = data[field]
    }
  }

  if (Object.keys(toEncrypt).length > 0) {
    const encrypted = await encryptWithUserId(userId, toEncrypt)
    result._encrypted = encrypted
    for (const field of Object.keys(toEncrypt)) {
      delete result[field]
    }
  }

  return result
}

export async function decryptSensitiveFields<T extends Record<string, unknown>>(
  userId: string,
  data: T
): Promise<T> {
  if (!data._encrypted) return data
  try {
    const decrypted = await decryptWithUserId<Record<string, unknown>>(
      userId,
      data._encrypted as EncryptedPayload
    )
    const result = { ...data }
    delete result._encrypted
    return { ...result, ...decrypted } as T
  } catch {
    return data
  }
}
