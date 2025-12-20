import { useState, useEffect, useCallback } from 'react';
import { getUserProfile } from '../services/userService';
import { UserProfile } from '../models';

export const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getUserProfile(userId);
      setProfile(data.profile);
    } catch (err: any) {
      setError(err.message || 'Unable to load profile');
      console.error('Fetch profile error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
};
