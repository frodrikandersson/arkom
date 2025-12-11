import { config } from '../config/env';
import type { Theme } from '../models/Theme';

export const getUserThemes = async (userId: string) => {
  const res = await fetch(`${config.apiUrl}/api/themes/${userId}`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch themes');
  }
  
  return data.themes;
};

export const createTheme = async (userId: string, theme: Theme, isActive: boolean = false) => {
  const res = await fetch(`${config.apiUrl}/api/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      themeId: theme.id,
      themeName: theme.name,
      themeData: theme,
      isActive,
    }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create theme');
  }
  
  return data.theme;
};

export const updateTheme = async (theme: Theme) => {
  const res = await fetch(`${config.apiUrl}/api/themes/${theme.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      themeName: theme.name,
      themeData: theme,
    }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update theme');
  }
  
  return data.theme;
};

export const deleteTheme = async (themeId: string) => {
  const res = await fetch(`${config.apiUrl}/api/themes/${themeId}`, {
    method: 'DELETE',
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete theme');
  }
  
  return data;
};

export const setActiveTheme = async (userId: string, themeId: string) => {
  const res = await fetch(`${config.apiUrl}/api/themes/set-active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, themeId }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to set active theme');
  }
  
  return data.theme;
};