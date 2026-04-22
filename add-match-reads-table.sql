-- Track per-user read state on each match so we can show proper unread counts
-- in the conversations list (Instagram-style badges).

CREATE TABLE IF NOT EXISTS match_reads (
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id     UUID REFERENCES matches(id)  ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, match_id)
);

CREATE INDEX IF NOT EXISTS idx_match_reads_user ON match_reads(user_id);

ALTER TABLE match_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own reads"    ON match_reads;
DROP POLICY IF EXISTS "Users can insert their own reads" ON match_reads;
DROP POLICY IF EXISTS "Users can update their own reads" ON match_reads;

CREATE POLICY "Users can see their own reads" ON match_reads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reads" ON match_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reads" ON match_reads
  FOR UPDATE USING (auth.uid() = user_id);
