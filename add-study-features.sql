-- Study features: sessions, streak freezes, synced settings, leaderboard RPC.
-- Powers StudyTimer logging, StatsGrid, AppHeader streak chips, and the
-- homepage Leaderboard. Safe to run multiple times (IF NOT EXISTS / OR REPLACE).

-- ============================================================
-- study_sessions
--   Every completed (or abandoned) timer run.
--   SELECT is public so the leaderboard can read it; writes are
--   restricted to the owning user.
-- ============================================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at         TIMESTAMPTZ NOT NULL,
  ended_at           TIMESTAMPTZ,
  duration_seconds   INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  mode               TEXT NOT NULL CHECK (mode IN ('pomodoro', 'stopwatch')),
  session_type       TEXT NOT NULL DEFAULT 'solo'
                     CHECK (session_type IN ('solo', 'partner', 'group')),
  partner_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  group_code         TEXT,
  focus_mode_enabled BOOLEAN NOT NULL DEFAULT false,
  distraction_free   BOOLEAN NOT NULL DEFAULT true,
  completed          BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_started
  ON study_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started
  ON study_sessions(started_at DESC);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view study sessions"        ON study_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions"   ON study_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions"   ON study_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions"   ON study_sessions;

CREATE POLICY "Anyone can view study sessions" ON study_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON study_sessions
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- streak_freezes
--   One row per freeze use. AppHeader counts rows in the
--   current rolling window (e.g. last 30 days) for freezesUsed.
-- ============================================================
CREATE TABLE IF NOT EXISTS streak_freezes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  used_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  freeze_type  TEXT NOT NULL DEFAULT 'personal'
               CHECK (freeze_type IN ('personal', 'buddy')),
  for_date     DATE NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_streak_freezes_unique
  ON streak_freezes(user_id, freeze_type, for_date);
CREATE INDEX IF NOT EXISTS idx_streak_freezes_user
  ON streak_freezes(user_id, used_at DESC);

ALTER TABLE streak_freezes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own freezes"   ON streak_freezes;
DROP POLICY IF EXISTS "Users can insert their own freezes" ON streak_freezes;
DROP POLICY IF EXISTS "Users can delete their own freezes" ON streak_freezes;

CREATE POLICY "Users can view their own freezes" ON streak_freezes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own freezes" ON streak_freezes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own freezes" ON streak_freezes
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- pomodoro_settings (one row per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS pomodoro_settings (
  user_id                   UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  focus_minutes             INTEGER NOT NULL DEFAULT 25 CHECK (focus_minutes BETWEEN 5 AND 90),
  short_break_minutes       INTEGER NOT NULL DEFAULT 5  CHECK (short_break_minutes BETWEEN 1 AND 30),
  long_break_minutes        INTEGER NOT NULL DEFAULT 15 CHECK (long_break_minutes BETWEEN 5 AND 60),
  cycles_before_long_break  INTEGER NOT NULL DEFAULT 4  CHECK (cycles_before_long_break BETWEEN 2 AND 8),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own pomodoro settings"   ON pomodoro_settings;
DROP POLICY IF EXISTS "Users can upsert their own pomodoro settings" ON pomodoro_settings;
DROP POLICY IF EXISTS "Users can update their own pomodoro settings" ON pomodoro_settings;

CREATE POLICY "Users can view their own pomodoro settings" ON pomodoro_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own pomodoro settings" ON pomodoro_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro settings" ON pomodoro_settings
  FOR UPDATE USING (auth.uid() = user_id);


-- ============================================================
-- focus_mode_settings (one row per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS focus_mode_settings (
  user_id    UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  enabled    BOOLEAN NOT NULL DEFAULT false,
  mode       TEXT NOT NULL DEFAULT 'block' CHECK (mode IN ('block', 'allow')),
  selected   TEXT[] NOT NULL DEFAULT ARRAY['instagram','tiktok','youtube','snapchat']::TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE focus_mode_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own focus settings"   ON focus_mode_settings;
DROP POLICY IF EXISTS "Users can upsert their own focus settings" ON focus_mode_settings;
DROP POLICY IF EXISTS "Users can update their own focus settings" ON focus_mode_settings;

CREATE POLICY "Users can view their own focus settings" ON focus_mode_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own focus settings" ON focus_mode_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus settings" ON focus_mode_settings
  FOR UPDATE USING (auth.uid() = user_id);


-- ============================================================
-- Leaderboard RPC
--   Ranks users by total completed seconds in a rolling window.
--   window_days = 0 means all-time.
-- ============================================================
CREATE OR REPLACE FUNCTION get_leaderboard(window_days INTEGER DEFAULT 7, row_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id        UUID,
  name           TEXT,
  photo_url      TEXT,
  total_seconds  BIGINT,
  session_count  BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id              AS user_id,
    p.name,
    p.photo_url,
    COALESCE(SUM(s.duration_seconds), 0)::BIGINT AS total_seconds,
    COUNT(s.id)::BIGINT                          AS session_count
  FROM profiles p
  LEFT JOIN study_sessions s
    ON s.user_id = p.id
   AND s.completed = true
   AND (window_days <= 0
        OR s.started_at >= now() - make_interval(days => window_days))
  GROUP BY p.id, p.name, p.photo_url
  HAVING COALESCE(SUM(s.duration_seconds), 0) > 0
  ORDER BY total_seconds DESC, p.name ASC
  LIMIT row_limit;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard(INTEGER, INTEGER) TO authenticated;
