"use client"

import { useState, useEffect } from 'react'
import { LoadingScreen } from '@/components/loading-screen'
import { AddToHomeScreen } from '@/components/add-to-home-screen'
import { Sidebar } from '@/components/sidebar'
import { Chatbot } from '@/components/chatbot'
import { MobileNavigation } from '@/components/mobile-navigation'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { useToolTracking } from '@/hooks/use-tool-tracking'

interface AppWrapperProps {
  children: React.ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  // Track tool usage for smart suggestions
  useToolTracking()

  useEffect(() => {
    // Always show loading screen on page load
    setIsLoading(true)
  }, [])

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden md:ml-0">
          <div className="container mx-auto p-4 md:p-6 pt-16 md:pt-6 pb-6 min-h-full">
            {children}
          </div>
        </main>
        <Chatbot />
        <MobileNavigation />
        <KeyboardShortcuts />
      </div>
      <AddToHomeScreen />
    </>
  )
}