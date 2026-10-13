// Aplica un archivo .sql en Turso. Uso: node scripts/apply-sql.mjs turso-roles.sql
import { readFileSync } from 'fs'
import { createClient } from '@libsql/client'

const file = process.argv[2]
if (!file) {
  console.error('Uso: node scripts/apply-sql.mjs <archivo.sql>')
  process.exit(1)
}

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
})

/** Divide en sentencias respetando bloques BEGIN...END de triggers. */
function splitStatements(sql) {
  const statements = []
  let depth = 0
  let current = ''

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    const upper = sql.slice(i, i + 6).toUpperCase()

    if (char === '-' && sql[i + 1] === '-') {
      const end = sql.indexOf('\n', i)
      i = end === -1 ? sql.length : end
      continue
    }

    if (upper.startsWith('BEGIN')) {
      depth++
      current += 'BEGIN'
      i += 4
      continue
    }

    if (upper.startsWith('END') && /\s|;/.test(sql[i + 3] ?? ';')) {
      depth = Math.max(0, depth - 1)
      current += 'END'
      i += 2
      continue
    }

    if (char === ';' && depth === 0) {
      statements.push(current)
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) statements.push(current)

  return statements.map((s) => s.trim()).filter(Boolean)
}

const statements = splitStatements(readFileSync(file, 'utf8'))

for (const sql of statements) {
  try {
    await client.execute(sql)
  } catch (error) {
    console.error('FALLO en:\n', sql.slice(0, 160), '\n->', error.message)
    process.exit(1)
  }
}

console.log(`OK: ${statements.length} sentencias aplicadas desde ${file}`)
