import { useAuth } from '../../contexts/AuthContext';
import { useBlockedUsers } from '../../hooks/useBlockedUsers';
import styles from './BlockedUsersSettings.module.css';

export const BlockedUsersSettings = () => {
  const { user } = useAuth();
  const { blockedUsers, loading, handleUnblock } = useBlockedUsers(user?.id || null);

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
