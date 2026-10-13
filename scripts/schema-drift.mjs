// Compara el esquema real de Turso contra turso-schema.sql y reporta la deriva.
// Uso: node scripts/schema-drift.mjs
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'

process.loadEnvFile?.('.env.local')

const db = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_API_KEY })

// ---------- Estado real ----------
const real = { tables: new Map(), indexes: new Set(), triggers: new Set() }

const objects = await db.execute(
  `SELECT type, name, tbl_name, sql FROM sqlite_master
    WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name`
)

for (const row of objects.rows) {
  if (row.type === 'table') {
    const cols = await db.execute(`PRAGMA table_info("${row.name}")`)
    real.tables.set(
      row.name,
      new Map(
        cols.rows.map((c) => [
          c.name,
          {
            type: (c.type || '').toUpperCase(),
            notnull: Number(c.notnull) === 1,
            pk: Number(c.pk) === 1,
            default: c.dflt_value,
          },
        ])
      )
    )
  } else if (row.type === 'index') {
    real.indexes.add(row.name)
  } else if (row.type === 'trigger') {
    real.triggers.add(row.name)
  }
}

// ---------- Estado declarado: materializando el archivo en una base nueva ----------
import { rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { execFileSync } from 'child_process'

const tmpDb = join(tmpdir(), `calpulli-drift-${Date.now()}.db`)
rmSync(tmpDb, { force: true })

// Se materializa con sqlite3 para no depender de la red.
const file = readFileSync('turso-schema.sql', 'utf8')
try {
  execFileSync('sqlite3', [tmpDb], { input: file, stdio: ['pipe', 'ignore', 'pipe'] })
} catch (error) {
  console.error('turso-schema.sql no aplica limpio en una base vacía:')
  console.error(String(error.stderr || error.message).slice(0, 2000))
  process.exit(1)
}

const declared = { tables: new Map(), indexes: new Set(), triggers: new Set() }

/** Lee el sqlite_master de un archivo local usando el propio @libsql/client. */
async function readLocal(filePath) {
  const client = createClient({ url: `file:${filePath}` })
  const rows = (
    await client.execute(
      `SELECT type, name, tbl_name FROM sqlite_master
        WHERE name NOT LIKE 'sqlite_%' AND type IN ('table','index','trigger')`
    )
  ).rows
  const out = { tables: new Map(), indexes: new Set(), triggers: new Set() }
  for (const r of rows) {
    if (r.type === 'table') {
      const cols = await client.execute(`PRAGMA table_info("${r.name}")`)
      out.tables.set(
        r.name,
        new Map(cols.rows.map((c) => [c.name, { type: (c.type || '').toUpperCase(), notnull: Number(c.notnull) === 1 }]))
      )
    } else if (r.type === 'index') out.indexes.add(r.name)
    else if (r.type === 'trigger') out.triggers.add(r.name)
  }
  client.close()
  return out
}

const local = await readLocal(tmpDb)
for (const [t, c] of local.tables) declared.tables.set(t, c)
for (const i of local.indexes) declared.indexes.add(i)
for (const t of local.triggers) declared.triggers.add(t)

rmSync(tmpDb, { force: true })

// ---------- Diff ----------
const problems = []

for (const [table, realCols] of real.tables) {
  if (!declared.tables.has(table)) {
    problems.push(`TABLA SOBRANTE en la BD: ${table} (no está en turso-schema.sql)`)
    continue
  }
  const declCols = declared.tables.get(table)
  for (const [col, rc] of realCols) {
    if (!declCols.has(col)) {
      problems.push(`COLUMNA SOBRANTE ${table}.${col} ${rc.type}${rc.notnull ? ' NOT NULL' : ''}`)
      continue
    }
    const dc = declCols.get(col)
    if (dc.type !== rc.type) {
      problems.push(`TIPO ${table}.${col}: BD=${rc.type} schema=${dc.type}`)
    }
    if (dc.notnull !== rc.notnull) {
      problems.push(
        `NOT NULL ${table}.${col}: BD=${rc.notnull ? 'sí' : 'no'} schema=${dc.notnull ? 'sí' : 'no'}`
      )
    }
  }
  for (const col of declCols.keys()) {
    if (!realCols.has(col)) problems.push(`COLUMNA FALTA en BD: ${table}.${col}`)
  }
}

for (const table of declared.tables.keys()) {
  if (!real.tables.has(table)) problems.push(`TABLA FALTA en BD: ${table}`)
}
for (const t of real.triggers) if (!declared.triggers.has(t)) problems.push(`TRIGGER SOBRANTE: ${t}`)
for (const t of declared.triggers) if (!real.triggers.has(t)) problems.push(`TRIGGER FALTA: ${t}`)
for (const i of real.indexes) if (!declared.indexes.has(i)) problems.push(`INDICE SOBRANTE: ${i}`)

console.log(`\nBD real: ${real.tables.size} tablas, ${real.indexes.size} indices, ${real.triggers.size} triggers`)
console.log(`Schema: ${declared.tables.size} tablas, ${declared.indexes.size} indices, ${declared.triggers.size} triggers`)
console.log(`\nDeriva: ${problems.length} problema(s)\n`)
problems.forEach((p) => console.log('  - ' + p))
console.log('')
process.exit(problems.length === 0 ? 0 : 1)
