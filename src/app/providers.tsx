'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme, toggle: () => void }>({ theme: 'light', toggle: () => {} })
export function useTheme() { return useContext(ThemeContext) }

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme || 'light'
    setTheme(saved)
    applyTheme(saved)
  }, [])

  function applyTheme(t: Theme) {
    if (t === 'dark') {
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)'
    } else {
      document.documentElement.style.filter = ''
    }
  }

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    applyTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <style>{`
        html[style*="invert"] img,
        html[style*="invert"] video,
        html[style*="invert"] canvas {
          filter: invert(1) hue-rotate(180deg) !important;
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  )
}