-- Prezzi, nomi e durate modificabili dal gestionale. Le categorie restano quelle del percorso di prenotazione.
create table if not exists public.catalog_services (
  id text primary key,
  name text not null check (char_length(name) between 1 and 120),
  price_from numeric(10,2) not null check (price_from >= 0 and price_from <= 9999),
  duration_min integer not null check (duration_min between 5 and 480),
  is_from boolean not null default true
);
alter table public.catalog_services enable row level security;
revoke all on public.catalog_services from anon, authenticated;
