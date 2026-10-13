-- Quita passport_number (dato que no pedimos) y reconstruye bookings para
-- soportar reservas de invitado (user_id nullable) y la hora del tour.

-- ---------------------------------------------------------------------------
-- users: sin pasaporte. date_of_birth sigue siendo opcional (nullable).
-- ---------------------------------------------------------------------------
CREATE TABLE users_new (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nationality TEXT,
  phone TEXT,
  date_of_birth TEXT,
  is_email_verified INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'guide')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
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

INSERT INTO users_new (
  id, email, password_hash, first_name, last_name, nationality, phone, date_of_birth,
  is_email_verified, is_active, last_login_at, failed_login_attempts, account_locked_until,
  role, created_at, updated_at,
  first_nameEncrypted, first_nameIv, first_nameTag, first_nameSalt,
  last_nameEncrypted, last_nameIv, last_nameTag, last_nameSalt,
  phoneEncrypted, phoneIv, phoneTag, phoneSalt,
  date_of_birthEncrypted, date_of_birthIv, date_of_birthTag, date_of_birthSalt,
  pii_encrypted_at
)
SELECT
  id, email, password_hash, first_name, last_name, nationality, phone, date_of_birth,
  is_email_verified, is_active, last_login_at, failed_login_attempts, account_locked_until,
  role, created_at, updated_at,
  first_nameEncrypted, first_nameIv, first_nameTag, first_nameSalt,
  last_nameEncrypted, last_nameIv, last_nameTag, last_nameSalt,
  phoneEncrypted, phoneIv, phoneTag, phoneSalt,
  date_of_birthEncrypted, date_of_birthIv, date_of_birthTag, date_of_birthSalt,
  pii_encrypted_at
FROM users;

DROP TRIGGER IF EXISTS trg_users_updated_at;
DROP TRIGGER IF EXISTS update_users_updated_at;
DROP TABLE IF EXISTS users;
ALTER TABLE users_new RENAME TO users;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE is_active = 1;
CREATE INDEX IF NOT EXISTS idx_users_pii_encrypted ON users(pii_encrypted_at);

CREATE TRIGGER trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ---------------------------------------------------------------------------
-- bookings: user_id nullable (invitados sin cuenta) + hora + check-in
-- ---------------------------------------------------------------------------
CREATE TABLE bookings_new (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  experience_id TEXT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  is_guest INTEGER NOT NULL DEFAULT 0,
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

INSERT INTO bookings_new (
  id, experience_id, user_id, booking_reference, booking_date, start_date, end_date,
  guests, status, payment_status, total_amount, discount_amount, taxes_amount,
  payed_amount, currency, stripe_session_id, stripe_payment_intent_id,
  special_requests, dietary_restrictions, accessibility_needs, agent_fee, commission_rate,
  created_at, updated_at
)
SELECT
  id, experience_id, user_id, booking_reference, booking_date, start_date, end_date,
  guests, status, payment_status, total_amount, discount_amount, taxes_amount,
  payed_amount, currency, stripe_session_id, stripe_payment_intent_id,
  special_requests, dietary_restrictions, accessibility_needs, agent_fee, commission_rate,
  created_at, updated_at
FROM bookings;

DROP TRIGGER IF EXISTS trg_bookings_updated_at;
DROP TRIGGER IF EXISTS update_bookings_updated_at;
DROP TABLE IF EXISTS bookings;
ALTER TABLE bookings_new RENAME TO bookings;

CREATE INDEX IF NOT EXISTS idx_bookings_experience_id ON bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_upcoming ON bookings(start_date)
  WHERE status IN ('confirmed','paid','pending');

CREATE TRIGGER trg_bookings_updated_at
AFTER UPDATE ON bookings
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE bookings SET updated_at = datetime('now') WHERE id = NEW.id;
END;
