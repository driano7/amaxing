// Pruebas del cifrado GDPR (AES-256-GCM + pepper).
// Uso: node --experimental-strip-types scripts/test-gdpr.mjs
import assert from 'node:assert/strict'

process.loadEnvFile?.('.env.local')

const { createRequire } = await import('node:module')
const require = createRequire(import.meta.url)

// El módulo es TS; se compila en memoria para probarlo sin toolchain.
const { transformSync } = require('esbuild')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.resolve('lib/gdpr-crypto.ts'), 'utf8')
const { code } = transformSync(source, { loader: 'ts', format: 'cjs', target: 'es2020' })

const Module = require('node:module')
const mod = new Module('gdpr-crypto')
mod._compile(code, 'gdpr-crypto.js')
const crypto = mod.exports

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (error) {
    failed++
    console.log(`  FAIL ${name}\n       ${error.message}`)
  }
}

const EMAIL = 'ana@example.com'

console.log('\nCifrado GDPR — AES-256-GCM\n')

test('el pepper está configurado', () => {
  assert.equal(crypto.isPepperConfigured(), true)
})

test('roundtrip: cifrar y descifrar devuelve el original', () => {
  for (const value of [
    'María',
    'a+verylongemailaddressthatkeepsgoing@subdomain.example.com',
    '+52 55 1234 5678',
    'ÁéíóúÑñ — símbolos 中文 🔐',
    'x'.repeat(500),
  ]) {
    const enc = crypto.encrypt(EMAIL, value)
    assert.equal(crypto.decrypt(EMAIL, enc), value)
  }
})

test('el ciphertext NO contiene el texto plano', () => {
  const enc = crypto.encrypt(EMAIL, 'SecretName')
  assert.ok(!enc.encrypted.includes('SecretName'))
  assert.ok(!enc.encrypted.includes('5365637265'))
})

test('IV y salt son aleatorios en cada cifrado', () => {
  const a = crypto.encrypt(EMAIL, 'mismo valor')
  const b = crypto.encrypt(EMAIL, 'mismo valor')
  assert.notEqual(a.iv, b.iv)
  assert.notEqual(a.salt, b.salt)
  assert.notEqual(a.encrypted, b.encrypted, 'texto idéntico debe producir ciphertext distinto')
})

test('el email cambia la llave: no se puede descifrar con otro email', () => {
  const enc = crypto.encrypt(EMAIL, 'privado')
  assert.equal(crypto.decrypt('otro@example.com', enc), null)
})

test('el case del email no altera la llave', () => {
  const enc = crypto.encrypt('  Ana@Example.COM ', 'privado')
  assert.equal(crypto.decrypt('ana@example.com', enc), 'privado')
})

test('detecta manipulación del ciphertext (tag GCM)', () => {
  const enc = crypto.encrypt(EMAIL, 'privado')
  const tampered = { ...enc, encrypted: enc.encrypted.slice(0, -2) + 'ff' }
  assert.equal(crypto.decrypt(EMAIL, tampered), null)
})

test('detecta manipulación del tag', () => {
  const enc = crypto.encrypt(EMAIL, 'privado')
  assert.equal(crypto.decrypt(EMAIL, { ...enc, tag: '00'.repeat(16) }), null)
})

test('detecta manipulación del IV', () => {
  const enc = crypto.encrypt(EMAIL, 'privado')
  assert.equal(crypto.decrypt(EMAIL, { ...enc, iv: '00'.repeat(12) }), null)
})

test('sin pepper configurado NO se puede descifrar', () => {
  const original = process.env.GDPR_PEPPER
  const enc = crypto.encrypt(EMAIL, 'privado')
  process.env.GDPR_PEPPER = 'otro-pepper-diferente-de-32-caracteres-minimo'
  assert.equal(crypto.decrypt(EMAIL, enc), null, 'un dump de BD no debe descifrar sin el pepper')
  process.env.GDPR_PEPPER = original
})

test('pepper ausente lanza error explícito', () => {
  const original = process.env.GDPR_PEPPER
  delete process.env.GDPR_PEPPER
  assert.throws(() => crypto.encrypt(EMAIL, 'x'), /GDPR_PEPPER/)
  process.env.GDPR_PEPPER = original
})

test('pepper corto se rechaza', () => {
  const original = process.env.GDPR_PEPPER
  process.env.GDPR_PEPPER = 'corto'
  assert.equal(crypto.isPepperConfigured(), false)
  process.env.GDPR_PEPPER = original
})

test('valor vacío no se puede cifrar', () => {
  assert.throws(() => crypto.encrypt(EMAIL, ''), /vacío/)
})

test('payload incompleto devuelve null, no explota', () => {
  assert.equal(crypto.decrypt(EMAIL, { encrypted: '', iv: '', tag: '', salt: '' }), null)
})

test('encryptRowFields genera las 4 columnas por campo', () => {
  const cols = crypto.encryptRowFields(
    { first_name: 'Ana', last_name: 'Rúa', phone: '+52 55 0000 0000' },
    EMAIL
  )
  assert.equal(cols.first_nameEncrypted.length > 0, true)
  assert.ok(cols.first_nameIv && cols.first_nameTag && cols.first_nameSalt)
  assert.ok(cols.last_nameEncrypted && cols.phoneEncrypted)
  assert.equal(cols.first_name, undefined, 'no debe filtrar el plaintext')
})

test('decryptRow reconstruye los 3 campos', () => {
  const row = {
    email: EMAIL,
    first_name: 'Ana',
    last_name: 'Rúa',
    phone: '+52 55 0000 0000',
    ...crypto.encryptRowFields(
      { first_name: 'Ana', last_name: 'Rúa', phone: '+52 55 0000 0000' },
      EMAIL
    ),
  }
  const out = crypto.decryptRow(row, EMAIL)
  assert.equal(out.firstName, 'Ana')
  assert.equal(out.lastName, 'Rúa')
  assert.equal(out.phone, '+52 55 0000 0000')
  assert.deepEqual(out.decrypted.sort(), ['first_name', 'last_name', 'phone'])
  assert.deepEqual(out.missing, [])
  assert.deepEqual(out.tampered, [])
})

test('decryptRow distingue "sin cifrar" de "alterado"', () => {
  const partial = { email: EMAIL, first_nameEncrypted: null, first_nameIv: null }
  const out = crypto.decryptRow(partial, EMAIL)
  assert.ok(out.missing.includes('first_name'))
  assert.equal(out.firstName, null)

  const tampered = crypto.encryptRowFields({ first_name: 'Ana' }, EMAIL)
  const bad = crypto.decryptRow(
    { email: EMAIL, ...tampered, first_nameTag: '00'.repeat(16) },
    EMAIL
  )
  assert.ok(bad.tampered.includes('first_name'))
})

console.log(`\n${passed} pasaron, ${failed} fallaron\n`)
process.exit(failed === 0 ? 0 : 1)
