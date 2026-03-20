'use client'
import { useTheme } from '@/app/providers'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle}
      className="text-sm border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}