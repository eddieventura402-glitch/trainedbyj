-- Migration 003: trainer_exists() RPC
-- Lets the unauthenticated /setup page ask "has a trainer already been created?"
-- without bypassing RLS on the profiles table. Returns only a boolean.

create or replace function public.trainer_exists()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from public.profiles where role = 'trainer')
$$;

grant execute on function public.trainer_exists() to anon;
grant execute on function public.trainer_exists() to authenticated;
