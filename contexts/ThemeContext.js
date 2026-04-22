import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, getShadows, getButtonStyles, getInputStyles, getCardStyles } from '../constants/theme';

const ThemeContext = createContext();

const THEME_KEY = '@budie_theme';

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((value) => {
      if (value === 'light') setIsDark(false);
      else setIsDark(true);
      setLoaded(true);
    });
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem(THEME_KEY, newValue ? 'dark' : 'light');
  };

  const theme = useMemo(() => {
    const colors = isDark ? darkColors : lightColors;
    return {
      colors,
      isDark,
      toggleTheme,
      shadows: getShadows(isDark),
      buttonStyles: getButtonStyles(colors),
      inputStyles: getInputStyles(colors),
      cardStyles: getCardStyles(colors),
    };
  }, [isDark]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
