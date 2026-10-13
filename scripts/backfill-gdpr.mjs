// Cifra los datos personales de los usuarios existentes que aún no lo estén.
// Uso: node scripts/backfill-gdpr.mjs [--dry-run]
import { createClient } from '@libsql/client'

process.loadEnvFile?.('.env.local')

const url = process.env.TURSO_URL
const apiKey = process.env.TURSO_API_KEY
const pepper = process.env.GDPR_PEPPER

if (!url || !apiKey) {
  console.error('Faltan TURSO_URL / TURSO_API_KEY')
  process.exit(1)
}
if (!pepper || pepper.length < 32) {
  console.error('GDPR_PEPPER ausente o muy corto (mín. 32). Genera con: openssl rand -hex 32')
  process.exit(1)
}

const dryRun = process.argv.includes('--dry-run')

// Reimplementado aquí para no depender de transpilar TypeScript en el script.
const { createCipheriv, pbkdf2Sync, randomBytes } = await import('crypto')

const IV_BYTES = 12
const SALT_BYTES = 16
const ITERATIONS = 210_000

function encrypt(email, plaintext) {
  const iv = randomBytes(IV_BYTES)
  const salt = randomBytes(SALT_BYTES)
  const key = pbkdf2Sync(
    `${pepper}\u0000${email.trim().toLowerCase()}`,
    salt,
    ITERATIONS,
    32,
    'sha256'
  )
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return {
    encrypted: data.toString('hex'),
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
    salt: salt.toString('hex'),
  }
}

const client = createClient({ url, authToken: apiKey })

const rows = await client.execute(
  `SELECT id, email, first_name, last_name, phone, pii_encrypted_at
   FROM users WHERE pii_encrypted_at IS NULL`
)

console.log(`Usuarios sin cifrar: ${rows.rows.length}`)
if (rows.rows.length === 0) process.exit(0)
if (dryRun) {
  rows.rows.forEach((r) => console.log(`  [dry-run] ${r.email}`))
  process.exit(0)
}

let done = 0
for (const row of rows.rows) {
  const email = row.email
  const sets = []
  const args = []

  for (const field of ['first_name', 'last_name', 'phone']) {
    const value = row[field]
    if (typeof value !== 'string' || value.trim() === '') continue

    const enc = encrypt(email, value)
    sets.push(
      `${field}Encrypted = ?`,
      `${field}Iv = ?`,
      `${field}Tag = ?`,
      `${field}Salt = ?`
    )
    args.push(enc.encrypted, enc.iv, enc.tag, enc.salt)
  }

  sets.push('pii_encrypted_at = ?')
  args.push(new Date().toISOString(), row.id)

  await client.execute({
    sql: `UPDATE users SET ${sets.join(', ')} WHERE id = ?`,
    args,
  })

  console.log(`  cifrado: ${email}`)
  done++
}

console.log(`Listo: ${done} usuarios cifrados`)
