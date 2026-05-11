import { supabase } from '../lib/supabase';

export async function fetchLeaderboard({ windowDays = 7, limit = 50 } = {}) {
  const { data, error } = await supabase.rpc('get_leaderboard', {
    window_days: windowDays,
    row_limit: limit,
  });
  if (error) throw error;
  return data || [];
}

export function formatHours(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
