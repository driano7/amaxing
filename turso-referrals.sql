-- MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX
-- Referidos (affiliates) — modelo de Cripte adapted a SQLite/libSQL.
--
-- referral_codes        código único por persona (empleado o admin)
-- referral_visits       clics en el enlace de referido (?ref=CODIGO)
-- referral_attributions a quién se atribuyó cada cliente (1 por usuario)
-- referral_conversions  compras atribuidas a un referido

-- ---------------------------------------------------------------------------
-- Código de referido por persona
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referral_codes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  display_name TEXT,
  commission_rate REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id)
);

CREATE TRIGGER IF NOT EXISTS trg_referral_codes_updated_at
AFTER UPDATE ON referral_codes
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE referral_codes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_status ON referral_codes(status);

-- ---------------------------------------------------------------------------
-- Clics
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referral_visits (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  referral_code_id TEXT NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  visit_url TEXT,
  referrer_url TEXT,
  ip TEXT,
  user_agent TEXT,
  visited_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_referral_visits_code ON referral_visits(referral_code_id, visited_at DESC);

-- ---------------------------------------------------------------------------
-- Atribución: una vez por usuario (el primer referido que lo trajo cuenta)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referral_attributions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  referral_code_id TEXT NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referred_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  campaign TEXT,
  source TEXT NOT NULL DEFAULT 'link',
  metadata TEXT NOT NULL DEFAULT '{}',
  attributed_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (referred_user_id)
);

CREATE TRIGGER IF NOT EXISTS trg_referral_attributions_updated_at
AFTER UPDATE ON referral_attributions
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE referral_attributions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_referral_attributions_code
  ON referral_attributions(referral_code_id, attributed_at DESC);

-- ---------------------------------------------------------------------------
-- Conversiones (reservas atribuidas)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referral_conversions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  referral_code_id TEXT NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referred_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  stripe_session_id TEXT,
  payment_intent_id TEXT,
  amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  converted_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (booking_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_conversions_code
  ON referral_conversions(referral_code_id, converted_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_stripe
  ON referral_conversions(stripe_session_id);

-- ---------------------------------------------------------------------------
-- Permiso de ser referente
-- ---------------------------------------------------------------------------
ALTER TABLE role_permissions ADD COLUMN can_be_referrer INTEGER NOT NULL DEFAULT 0;
ALTER TABLE role_permissions ADD COLUMN can_view_referral_stats INTEGER NOT NULL DEFAULT 0;

UPDATE role_permissions SET can_be_referrer = 1 WHERE role = 'employee';
UPDATE role_permissions SET can_be_referrer = 1, can_view_referral_stats = 1 WHERE role = 'admin';

DROP TRIGGER IF EXISTS trg_role_permissions_updated_at;
CREATE TRIGGER trg_role_permissions_updated_at
AFTER UPDATE ON role_permissions
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE role_permissions SET updated_at = datetime('now') WHERE role = NEW.role;
END;
