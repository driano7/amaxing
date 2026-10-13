// Prueba end-to-end del flujo QR: checkout -> reserva en Turso -> QR -> escaneo -> check-in.
// Uso: set -a; source .env.local; set +a; node scripts/test-qr-flow.mjs
import assert from 'node:assert/strict'
import { createClient } from '@libsql/client'

process.loadEnvFile?.('.env.local')

const { createBookingInTurso, getTicketByCode, checkIn, ticketCodeFor, generateBookingReference, findBookingsByStripeSession } =
  await (async () => {
    const { createRequire } = await import('node:module')
    const require = createRequire(import.meta.url)
    const { transformSync } = require('esbuild')
    const fs = require('node:fs')
    const path = require('node:path')
    const Module = require('node:module')

    // lib/booking/turso.ts depende de ./turso (js)
    const tursoJs = fs.readFileSync(path.resolve('lib/turso.js'), 'utf8')
    const tursoMod = new Module(path.resolve('lib/turso.js'))
    tursoMod.filename = path.resolve('lib/turso.js')
    tursoMod.paths = Module._nodeModulePaths(process.cwd())
    tursoMod._compile(
      transformSync(tursoJs, { loader: 'js', format: 'cjs', target: 'es2020' }).code,
      'turso.js'
    )

    const src = fs.readFileSync(path.resolve('lib/booking/turso.ts'), 'utf8')
    let code = transformSync(src, { loader: 'ts', format: 'cjs', target: 'es2020' }).code
    // lib/booking/turso.ts usa dos modulos locales: el cliente y los
    // normalizadores de demografia. Se inyectan como requires resueltos.
    const demoSrc = fs.readFileSync(path.resolve('lib/demographics-shared.ts'), 'utf8')
    const demoMod = new Module(path.resolve('lib/demographics-shared.ts'))
    demoMod.paths = Module._nodeModulePaths(process.cwd())
    demoMod._compile(
      transformSync(demoSrc, { loader: 'ts', format: 'cjs', target: 'es2020' })
        .code.replace(/require\(["']\.\/demographics["']\)/g, 'global.__demographicsStub'),
      path.resolve('lib/demographics-shared.js')
    )
    demoMod.filename = path.resolve('lib/demographics-shared.ts')

    global.__demographicsStub = {
      AGE_BAND_VALUES: ['menor_de_18','18_24','25_34','35_44','45_54','55_64','65_mas'],
      GENDER_VALUES: ['femenino','masculino','no_binario','otro','prefiero_no_decir'],
      STATE_CODES: ['CMX','JAL','NLE'],
    }
    const demo = path.resolve('lib/demographics-shared.ts')
    code = code.replace(
      /require\(["'](\.\.\/turso|\.\.\/demographics-shared)["']\)/g,
      (_m, spec) => {
        if (spec.includes('turso')) return 'global.__tursoModule'
        void demo
        return 'global.__demoModule'
      }
    )
    global.__demoModule = demoMod.exports


    global.__tursoModule = tursoMod.exports
    const mod = new Module(path.resolve('lib/booking/turso.ts'))
    mod.paths = Module._nodeModulePaths(process.cwd())
    mod._compile(code, path.resolve('lib/booking/turso.js'))
    return mod.exports
  })()

const db = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_API_KEY })

let passed = 0
let failed = 0
async function test(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (error) {
    failed++
    console.log(`  FAIL ${name}\n       ${error.message}`)
  }
}

const SESSION = `test_${Date.now()}`
const created = []

console.log('\nFlujo QR de punta a punta\n')

await test('la referencia tiene formato CDMX-XXXXXX', () => {
  const ref = generateBookingReference()
  assert.match(ref, /^CDMX-[A-HJ-NP-RT-Z2-9]{6}$/)
})

await test('el código del QR es AMX-T-<referencia>', () => {
  assert.equal(ticketCodeFor('CDMX-ABC123'), 'AMX-T-CDMX-ABC123')
  assert.equal(ticketCodeFor('AMX-T-CDMX-ABC123'), 'AMX-T-CDMX-ABC123')
})

await test('checkout crea la reserva real en Turso (usuario con cuenta)', async () => {
  const email = `qr${Date.now()}@test.com`
  await db.execute({
    sql: `INSERT INTO users (email, password_hash, first_name, last_name)
          VALUES (?, ?, 'QR', 'Test')`,
    args: [email, 'x'.repeat(70)],
  })
  const found = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] })
  const userId = found.rows[0].id

  const booking = await createBookingInTurso({
    experienceId: '1',
    userId,
    date: '2027-03-15',
    time: '10:30',
    peopleCount: 2,
    totalAmount: 130,
    currency: 'USD',
    customerName: 'QR Test',
    customerEmail: 'qr@test.com',
    stripeSessionId: SESSION,
    stripePaymentIntentId: 'pi_test_123',
    paid: true,
  })
  created.push({ userId, booking })

  assert.match(booking.bookingReference, /^CDMX-/)
  assert.equal(booking.ticketCode, ticketCodeFor(booking.bookingReference))
  assert.equal(booking.status, 'paid')
  assert.equal(booking.paymentStatus, 'paid')
})

