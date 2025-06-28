"use client"

import { useState, useEffect } from 'react'
import { X, ExternalLink, FileText, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

export function FlowNotesSuggestion() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    // Check if user has dismissed this suggestion
    const dismissed = localStorage.getItem('flow-notes-suggestion-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Track user engagement
    const visitCount = parseInt(localStorage.getItem('devkit-pro-visit-count') || '0')
    const toolsUsed = JSON.parse(localStorage.getItem('devkit-pro-tools-used') || '[]')
    
    // Show suggestion based on engagement patterns
    const shouldShow = 
      visitCount >= 2 || // After 2nd visit
      toolsUsed.length >= 3 || // After using 3 tools
      toolsUsed.some((tool: string) => ['markdown-editor', 'code-formatter', 'text-formatter'].includes(tool)) // Used text-related tools

    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 8000) // Show after 8 seconds for engaged users

      return () => clearTimeout(timer)
    }

    // Update visit count
    localStorage.setItem('devkit-pro-visit-count', (visitCount + 1).toString())
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('flow-notes-suggestion-dismissed', 'true')
  }

  const handleVisit = () => {
    window.open('https://coming-soon-ten-roan.vercel.app/', '_blank', 'noopener,noreferrer')
    // Track engagement but don't dismiss - let user decide
  }

  if (isDismissed || !isVisible) {
    return null
  }

  const getLogoFilter = () => {
    switch (resolvedTheme) {
      case 'light':
        return 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(200deg) brightness(104%) contrast(97%)'
      case 'blackwhite':
        return 'brightness(0) saturate(100%) invert(100%)'
      default: // dark
        return 'none'
    }
  }

  return (
    <div className="mx-4 mb-4 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/30 backdrop-blur-sm transition-all duration-300 hover:border-muted-foreground/40 hover:bg-muted/50 hover:shadow-md">
        <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img 
                src="/docs/logo/flownoteslogo.png" 
                alt="Flow Notes" 
                className="h-6 w-6 object-contain rounded-sm"
                style={{
                  filter: getLogoFilter()
                }}
              />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse opacity-80" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Flow Notes</h3>
              <p className="text-xs text-muted-foreground">Developer Notes App</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2 mb-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Perfect companion for your dev workflow. Organize code snippets, project notes, and ideas seamlessly.
          </p>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>Markdown</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Fast & Clean</span>
            </div>
          </div>
        </div>
        
        <Button
          onClick={handleVisit}
          size="sm"
          className={`w-full text-xs h-7 transition-all duration-200 ${
            resolvedTheme === 'blackwhite'
              ? 'bg-white text-black hover:bg-gray-200 border border-white'
              : 'bg-primary/90 hover:bg-primary text-primary-foreground'
          }`}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Try Flow Notes
        </Button>
        
        <div className="mt-2 text-center">
          <span className="text-xs text-muted-foreground/60">
            {resolvedTheme === 'blackwhite' ? '> suggestion.show()' : 'Suggested for you'}
          </span>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}