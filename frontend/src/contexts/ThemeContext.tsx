import { createContext, useContext, useState, useEffect, type ReactNode, useRef } from 'react';
import type { Theme } from '../models/Theme';
import { defaultDarkTheme, defaultLightTheme } from '../models/Theme';
import { getUserThemes, getUserActiveTheme, setActiveTheme, createTheme as createThemeAPI, updateTheme as updateThemeAPI } from '../services/themeService';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  currentTheme: Theme;
  customTheme: Theme | null;
  setTheme: (theme: Theme) => Promise<void>;
  previewTheme: (theme: Theme) => void;
  saveCustomTheme: (theme: Theme) => Promise<void>;
  loadUserThemes: () => Promise<void>;
  resetToDefault: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { user } = useAuth(); // Get user from AuthContext instead of props
  const userId = user?.id ?? null;

  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultDarkTheme);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Track previous userId to prevent re-loading on Stack Auth token refresh
  const prevUserIdRef = useRef<string | null>(userId);
  const isInitialMount = useRef(true);

  // Load user themes when userId changes
  useEffect(() => {
    // On initial mount, load themes without comparison
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevUserIdRef.current = userId;

      if (userId) {
        loadUserThemes();
      }
      return;
    }

    // Only reload if userId actually changed (not just Stack Auth refresh)
    if (userId !== prevUserIdRef.current) {
      prevUserIdRef.current = userId;

      if (userId) {
        loadUserThemes();
      } else {
        // User logged out, reset to default
        resetToDefault();
      }
    }
  }, [userId]);

  // Apply theme CSS variables whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [currentTheme]);

  const setTheme = async (theme: Theme) => {
    setCurrentTheme(theme);
    
    // Save active theme selection to database if user is logged in
    if (userId) {
      try {
        await setActiveTheme(userId, theme.id);
      } catch (err) {
        console.error('Failed to save active theme:', err);
      }
    }
  };

  const previewTheme = (theme: Theme) => {
    setCurrentTheme(theme);
  };

  const resetToDefault = () => {
    setCurrentTheme(defaultDarkTheme);
    setCustomTheme(null);
  };

  const loadUserThemes = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      const themes = await getUserThemes(userId);
      
      if (themes && Array.isArray(themes) && themes.length > 0) {
        const userCustomTheme = themes.find((t: any) => t.themeData?.id?.startsWith('custom-'));
        if (userCustomTheme) {
          setCustomTheme(userCustomTheme.themeData);
        }
      }
      
      const activeThemeId = await getUserActiveTheme(userId);
      if (activeThemeId) {
        if (activeThemeId === 'dark') {
          setCurrentTheme(defaultDarkTheme);
        } else if (activeThemeId === 'light') {
          setCurrentTheme(defaultLightTheme);
        } else {
          const customTheme = themes?.find((t: any) => t.themeData?.id === activeThemeId);
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

  const saveCustomTheme = async (theme: Theme) => {
    if (!userId) return;
    
    try {
      if (customTheme) {
        await updateThemeAPI(theme);
      } else {
        await createThemeAPI(userId, theme, false);
      }
      
      setCustomTheme(theme);
      await loadUserThemes();
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
