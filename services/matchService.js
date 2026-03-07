import { supabase } from '../lib/supabase';

export const createLike = async (likerId, likedId) => {
  const { data, error } = await supabase
    .from('likes')
    .insert({ liker_id: likerId, liked_id: likedId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return null;
    }
    throw error;
  }

  return data;
};

export const fetchLikes = async (userId) => {
  const { data, error} = await supabase
    .from('likes')
    .select(`
      *,
      profiles:liker_id (*)
    `)
    .eq('liked_id', userId);

  if (error) throw error;
  return data || [];
};

export const getLikedIds = async (userId) => {
  const { data, error } = await supabase
    .from('likes')
    .select('liked_id')
    .eq('liker_id', userId);

  if (error) throw error;
  return (data || []).map(like => like.liked_id);
};

export const fetchMatches = async (userId) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (error) throw error;
  return data || [];
};

export const checkIfMatched = async (currentUserId, otherUserId) => {
  const id1 = currentUserId < otherUserId ? currentUserId : otherUserId;
  const id2 = currentUserId < otherUserId ? otherUserId : currentUserId;

  const { data, error } = await supabase
    .from('matches')
    .select('id')
    .or(
      `and(user1_id.eq.${id1},user2_id.eq.${id2})`
    )
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

export const unmatch = async (matchId) => {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);

  if (error) throw error;
};

export const getUnreadMatchCount = async (userId) => {
  const matches = await fetchMatches(userId);
  let count = 0;

  for (const match of matches) {
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('match_id', match.id)
      .eq('sender_id', userId)
      .limit(1);

    if (!messages || messages.length === 0) {
      count++;
    }
  }

  return count;
};
