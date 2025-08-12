import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createTheme, Theme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
  theme: Theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Create light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check if there's a saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme-mode')
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }
    // Default to light mode
    return 'light'
  })

  const theme = mode === 'light' ? lightTheme : darkTheme

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light'
    setMode(newMode)
    localStorage.setItem('theme-mode', newMode)
  }

  // Apply theme to document root for CSS custom properties
  useEffect(() => {
    const root = document.documentElement
    
    if (mode === 'dark') {
      root.style.setProperty('--background-color', '#121212')
      root.style.setProperty('--surface-color', '#1e1e1e')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#b3b3b3')
      root.style.setProperty('--border-color', '#333333')
      root.style.setProperty('--hover-color', '#333333')
      root.classList.add('dark-theme')
      root.classList.remove('light-theme')
    } else {
      root.style.setProperty('--background-color', '#f5f5f5')
      root.style.setProperty('--surface-color', '#ffffff')
      root.style.setProperty('--text-primary', '#333333')
      root.style.setProperty('--text-secondary', '#666666')
      root.style.setProperty('--border-color', '#e0e0e0')
      root.style.setProperty('--hover-color', '#f0f0f0')
      root.classList.add('light-theme')
      root.classList.remove('dark-theme')
    }
  }, [mode])

  const contextValue: ThemeContextType = {
    mode,
    toggleTheme,
    theme,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
