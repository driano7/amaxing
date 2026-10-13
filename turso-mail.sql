-- MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX
-- Correo: plantillas editables desde el panel + bitácora de envíos.

CREATE TABLE IF NOT EXISTS email_templates (
  key TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  text TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  variables TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

DROP TRIGGER IF EXISTS trg_email_templates_updated_at;
CREATE TRIGGER trg_email_templates_updated_at
AFTER UPDATE ON email_templates
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE email_templates SET updated_at = datetime('now') WHERE key = NEW.key;
END;

CREATE TABLE IF NOT EXISTS email_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  template_key TEXT NOT NULL,
  to_email TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','skipped')),
  error TEXT,
  provider_id TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_log_key ON email_log(template_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_to ON email_log(to_email);
CREATE INDEX IF NOT EXISTS idx_email_log_user ON email_log(user_id);

CREATE INDEX IF NOT EXISTS idx_users_email_notify ON users(email, is_active);
