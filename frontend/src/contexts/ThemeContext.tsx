import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Theme } from '../models/Theme';
import { defaultDarkTheme, defaultLightTheme } from '../models/Theme';
import { getUserThemes, getUserActiveTheme, setUserActiveTheme, createTheme as createThemeAPI, updateTheme as updateThemeAPI, deleteTheme as deleteThemeAPI } from '../services/themeService';

interface ThemeContextType {
  currentTheme: Theme;
  customThemes: Theme[];
  setTheme: (theme: Theme, userId?: string | null) => Promise<void>;
  addCustomTheme: (theme: Theme, userId?: string) => Promise<void>;
  deleteCustomTheme: (themeId: string) => Promise<void>;
  updateCustomTheme: (theme: Theme) => Promise<void>;
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
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
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

  const resetToDefault = () => {
    setCurrentTheme(defaultDarkTheme);
    setCustomThemes([]);
  };

  const loadUserThemes = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Load custom themes
      const themes = await getUserThemes(userId);
      
      // Handle empty or null results
      if (!themes || !Array.isArray(themes)) {
        console.log('No themes found for user');
      } else {
        const parsedThemes = themes.map((t: any) => t.themeData as Theme);
        setCustomThemes(parsedThemes);
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
          // It's a custom theme
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

  const addCustomTheme = async (theme: Theme, userId?: string) => {
    // Save to database if user is logged in
    if (userId) {
      try {
        await createThemeAPI(userId, theme, true);
        // Reload themes after creation
        await loadUserThemes(userId);
      } catch (err) {
        console.error('Failed to save theme to database:', err);
        throw err;
      }
    } else {
      // Guest users: just set temporarily (lost on page refresh)
      const newCustomThemes = [...customThemes, theme];
      setCustomThemes(newCustomThemes);
      setTheme(theme);
    }
  };

  const deleteCustomTheme = async (themeId: string) => {
    // Remove from state
    const newCustomThemes = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(newCustomThemes);
    
    if (currentTheme.id === themeId) {
      setTheme(defaultDarkTheme);
    }

    // Delete from database
    try {
      await deleteThemeAPI(themeId);
    } catch (err) {
      console.error('Failed to delete theme from database:', err);
    }
  };

  const updateCustomTheme = async (theme: Theme) => {
    // Update state
    const newCustomThemes = customThemes.map(t => t.id === theme.id ? theme : t);
    setCustomThemes(newCustomThemes);
    
    if (currentTheme.id === theme.id) {
      setTheme(theme);
    }

    // Update database
    try {
      await updateThemeAPI(theme);
    } catch (err) {
      console.error('Failed to update theme in database:', err);
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      customThemes,
      setTheme,
      addCustomTheme,
      deleteCustomTheme,
      updateCustomTheme,
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