"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function useToolTracking() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't track home page or settings
    if (pathname === '/' || pathname === '/settings') return

    // Extract tool name from pathname
    const toolName = pathname.slice(1) // Remove leading slash
    
    if (toolName) {
      // Get existing tools used
      const toolsUsed = JSON.parse(localStorage.getItem('devkit-pro-tools-used') || '[]')
      
      // Add current tool if not already tracked
      if (!toolsUsed.includes(toolName)) {
        const updatedTools = [...toolsUsed, toolName]
        localStorage.setItem('devkit-pro-tools-used', JSON.stringify(updatedTools))
      }

      // Track last tool used and timestamp
      localStorage.setItem('devkit-pro-last-tool', toolName)
      localStorage.setItem('devkit-pro-last-activity', Date.now().toString())
    }
  }, [pathname])
}