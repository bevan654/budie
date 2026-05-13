-- Reverts the seed from seed-inferno-streak.sql for user
-- 46727d08-c99b-446f-ad70-0043ff14ab4c by deleting any study_sessions row
-- matching the seed marker (duration_seconds = 23400, within last 14 days).
-- Only seeded rows are removed — any real sessions the user logged stay.

with deleted as (
  delete from public.study_sessions
   where user_id = '46727d08-c99b-446f-ad70-0043ff14ab4c'
     and duration_seconds = 23400
     and started_at >= now() - interval '14 days'
  returning 1
)
select count(*) as rows_deleted from deleted;

-- Sanity checks (read-only).
select
  count(*) as remaining_rows,
  coalesce(sum(duration_seconds), 0) / 3600.0 as remaining_hours_last_7d
from public.study_sessions
where user_id = '46727d08-c99b-446f-ad70-0043ff14ab4c'
  and started_at >= now() - interval '7 days'
  and completed = true;

select public.get_user_xp('46727d08-c99b-446f-ad70-0043ff14ab4c') as total_xp;
