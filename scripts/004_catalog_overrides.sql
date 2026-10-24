-- Mister Dog: modifiche al catalogo servizi fatte dal gestionale.
-- La lista base dei servizi resta nel codice (lib/services.ts): questa tabella
-- contiene solo prezzo, durata e visibilità modificati dal salone.
-- Sicuro da rilanciare. RLS attiva SENZA policy: legge e scrive solo il server.

create table if not exists public.catalog_overrides (
  service_id text primary key,
  price_from numeric not null check (price_from >= 0),
  is_from boolean not null,
  duration_min int not null check (duration_min between 10 and 480),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.catalog_overrides enable row level security;
revoke all on public.catalog_overrides from anon, authenticated;
