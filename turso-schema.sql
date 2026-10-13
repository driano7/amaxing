-- ============================================================================
--  Calpulli CDMX — Esquema unificado de Turso (SQLite / libSQL)
--  Copyright (c) 2024-2026 Donovan Riaño
--
--  Este archivo es la fuente de verdad del esquema. Reemplaza a los scripts
--  incrementales que se aplicaron durante el desarrollo:
--    turso-roles.sql, turso-gdpr.sql, turso-bookings.sql, turso-referrals.sql
--
--  Aplicar sobre una base vacía:
--    set -a; source .env.local; set +a
--    node scripts/apply-sql.mjs turso-schema.sql
--
--  Datos fuera del esquema (se siembran aparte):
--    experiences  -> node scripts/seed-experiences.mjs   (desde data/toursData.js)
--    Cifrado PII  -> node scripts/backfill-gdpr.mjs      (--dry-run primero)
-- ============================================================================


-- ============================================================================
--  1. IDENTIDAD
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nationality TEXT,
  phone TEXT,
  -- Opcional. passport_number se eliminó: no lo pedimos.
  date_of_birth TEXT,
  is_email_verified INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'guide')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Cifrado en reposo (AES-256-GCM, ver lib/gdpr-crypto.ts).
  -- La llave se deriva con PBKDF2(email + GDPR_PEPPER); sin el pepper, el
  -- dump de la base no descifra nada.
  first_nameEncrypted TEXT,
  first_nameIv TEXT,
  first_nameTag TEXT,
  first_nameSalt TEXT,
  last_nameEncrypted TEXT,
  last_nameIv TEXT,
  last_nameTag TEXT,
  last_nameSalt TEXT,
  phoneEncrypted TEXT,
  phoneIv TEXT,
  phoneTag TEXT,
  phoneSalt TEXT,
  date_of_birthEncrypted TEXT,
  date_of_birthIv TEXT,
  date_of_birthTag TEXT,
  date_of_birthSalt TEXT,
  pii_encrypted_at TEXT,

  CHECK (email LIKE '%@%.%'),
  CHECK (LENGTH(password_hash) >= 60)
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE is_active = 1;
CREATE INDEX IF NOT EXISTS idx_users_pii_encrypted ON users(pii_encrypted_at);

DROP TRIGGER IF EXISTS trg_users_updated_at;
CREATE TRIGGER trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  "expiresAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "deviceType" TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  "sessionDuration" INTEGER NOT NULL DEFAULT 0,
  "pageViews" INTEGER NOT NULL DEFAULT 0,
  "lastActivityAt" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions("expiresAt");

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT,
  ip TEXT,
  user_agent TEXT,
  success INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, attempted_at DESC);


