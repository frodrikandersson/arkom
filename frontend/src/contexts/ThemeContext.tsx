import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Theme } from '../models/Theme';
import { defaultDarkTheme, defaultLightTheme } from '../models/Theme';
import { getUserThemes, createTheme as createThemeAPI, updateTheme as updateThemeAPI, deleteTheme as deleteThemeAPI } from '../services/themeService';

interface ThemeContextType {
  currentTheme: Theme;
  customThemes: Theme[];
  setTheme: (theme: Theme) => void;
  addCustomTheme: (theme: Theme, userId?: string) => Promise<void>;
  deleteCustomTheme: (themeId: string) => Promise<void>;
  updateCustomTheme: (theme: Theme) => Promise<void>;
  loadUserThemes: (userId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultDarkTheme);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('arkom-theme-id');
    const savedCustomThemes = localStorage.getItem('arkom-custom-themes');

    if (savedCustomThemes) {
      try {
        const parsed = JSON.parse(savedCustomThemes);
        setCustomThemes(parsed);
      } catch (err) {
        console.error('Failed to parse custom themes:', err);
      }
    }

    if (savedThemeId) {
      const savedTheme = localStorage.getItem(`arkom-theme-${savedThemeId}`);
      if (savedTheme) {
        try {
          const parsed = JSON.parse(savedTheme);
          setCurrentTheme(parsed);
        } catch (err) {
          console.error('Failed to parse saved theme:', err);
        }
      } else if (savedThemeId === 'light') {
        setCurrentTheme(defaultLightTheme);
      }
    }
  }, []);

  // Apply theme CSS variables whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [currentTheme]);

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('arkom-theme-id', theme.id);
    localStorage.setItem(`arkom-theme-${theme.id}`, JSON.stringify(theme));
  };

  const loadUserThemes = async (userId: string) => {
    try {
      const themes = await getUserThemes(userId);
      const parsedThemes = themes.map((t: any) => t.themeData as Theme);
      setCustomThemes(parsedThemes);
      
      // Also save to localStorage for offline access
      localStorage.setItem('arkom-custom-themes', JSON.stringify(parsedThemes));
      
      // Check if there's an active theme
      const activeTheme = themes.find((t: any) => t.isActive);
      if (activeTheme) {
        setTheme(activeTheme.themeData);
      }
    } catch (err) {
      console.error('Failed to load user themes:', err);
    }
  };

  const addCustomTheme = async (theme: Theme, userId?: string) => {
    // Save to localStorage
    const newCustomThemes = [...customThemes, theme];
    setCustomThemes(newCustomThemes);
    localStorage.setItem('arkom-custom-themes', JSON.stringify(newCustomThemes));
    setTheme(theme);

    // Save to database if user is logged in
    if (userId) {
      try {
        await createThemeAPI(userId, theme, true);
      } catch (err) {
        console.error('Failed to save theme to database:', err);
      }
    }
  };

  const deleteCustomTheme = async (themeId: string) => {
    // Remove from localStorage
    const newCustomThemes = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(newCustomThemes);
    localStorage.setItem('arkom-custom-themes', JSON.stringify(newCustomThemes));
    localStorage.removeItem(`arkom-theme-${themeId}`);
    
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
    // Update localStorage
    const newCustomThemes = customThemes.map(t => t.id === theme.id ? theme : t);
    setCustomThemes(newCustomThemes);
    localStorage.setItem('arkom-custom-themes', JSON.stringify(newCustomThemes));
    
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