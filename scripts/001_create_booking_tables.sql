-- Mister Dog: tabelle prenotazioni.
-- RLS attiva SENZA policy: il browser (anon/authenticated) non legge né scrive.
-- Tutto passa dal server con la chiave service role, che ignora la RLS.

create extension if not exists pgcrypto;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  duration_min int not null check (duration_min > 0),
  services jsonb not null default '[]'::jsonb,
  size text not null,
  customer_name text not null,
  phone text not null,
  dog_name text not null,
  status text not null default 'confermato'
    check (status in ('confermato', 'cancellato')),
  cancel_token text unique,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index if not exists appointments_active_range_idx
  on public.appointments (start_at, end_at)
  where status = 'confermato';

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  check (end_at > start_at)
);

create index if not exists blocked_slots_range_idx
  on public.blocked_slots (start_at, end_at);

alter table public.appointments enable row level security;
alter table public.blocked_slots enable row level security;

revoke all on public.appointments from anon, authenticated;
revoke all on public.blocked_slots from anon, authenticated;
