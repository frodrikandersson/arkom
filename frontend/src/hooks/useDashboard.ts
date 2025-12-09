import { useState, useEffect, useCallback } from 'react';
import { getDashboard } from '../services/counterService';
import type { LeaderboardEntry } from '../models/Counter';

export const useDashboard = (userId: string | null) => {
  const [count, setCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getDashboard(userId);
      
      setLeaderboard(data.leaderboard);
      if (data.userCounter) {
        setCount(data.userCounter.count);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard');
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    count,
    leaderboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
};