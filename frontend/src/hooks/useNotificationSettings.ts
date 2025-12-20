import { useState, useEffect, useCallback } from 'react';
import { getUserSettings, updateUserSettings } from '../services/settingsService';
import { NotificationPreferences } from '../models/Notification';

export const useNotificationSettings = (userId: string | null) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const loadPreferences = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserSettings(userId);
      setPreferences({
        emailNotifications: data.emailNotifications ?? true,
        pushNotifications: data.pushNotifications ?? true,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load preferences');
      console.error('Failed to load preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const savePreferences = useCallback(async (prefs: NotificationPreferences) => {
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);
      await updateUserSettings(userId, prefs);
      setPreferences(prefs);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error saving settings');
      setMessage('Failed to save settings');
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    setPreferences,
    loading,
    saving,
    error,
    message,
    savePreferences,
    refetch: loadPreferences,
  };
};
