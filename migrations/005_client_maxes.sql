-- Migration 005: per-client per-exercise personal records (maxes).
-- Trainer adds/edits; client reads their own.

create table if not exists client_maxes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id) on delete cascade not null,
  trainer_id uuid references profiles(id) not null,
  exercise_name text not null,
  exercise_db_id text,
  weight numeric not null,
  reps integer default 1,
  recorded_date date default current_date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists client_maxes_client_idx on client_maxes (client_id);

alter table client_maxes enable row level security;

drop policy if exists "Trainer manages client maxes" on client_maxes;
create policy "Trainer manages client maxes" on client_maxes for all using (
  auth.uid() = trainer_id
);

drop policy if exists "Client reads own maxes" on client_maxes;
create policy "Client reads own maxes" on client_maxes for select using (
  auth.uid() = client_id
);
