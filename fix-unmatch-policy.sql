-- Policies that make Unmatch work end-to-end.
-- Safe to re-run (each CREATE POLICY will error if it already exists — that's fine).

-- Allow deleting a match you're part of.
CREATE POLICY "Users can delete their matches" ON matches
  FOR DELETE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Allow deleting likes that involve you (your own, or those targeting you).
-- Needed so unmatch can wipe BOTH mutual likes, letting the pair re-match later.
CREATE POLICY "Users can delete likes involving them" ON likes
  FOR DELETE USING (auth.uid() = liker_id OR auth.uid() = liked_id);
