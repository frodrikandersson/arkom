import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './TimezoneSettings.module.css';

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Asia/Seoul', label: 'South Korea (KST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'Pacific/Auckland', label: 'New Zealand (NZDT/NZST)' },
  { value: 'UTC', label: 'UTC' },
];

export const TimezoneSettings = () => {
  const { user } = useAuth();
  const [timezone, setTimezone] = useState('UTC');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/${user.id}/settings`);
      if (res.ok) {
        const data = await res.json();
        setTimezone(data.timezone || 'UTC');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/${user.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone }),
      });

      if (res.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2>Time & Location</h2>
      
      <div className={styles.field}>
        <label htmlFor="timezone">Timezone</label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className={styles.select}
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <p className={styles.help}>
          Your current time: {new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: timezone 
          })}
        </p>
      </div>

      <button 
        onClick={saveSettings} 
        disabled={saving}
        className={styles.saveBtn}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      {message && (
        <div className={styles.message}>{message}</div>
      )}
    </div>
  );
};