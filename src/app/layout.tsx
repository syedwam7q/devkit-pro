import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AppWrapper } from '@/components/app-wrapper'
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DevKit Pro" />
        <link rel="apple-touch-icon" href="/docs/logo/devkitproicon.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'blackwhite']}
        >
          <AppWrapper>
            {children}
          </AppWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}