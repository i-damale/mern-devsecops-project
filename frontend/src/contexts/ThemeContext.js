import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'blue'
    return localStorage.getItem('theme') || 'blue';
  });

  useEffect(() => {
    // Apply theme to document
    if (theme === 'blue') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const themes = [
    { id: 'blue', name: 'Blue', color: '#0073e6' },
    { id: 'green', name: 'Green', color: '#28a745' },
    { id: 'purple', name: 'Purple', color: '#6f42c1' },
    { id: 'orange', name: 'Orange', color: '#fd7e14' },
    { id: 'teal', name: 'Teal', color: '#20c997' },
    { id: 'dark', name: 'Dark', color: '#0d6efd' },
  ];

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const value = {
    theme,
    themes,
    changeTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
