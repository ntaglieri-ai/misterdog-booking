-- Mister Dog: spunta "avvisato" nella lista clienti di "Chiudi giornata".
alter table public.appointments
  add column if not exists notified_at timestamptz;
