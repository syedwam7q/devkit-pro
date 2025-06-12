import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FavoriteToolType = {
  name: string
  href: string
  icon: string
}

interface UserPreferencesState {
  // UI Preferences
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // Dashboard customization
  favoriteTools: FavoriteToolType[]
  addFavoriteTool: (tool: FavoriteToolType) => void
  removeFavoriteTool: (href: string) => void
  reorderFavoriteTools: (startIndex: number, endIndex: number) => void
  
  // Recent tools
  recentTools: FavoriteToolType[]
  addRecentTool: (tool: FavoriteToolType) => void
  
  // UI Density
  uiDensity: 'compact' | 'comfortable' | 'spacious'
  setUiDensity: (density: 'compact' | 'comfortable' | 'spacious') => void
  
  // Font size
  fontSize: 'small' | 'medium' | 'large'
  setFontSize: (size: 'small' | 'medium' | 'large') => void
}

export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      // UI Preferences
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      // Dashboard customization
      favoriteTools: [],
      addFavoriteTool: (tool) => set((state) => {
        // Don't add if already exists
        if (state.favoriteTools.some(t => t.href === tool.href)) {
          return state
        }
        return { favoriteTools: [...state.favoriteTools, tool] }
      }),
      removeFavoriteTool: (href) => set((state) => ({
        favoriteTools: state.favoriteTools.filter(tool => tool.href !== href)
      })),
      reorderFavoriteTools: (startIndex, endIndex) => set((state) => {
        const newFavorites = [...state.favoriteTools]
        const [removed] = newFavorites.splice(startIndex, 1)
        newFavorites.splice(endIndex, 0, removed)
        return { favoriteTools: newFavorites }
      }),
      
      // Recent tools
      recentTools: [],
      addRecentTool: (tool) => set((state) => {
        // Remove if already exists
        const filteredTools = state.recentTools.filter(t => t.href !== tool.href)
        // Add to beginning and limit to 5 items
        return { recentTools: [tool, ...filteredTools].slice(0, 5) }
      }),
      
      // UI Density
      uiDensity: 'comfortable',
      setUiDensity: (density) => set({ uiDensity: density }),
      
      // Font size
      fontSize: 'medium',
      setFontSize: (size) => set({ fontSize: size }),
    }),
    {
      name: 'user-preferences',
      onRehydrateStorage: () => {
        // This runs when the store is rehydrated
        return (state) => {
          if (state) {
            // If we have no recent tools in the store, try to load from localStorage
            if (state.recentTools.length === 0) {
              try {
                const storedRecent = localStorage.getItem('recent-tools')
                if (storedRecent) {
                  const recentTools = JSON.parse(storedRecent)
                  if (Array.isArray(recentTools) && recentTools.length > 0) {
                    state.recentTools = recentTools
                  }
                }
              } catch (error) {
                console.error('Error loading recent tools from localStorage:', error)
              }
            }
          }
        }
      }
    }
  )
)