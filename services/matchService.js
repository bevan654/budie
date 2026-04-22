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
  // Identify the two users involved
  const { data: match, error: fetchError } = await supabase
    .from('matches')
    .select('user1_id, user2_id')
    .eq('id', matchId)
    .single();

  if (fetchError) throw fetchError;
  if (!match) throw new Error('Match not found');

  // Wipe both mutual likes so the pair becomes mutually visible + re-matchable.
  // No count assertion here — with orphaned matches the likes may already be gone.
  const { error: likesError } = await supabase
    .from('likes')
    .delete()
    .or(
      `and(liker_id.eq.${match.user1_id},liked_id.eq.${match.user2_id}),` +
      `and(liker_id.eq.${match.user2_id},liked_id.eq.${match.user1_id})`
    );

  if (likesError) throw likesError;

  // Delete the match row itself
  const { error, count } = await supabase
    .from('matches')
    .delete({ count: 'exact' })
    .eq('id', matchId);

  if (error) throw error;
  if (count === 0) {
    throw new Error('Could not unmatch — you may not have permission. Check DELETE policy on matches.');
  }
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
