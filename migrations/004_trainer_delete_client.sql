-- Migration 004: let the trainer delete a client and all their data.
-- Existing policies already cover schedule, notes, and client_programs (FOR ALL).
-- Sessions, session_sets, body_metrics, and profiles need explicit DELETE policies.

create policy "Trainer deletes client sessions" on sessions for delete using (
  exists (
    select 1 from profiles p where p.id = client_id and p.trainer_id = auth.uid()
  )
);

create policy "Trainer deletes client sets" on session_sets for delete using (
  exists (
    select 1 from sessions s
    join profiles p on p.id = s.client_id
    where s.id = session_id and p.trainer_id = auth.uid()
  )
);

create policy "Trainer deletes client metrics" on body_metrics for delete using (
  exists (
    select 1 from profiles p where p.id = client_id and p.trainer_id = auth.uid()
  )
);

create policy "Trainer deletes client profile" on profiles for delete using (
  exists (
    select 1 from profiles me where me.id = auth.uid() and me.role = 'trainer'
  )
  and trainer_id = auth.uid()
);
