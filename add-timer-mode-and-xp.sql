-- Adds the XP RPC, a no_breaks flag to pomodoro_settings, and session grouping.
--
-- XP is intentionally NOT a column on profiles. It's computed on demand from
-- completed study_sessions so that any session insert/delete is automatically
-- reflected without trigger maintenance.

-- 1. Pomodoro 'no breaks' option — chains focus rounds without break phases.
alter table public.pomodoro_settings
  add column if not exists no_breaks boolean not null default false;

-- 2. Run grouping. A pomodoro 'run' is the span between the user pressing
-- start and pressing stop. Multiple focus phases inside one run share the
-- same session_run_id so XP is awarded on the cumulative focus time of the
-- whole run, not per phase. Legacy rows have no run_id and are treated as
-- standalone runs via the coalesce(session_run_id, id) fallback below.
alter table public.study_sessions
  add column if not exists session_run_id uuid;

-- 3. XP RPC. Tiered by minutes of focus per run:
--      10 min   → 10 XP
--      60 min   → 100 XP
--      120 min  → 500 XP
--      240 min  → 1500 XP
--      360 min  → 3000 XP
--      361+ min → 3000 + 1 XP per extra minute
--    Between milestones: +1 XP per minute on top of the last milestone reached.
create or replace function public.get_user_xp(p_user_id uuid)
returns integer
language sql
stable
as $$
  with runs as (
    select coalesce(session_run_id, id) as run_id,
           sum(duration_seconds) as total_seconds
    from public.study_sessions
    where user_id = p_user_id and completed = true
    group by coalesce(session_run_id, id)
  ),
  with_minutes as (
    select (total_seconds / 60)::int as m from runs
  )
  select coalesce(sum(
    case
      when m >= 360 then 3000 + (m - 360)
      when m >= 240 then 1500 + (m - 240)
      when m >= 120 then 500 + (m - 120)
      when m >= 60 then 100 + (m - 60)
      when m > 0 then m
      else 0
    end
  ), 0)::integer
  from with_minutes;
$$;

grant execute on function public.get_user_xp(uuid) to anon, authenticated;
