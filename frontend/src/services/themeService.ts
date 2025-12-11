import { config } from '../config/env';
import type { Theme } from '../models/Theme';

export const getUserThemes = async (userId: string) => {
  const res = await fetch(`${config.apiUrl}/api/themes/${userId}`);
  
  if (!res.ok) {
    const text = await res.text();
    console.error('Get themes error response:', text);
    throw new Error('Failed to fetch themes');
  }
  
  const data = await res.json();
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
  
  if (!res.ok) {
    const text = await res.text();
    console.error('Create theme error response:', text);
    throw new Error('Failed to create theme');
  }
  
  const data = await res.json();
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
  
  if (!res.ok) {
    const text = await res.text();
    console.error('Update theme error response:', text);
    throw new Error('Failed to update theme');
  }
  
  const data = await res.json();
  return data.theme;
};

export const deleteTheme = async (themeId: string) => {
  const res = await fetch(`${config.apiUrl}/api/themes/${themeId}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.error('Delete theme error response:', text);
    throw new Error('Failed to delete theme');
  }
  
  const data = await res.json();
  return data;
};

export const setActiveTheme = async (userId: string, themeId: string) => {
  const res = await fetch(`${config.apiUrl}/api/themes/set-active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, themeId }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.error('Set active theme error response:', text);
    throw new Error('Failed to set active theme');
  }
  
  const data = await res.json();
  return data.theme;
};