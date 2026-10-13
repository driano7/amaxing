// Verifica que al borrar el cliente la identidad se va y la demografía sobrevive.
import assert from 'node:assert/strict'
import { createClient } from '@libsql/client'

process.loadEnvFile?.('.env.local')

const db = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_API_KEY })
const B = process.env.BASE_URL || 'http://localhost:3000'

let passed = 0
let failed = 0
async function test(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e) {
    failed++
    console.log(`  FAIL ${name}\n       ${e.message}`)
  }
}

const email = `anon${Date.now()}@test.com`
const password = 'Prueba12345'

async function api(path, opts = {}) {
  const res = await fetch(`${B}${path}`, opts)
  return { status: res.status, json: await res.json().catch(() => null) }
}

console.log('\nAnonimización al borrar la cuenta\n')

// 1. Alta con demografía
await api('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mode: 'register', email, password, firstName: 'Rosa', lastName: 'Delgado' }),
})

const login = await api('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mode: 'login', email, password }),
})
const token = login.json.token
const userId = (await api('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })).json
  .user.id

await db.execute({
  sql: 'UPDATE users SET country = ?, gender = ?, date_of_birth = ? WHERE id = ?',
  args: ['MX', 'femenino', '1994-06-15', userId],
})

// 2. Reserva con snapshot demográfico (como lo hace createBookingInTurso)
const alphabet = 'ABCDEFGHJKLMNPQRTUVWXYZ23456789'
const ref =
  'CDMX-' +
  [...crypto.getRandomValues(new Uint8Array(6))].map((n) => alphabet[n % alphabet.length]).join('')

await db.execute({
  sql: `INSERT INTO bookings (
          experience_id, user_id, booking_reference, booking_date, start_date, end_date,
          start_time, guests, status, payment_status, total_amount, payed_amount, currency,
          customer_name, customer_email, special_requests, accessibility_needs,
          anon_country, anon_age_band, anon_gender, anon_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  args: [
    '1', userId, ref, '2027-07-01', '2027-07-01T10:00:00.000Z', '2027-07-01T13:00:00.000Z',
    '10:00', 2, 'paid', 'paid', 130, 130, 'USD',
    'Rosa Delgado', email,
    'soy Rosa, alergia a las nueces', 'silla de ruedas',
    'MX', '25_34', 'femenino', new Date().toISOString(),
  ],
})

await test('la reserva guarda identidad y demografía a la vez', async () => {
  const row = (
    await db.execute({
      sql: 'SELECT customer_name, anon_country, anon_age_band FROM bookings WHERE booking_reference = ?',
      args: [ref],
    })
  ).rows[0]
  assert.equal(row.customer_name, 'Rosa Delgado')
  assert.equal(row.anon_country, 'MX')
  assert.equal(row.anon_age_band, '25_34')
})

// 3. Borrado
const del = await api('/api/gdpr/account', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ password, confirm: 'ELIMINAR' }),
})
assert.equal(del.status, 200)

await test('la cuenta se borró de la BD', async () => {
  const row = (
    await db.execute({ sql: 'SELECT COUNT(*) n FROM users WHERE id = ?', args: [userId] })
  ).rows[0]
  assert.equal(row.n, 0)
})

await test('la reserva ya NO tiene identidad', async () => {
  const row = (
    await db.execute({
      sql: 'SELECT user_id, customer_name, customer_email FROM bookings WHERE booking_reference = ?',
      args: [ref],
    })
  ).rows[0]
  assert.equal(row.user_id, null)
  assert.equal(row.customer_name, null)
  assert.equal(row.customer_email, null)
})

await test('las notas libres se borran (podrían contener el nombre)', async () => {
  const row = (
    await db.execute({
      sql: 'SELECT special_requests, accessibility_needs FROM bookings WHERE booking_reference = ?',
      args: [ref],
    })
  ).rows[0]
  assert.equal(row.special_requests, null)
  assert.equal(row.accessibility_needs, null)
})

await test('la demografía SOBREVIVE para poder medir', async () => {
  const row = (
    await db.execute({
      sql: 'SELECT anon_country, anon_age_band, anon_gender FROM bookings WHERE booking_reference = ?',
      args: [ref],
    })
  ).rows[0]
  assert.equal(row.anon_country, 'MX')
  assert.equal(row.anon_age_band, '25_34')
  assert.equal(row.anon_gender, 'femenino')
})

await test('la reserva conserva el monto (contabilidad)', async () => {
  const row = (
    await db.execute({
      sql: 'SELECT total_amount, payed_amount FROM bookings WHERE booking_reference = ?',
      args: [ref],
    })
  ).rows[0]
  assert.equal(row.total_amount, 130)
  assert.equal(row.payed_amount, 130)
})

// limpieza
await db.execute({ sql: 'DELETE FROM bookings WHERE booking_reference = ?', args: [ref] })

console.log(`\n${passed} pasaron, ${failed} fallaron\n`)
process.exit(failed === 0 ? 0 : 1)
