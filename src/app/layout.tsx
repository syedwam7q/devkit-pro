import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Sidebar } from '@/components/sidebar'
import { Chatbot } from '@/components/chatbot'
import { MobileNavigation } from '@/components/mobile-navigation'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
// We've removed the FavoritesHelper import

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevKit Pro - Your Ultimate Developer Toolbox',
  description: 'A comprehensive toolkit for developers, designers, and content creators with essential utilities.',
  icons: {
    icon: '/docs/logo/devkitproappicon.png',
    shortcut: '/docs/logo/devkitproappicon.png',
    apple: '/docs/logo/devkitproappicon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden md:ml-0">
              <div className="container mx-auto p-4 md:p-6 pt-16 md:pt-6 pb-24 md:pb-6 min-h-full">
                {children}
              </div>
            </main>
            <Chatbot />
            <MobileNavigation />
            <KeyboardShortcuts />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}