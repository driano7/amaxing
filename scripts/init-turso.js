// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Initialize Turso database with OAuth 2.1 schema
import { createClient } from '@libsql/client'
import { createHash, randomBytes } from 'crypto'

const url = process.env.TURSO_URL
const authToken = process.env.TURSO_API_KEY

if (!url) {
  throw new Error('TURSO_URL environment variable is required')
}

const turso = createClient({ url, authToken })

async function initializeDatabase() {
  console.log('Initializing database schema...')

  const statements = [
    // OAuth Clients table
    `CREATE TABLE IF NOT EXISTS oauth_clients (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      client_id TEXT UNIQUE NOT NULL,
      client_secret_hash TEXT,
      client_name TEXT,
      redirect_uris TEXT NOT NULL DEFAULT '[]',
      grant_types TEXT NOT NULL DEFAULT '["authorization_code","refresh_token"]',
      response_types TEXT NOT NULL DEFAULT '["code"]',
      scope TEXT NOT NULL DEFAULT 'mcp:read',
      token_endpoint_auth_method TEXT NOT NULL DEFAULT 'client_secret_post',
      client_uri TEXT,
      logo_uri TEXT,
      contacts TEXT,
      tos_uri TEXT,
      policy_uri TEXT,
      jwks_uri TEXT,
      jwks TEXT,
      software_id TEXT,
      software_version TEXT,
      is_public INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE INDEX IF NOT EXISTS idx_oauth_clients_client_id ON oauth_clients(client_id)`,

    `CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      code TEXT UNIQUE NOT NULL,
      client_id TEXT NOT NULL,
      redirect_uri TEXT NOT NULL,
      scope TEXT NOT NULL,
      user_id TEXT NOT NULL,
      code_challenge TEXT,
      code_challenge_method TEXT CHECK (code_challenge_method IN ('S256', 'plain')),
      expires_at TEXT NOT NULL,
      consumed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_code ON oauth_authorization_codes(code)`,
    `CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_client_id ON oauth_authorization_codes(client_id)`,
    `CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_expires_at ON oauth_authorization_codes(expires_at)`,

    `CREATE TABLE IF NOT EXISTS oauth_tokens (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      token_hash TEXT UNIQUE NOT NULL,
      token_type TEXT NOT NULL CHECK (token_type IN ('access', 'refresh')),
      client_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      scope TEXT NOT NULL,
      expires_at TEXT,
      revoked_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE INDEX IF NOT EXISTS idx_oauth_tokens_hash ON oauth_tokens(token_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_oauth_tokens_client_id ON oauth_tokens(client_id)`,
    `CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON oauth_tokens(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires_at ON oauth_tokens(expires_at)`,

    `CREATE TABLE IF NOT EXISTS oauth_client_metadata (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      client_id TEXT UNIQUE NOT NULL,
      metadata TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE TRIGGER IF NOT EXISTS update_oauth_clients_updated_at
      AFTER UPDATE ON oauth_clients
      BEGIN
        UPDATE oauth_clients SET updated_at = datetime('now') WHERE id = NEW.id;
      END`,

    `CREATE TRIGGER IF NOT EXISTS update_oauth_client_metadata_updated_at
      AFTER UPDATE ON oauth_client_metadata
      BEGIN
        UPDATE oauth_client_metadata SET updated_at = datetime('now') WHERE id = NEW.id;
      END`,
  ]

  for (const sql of statements) {
    await turso.execute(sql)
    console.log('Executed:', sql.substring(0, 60) + '...')
  }

  console.log('✅ Database schema initialized successfully')
}

async function testConnection() {
  const result = await turso.execute('SELECT 1 as test')
  console.log('✅ Database connection test:', result.rows)
}

async function main() {
  try {
    await testConnection()
    await initializeDatabase()
    console.log('✅ Database initialization complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
