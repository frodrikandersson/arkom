import { useState, useEffect, useCallback } from 'react';
import { getLeaderboard } from '../services/counterService';
import type { LeaderboardEntry } from '../models/Counter';

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLeaderboard();
      if (data?.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaderboard');
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard,
  };
};