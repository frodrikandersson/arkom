import { useState, useEffect, useCallback } from 'react';
import { getUserSettings, updateUserSettings, UserSettings } from '../services/settingsService';

export const useUserSettings = (userId: string | null) => {
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const loadSettings = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserSettings(userId);
      setTimezone(data.timezone || 'UTC');
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveSettings = useCallback(async (settings: UserSettings) => {
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);
      await updateUserSettings(userId, settings);
      setTimezone(settings.timezone);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error saving settings');
      setMessage('Failed to save settings');
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    timezone,
    setTimezone,
    loading,
    saving,
    error,
    message,
    saveSettings,
    refetch: loadSettings,
  };
};
