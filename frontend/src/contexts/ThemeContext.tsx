import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Theme } from '../models/Theme';
import { defaultDarkTheme, defaultLightTheme } from '../models/Theme';

interface ThemeContextType {
  currentTheme: Theme;
  customThemes: Theme[];
  setTheme: (theme: Theme) => void;
  addCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (themeId: string) => void;
  updateCustomTheme: (theme: Theme) => void;
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

  const addCustomTheme = (theme: Theme) => {
    const newCustomThemes = [...customThemes, theme];
    setCustomThemes(newCustomThemes);
    localStorage.setItem('arkom-custom-themes', JSON.stringify(newCustomThemes));
    setTheme(theme);
  };

  const deleteCustomTheme = (themeId: string) => {
    const newCustomThemes = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(newCustomThemes);
    localStorage.setItem('arkom-custom-themes', JSON.stringify(newCustomThemes));
    localStorage.removeItem(`arkom-theme-${themeId}`);
    
    if (currentTheme.id === themeId) {
      setTheme(defaultDarkTheme);
    }
  };

  const updateCustomTheme = (theme: Theme) => {
    const newCustomThemes = customThemes.map(t => t.id === theme.id ? theme : t);
    setCustomThemes(newCustomThemes);
    localStorage.setItem('arkom-custom-themes', JSON.stringify(newCustomThemes));
    
    if (currentTheme.id === theme.id) {
      setTheme(theme);
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