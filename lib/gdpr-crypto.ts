// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
//
// Cifrado de datos personales (GDPR) — AES-256-GCM.
//
// Adaptado del patrón de XocoCafé (4 columnas por campo: Encrypted/Iv/Tag/Salt,
// PBKDF2 desde el email como base de la llave), con una mejora importante:
//
//   XocoCafé deriva la llave SOLO desde el email. El email no es un secreto:
//   con un dump de la base de datos y una lista de correos, cualquiera
//   descifra todo. Para GDPR eso es insuficiente.
//
//   Aquí la llave se deriva de (email + pepper), donde el pepper es un
//   secreto del servidor (GDPR_PEPPER). Un atacante con solo el dump de la
//   BD NO puede descifrar nada: necesita además acceso al servidor.
//
// Nombres de columnas: <campo>Encrypted / <campo>Iv / <campo>Tag / <campo>Salt
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12 // 96 bits, el tamaño recomendado para GCM
const SALT_BYTES = 16
const KEY_BYTES = 32
const PBKDF2_ITERATIONS = 210_000 // OWASP 2023 para PBKDF2-SHA256

/** Campos personales que se cifran en reposo. */
export const SENSITIVE_FIELDS = ['first_name', 'last_name', 'phone'] as const
export type SensitiveField = (typeof SENSITIVE_FIELDS)[number]

export interface EncryptedValue {
  encrypted: string
  iv: string
  tag: string
  salt: string
}

/**
 * Pepper del servidor. Sin él NO se puede descifrar nada.
 * Se genera una vez y vive en el entorno (nunca en el repo).
 */
export function getPepper(): string {
  const pepper = process.env.GDPR_PEPPER
  if (!pepper || pepper.length < 32) {
    throw new Error(
      'GDPR_PEPPER ausente o demasiado corto (mín. 32 chars). Genera uno con: openssl rand -hex 32'
    )
  }
  return pepper
}

export function isPepperConfigured(): boolean {
  const pepper = process.env.GDPR_PEPPER
  return !!pepper && pepper.length >= 32
}

/** Deriva la llave de un usuario: PBKDF2(email + pepper, salt). */
function deriveKey(email: string, salt: Buffer, pepper: string): Buffer {
  return pbkdf2Sync(
    `${pepper}\u0000${email.trim().toLowerCase()}`,
    salt,
    PBKDF2_ITERATIONS,
    KEY_BYTES,
    'sha256'
  )
}

export function encrypt(email: string, plaintext: string): EncryptedValue {
  if (!plaintext) throw new Error('No se puede cifrar un valor vacío')

  const iv = randomBytes(IV_BYTES)
  const salt = randomBytes(SALT_BYTES)
  const key = deriveKey(email, salt, getPepper())

  const cipher = createCipheriv(ALGORITHM, key, iv)
  const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])

  return {
    encrypted: data.toString('hex'),
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
    salt: salt.toString('hex'),
  }
}

/**
 * Descifra. Devuelve null si el ciphertext fue alterado (el tag GCM no cuadra)
 * o si se usa el pepper equivocado. Nunca lanza por datos corruptos.
 */
export function decrypt(email: string, value: EncryptedValue): string | null {
  if (!value?.encrypted || !value?.iv || !value?.tag || !value?.salt) return null

  try {
    const key = deriveKey(email, Buffer.from(value.salt, 'hex'), getPepper())
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(value.iv, 'hex'))
    decipher.setAuthTag(Buffer.from(value.tag, 'hex'))

    const out = Buffer.concat([
      decipher.update(Buffer.from(value.encrypted, 'hex')),
      decipher.final(),
    ])
    return out.toString('utf8')
  } catch {
    return null
  }
}

type Row = Record<string, unknown>

/** Convierte `first_name` → { first_nameEncrypted, first_nameIv, ... }. */
export function encryptedColumnNames(field: string): [string, string, string, string] {
  return [`${field}Encrypted`, `${field}Iv`, `${field}Tag`, `${field}Salt`]
}

/** Cifra los campos sensibles de una fila y devuelve solo las columnas cifradas. */
export function encryptRowFields(row: Row, email: string): Row {
  const out: Row = {}

  for (const field of SENSITIVE_FIELDS) {
    const value = row[field]
    if (typeof value !== 'string' || value.trim() === '') continue

    const [cEnc, cIv, cTag, cSalt] = encryptedColumnNames(field)
    const result = encrypt(email, value)

    out[cEnc] = result.encrypted
    out[cIv] = result.iv
    out[cTag] = result.tag
    out[cSalt] = result.salt
  }

  return out
}

/** Lee las columnas cifradas de una fila y las devuelve como objeto plano. */
export function extractEncryptedValues(row: Row): Record<SensitiveField, EncryptedValue | null> {
  const read = (field: SensitiveField): EncryptedValue | null => {
    const [cEnc, cIv, cTag, cSalt] = encryptedColumnNames(field)
    const encrypted = row[cEnc]
    if (!encrypted) return null
    return {
      encrypted: String(encrypted),
      iv: String(row[cIv] ?? ''),
      tag: String(row[cTag] ?? ''),
      salt: String(row[cSalt] ?? ''),
    }
  }

  return {
    first_name: read('first_name'),
    last_name: read('last_name'),
    phone: read('phone'),
  }
}

export interface DecryptedUser {
  firstName: string | null
  lastName: string | null
  phone: string | null
  /** Campos que se pudieron descifrar de verdad. */
  decrypted: SensitiveField[]
  /** Campos sin ciphertext (nunca cifrados o backfill pendiente). */
  missing: SensitiveField[]
  /** El descifrado se intentó pero el tag no cuadra: dato alterado o pepper distinto. */
  tampered: SensitiveField[]
}

/** Descifra una fila completa de `users`. */
export function decryptRow(row: Row, email: string): DecryptedUser {
  const stored = extractEncryptedValues(row)
  const result: DecryptedUser = {
    firstName: null,
    lastName: null,
    phone: null,
    decrypted: [],
    missing: [],
    tampered: [],
  }

  const target: Record<SensitiveField, 'firstName' | 'lastName' | 'phone'> = {
    first_name: 'firstName',
    last_name: 'lastName',
    phone: 'phone',
  }

  for (const field of SENSITIVE_FIELDS) {
    const payload = stored[field]

    if (!payload) {
      result.missing.push(field)
      continue
    }

    const plain = decrypt(email, payload)
    if (plain === null) {
      result.tampered.push(field)
      continue
    }

    result[target[field]] = plain
    result.decrypted.push(field)
  }

  return result
}

/** Compara dos strings en tiempo constante. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a ?? '', 'utf8')
  const bufB = Buffer.from(b ?? '', 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
