-- Supabase: tabla para notas de noticias generadas automáticamente (cron de Vercel).
-- Mismo patrón RLS que chatbot_prefs: lectura + escritura públicas (sin login),
-- porque la generación la dispara el cron del servidor con la key anon.
-- Ejecutar en el SQL Editor de Supabase.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.news_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  image TEXT,
  images TEXT[] DEFAULT '{}',
  category TEXT,
  source_url TEXT,
  body TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slug, locale)
);

CREATE INDEX IF NOT EXISTS news_notes_date_idx ON public.news_notes (date DESC);
CREATE INDEX IF NOT EXISTS news_notes_locale_idx ON public.news_notes (locale);

ALTER TABLE public.news_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "news_notes_public_select" ON public.news_notes;
CREATE POLICY "news_notes_public_select" ON public.news_notes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "news_notes_public_insert" ON public.news_notes;
CREATE POLICY "news_notes_public_insert" ON public.news_notes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "news_notes_public_update" ON public.news_notes;
CREATE POLICY "news_notes_public_update" ON public.news_notes
  FOR UPDATE USING (true) WITH CHECK (true);
