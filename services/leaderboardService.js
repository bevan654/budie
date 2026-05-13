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
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${sec}s`);
  return parts.join(' ');
}
