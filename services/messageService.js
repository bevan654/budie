import { supabase } from '../lib/supabase';

export const fetchMessages = async (matchId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const sendMessage = async (matchId, senderId, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const subscribeToMessages = (matchId, callback) => {
  const channel = supabase.channel(`match-${matchId}`);

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to messages');
      }
    });

  return channel;
};

export const unsubscribeFromMessages = (channel) => {
  if (channel) {
    supabase.removeChannel(channel);
  }
};

export const markMatchAsRead = async (matchId, userId) => {
  const { error } = await supabase
    .from('match_reads')
    .upsert(
      { user_id: userId, match_id: matchId, last_read_at: new Date().toISOString() },
      { onConflict: 'user_id,match_id' }
    );
  if (error) throw error;
};

// Returns { [matchId]: unreadCount } — counts messages from others after last_read_at.
export const fetchMatchUnreadCounts = async (userId, matchIds) => {
  if (!matchIds.length) return {};

  const { data: reads } = await supabase
    .from('match_reads')
    .select('match_id, last_read_at')
    .eq('user_id', userId)
    .in('match_id', matchIds);

  const lastRead = Object.fromEntries((reads || []).map(r => [r.match_id, r.last_read_at]));

  const counts = {};
  await Promise.all(
    matchIds.map(async (matchId) => {
      let query = supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('match_id', matchId)
        .neq('sender_id', userId);
      if (lastRead[matchId]) {
        query = query.gt('created_at', lastRead[matchId]);
      }
      const { count } = await query;
      counts[matchId] = count || 0;
    })
  );

  return counts;
};
