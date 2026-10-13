// Genera turso-schema.sql desde el esquema REAL de Turso.
// Así el archivo nunca puede divergir de la base.
//
// Uso:
//   node scripts/schema-dump.mjs              -> escribe turso-schema.sql
//   node scripts/schema-dump.mjs --stdout     -> solo imprime
import { createClient } from '@libsql/client'
import { writeFileSync } from 'fs'

process.loadEnvFile?.('.env.local')

const db = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_API_KEY })

const objects = (
  await db.execute(
    `SELECT type, name, tbl_name, sql FROM sqlite_master
      WHERE name NOT LIKE 'sqlite_%' AND sql IS NOT NULL
      ORDER BY type, name`
  )
).rows

const tables = objects.filter((o) => o.type === 'table')
const indexes = objects.filter((o) => o.type === 'index' && !o.name.startsWith('sqlite_autoindex'))
const triggers = objects.filter((o) => o.type === 'trigger')

/** Ordena las tablas por dependencia para que se lean como el modelo. */
const ORDER = [
  'users', 'role_permissions', 'user_roles', 'access_audit_logs',
  'sessions', 'password_reset_tokens', 'email_verification_tokens', 'login_attempts',
  'tour_categories', 'experiences', 'reviews', 'news_notes',
  'bookings', 'payments',
  'referral_codes', 'referral_visits', 'referral_attributions', 'referral_conversions',
  'page_analytics', 'conversion_events', 'chatbot_prefs',
  'oauth_clients', 'oauth_client_metadata', 'oauth_authorization_codes', 'oauth_tokens',
]
const rank = (name) => {
  const i = ORDER.indexOf(name)
  return i === -1 ? ORDER.length : i
}
tables.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))

const clean = (sql) =>
  sql
    .replace(/\r/g, '')
    .replace(/\s+$/, '')
    .replace(/CREATE TABLE\s+/i, 'CREATE TABLE IF NOT EXISTS ')
    .replace(/CREATE INDEX\s+/i, 'CREATE INDEX IF NOT EXISTS ')
    .replace(/CREATE TRIGGER\s+/i, 'CREATE TRIGGER IF NOT EXISTS ')
    .replace(/CREATE UNIQUE INDEX\s+/i, 'CREATE UNIQUE INDEX IF NOT EXISTS ')

const header = `-- ============================================================================
--  Calpulli CDMX — Esquema de Turso (SQLite / libSQL)
--  Copyright (c) 2024-2026 Donovan Riaño
--
--  GENERADO AUTOMÁTICAMENTE desde la base real:
--    node scripts/schema-dump.mjs
--
--  No editar a mano: la fuente de verdad es la base. Regenerar tras cualquier
--  cambio. Verifica que no haya deriva con:
--    node scripts/schema-drift.mjs
--
--  Aplicar sobre una base vacía:
--    set -a; source .env.local; set +a
--    node scripts/apply-sql.mjs turso-schema.sql
--
--  Datos que NO son esquema (se siembran aparte):
--    experiences -> node scripts/seed-experiences.mjs
--    Cifrado PII -> node scripts/backfill-gdpr.mjs
-- ============================================================================


-- ============================================================================
--  IDENTIDAD
-- ============================================================================

`

const body = tables.map((t) => `${clean(t.sql)};\n`).join('\n')

const idxSection = `\n-- ============================================================================
--  ÍNDICES
-- ============================================================================

${indexes.map((i) => `${clean(i.sql)};`).join('\n')}
`

const trgSection = `\n-- ============================================================================
--  TRIGGERS  (updated_at automático)
-- ============================================================================

${triggers.map((t) => `${clean(t.sql)};`).join('\n')}
`

// ---------- Datos semilla ----------
// sqlite_master solo guarda DDL: las filas de configuración deben viajar aparte.
const seeds = []

const roles = (await db.execute('SELECT * FROM role_permissions ORDER BY rank')).rows
if (roles.length) {
  const cols = Object.keys(roles[0])
  const cell = (v) => {
    if (v === null || v === undefined) return 'NULL'
    if (typeof v === 'number') return String(v)
    if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`
    return `'${String(v).replace(/'/g, "''")}'`
  }
  const rows = roles.map((r) => `  (${cols.map((c) => cell(r[c])).join(', ')})`)
  seeds.push(
    `-- Matriz de roles: configuración, no datos de usuario.\n` +
      `-- Es lo único que debe existir en una base recién creada.\n` +
      `INSERT OR REPLACE INTO role_permissions (${cols.map((c) => `"${c}"`).join(', ')}) VALUES\n` +
      `${rows.join(',\n')};\n`
  )
}

const seedSection = seeds.length
  ? `\n-- ============================================================================\n--  DATOS SEMILLA\n-- ============================================================================\n\n${seeds.join('\n')}`
  : ''

const footer = `

-- ============================================================================
--  RESUMEN
--    ${tables.length} tablas · ${indexes.length} índices · ${triggers.length} triggers
--
--  Privacidad (ver lib/gdpr-crypto.ts):
--    users.*Encrypted/Iv/Tag/Salt  -> AES-256-GCM, llave = PBKDF2(email + GDPR_PEPPER).
--    bookings.anon_*               -> snapshot demográfico; sobrevive al borrado
--                                     del cliente y no identifica a nadie.
-- ============================================================================
`

const out = header + body + idxSection + trgSection + seedSection + footer

if (process.argv.includes('--stdout')) {
  console.log(out)
} else {
  writeFileSync('turso-schema.sql', out)
  console.log(
    `turso-schema.sql regenerado: ${tables.length} tablas, ${indexes.length} indices, ${triggers.length} triggers`
  )
}
