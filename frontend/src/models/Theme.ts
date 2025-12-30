export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardBorder: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
    error: string;
    success: string;
  };
}

// Database row type for theme storage
export interface ThemeRow {
  id: number;
  userId: string;
  themeId: string;
  themeName: string;
  themeData: Theme;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const defaultDarkTheme: Theme = {
  id: 'dark',
  name: 'Dark Portfolio',
  colors: {
    background: '#0a0a0a',
    foreground: '#1a1a1a',
    card: '#1f1f1f',
    cardBorder: '#333333',
    text: '#f0f0f0',
    textSecondary: '#cccccc',
    accent: '#00d9ff',
    accentHover: '#00b8e6',
    error: '#ff4444',
    success: '#00ff88',
  },
};

export const defaultLightTheme: Theme = {
  id: 'light',
  name: 'Light Gallery',
  colors: {
    background: '#fafafa',
    foreground: '#ffffff',
    card: '#ffffff',
    cardBorder: '#e0e0e0',
    text: '#1a1a1a',
    textSecondary: '#666666',
    accent: '#0088aa',
    accentHover: '#006688',
    error: '#cc3333',
    success: '#00cc66',
  },
};

export const createDefaultCustomTheme = (userId: string): Theme => ({
  id: `custom-${userId}`,
  name: 'My Custom Theme',
  colors: { ...defaultDarkTheme.colors },
});
