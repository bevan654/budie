import { useState, useEffect, useCallback } from 'react';
import { fetchLikes, createLike as createLikeService, getLikedIds } from '../services/matchService';

export const useLikes = (userId) => {
  const [likes, setLikes] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLikes = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [likesData, likedIdsData] = await Promise.all([
        fetchLikes(userId),
        getLikedIds(userId)
      ]);
      setLikes(likesData);
      setLikedIds(likedIdsData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  const createLike = async (likerId, likedId) => {
    try {
      const data = await createLikeService(likerId, likedId);
      if (data) {
        setLikedIds(prev => [...prev, likedId]);
      }
      return data;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const refetch = () => {
    return loadLikes();
  };

  return {
    likes,
    likedIds,
    loading,
    error,
    createLike,
    getLikedIds: () => likedIds,
    refetch,
  };
};
