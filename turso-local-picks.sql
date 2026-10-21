-- ============================================================================
--  Calpulli CDMX — Turso: Local Picks
--  Copyright (c) 2024-2026 Donovan Riaño
--
--  Por que existe: el generador de Local Picks necesita escribir en
--  produccion. En Vercel el sistema de archivos de la funcion es de solo
--  lectura, asi que el cron NO puede dejar los .mdx en data/local-picks/.
--  La tabla local_picks es el almacen de verdad; los .mdx quedan como
--  semilla y copia local para desarrollo.
--
--  Aplicar:
--    node scripts/apply-sql.js turso-local-picks.sql
--  o pegar el bloque siguiente en el editor de Turso.
-- ============================================================================

CREATE TABLE IF NOT EXISTS local_picks (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL,
  lang          TEXT NOT NULL CHECK (lang IN ('es', 'en')),
  title         TEXT NOT NULL,
  festivity     TEXT,
  pinned        INTEGER NOT NULL DEFAULT 0,
  pinned_order  INTEGER,
  date          TEXT,
  tags          TEXT NOT NULL DEFAULT '[]',
  draft         INTEGER NOT NULL DEFAULT 0,
  summary       TEXT,
  images        TEXT NOT NULL DEFAULT '[]',
  neighborhood TEXT,
  budget        TEXT,
  category      TEXT,
  month         TEXT,
  pick_index    INTEGER,
  total_picks   INTEGER,
  is_monthly_guide INTEGER NOT NULL DEFAULT 0,
  body          TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- El indice natural del sitio: por idioma y fecha, con los fijados primero.
CREATE INDEX IF NOT EXISTS idx_local_picks_lang_date
  ON local_picks (lang, date DESC);

-- Los fijados se consultan por separado, para no mezclarlos con la rotacion.
CREATE INDEX IF NOT EXISTS idx_local_picks_pinned
  ON local_picks (lang, pinned, pinned_order);

-- Un slug por idioma: no puede repetirse.
CREATE UNIQUE INDEX IF NOT EXISTS idx_local_picks_slug_lang
  ON local_picks (slug, lang);
