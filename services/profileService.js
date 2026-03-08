import { supabase } from '../lib/supabase';

export const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchProfiles = async (currentUserId, likedIds = [], filters = {}) => {
  // Get matched user IDs to exclude them
  const { data: matches } = await supabase
    .from('matches')
    .select('user1_id, user2_id')
    .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

  const matchedIds = (matches || []).map((m) =>
    m.user1_id === currentUserId ? m.user2_id : m.user1_id
  );

  const excludeIds = [...new Set([...likedIds, ...matchedIds])];

  let query = supabase
    .from('profiles')
    .select('*')
    .neq('id', currentUserId);

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
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

  if (filters.studyMethod) {
    query = query.eq('study_method', filters.studyMethod);
  }

  if (filters.ageRange) {
    query = query
      .gte('age', filters.ageRange[0])
      .lte('age', filters.ageRange[1]);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};
