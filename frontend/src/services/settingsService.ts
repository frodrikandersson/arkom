import { config } from '../config/env';

export interface UserSettings {
  timezone: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface UserSettingsResponse {
  timezone: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export const getUserSettings = async (userId: string): Promise<UserSettingsResponse> => {
  const res = await fetch(`${config.apiUrl}/api/users/${userId}/settings`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load settings');
  }
  
  return data;
};

export const updateUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettingsResponse> => {
  const res = await fetch(`${config.apiUrl}/api/users/${userId}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save settings');
  }
  
  return data;
};
