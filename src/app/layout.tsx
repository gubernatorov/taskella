import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { TelegramProvider } from '@/lib/providers/TelegramProvider'
import { AuthProvider } from '@/lib/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'Task Tracker',
  description: 'Управление задачами в Telegram',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body className="font-sans">
        <TelegramProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </TelegramProvider>
      </body>
    </html>
  )
}