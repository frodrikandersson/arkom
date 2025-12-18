import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BlockedUser } from '../../models';
import styles from './BlockedUsersSettings.module.css';


export const BlockedUsersSettings = () => {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBlockedUsers();
    }
  }, [user]);

  const loadBlockedUsers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/${user.id}/blocked`
      );
      const data = await res.json();
      
      // Fetch user details for each blocked user
      const usersWithDetails = await Promise.all(
        data.blockedUsers.map(async (blocked: BlockedUser) => {
          try {
            const userRes = await fetch(
              `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/profile/${blocked.blockedUserId}`
            );
            const userData = await userRes.json();
            return {
              ...blocked,
              displayName: userData.profile?.displayName || 'Unknown User',
              profileImageUrl: userData.profile?.profileImageUrl,
            };
          } catch {
            return {
              ...blocked,
              displayName: 'Unknown User',
            };
          }
        })
      );

      setBlockedUsers(usersWithDetails);
    } catch (err) {
      console.error('Failed to load blocked users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockedUserId: string, displayName?: string) => {
    if (!user) return;

    if (!confirm(`Unblock ${displayName || 'this user'}?`)) {
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/unblock`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            blockedUserId,
          }),
        }
      );

      if (res.ok) {
        await loadBlockedUsers();
      }
    } catch (err) {
      console.error('Failed to unblock user:', err);
      alert('Failed to unblock user. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Blocked Users</h2>
      <p className={styles.description}>
        Blocked users cannot send you messages or see your activity.
      </p>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : blockedUsers.length === 0 ? (
        <div className={styles.empty}>You haven't blocked anyone yet.</div>
      ) : (
        <div className={styles.userList}>
          {blockedUsers.map((blocked) => (
            <div key={blocked.id} className={styles.userItem}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {blocked.profileImageUrl ? (
                    <img src={blocked.profileImageUrl} alt={blocked.displayName} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {blocked.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>{blocked.displayName}</div>
                  <div className={styles.blockedDate}>
                    Blocked {new Date(blocked.blockedAt).toLocaleDateString()}
                  </div>
                  {blocked.reason && (
                    <div className={styles.reason}>Reason: {blocked.reason}</div>
                  )}
                </div>
              </div>
              <button
                className={styles.unblockBtn}
                onClick={() => handleUnblock(blocked.blockedUserId, blocked.displayName)}
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