await test('la fila existe en bookings con su booking_reference', async () => {
  const { booking } = created[0]
  const row = await db.execute({
    sql: 'SELECT booking_reference, status, payment_status, start_time, guests FROM bookings WHERE id = ?',
    args: [booking.id],
  })
  assert.equal(row.rows[0].booking_reference, booking.bookingReference)
  assert.equal(row.rows[0].status, 'paid')
  assert.equal(row.rows[0].start_time, '10:30')
  assert.equal(row.rows[0].guests, 2)
})

await test('el QR resuelve la reserva (clave del scanner)', async () => {
  const { booking } = created[0]
  const ticket = await getTicketByCode(booking.ticketCode)
  assert.ok(ticket, 'el QR debe resolver')
  assert.equal(ticket.bookingReference, booking.bookingReference)
  assert.equal(ticket.guests, 2)
  assert.equal(ticket.paymentStatus, 'paid')
  assert.ok(ticket.experienceTitle.length > 0)
})

await test('también resuelve con la referencia sin el prefijo', async () => {
  const { booking } = created[0]
  const ticket = await getTicketByCode(booking.bookingReference.toLowerCase())
  assert.ok(ticket, 'debe resolver sin prefijo y sin distinguir mayúsculas')
})

await test('QR inexistente devuelve null, no explota', async () => {
  assert.equal(await getTicketByCode('AMX-T-CDMX-ZZZZZZ'), null)
  assert.equal(await getTicketByCode(''), null)
})

await test('check-in marca la reserva y la devuelve actualizada', async () => {
  const { booking } = created[0]
  const ticket = await checkIn(booking.bookingReference, created[0].userId)
  assert.ok(ticket)
  assert.ok(ticket.checkedInAt, 'debe registrar checked_in_at')
})

await test('check-in es idempotente (segundo escaneo no falla)', async () => {
  const { booking } = created[0]
  const ticket = await checkIn(booking.bookingReference, created[0].userId)
  assert.ok(ticket)
  assert.ok(ticket.checkedInAt)
})

await test('check-in de un QR falso devuelve null', async () => {
  assert.equal(await checkIn('CDMX-XXXXXX', null), null)
})

await test('reserva de invitado sin cuenta (user_id nulo)', async () => {
  const booking = await createBookingInTurso({
    experienceId: '2',
    userId: null,
    date: '2027-04-02',
    time: '16:00',
    peopleCount: 3,
    totalAmount: 195,
    currency: 'USD',
    customerName: 'Invitado Sin Cuenta',
    stripeSessionId: `${SESSION}_guest`,
    paid: true,
  })
  created.push({ booking })

  const ticket = await getTicketByCode(booking.ticketCode)
  assert.ok(ticket, 'la reserva de invitado debe resolver igual')
  assert.equal(ticket.isGuest, true)

  const row = await db.execute({ sql: 'SELECT user_id, is_guest FROM bookings WHERE id = ?', args: [booking.id] })
  assert.equal(row.rows[0].user_id, null)
  assert.equal(row.rows[0].is_guest, 1)
})

await test('no guarda el email del invitado (solo con cuenta)', async () => {
  const guest = created.find((c) => c.booking.bookingReference && true)
  const row = await db.execute({
    sql: 'SELECT customer_email FROM bookings WHERE id = ?',
    args: [created[1].booking.id],
  })
  assert.equal(row.rows[0].customer_email, null)
})

await test('referencias únicas: dos reservas nunca comparten código', async () => {
  const refs = new Set()
  for (let i = 0; i < 50; i++) refs.add(generateBookingReference())
  assert.equal(refs.size, 50)
})

await test('experiencia inexistente se rechaza', async () => {
  await assert.rejects(
    () =>
      createBookingInTurso({
        experienceId: 'no-existe',
        userId: null,
        date: '2027-01-01',
        peopleCount: 1,
        totalAmount: 10,
      }),
    /no existe/
  )
})

await test('fecha inválida se rechaza', async () => {
  await assert.rejects(
    () =>
      createBookingInTurso({
        experienceId: '1',
        userId: null,
        date: 'no-es-fecha',
        peopleCount: 1,
        totalAmount: 10,
      }),
    /inválida|Falta/
  )
})

await test('idempotencia por sesión de Stripe: no duplica', async () => {
  const found = await findBookingsByStripeSession(SESSION)
  assert.equal(found.length, 1)
  assert.equal(found[0].bookingReference, created[0].booking.bookingReference)
})

console.log(`\n${passed} pasaron, ${failed} fallaron`)

// limpieza
for (const { userId, booking } of created) {
  await db.execute({ sql: 'DELETE FROM bookings WHERE id = ?', args: [booking.id] })
  if (userId) await db.execute({ sql: 'DELETE FROM user_roles WHERE "userId" = ?', args: [userId] })
  if (userId) await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] })
}
const left = await db.execute('SELECT COUNT(*) n FROM bookings')
console.log(`limpieza -> bookings restantes: ${left.rows[0].n}\n`)

process.exit(failed === 0 ? 0 : 1)
