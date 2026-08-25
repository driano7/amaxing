-- ============================================================
-- Amaxing — Sistema de roles y auditoría (GDPR)
-- Ejecutar en Supabase SQL Editor.
--
-- Roles resueltos en este orden:
--   1. ADMIN_EMAILS / EMPLOYEE_EMAILS (env, fuente inmediata)
--   2. Tabla user_roles (persistente, gestionable desde panel admin)
--   3. Default: 'client'
-- ============================================================

-- Tabla de roles persistentes
create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'employee', 'client')),
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique ("userId", role)
);

create index if not exists idx_user_roles_email on user_roles(lower(email));
create index if not exists idx_user_roles_user on user_roles("userId");

-- Log de auditoría GDPR: quién accedió/descifró/gestionó qué
create table if not exists access_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  actor_role text not null,
  action text not null, -- 'view_users' | 'decrypt_field' | 'grant_role' | 'revoke_role' | 'export_gdpr'
  target_email text,
  details jsonb default '{}',
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_actor on access_audit_logs(actor_id, created_at desc);

-- RLS: solo admins leen roles completos; usuarios ven su propio rol
alter table user_roles enable row level security;
alter table access_audit_logs enable row level security;

create policy "users_read_own_role" on user_roles
  for select using (auth.uid() = "userId");

create policy "admins_manage_roles" on user_roles
  for all using (
    exists (
      select 1 from user_roles ur
      where ur."userId" = auth.uid() and ur.role = 'admin'
    )
  );

-- Solo inserts desde service role (APIs) para auditoría
create policy "service_writes_audit" on access_audit_logs
  for insert with check (true);

-- Vista helper: rol efectivo por usuario (env se evalúa server-side, esta vista es BD-only)
create or replace view effective_user_roles as
select distinct on ("userId")
  "userId", email, role, updated_at as since
from user_roles
order by "userId",
  case role when 'admin' then 1 when 'employee' then 2 else 3 end;
