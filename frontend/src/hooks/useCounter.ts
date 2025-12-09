import { useState, useEffect, useCallback } from 'react';
import { getUserCounter, incrementUserCounter } from '../services/counterService';

export const useCounter = (userId: string | null) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounter = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserCounter(userId);
      setCount(data.count);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch counter');
      console.error('Failed to fetch count:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const increment = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const data = await incrementUserCounter(userId);
      setCount(data.count);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to increment counter');
      console.error('Failed to increment:', err);
      throw err;
    }
  }, [userId]);

  useEffect(() => {
    fetchCounter();
  }, [fetchCounter]);

  return {
    count,
    loading,
    error,
    increment,
    refetch: fetchCounter,
  };
};