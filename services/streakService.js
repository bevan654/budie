import { supabase } from '../lib/supabase';

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

export async function fetchUserStreak(userId) {
  const since = new Date(Date.now() - 365 * DAY_MS).toISOString();
  const { data, error } = await supabase
    .from('study_sessions')
    .select('started_at, duration_seconds, completed')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('started_at', since)
    .order('started_at', { ascending: false });
  if (error) throw error;

  const studiedDays = new Set();
  for (const s of data || []) {
    studiedDays.add(toDateKey(s.started_at));
  }

  let current = 0;
  let cursor = new Date();
  while (studiedDays.has(toDateKey(cursor))) {
    current += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  if (current === 0 && studiedDays.has(toDateKey(new Date(Date.now() - DAY_MS)))) {
    cursor = new Date(Date.now() - DAY_MS);
    while (studiedDays.has(toDateKey(cursor))) {
      current += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }
  }

  let longest = 0;
  const sortedKeys = [...studiedDays].sort();
  let run = 0;
  let prev = null;
  for (const k of sortedKeys) {
    if (prev) {
      const diff = (new Date(k) - new Date(prev)) / DAY_MS;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = k;
  }

  return { current, longest, studiedDays: [...studiedDays] };
}

export async function fetchFreezesUsed(userId, { windowDays = 30 } = {}) {
  const since = new Date(Date.now() - windowDays * DAY_MS).toISOString();
  const { count, error } = await supabase
    .from('streak_freezes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('freeze_type', 'personal')
    .gte('used_at', since);
  if (error) throw error;
  return count || 0;
}

export async function useStreakFreeze(userId, forDate) {
  const dateStr = toDateKey(forDate || new Date());
  const { data, error } = await supabase
    .from('streak_freezes')
    .insert([{ user_id: userId, for_date: dateStr, freeze_type: 'personal' }])
    .select()
    .single();
  if (error) throw error;
  return data;
}
