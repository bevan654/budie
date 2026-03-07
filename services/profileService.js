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
  let query = supabase
    .from('profiles')
    .select('*')
    .neq('id', currentUserId);

  if (likedIds.length > 0) {
    query = query.not('id', 'in', `(${likedIds.join(',')})`);
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
