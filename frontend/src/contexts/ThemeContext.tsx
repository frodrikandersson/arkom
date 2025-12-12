import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Theme } from '../models/Theme';
import { defaultDarkTheme, defaultLightTheme } from '../models/Theme';
import { getUserThemes, getUserActiveTheme, setUserActiveTheme, createTheme as createThemeAPI, updateTheme as updateThemeAPI, deleteTheme as deleteThemeAPI } from '../services/themeService';

interface ThemeContextType {
  currentTheme: Theme;
  customTheme: Theme | null;
  setTheme: (theme: Theme, userId?: string | null) => Promise<void>;
  previewTheme: (theme: Theme) => void; // Live preview without saving
  saveCustomTheme: (theme: Theme, userId: string) => Promise<void>;
  loadUserThemes: (userId: string) => Promise<void>;
  resetToDefault: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  userId?: string | null;
}

export const ThemeProvider = ({ children, userId }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultDarkTheme);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user themes when userId changes
  useEffect(() => {
    if (userId) {
      loadUserThemes(userId);
    } else {
      // User logged out, reset to default
      resetToDefault();
    }
  }, [userId]);

  // Apply theme CSS variables whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [currentTheme]);

  const setTheme = async (theme: Theme, userId?: string | null) => {
    setCurrentTheme(theme);
    
    // Save active theme selection to database if user is logged in
    if (userId) {
      try {
        await setUserActiveTheme(userId, theme.id);
      } catch (err) {
        console.error('Failed to save active theme:', err);
      }
    }
  };

  const previewTheme = (theme: Theme) => {
    // Just update the current theme visually, don't save to database
    setCurrentTheme(theme);
  };

  const resetToDefault = () => {
    setCurrentTheme(defaultDarkTheme);
    setCustomTheme(null);
  };

  const loadUserThemes = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Load custom themes
      const themes = await getUserThemes(userId);
      
      // Get the user's custom theme (should only be one)
      if (themes && Array.isArray(themes) && themes.length > 0) {
        const userCustomTheme = themes.find((t: any) => t.themeData.id.startsWith('custom-'));
        if (userCustomTheme) {
          setCustomTheme(userCustomTheme.themeData);
        }
      }
      
      // Load active theme ID
      const activeThemeId = await getUserActiveTheme(userId);
      if (activeThemeId) {
        // Check if it's a default theme
        if (activeThemeId === 'dark') {
          setCurrentTheme(defaultDarkTheme);
        } else if (activeThemeId === 'light') {
          setCurrentTheme(defaultLightTheme);
        } else {
          // It's the custom theme
          const customTheme = themes?.find((t: any) => t.themeData.id === activeThemeId);
          if (customTheme) {
            setCurrentTheme(customTheme.themeData);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load user themes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCustomTheme = async (theme: Theme, userId: string) => {
    try {
      // Check if custom theme already exists
      if (customTheme) {
        // Update existing
        await updateThemeAPI(theme);
      } else {
        // Create new
        await createThemeAPI(userId, theme, false);
      }
      
      // Update local state
      setCustomTheme(theme);
      
      // Reload to ensure sync
      await loadUserThemes(userId);
    } catch (err) {
      console.error('Failed to save custom theme:', err);
      throw err;
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      customTheme,
      setTheme,
      previewTheme,
      saveCustomTheme,
      loadUserThemes,
      resetToDefault,
      isLoading,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};