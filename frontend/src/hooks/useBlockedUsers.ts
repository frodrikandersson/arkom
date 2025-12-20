import { useState, useEffect, useCallback } from 'react';
import { getBlockedUsers, unblockUser } from '../services/userService';
import { BlockedUser } from '../models';

export const useBlockedUsers = (userId: string | null) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlockedUsers = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getBlockedUsers(userId);
      setBlockedUsers(data.blockedUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to load blocked users');
      console.error('Failed to load blocked users:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleUnblock = useCallback(async (blockedUserId: string, displayName?: string) => {
    if (!userId) return;

    if (!confirm(`Unblock ${displayName || 'this user'}?`)) {
      return;
    }

    try {
      await unblockUser(userId, blockedUserId);
      await loadBlockedUsers();
    } catch (err: any) {
      console.error('Failed to unblock user:', err);
      alert('Failed to unblock user. Please try again.');
    }
  }, [userId, loadBlockedUsers]);

  useEffect(() => {
    loadBlockedUsers();
  }, [loadBlockedUsers]);

  return {
    blockedUsers,
    loading,
    error,
    handleUnblock,
    refetch: loadBlockedUsers,
  };
};
