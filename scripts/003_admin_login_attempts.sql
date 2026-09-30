-- Tentativi di accesso all'admin: servono per bloccare il PIN dopo 5 errori per 15 minuti.
create table if not exists public.admin_login_attempts (
  key text primary key,
  failures int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

-- RLS attiva senza policy: solo il server (service role) può leggere e scrivere.
alter table public.admin_login_attempts enable row level security;
