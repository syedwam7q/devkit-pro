"use client"

import { useEffect, useState } from 'react'
import { X, Plus, Share, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function AddToHomeScreen() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false)

  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('addToHomeScreenDismissed')
    setHasBeenDismissed(dismissed === 'true')

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay for first-time users
      if (!dismissed && !standalone) {
        setTimeout(() => {
          setShowPrompt(true)
        }, 3000) // Show after 3 seconds
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show prompt if not standalone and not dismissed
    if (iOS && !standalone && !dismissed) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowPrompt(false)
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setHasBeenDismissed(true)
    localStorage.setItem('addToHomeScreenDismissed', 'true')
  }

  // Don't show if already installed or dismissed
  if (!showPrompt || isStandalone || hasBeenDismissed) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center p-4">
      <Card className="w-full max-w-sm mx-auto mb-safe">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/docs/logo/devkitproicon.png" 
                alt="DevKit Pro" 
                className="w-8 h-8 rounded-lg"
              />
              <CardTitle className="text-lg">Install DevKit Pro</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Add DevKit Pro to your home screen for quick access to all developer tools
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isIOS ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Share className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Tap the Share button in Safari</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
                  <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span>Select "Add to Home Screen"</span>
              </div>
            </div>
          ) : (
            <Button 
              onClick={handleInstall}
              className="w-full"
              disabled={!deferredPrompt}
            >
              <Download className="h-4 w-4 mr-2" />
              Add to Home Screen
            </Button>
          )}
          
          <div className="text-xs text-muted-foreground text-center">
            Get native app experience with offline access
          </div>
        </CardContent>
      </Card>
    </div>
  )
}