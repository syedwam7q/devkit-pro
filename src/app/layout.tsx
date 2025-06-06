import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Sidebar } from '@/components/sidebar'
import { Chatbot } from '@/components/chatbot'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevKit Pro - Your Ultimate Developer Toolbox',
  description: 'A comprehensive toolkit for developers, designers, and content creators with essential utilities.',
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
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto md:ml-0">
              <div className="container mx-auto p-4 md:p-6 pt-16 md:pt-6">
                {children}
              </div>
            </main>
            <Chatbot />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}