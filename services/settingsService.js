import { supabase } from '../lib/supabase';

export async function fetchPomodoroSettings(userId) {
  const { data, error } = await supabase
    .from('pomodoro_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    focusMinutes: data.focus_minutes,
    shortBreakMinutes: data.short_break_minutes,
    longBreakMinutes: data.long_break_minutes,
    cyclesBeforeLongBreak: data.cycles_before_long_break,
  };
}

export async function upsertPomodoroSettings(userId, settings) {
  const { error } = await supabase
    .from('pomodoro_settings')
    .upsert(
      {
        user_id: userId,
        focus_minutes: settings.focusMinutes,
        short_break_minutes: settings.shortBreakMinutes,
        long_break_minutes: settings.longBreakMinutes,
        cycles_before_long_break: settings.cyclesBeforeLongBreak,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
}

export async function fetchFocusModeSettings(userId) {
  const { data, error } = await supabase
    .from('focus_mode_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    enabled: data.enabled,
    mode: data.mode,
    selected: data.selected || [],
  };
}

export async function upsertFocusModeSettings(userId, settings) {
  const { error } = await supabase
    .from('focus_mode_settings')
    .upsert(
      {
        user_id: userId,
        enabled: settings.enabled,
        mode: settings.mode,
        selected: settings.selected,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
}
