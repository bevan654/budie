import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

// Subscribes the current user to live likes + matches + messages.
// Shows a toast whenever:
//   - Someone new likes them
//   - A new match is created involving them (mutual like landed)
//   - A new message arrives in one of their matches (from someone else)
//
// Requires `likes`, `matches`, `messages` to be in the supabase_realtime publication.
// RLS filters messages server-side so we only receive ones for this user's matches.
// See enable-realtime-notifications.sql.
export const useRealtimeNotifications = (userId) => {
  const { showToast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const resolveFirstName = async (profileId) => {
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', profileId)
        .single();
      return data?.name?.split(' ')[0] || 'Someone';
    };

    const likesChannel = supabase
      .channel(`likes-for-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
          filter: `liked_id=eq.${userId}`,
        },
        async (payload) => {
          const name = await resolveFirstName(payload.new.liker_id);
          showToast({ message: `${name} liked you`, type: 'success' });
        }
      )
      .subscribe();

    // postgres_changes filters don't support OR, so use two channels for matches
    const matchChannelA = supabase
      .channel(`matches-u1-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${userId}`,
        },
        async (payload) => {
          const name = await resolveFirstName(payload.new.user2_id);
          showToast({ message: `It's a match with ${name}!`, type: 'success' });
        }
      )
      .subscribe();

    const matchChannelB = supabase
      .channel(`matches-u2-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user2_id=eq.${userId}`,
        },
        async (payload) => {
          const name = await resolveFirstName(payload.new.user1_id);
          showToast({ message: `It's a match with ${name}!`, type: 'success' });
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel(`messages-for-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const msg = payload.new;
          if (msg.sender_id === userId) return;
          const name = await resolveFirstName(msg.sender_id);
          showToast({ message: `${name} sent you a message`, type: 'info' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(matchChannelA);
      supabase.removeChannel(matchChannelB);
      supabase.removeChannel(messagesChannel);
    };
  }, [userId, showToast]);
};
