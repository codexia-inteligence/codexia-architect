import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Codexia Architect',
  description: 'Generador de propuestas técnicas — Codexia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ minHeight: '100vh', background: '#ffffff' }}>{children}</body>
    </html>
  )
}
