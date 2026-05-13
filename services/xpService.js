import { supabase } from '../lib/supabase';

// Returns total XP for the given user, derived server-side from
// completed study_sessions via the get_user_xp RPC.
export const fetchUserXp = async (userId) => {
  if (!userId) return 0;
  const { data, error } = await supabase.rpc('get_user_xp', { p_user_id: userId });
  if (error) {
    console.warn('[xpService] get_user_xp failed:', error.message);
    return 0;
  }
  return Number(data) || 0;
};
