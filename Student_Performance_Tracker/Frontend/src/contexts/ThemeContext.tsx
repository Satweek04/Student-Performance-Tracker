import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { STORAGE_KEYS, THEME_CONFIG } from '../services/config';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: typeof THEME_CONFIG.LIGHT;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme;
    return savedTheme || 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    
    // Apply theme to document
    const root = document.documentElement;
    const colors = theme === 'dark' ? THEME_CONFIG.DARK : THEME_CONFIG.LIGHT;
    
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-border', colors.border);
    
    // Update body class for Tailwind dark mode
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';
  const colors = theme === 'dark' ? THEME_CONFIG.DARK : THEME_CONFIG.LIGHT;

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isDark,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}