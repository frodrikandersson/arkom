import { useState, useEffect } from 'react';
import { searchUsers } from '../services/userService';
import { UserSearchResult } from '../models';

export const useUserSearch = (query: string, userId?: string) => {
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchUsers(query, userId);
        setResults(data.users || []);
      } catch (err: any) {
        setError(err.message || 'Failed to search users');
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, userId]);

  return {
    results,
    isLoading,
    error,
  };
};
