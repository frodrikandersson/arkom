import { config } from '../config/env';
import type { Theme } from '../models/Theme';

export const getUserActiveTheme = async (userId: string) => {
  const res = await fetch(`${config.apiUrl}/api/themes/active/${userId}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch active theme');
  }

  return data.activeThemeId;
};


// export const setUserActiveTheme = async (userId: string, themeId: string) => {
//   const res = await fetch(`${config.apiUrl}/api/themes/active`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ userId, themeId }),
//   });
  
//   if (!res.ok) {
//     const text = await res.text();
//     console.error('Set active theme error response:', text);
//     throw new Error('Failed to set active theme');
//   }
  
//   const data = await res.json();
//   return data.activeThemeId;
// };

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
    throw new Error('Failed to create theme');
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
    throw new Error('Failed to update theme');
  }
  
  return data.theme;
};

export const deleteTheme = async (themeId: string) => {
  const res = await fetch(`${config.apiUrl}/api/themes/${themeId}`, {
    method: 'DELETE',
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error('Failed to delete theme');
  }
  
  return data;
};

export const setActiveTheme = async (userId: string, themeId: string) => {
  const res = await fetch(`${config.apiUrl}/api/themes/active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, themeId }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error('Failed to set active theme');
  }
  
  return data.theme;
};