-- ============================================================================
--  2. ROLES Y PERMISOS  (fuente de verdad: la BD)
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  role TEXT PRIMARY KEY CHECK (role IN ('client', 'employee', 'admin')),
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rank INTEGER NOT NULL DEFAULT 1,

  -- Paneles
  can_view_profile INTEGER NOT NULL DEFAULT 1,
  can_operate_tours INTEGER NOT NULL DEFAULT 0,
  can_view_admin INTEGER NOT NULL DEFAULT 0,

  -- Usuarios
  can_manage_users INTEGER NOT NULL DEFAULT 0,
  can_view_client_pii INTEGER NOT NULL DEFAULT 0,
  can_decrypt_sensitive_fields INTEGER NOT NULL DEFAULT 0,
  can_manage_admins INTEGER NOT NULL DEFAULT 0,

  -- Reservas y pagos
  can_view_bookings_own INTEGER NOT NULL DEFAULT 1,
  can_view_bookings_all INTEGER NOT NULL DEFAULT 0,
  can_manage_bookings INTEGER NOT NULL DEFAULT 0,
  can_view_payments INTEGER NOT NULL DEFAULT 0,

  -- Métricas
  can_view_basic_metrics INTEGER NOT NULL DEFAULT 0,
  can_view_passive_analytics INTEGER NOT NULL DEFAULT 0,
  can_view_advanced_metrics INTEGER NOT NULL DEFAULT 0,
  can_export_gdpr INTEGER NOT NULL DEFAULT 0,

  -- Referidos
  can_be_referrer INTEGER NOT NULL DEFAULT 0,
  can_view_referral_stats INTEGER NOT NULL DEFAULT 0,

  -- RGPD: el derecho de acceso y supresión es del propio cliente sobre
  -- sus datos. Por eso can_export_gdpr está en 1 para los tres roles, pero
  -- el endpoint /api/gdpr/* solo alcanza los datos del usuario autenticado.
  can_export_own_data INTEGER NOT NULL DEFAULT 1,

  panels TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

DROP TRIGGER IF EXISTS trg_role_permissions_updated_at;
CREATE TRIGGER trg_role_permissions_updated_at
AFTER UPDATE ON role_permissions
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE role_permissions SET updated_at = datetime('now') WHERE role = NEW.role;
END;

INSERT INTO role_permissions (
  role, label, description, rank,
  can_view_profile, can_operate_tours, can_view_admin,
  can_manage_users, can_view_client_pii, can_decrypt_sensitive_fields, can_manage_admins,
  can_view_bookings_own, can_view_bookings_all, can_manage_bookings, can_view_payments,
  can_view_basic_metrics, can_view_passive_analytics, can_view_advanced_metrics, can_export_gdpr,
  can_be_referrer, can_view_referral_stats, can_export_own_data,
  panels
) VALUES
  ('client', 'Cliente',
   'Compra y gestiona sus propias reservas. Exporta y elimina sus datos (RGPD).',
   1, 1,0,0,  0,0,0,0,  1,0,0,0,  0,0,0,0,  0,0, 1,  '["/profile"]'),

  ('employee', 'Empleado',
   'Opera tours del día. Ve lo mínimo del cliente. Puede tener referred.',
   2, 1,1,0,  0,1,0,0,  1,1,1,0,  1,1,0,0,  1,0, 1,  '["/profile", "/empleados"]'),

  ('admin', 'Admin',
   'Control total: usuarios, datos sensibles, métricas, referidos y RGPD.',
   3, 1,1,1,  1,1,1,1,  1,1,1,1,  1,1,1,1,  1,1, 1,  '["/profile", "/empleados", "/admin"]')
ON CONFLICT(role) DO UPDATE SET
  label = excluded.label,
  description = excluded.description,
  rank = excluded.rank,
  can_view_profile = excluded.can_view_profile,
  can_operate_tours = excluded.can_operate_tours,
  can_view_admin = excluded.can_view_admin,
  can_manage_users = excluded.can_manage_users,
  can_view_client_pii = excluded.can_view_client_pii,
  can_decrypt_sensitive_fields = excluded.can_decrypt_sensitive_fields,
  can_manage_admins = excluded.can_manage_admins,
  can_view_bookings_own = excluded.can_view_bookings_own,
  can_view_bookings_all = excluded.can_view_bookings_all,
  can_manage_bookings = excluded.can_manage_bookings,
  can_view_payments = excluded.can_view_payments,
  can_view_basic_metrics = excluded.can_view_basic_metrics,
  can_view_passive_analytics = excluded.can_view_passive_analytics,
  can_view_advanced_metrics = excluded.can_view_advanced_metrics,
  can_export_gdpr = excluded.can_export_gdpr,
  can_be_referrer = excluded.can_be_referrer,
  can_view_referral_stats = excluded.can_view_referral_stats,
  can_export_own_data = excluded.can_export_own_data,
  panels = excluded.panels;

-- Fuente de verdad del rol. Un solo rol activo por usuario.
CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'employee', 'admin')),
  granted_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE ("userId", role)
);

DROP TRIGGER IF EXISTS trg_user_roles_updated_at;
CREATE TRIGGER trg_user_roles_updated_at
AFTER UPDATE ON user_roles
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE user_roles SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles("userId");

CREATE TABLE IF NOT EXISTS access_audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  actor_id TEXT,
  actor_email TEXT,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_email TEXT,
  details TEXT NOT NULL DEFAULT '{}',
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON access_audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_role_created ON access_audit_logs(actor_role, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_target ON access_audit_logs(target_email);


-- ============================================================================
--  3. CATÁLOGO
-- ============================================================================

CREATE TABLE IF NOT EXISTS tour_categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT UNIQUE,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

DROP TRIGGER IF EXISTS trg_tour_categories_updated_at;
CREATE TRIGGER trg_tour_categories_updated_at
AFTER UPDATE ON tour_categories
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE tour_categories SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  price REAL NOT NULL CHECK (price >= 0),
  duration_hours REAL NOT NULL CHECK (duration_hours > 0),
  max_guests INTEGER NOT NULL DEFAULT 8 CHECK (max_guests > 0),
  image_url TEXT,
  location_en TEXT,
  location_es TEXT,
  highlights_en TEXT NOT NULL DEFAULT '[]',
  highlights_es TEXT NOT NULL DEFAULT '[]',
  "isFeatured" INTEGER NOT NULL DEFAULT 0,
  "isActive" INTEGER NOT NULL DEFAULT 1,
  category_id TEXT REFERENCES tour_categories(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

DROP TRIGGER IF EXISTS trg_experiences_updated_at;
CREATE TRIGGER trg_experiences_updated_at
AFTER UPDATE ON experiences
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE experiences SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_experiences_category_id ON experiences(category_id);
CREATE INDEX IF NOT EXISTS idx_experiences_active ON experiences("isActive");
CREATE INDEX IF NOT EXISTS idx_experiences_featured ON experiences("isFeatured");

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  experience_id TEXT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  origin_country TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment_text TEXT NOT NULL,
  "isVerified" INTEGER NOT NULL DEFAULT 0,
  "isPublished" INTEGER NOT NULL DEFAULT 1,
  "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
);

DROP TRIGGER IF EXISTS trg_reviews_updated_at;
CREATE TRIGGER trg_reviews_updated_at
AFTER UPDATE ON reviews
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE reviews SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_reviews_experience_id ON reviews(experience_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews("isPublished");
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews("createdAt" DESC);

CREATE TABLE IF NOT EXISTS news_notes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT NOT NULL UNIQUE,
  locale TEXT NOT NULL DEFAULT 'es',
  title TEXT NOT NULL,
  date TEXT,
  summary TEXT,
  body TEXT,
  image TEXT,
  images TEXT,
  category TEXT,
  source_url TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  tags TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

DROP TRIGGER IF EXISTS trg_news_notes_updated_at;
CREATE TRIGGER trg_news_notes_updated_at
AFTER UPDATE ON news_notes
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE news_notes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_news_notes_slug ON news_notes(slug);
CREATE INDEX IF NOT EXISTS idx_news_notes_published ON news_notes(published);


-- ============================================================================
--  4. RESERVAS Y PAGOS
-- ============================================================================

-- user_id es NULLABLE: el sitio permite pagar como invitado sin cuenta.
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  experience_id TEXT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  is_guest INTEGER NOT NULL DEFAULT 0,
  -- Esta referencia es la que viaja en el QR (AMX-T-<booking_reference>).
  booking_reference TEXT NOT NULL UNIQUE,
  booking_date TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  start_time TEXT,
  guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 10),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','paid','in_progress','completed','cancelled','no_show','refunded')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','partial','paid','refunded')),
  paid_at TEXT,
  total_amount REAL NOT NULL CHECK (total_amount >= 0),
  discount_amount REAL NOT NULL DEFAULT 0,
  taxes_amount REAL NOT NULL DEFAULT 0,
  payed_amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','EUR','MXN','CAD')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  special_requests TEXT,
  dietary_restrictions TEXT NOT NULL DEFAULT '[]',
  accessibility_needs TEXT,
  agent_fee REAL NOT NULL DEFAULT 0,
  commission_rate REAL NOT NULL DEFAULT 0,
  checked_in_at TEXT,
  checked_in_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

DROP TRIGGER IF EXISTS trg_bookings_updated_at;
CREATE TRIGGER trg_bookings_updated_at
AFTER UPDATE ON bookings
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE bookings SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_bookings_experience_id ON bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_upcoming ON bookings(start_date)
  WHERE status IN ('confirmed','paid','pending');
CREATE INDEX IF NOT EXISTS idx_bookings_stripe ON bookings(stripe_session_id);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_payment_id TEXT,
  amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  raw_payload TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

DROP TRIGGER IF EXISTS trg_payments_updated_at;
CREATE TRIGGER trg_payments_updated_at
AFTER UPDATE ON payments
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE payments SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON payments(provider_payment_id);


-- ============================================================================
--  5. REFERIDOS  (modelo de Cripte, adaptado a SQLite)
-- ============================================================================

-- El código es único y está ligado 1:1 al usuario (UNIQUE(user_id)).
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

DROP TRIGGER IF EXISTS trg_referral_codes_updated_at;
CREATE TRIGGER trg_referral_codes_updated_at
AFTER UPDATE ON referral_codes
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE referral_codes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_status ON referral_codes(status);

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

-- Una atribución por usuario: el primer referido que lo trae es el que cuenta.
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

DROP TRIGGER IF EXISTS trg_referral_attributions_updated_at;
CREATE TRIGGER trg_referral_attributions_updated_at
AFTER UPDATE ON referral_attributions
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE referral_attributions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_referral_attributions_code
  ON referral_attributions(referral_code_id, attributed_at DESC);

-- Una conversión por reserva.
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


-- ============================================================================
--  6. ANALÍTICA
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_analytics (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
  "sessionId" TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  "pagePath" TEXT NOT NULL,
  "pageTitle" TEXT,
  "pageCategory" TEXT,
  "timeOnPage" INTEGER,
  "scrollDepth" REAL,
  "bounce" INTEGER,
  "exitPage" INTEGER,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "referrerUrl" TEXT,
  "conversionEvent" TEXT,
  "conversionValue" REAL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_page_analytics_user ON page_analytics("userId");
CREATE INDEX IF NOT EXISTS idx_page_analytics_session ON page_analytics("sessionId");
CREATE INDEX IF NOT EXISTS idx_page_analytics_path ON page_analytics("pagePath");
CREATE INDEX IF NOT EXISTS idx_page_analytics_created ON page_analytics("createdAt" DESC);

CREATE TABLE IF NOT EXISTS conversion_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
  "sessionId" TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  "eventType" TEXT NOT NULL,
  "eventCategory" TEXT,
  "eventValue" REAL DEFAULT 0,
  "eventData" TEXT,
  "pagePath" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events("eventType");
CREATE INDEX IF NOT EXISTS idx_conversion_events_created ON conversion_events("createdAt" DESC);

CREATE TABLE IF NOT EXISTS chatbot_prefs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "userId" TEXT REFERENCES users(id) ON DELETE CASCADE,
  prefs TEXT NOT NULL DEFAULT '{}',
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
);

DROP TRIGGER IF EXISTS trg_chatbot_prefs_updated_at;
CREATE TRIGGER trg_chatbot_prefs_updated_at
AFTER UPDATE ON chatbot_prefs
FOR EACH ROW WHEN NEW."updatedAt" = OLD."updatedAt"
BEGIN
  UPDATE chatbot_prefs SET "updatedAt" = datetime('now') WHERE id = NEW.id;
END;


-- ============================================================================
--  7. MCP / OAUTH 2.1
-- ============================================================================

CREATE TABLE IF NOT EXISTS oauth_clients (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  client_id TEXT UNIQUE NOT NULL,
  client_secret_hash TEXT,
  client_name TEXT,
  redirect_uris TEXT NOT NULL DEFAULT '[]',
  grant_types TEXT NOT NULL DEFAULT '["authorization_code","refresh_token"]',
  response_types TEXT NOT NULL DEFAULT '["code"]',
  scope TEXT NOT NULL DEFAULT 'mcp:read',
  token_endpoint_auth_method TEXT NOT NULL DEFAULT 'none',
  client_uri TEXT,
  logo_uri TEXT,
  contacts TEXT,
  tos_uri TEXT,
  policy_uri TEXT,
  jwks_uri TEXT,
  jwks TEXT,
  software_id TEXT,
  software_version TEXT,
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

DROP TRIGGER IF EXISTS trg_oauth_clients_updated_at;
CREATE TRIGGER trg_oauth_clients_updated_at
AFTER UPDATE ON oauth_clients
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE oauth_clients SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code_hash TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  redirect_uri TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'mcp:read',
  code_challenge TEXT,
  code_challenge_method TEXT,
  resource TEXT,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_oauth_codes_hash ON oauth_authorization_codes(code_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_codes_user ON oauth_authorization_codes(user_id);

CREATE TABLE IF NOT EXISTS oauth_tokens (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  token_hash TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'mcp:read',
  token_type TEXT NOT NULL DEFAULT 'access' CHECK (token_type IN ('access','refresh')),
  resource TEXT,
  expires_at TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_hash ON oauth_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user ON oauth_tokens(user_id);

CREATE TABLE IF NOT EXISTS oauth_client_metadata (
  client_id TEXT PRIMARY KEY,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

DROP TRIGGER IF EXISTS trg_oauth_client_metadata_updated_at;
CREATE TRIGGER trg_oauth_client_metadata_updated_at
AFTER UPDATE ON oauth_client_metadata
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE oauth_client_metadata SET updated_at = datetime('now') WHERE client_id = NEW.client_id;
END;


-- ============================================================================
--  8. VERIFICACIÓN
-- ============================================================================
-- SELECT COUNT(*) FROM users;                          -- 0
-- SELECT role, can_view_advanced_metrics,
--        can_decrypt_sensitive_fields, can_export_own_data
--   FROM role_permissions ORDER BY rank;              -- 3 filas
-- SELECT name FROM sqlite_master
--  WHERE type='trigger' ORDER BY name;                -- todos válidas
