import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Air Freight AI Platform',
  description: 'AI platform for air cargo requests, Firebase workflow and logist approval.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
