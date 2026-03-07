import { useState, useEffect, useCallback } from 'react';
import { fetchProfile, updateProfile } from '../services/profileService';

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const update = async (updates) => {
    if (!userId) throw new Error('No user ID provided');

    try {
      const data = await updateProfile(userId, updates);
      setProfile(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const refetch = () => {
    return loadProfile();
  };

  return {
    profile,
    loading,
    error,
    updateProfile: update,
    refetch,
  };
};
