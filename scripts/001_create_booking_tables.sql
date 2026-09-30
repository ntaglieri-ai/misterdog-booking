-- Mister Dog: tabelle prenotazioni.
-- Sicuro da rilanciare: se le tabelle esistono già (anche con una struttura
-- vecchia) aggiunge solo le colonne mancanti, senza cancellare dati.
-- RLS attiva SENZA policy: il browser (anon/authenticated) non legge né scrive.
-- Tutto passa dal server con la chiave service role, che ignora la RLS.

create extension if not exists pgcrypto;

-- appointments ---------------------------------------------------------------

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid()
);

alter table public.appointments
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz,
  add column if not exists duration_min int,
  add column if not exists services jsonb not null default '[]'::jsonb,
  add column if not exists size text,
  add column if not exists customer_name text,
  add column if not exists phone text,
  add column if not exists dog_name text,
  add column if not exists status text not null default 'confermato',
  add column if not exists cancel_token text,
  add column if not exists created_at timestamptz not null default now();

-- Old columns left over from a previous schema must not block new inserts.
do $$
declare
  col record;
begin
  for col in
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointments'
      and is_nullable = 'NO'
      and column_default is null
      and column_name not in ('id', 'services', 'status', 'created_at')
  loop
    execute format('alter table public.appointments alter column %I drop not null', col.column_name);
  end loop;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_status_check') then
    alter table public.appointments
      add constraint appointments_status_check
      check (status in ('confermato', 'cancellato')) not valid;
  end if;
end $$;

create unique index if not exists appointments_cancel_token_key
  on public.appointments (cancel_token);

create index if not exists appointments_active_range_idx
  on public.appointments (start_at, end_at)
  where status = 'confermato';

-- blocked_slots --------------------------------------------------------------

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid()
);

alter table public.blocked_slots
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz,
  add column if not exists reason text;

create index if not exists blocked_slots_range_idx
  on public.blocked_slots (start_at, end_at);

-- sicurezza ------------------------------------------------------------------

alter table public.appointments enable row level security;
alter table public.blocked_slots enable row level security;

revoke all on public.appointments from anon, authenticated;
revoke all on public.blocked_slots from anon, authenticated;
