-- Home gym log: database setup. Run once in Supabase: SQL Editor > New query > paste > Run.
-- Safe to run again. Every row belongs to one user. Row-level security lets each signed-in
-- user read and write only their own rows; logged-out visitors can read nothing.
-- The jsonb columns hold the app's own objects (see lib/types.ts), so the backup format still fits.

create table if not exists public.profiles (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  display_name text not null default '',
  equipment text not null default '',   -- free text: what this user owns
  plate_map text not null default '',   -- optional, e.g. "High pulley plate 1 = 6 kg"
  updated_at timestamptz not null default now()
);

create table if not exists public.workouts (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,                      -- permanent workout id, e.g. "mon"
  position integer not null,             -- the user's order of days
  data jsonb not null,                   -- Workout
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.sessions (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  workout_id text not null,
  date timestamptz not null,
  data jsonb not null,                   -- Session
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists sessions_user_date on public.sessions (user_id, date);

create table if not exists public.drafts (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  workout_id text not null,
  data jsonb not null,                   -- Draft
  updated_at timestamptz not null default now(),
  primary key (user_id, workout_id)
);

do $$
declare t text;
begin
  foreach t in array array['profiles', 'workouts', 'sessions', 'drafts'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated '
      'using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;
