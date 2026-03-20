import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './providers'

export const metadata: Metadata = {
  title: 'Quickster',
  description: 'Registro de asistencia por código QR'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}