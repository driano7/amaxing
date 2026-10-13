import { createClient } from '@libsql/client'

const url = process.env.TURSO_URL
const apiKey = process.env.TURSO_API_KEY

if (!url || !apiKey) {
  console.error('Faltan TURSO_URL / TURSO_API_KEY')
  process.exit(1)
}

const client = createClient({ url, authToken: apiKey })

try {
  await client.execute('SELECT 1')
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  )
  console.log('CONEXION OK')
  console.log(tables.rows.map((r) => r.name).join(', '))
} catch (error) {
  console.error('CONEXION FALLIDA:', error.message)
  process.exit(1)
}
