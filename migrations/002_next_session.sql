-- Migration 002: per-client "next session" date/time + location
-- Run this in Supabase SQL Editor after the initial schema.

alter table profiles add column if not exists next_session_at timestamptz;
alter table profiles add column if not exists next_session_location text;

-- Allow the trainer to update their clients' profiles (for next-session edits).
-- The existing "Users update own profile" policy is unchanged.
drop policy if exists "Trainer updates client profile" on profiles;
create policy "Trainer updates client profile" on profiles for update using (
  exists (
    select 1 from profiles me
    where me.id = auth.uid() and me.role = 'trainer'
  )
  and trainer_id = auth.uid()
);
