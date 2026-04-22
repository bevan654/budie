import { supabase } from '../lib/supabase';
import { resolveProfilePhoto, resolveProfilePhotos } from './photoService';

export const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return await resolveProfilePhoto(data);
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return await resolveProfilePhoto(data);
};

export const fetchProfiles = async (currentUserId, filters = {}) => {
  // Always fetch exclusions live from the DB — using cached React state here
  // causes stale-exclusion bugs after unmatch, undo, etc. Also defends against
  // orphaned matches (match row without matching like rows).
  const [likesRes, matchesRes] = await Promise.all([
    supabase.from('likes').select('liked_id').eq('liker_id', currentUserId),
    supabase.from('matches').select('user1_id, user2_id')
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`),
  ]);

  const likedIds = (likesRes.data || []).map(l => l.liked_id);
  const matchedPartnerIds = (matchesRes.data || []).map(m =>
    m.user1_id === currentUserId ? m.user2_id : m.user1_id
  );

  const excludedIds = Array.from(new Set([...likedIds, ...matchedPartnerIds]));

  let query = supabase
    .from('profiles')
    .select('*')
    .neq('id', currentUserId);

  if (excludedIds.length > 0) {
    query = query.not('id', 'in', `(${excludedIds.join(',')})`);
  }

  if (filters.universities?.length > 0) {
    query = query.in('university', filters.universities);
  }

  if (filters.courses?.length > 0) {
    query = query.in('course', filters.courses);
  }

  if (filters.years?.length > 0) {
    query = query.in('course_year', filters.years);
  }

  if (filters.studyTimes?.length > 0) {
    query = query.in('study_time', filters.studyTimes);
  }

  if (filters.ageRange) {
    query = query
      .gte('age', filters.ageRange[0])
      .lte('age', filters.ageRange[1]);
  }

  const { data, error } = await query;

  if (error) throw error;
  return await resolveProfilePhotos(data || []);
};
