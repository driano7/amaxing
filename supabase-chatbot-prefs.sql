-- =====================================================================
--  amaxing - Preferencias del Asistente (chatbot_prefs)
--  Guarda las respuestas del onboarding de Amaxing AI.
--  Sin login: se guarda como registro público (chat_id anónimo).
--  Ejecuta en el esquema "public".
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función helper para updatedAt (reutilizable, idempotente)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- Tabla de preferencias
-- chat_id: identificador anónimo del visitante (cookie/localStorage)
-- prefs:   array JSON con las respuestas del onboarding
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chatbot_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id TEXT NOT NULL UNIQUE,
  prefs JSONB NOT NULL DEFAULT '[]',
  locale TEXT NOT NULL DEFAULT 'en',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chatbot_prefs_chat_id_idx ON public.chatbot_prefs (chat_id);
CREATE INDEX IF NOT EXISTS chatbot_prefs_created_at_idx ON public.chatbot_prefs ("createdAt" DESC);

DROP TRIGGER IF EXISTS trg_chatbot_prefs_touch_updated_at ON public.chatbot_prefs;
CREATE TRIGGER trg_chatbot_prefs_touch_updated_at
  BEFORE UPDATE ON public.chatbot_prefs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------
-- RLS: lectura e inserción/actualización públicas (sin autenticación),
-- porque el onboarding se responde sin iniciar sesión.
-- ---------------------------------------------------------------------
ALTER TABLE public.chatbot_prefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chatbot_prefs_public_select" ON public.chatbot_prefs;
CREATE POLICY "chatbot_prefs_public_select" ON public.chatbot_prefs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "chatbot_prefs_public_insert" ON public.chatbot_prefs;
CREATE POLICY "chatbot_prefs_public_insert" ON public.chatbot_prefs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "chatbot_prefs_public_update" ON public.chatbot_prefs;
CREATE POLICY "chatbot_prefs_public_update" ON public.chatbot_prefs
  FOR UPDATE USING (true) WITH CHECK (true);
