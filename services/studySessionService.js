import { supabase } from '../lib/supabase';

export async function logStudySession(session) {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert([session])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchUserSessions(userId, { since, until, limit = 200 } = {}) {
  let q = supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (since) q = q.gte('started_at', since);
  if (until) q = q.lte('started_at', until);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function fetchUserWeeklyTotal(userId) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('study_sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('started_at', since);
  if (error) throw error;
  return (data || []).reduce((sum, r) => sum + r.duration_seconds, 0);
}
