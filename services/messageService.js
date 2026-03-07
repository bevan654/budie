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
