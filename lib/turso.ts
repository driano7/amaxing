// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { createClient } from '@libsql/client'

// Cliente Turso/LibSQL para base de datos
// Usa variables de entorno TURSO_DATABASE_URL y TURSO_AUTH_TOKEN

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  throw new Error('TURSO_DATABASE_URL environment variable is not set')
}

export const turso = createClient({
  url,
  authToken,
})

// Helper para ejecutar queries con retry
export async function executeWithRetry(sql: string, args: any[] = [], retries = 3) {
  let lastError: Error | null = null

  for (let i = 0; i < retries; i++) {
    try {
      return await turso.execute({ sql, args })
    } catch (error) {
      lastError = error as Error
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100 * (i + 1)))
      }
    }

    throw lastError
  }
}

// Helper para transacciones
export async function transaction(statements: { sql: string; args: any[] }[]) {
  return await turso.transaction(
    statements.map((s) => ({
      sql: s.sql,
      args: s.args,
    }))
  )
}

export default turso
