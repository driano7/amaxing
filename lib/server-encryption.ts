import { createCipheriv, createDecipheriv, createHash, pbkdf2Sync, randomBytes } from 'node:crypto'

interface EncryptionResult {
  encryptedData: string
  iv: string
  tag: string
  salt: string
}

interface DecryptionResult {
  decryptedData: string
  success: boolean
}

function deriveKeyFromEmail(email: string, salt?: Buffer): Buffer {
  const actualSalt = salt ?? randomBytes(16)
  return pbkdf2Sync(email, actualSalt, 100000, 32, 'sha256')
}

export function encryptWithEmail(email: string, data: string): EncryptionResult {
  try {
    const iv = randomBytes(12)
    const salt = randomBytes(16)
    const key = deriveKeyFromEmail(email, salt)
    const cipher = createCipheriv('aes-256-gcm', key, iv)
    const encryptedBuffer = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()

    return {
      encryptedData: encryptedBuffer.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex'),
    }
  } catch (error) {
    throw new Error(`Encryption error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export function decryptWithEmail(
  email: string,
  encryptedData: string,
  iv: string,
  tag: string,
  salt: string
): DecryptionResult {
  try {
    const ivBuffer = Buffer.from(iv, 'hex')
    const tagBuffer = Buffer.from(tag, 'hex')
    const saltBuffer = Buffer.from(salt, 'hex')
    const key = deriveKeyFromEmail(email, saltBuffer)
    const decipher = createDecipheriv('aes-256-gcm', key, ivBuffer)
    decipher.setAuthTag(tagBuffer)
    const decryptedBuffer = Buffer.concat([decipher.update(encryptedData, 'hex'), decipher.final()])
    return { decryptedData: decryptedBuffer.toString('utf8'), success: true }
  } catch {
    return { decryptedData: '', success: false }
  }
}

export function encryptUserData(email: string, userData: Record<string, any>): Record<string, any> {
  const encryptedData: Record<string, any> = {}
  const sensitiveFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'country']

  for (const [key, value] of Object.entries(userData)) {
    if (sensitiveFields.includes(key)) {
      if (value === undefined) continue
      if (typeof value === 'string' && value.length > 0) {
        const encrypted = encryptWithEmail(email, value)
        encryptedData[`${key}Encrypted`] = encrypted.encryptedData
        encryptedData[`${key}Iv`] = encrypted.iv
        encryptedData[`${key}Tag`] = encrypted.tag
        encryptedData[`${key}Salt`] = encrypted.salt
      } else {
        encryptedData[`${key}Encrypted`] = null
        encryptedData[`${key}Iv`] = null
        encryptedData[`${key}Tag`] = null
        encryptedData[`${key}Salt`] = null
      }
    } else {
      encryptedData[key] = value
    }
  }

  return encryptedData
}

export function decryptUserData(
  email: string,
  encryptedUserData: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = { ...encryptedUserData }
  const sensitiveFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'country']

  for (const field of sensitiveFields) {
    const encryptedValue = encryptedUserData[`${field}Encrypted`]
    const ivValue = encryptedUserData[`${field}Iv`]
    const tagValue = encryptedUserData[`${field}Tag`]
    const saltValue = encryptedUserData[`${field}Salt`]

    if (encryptedValue && ivValue && tagValue && saltValue) {
      const decrypted = decryptWithEmail(email, encryptedValue, ivValue, tagValue, saltValue)
      result[field] = decrypted.success ? decrypted.decryptedData : null
    } else if (field in encryptedUserData) {
      result[field] = encryptedUserData[field]
    } else {
      delete result[field]
    }
  }

  return result
}

export function generateDataHash(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

export function verifyDataIntegrity(originalData: string, receivedHash: string): boolean {
  const calculatedHash = generateDataHash(originalData)
  return calculatedHash === receivedHash
}
