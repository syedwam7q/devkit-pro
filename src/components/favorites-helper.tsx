"use client"

import { useEffect } from "react"
import { useUserPreferences } from "@/lib/store"

export function FavoritesHelper() {
  const { favoriteTools, addFavoriteTool } = useUserPreferences()
  
  useEffect(() => {
    // Add a sample favorite tool if none exist
    if (typeof window !== 'undefined' && favoriteTools.length === 0) {
      // Check if we've already shown the helper
      const hasShownHelper = localStorage.getItem('favorites-helper-shown')
      
      if (!hasShownHelper) {
        // Add a sample favorite
        addFavoriteTool({
          name: "Text Formatter",
          href: "/text-formatter",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path></svg>'
        })
        
        // Mark as shown
        localStorage.setItem('favorites-helper-shown', 'true')
      }
    }
  }, [favoriteTools.length, addFavoriteTool])
  
  return null
}