import { useAuth } from '../../contexts/AuthContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import styles from './NotificationSettings.module.css';

export const NotificationSettings = () => {
  const { user } = useAuth();
  const {
    preferences,
    setPreferences,
    saving,
    message,
    savePreferences,
  } = useNotificationSettings(user?.id || null);

  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    loading: pushLoading,
    error: pushError,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = usePushNotifications(user?.id || null);

  const handleSave = async () => {
    // Handle push notification subscription
    if (preferences.pushNotifications && !pushSubscribed) {
      await subscribePush();
    } else if (!preferences.pushNotifications && pushSubscribed) {
      await unsubscribePush();
    }

    await savePreferences(preferences);
  };

  const handlePushToggle = (enabled: boolean) => {
    if (!pushSupported) {
      return;
    }

    setPreferences({ ...preferences, pushNotifications: enabled });
  };

  return (
    <div className={styles.section}>
      <h2>Notifications</h2>
      <p className={styles.description}>
        Choose how you want to be notified about important events
      </p>

      <div className={styles.toggleGroup}>
        <div className={styles.toggleItem}>
          <div className={styles.toggleInfo}>
            <label htmlFor="emailNotifications" className={styles.toggleLabel}>
              Email Notifications
            </label>
            <p className={styles.toggleDescription}>
              Receive email alerts for important events
            </p>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              id="emailNotifications"
              checked={preferences.emailNotifications}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  emailNotifications: e.target.checked,
                })
              }
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.toggleItem}>
          <div className={styles.toggleInfo}>
            <label htmlFor="pushNotifications" className={styles.toggleLabel}>
              Push Notifications
            </label>
            <p className={styles.toggleDescription}>
              {!pushSupported
                ? 'Push notifications are not supported in your browser'
                : pushSubscribed
                ? 'Receive desktop notifications'
                : 'Enable desktop notifications (requires permission)'}
            </p>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              id="pushNotifications"
              checked={preferences.pushNotifications}
              onChange={(e) => handlePushToggle(e.target.checked)}
              disabled={!pushSupported || pushLoading}
            />
            <span className={styles.slider}></span>
          </label>
        </div>
      </div>

      {pushError && (
        <div className={styles.error}>{pushError}</div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || pushLoading}
        className={styles.saveBtn}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
};
