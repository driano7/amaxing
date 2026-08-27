import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-key'

const isValidUrl = (url) =>
  typeof url === 'string' && /^https?:\/\//.test(url) && !url.includes('your_')

const resolvedUrl = isValidUrl(supabaseUrl) ? supabaseUrl : PLACEHOLDER_URL
const resolvedKey =
  supabaseAnonKey && !supabaseAnonKey.includes('your_') ? supabaseAnonKey : PLACEHOLDER_KEY

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey || supabaseAnonKey.includes('your_')) {
  console.warn(
    '[Supabase] Using placeholder client — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for real DB'
  )
}

export const supabase = createClient(resolvedUrl, resolvedKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export function createServerSupabaseClient() {
  const url = isValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : PLACEHOLDER_URL
  const key =
    (process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your_')
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : null) ||
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your_')
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : PLACEHOLDER_KEY)
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
