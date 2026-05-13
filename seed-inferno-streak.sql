-- Seeds 7 days of ~6.5h completed study sessions for a single user so their
-- weekly average lands in the Inferno tier (>= 6 h/day) and their current
-- streak is 7. One row per day, each with its own session_run_id so the
-- tiered XP RPC awards each session the full 3000 XP at the 6 h tier.
--
-- Adjust the uuid below to seed a different user. Re-running is safe — old
-- seed rows are removed first via the marker in ended_at notes (we use a
-- distinctive duration_seconds value to identify and clear prior runs).

do $$
declare
  target_user uuid := '46727d08-c99b-446f-ad70-0043ff14ab4c';
  i integer;
  start_ts timestamptz;
  end_ts   timestamptz;
  dur_sec  integer := 23400; -- 6h 30m, comfortably over the 6 h Inferno floor
begin
  -- Clear any prior seeded sessions for this user in the last 14 days that
  -- have the exact marker duration, so re-runs don't pile up.
  delete from public.study_sessions
   where user_id = target_user
     and duration_seconds = dur_sec
     and started_at >= now() - interval '14 days';

  for i in 0..6 loop
    -- Anchor each session to roughly the same wall-clock time on day N-i.
    start_ts := date_trunc('day', now()) - (i || ' days')::interval + interval '10 hours';
    end_ts   := start_ts + (dur_sec || ' seconds')::interval;

    insert into public.study_sessions (
      user_id,
      started_at,
      ended_at,
      duration_seconds,
      mode,
      session_type,
      focus_mode_enabled,
      distraction_free,
      completed,
      session_run_id
    ) values (
      target_user,
      start_ts,
      end_ts,
      dur_sec,
      'stopwatch',
      'solo',
      false,
      true,
      true,
      gen_random_uuid()
    );
  end loop;
end $$;

-- Sanity checks (read-only).
select
  count(*) as seeded_rows,
  sum(duration_seconds) / 3600.0 as total_hours,
  (sum(duration_seconds) / 3600.0) / 7 as avg_hours_per_day
from public.study_sessions
where user_id = '46727d08-c99b-446f-ad70-0043ff14ab4c'
  and started_at >= now() - interval '7 days'
  and completed = true;

select public.get_user_xp('46727d08-c99b-446f-ad70-0043ff14ab4c') as total_xp;
