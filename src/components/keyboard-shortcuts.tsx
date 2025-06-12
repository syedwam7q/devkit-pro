"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUserPreferences } from "@/lib/store"
import { Search, Home, Settings, Star, Moon, Sun, Monitor, Info, X } from "lucide-react"

// Define keyboard shortcuts
const SHORTCUTS = [
  {
    key: "?",
    description: "Show keyboard shortcuts",
    action: "showShortcuts",
    category: "General"
  },
  {
    key: "/",
    description: "Focus search",
    action: "focusSearch",
    category: "Navigation"
  },
  {
    key: "g h",
    description: "Go to home",
    action: "goToHome",
    category: "Navigation"
  },
  {
    key: "g s",
    description: "Go to settings",
    action: "goToSettings",
    category: "Navigation"
  },
  {
    key: "g f",
    description: "Go to favorites",
    action: "goToFavorites",
    category: "Navigation"
  },
  {
    key: "t",
    description: "Toggle theme (light/dark)",
    action: "toggleTheme",
    category: "Appearance"
  },
  {
    key: "Esc",
    description: "Close dialogs or cancel actions",
    action: "escape",
    category: "General"
  },
  {
    key: "Ctrl+s",
    description: "Save current work (when applicable)",
    action: "save",
    category: "Tools"
  },
  {
    key: "Ctrl+d",
    description: "Download result (when applicable)",
    action: "download",
    category: "Tools"
  },
  {
    key: "Ctrl+c",
    description: "Copy to clipboard (when applicable)",
    action: "copy",
    category: "Tools"
  }
]

// Group shortcuts by category
const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
  if (!acc[shortcut.category]) {
    acc[shortcut.category] = []
  }
  acc[shortcut.category].push(shortcut)
  return acc
}, {} as Record<string, typeof SHORTCUTS>)

// Component to display a keyboard key
function KeyboardKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
      {children}
    </kbd>
  )
}

export function KeyboardShortcuts() {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false)
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null)
  const router = useRouter()
  const { favoriteTools } = useUserPreferences()
  
  // Handle keyboard shortcuts
  useEffect(() => {
    let keysPressed: Record<string, boolean> = {}
    let keySequence: string[] = []
    let keySequenceTimer: NodeJS.Timeout | null = null
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }
      
      // Store the key pressed
      keysPressed[e.key] = true
      
      // Add to sequence for multi-key shortcuts
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        keySequence.push(e.key.toLowerCase())
        
        // Reset sequence after a delay
        if (keySequenceTimer) {
          clearTimeout(keySequenceTimer)
        }
        
        keySequenceTimer = setTimeout(() => {
          keySequence = []
        }, 1000)
      }
      
      // Show shortcuts dialog
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        setShowShortcutsDialog(true)
      }
      
      // Focus search
      if (e.key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        if (searchInputRef) {
          searchInputRef.focus()
        }
      }
      
      // Navigation shortcuts with 'g' prefix
      if (keySequence.length === 2 && keySequence[0] === 'g') {
        // Go to home
        if (keySequence[1] === 'h') {
          e.preventDefault()
          router.push('/')
        }
        
        // Go to settings
        if (keySequence[1] === 's') {
          e.preventDefault()
          router.push('/settings')
        }
        
        // Go to favorites
        if (keySequence[1] === 'f' && favoriteTools.length > 0) {
          e.preventDefault()
          router.push(favoriteTools[0].href)
        }
      }
      
      // Toggle theme
      if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        const html = document.documentElement
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light'
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
        
        if (currentTheme === 'dark') {
          html.classList.remove('dark')
          localStorage.setItem('theme', 'light')
        } else {
          html.classList.add('dark')
          localStorage.setItem('theme', 'dark')
        }
      }
      
      // Escape to close dialogs
      if (e.key === 'Escape') {
        setShowShortcutsDialog(false)
      }
      
      // Tool shortcuts
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        // Dispatch a custom event that tool components can listen for
        document.dispatchEvent(new CustomEvent('devkit:save'))
        e.preventDefault()
      }
      
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        document.dispatchEvent(new CustomEvent('devkit:download'))
        e.preventDefault()
      }
      
      if (e.ctrlKey && e.key.toLowerCase() === 'c' && window.getSelection()?.toString() === '') {
        document.dispatchEvent(new CustomEvent('devkit:copy'))
        // Don't prevent default here to allow normal copy behavior
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Remove the key from pressed keys
      delete keysPressed[e.key]
    }
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    // Find search input and store reference
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
    setSearchInputRef(searchInput)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (keySequenceTimer) {
        clearTimeout(keySequenceTimer)
      }
    }
  }, [router, favoriteTools])
  
  return (
    <Dialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and use DevKit Pro more efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{category}</h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.key.split('+').map((key, i) => (
                          <span key={i} className="flex items-center">
                            {i > 0 && <span className="mx-1">+</span>}
                            <KeyboardKey>{key}</KeyboardKey>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setShowShortcutsDialog(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}