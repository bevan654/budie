import { useState, useEffect, useCallback } from 'react';
import { fetchMatches } from '../services/matchService';

export const useMatches = (userId) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMatches = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchMatches(userId);
      setMatches(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const refetch = () => {
    return loadMatches();
  };

  return {
    matches,
    loading,
    error,
    refetch,
  };
};
