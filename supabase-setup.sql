-- ============================================================
--  316 Restock Watch — database setup
--  Paste this whole file into Supabase > SQL Editor and click Run.
-- ============================================================

create table if not exists public.sightings (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('restock', 'sighting', 'sold_out')),
  city        text not null check (char_length(city)    between 1 and 40),
  store       text not null check (char_length(store)   between 1 and 80),
  product     text not null check (char_length(product) between 1 and 120),
  notes       text          check (char_length(notes)   <= 300),
  reporter    text          check (char_length(reporter) <= 30)
);

create index if not exists sightings_created_at_idx on public.sightings (created_at desc);

-- Row Level Security: visitors can READ and ADD reports,
-- but can never edit or delete them. (You can, from the Supabase dashboard.)
alter table public.sightings enable row level security;

drop policy if exists "Anyone can read sightings" on public.sightings;
create policy "Anyone can read sightings"
  on public.sightings for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can add a sighting" on public.sightings;
create policy "Anyone can add a sighting"
  on public.sightings for insert
  to anon, authenticated
  with check (created_at > now() - interval '1 minute');

-- Live updates: new reports appear on everyone's screen instantly
alter publication supabase_realtime add table public.sightings;
