-- MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX
-- Roles y permisos en Turso (SQLite/libSQL). Fuente de verdad: la BD.
-- ADMIN_EMAILS / EMPLOYEE_EMAILS quedan solo como bootstrap de emergencia.

-- ---------------------------------------------------------------------------
-- Matriz de roles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
  role TEXT PRIMARY KEY CHECK (role IN ('client', 'employee', 'admin')),
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rank INTEGER NOT NULL DEFAULT 1,

  -- Qué paneles puede abrir
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

  -- Paneles visibles (JSON array)
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

-- ---------------------------------------------------------------------------
-- Seed: 3 roles
-- ---------------------------------------------------------------------------
INSERT INTO role_permissions (
  role, label, description, rank,
  can_view_profile, can_operate_tours, can_view_admin,
  can_manage_users, can_view_client_pii, can_decrypt_sensitive_fields, can_manage_admins,
  can_view_bookings_own, can_view_bookings_all, can_manage_bookings, can_view_payments,
  can_view_basic_metrics, can_view_passive_analytics, can_view_advanced_metrics, can_export_gdpr,
  panels
) VALUES
  (
    'client', 'Cliente', 'Compra y gestiona sus propias reservas y datos.', 1,
    1, 0, 0,
    0, 0, 0, 0,
    1, 0, 0, 0,
    0, 0, 0, 0,
    '["/profile"]'
  ),
  (
    'employee', 'Empleado', 'Opera tours del día. Ve lo mínimo necesario del cliente.', 2,
    1, 1, 0,
    0, 1, 0, 0,
    1, 1, 1, 0,
    1, 1, 0, 0,
    '["/profile", "/empleados"]'
  ),
  (
    'admin', 'Admin', 'Control total: usuarios, datos sensibles, métricas y GDPR.', 3,
    1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    '["/profile", "/empleados", "/admin"]'
  )
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
  panels = excluded.panels;

-- ---------------------------------------------------------------------------
-- user_roles: fuente de verdad. Añade notas y estado.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles_new (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'employee', 'admin')),
  granted_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE("userId", role)
);

INSERT OR IGNORE INTO user_roles_new (id, "userId", email, role, granted_by, created_at, updated_at)
SELECT id, "userId", email, role, granted_by, created_at, updated_at FROM user_roles;

DROP TRIGGER IF EXISTS trg_user_roles_updated_at;
DROP TABLE IF EXISTS user_roles;
ALTER TABLE user_roles_new RENAME TO user_roles;

CREATE TRIGGER trg_user_roles_updated_at
AFTER UPDATE ON user_roles
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE user_roles SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles("userId");

-- ---------------------------------------------------------------------------
-- Todo usuario nuevo nace como client (salvo que se clasifique después)
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO user_roles ("userId", email, role, note)
SELECT u.id, u.email, 'client', 'Alta automática'
FROM users u
LEFT JOIN user_roles r ON r."userId" = u.id
WHERE r.id IS NULL;

-- ---------------------------------------------------------------------------
-- Auditoría: toda acción sensible debe registrar rol
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_audit_role_created ON access_audit_logs(actor_role, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_target ON access_audit_logs(target_email);
