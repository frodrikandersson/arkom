import { api } from '../utils/apiClient';

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
  return api.get<UserSettingsResponse>(`/api/users/${userId}/settings`);
};

export const updateUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettingsResponse> => {
  return api.put<UserSettingsResponse>(`/api/users/${userId}/settings`, settings);
};
