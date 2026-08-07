-- Analítica pasiva estilo XocoCafe, adaptada a Amaxing.
-- Ejecutar en el SQL Editor de Supabase.

-- Sesiones
CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress" INET,
  "userAgent" TEXT,
  "deviceType" TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  "sessionDuration" INTEGER NOT NULL DEFAULT 0,
  "pageViews" INTEGER NOT NULL DEFAULT 0,
  "lastActivityAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analítica de páginas
CREATE TABLE IF NOT EXISTS public.page_analytics (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  "sessionId" TEXT REFERENCES public.sessions(id) ON DELETE SET NULL,
  "pagePath" TEXT NOT NULL,
  "pageTitle" TEXT,
  "pageCategory" TEXT,
  "timeOnPage" INTEGER NOT NULL DEFAULT 0,
  "scrollDepth" INTEGER NOT NULL DEFAULT 0,
  bounce BOOLEAN NOT NULL DEFAULT FALSE,
  "exitPage" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress" INET,
  "userAgent" TEXT,
  "referrerUrl" TEXT,
  "conversionEvent" TEXT,
  "conversionValue" NUMERIC(10,2)
);

-- Eventos de conversión
CREATE TABLE IF NOT EXISTS public.conversion_events (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  "sessionId" TEXT REFERENCES public.sessions(id) ON DELETE SET NULL,
  "eventType" TEXT NOT NULL,
  "eventCategory" TEXT,
  "eventValue" NUMERIC(10,2),
  "eventData" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress" INET,
  "userAgent" TEXT,
  "pagePath" TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_page_analytics_created_at ON public.page_analytics ("createdAt");
CREATE INDEX IF NOT EXISTS idx_page_analytics_page_category ON public.page_analytics ("pageCategory");
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON public.conversion_events ("eventType");
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions (token);

-- RLS: la lectura es pública (dashboard), la escritura la hace el backend con service role.
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions_read_public" ON public.sessions;
CREATE POLICY "sessions_read_public" ON public.sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "page_analytics_read_public" ON public.page_analytics;
CREATE POLICY "page_analytics_read_public" ON public.page_analytics FOR SELECT USING (true);

DROP POLICY IF EXISTS "conversion_events_read_public" ON public.conversion_events;
CREATE POLICY "conversion_events_read_public" ON public.conversion_events FOR SELECT USING (true);
