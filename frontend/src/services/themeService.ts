import { api } from '../utils/apiClient';
import type { Theme, ThemeRow } from '../models/Theme';

export const getUserActiveTheme = async (userId: string) => {
  const data = await api.get<{ activeThemeId: string }>(`/api/themes/active/${userId}`);
  return data.activeThemeId;
};

export const getUserThemes = async (userId: string) => {
  const data = await api.get<{ themes: ThemeRow[] }>(`/api/themes/${userId}`);
  return data.themes;
};

export const createTheme = async (userId: string, theme: Theme, isActive: boolean = false) => {
  const data = await api.post<{ theme: ThemeRow }>('/api/themes', {
    userId,
    themeId: theme.id,
    themeName: theme.name,
    themeData: theme,
    isActive,
  });
  return data.theme;
};

export const updateTheme = async (theme: Theme) => {
  const data = await api.patch<{ theme: ThemeRow }>(`/api/themes/${theme.id}`, {
    themeName: theme.name,
    themeData: theme,
  });
  return data.theme;
};

export const deleteTheme = async (themeId: string) => {
  return api.delete(`/api/themes/${themeId}`);
};

export const setActiveTheme = async (userId: string, themeId: string) => {
  const data = await api.post<{ theme: ThemeRow }>('/api/themes/active', { userId, themeId });
  return data.theme;
};
