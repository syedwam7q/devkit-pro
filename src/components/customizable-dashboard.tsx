"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserPreferences, FavoriteToolType } from "@/lib/store"
import { 
  Star, 
  Clock, 
  Grid3x3, 
  Settings, 
  GripHorizontal, 
  X,
  ArrowRight,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

// Import DND libraries for drag and drop functionality
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Tool card component that can be favorited
interface ToolCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  tools: string[]
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

function ToolCard({ title, description, icon, href, tools, isFavorite, onToggleFavorite }: ToolCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          {onToggleFavorite && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.preventDefault()
                onToggleFavorite()
              }}
              className="text-muted-foreground hover:text-primary"
            >
              <Star className={cn("h-5 w-5", isFavorite ? "fill-primary text-primary" : "")} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
              >
                {tool}
              </span>
            ))}
          </div>
          <Link href={href}>
            <Button className="w-full group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Sortable favorite tool card
function SortableFavoriteCard({ tool }: { tool: FavoriteToolType }) {
  const { removeFavoriteTool } = useUserPreferences()
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tool.href })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-manipulation">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <span className="text-primary" dangerouslySetInnerHTML={{ __html: tool.icon }} />
              </div>
              <CardTitle className="text-sm font-medium">{tool.name}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => removeFavoriteTool(tool.href)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <div className="h-7 w-7 flex items-center justify-center text-muted-foreground cursor-grab">
                <GripHorizontal className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <Link href={tool.href}>
            <Button variant="secondary" size="sm" className="w-full">
              Open
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

// Recent tool card
function RecentToolCard({ tool }: { tool: FavoriteToolType }) {
  return (
    <Link href={tool.href}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <span className="text-primary" dangerouslySetInnerHTML={{ __html: tool.icon }} />
            </div>
            <CardTitle className="text-sm font-medium">{tool.name}</CardTitle>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}

// Import all icons
import * as LucideIcons from "lucide-react"

// Main dashboard component
export function CustomizableDashboard({ categories }: { categories: any[] }) {
  const [activeTab, setActiveTab] = useState("all")
  const { 
    favoriteTools, 
    addFavoriteTool, 
    recentTools, 
    reorderFavoriteTools,
    uiDensity
  } = useUserPreferences()
  
  // Set up DND sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Handle DND end
  function handleDragEnd(event: any) {
    const { active, over } = event
    
    if (active.id !== over.id) {
      const oldIndex = favoriteTools.findIndex(tool => tool.href === active.id)
      const newIndex = favoriteTools.findIndex(tool => tool.href === over.id)
      reorderFavoriteTools(oldIndex, newIndex)
    }
  }
  
  // Spacing classes based on UI density
  const spacingClasses = {
    compact: "gap-3",
    comfortable: "gap-6",
    spacious: "gap-8"
  }
  
  // Helper function to get icon component from string name
  const getIconComponent = (iconName: string) => {
    // @ts-ignore - Dynamic access to Lucide icons
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle
    return IconComponent
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to DevKit Pro
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your ultimate toolbox for development, design, and content creation. 
          Fast, free, and works entirely in your browser.
        </p>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              <span>All Tools</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Favorites</span>
            </TabsTrigger>
            {/* Temporarily hidden until implementation is fixed
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Recent</span>
            </TabsTrigger>
            */}
          </TabsList>
          
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Link>
          </Button>
        </div>
        
        <TabsContent value="all" className="mt-6">
          <div className={`grid grid-cols-1 md:grid-cols-2 ${spacingClasses[uiDensity]}`}>
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon)
              const isFavorite = favoriteTools.some(tool => tool.href === category.href)
              
              return (
                <ToolCard 
                  key={category.title}
                  title={category.title}
                  description={category.description}
                  icon={<IconComponent className="h-6 w-6 text-primary" />}
                  href={category.href}
                  tools={category.tools}
                  isFavorite={isFavorite}
                  onToggleFavorite={() => {
                    if (isFavorite) {
                      // Remove from favorites
                      const href = category.href
                      useUserPreferences.getState().removeFavoriteTool(href)
                    } else {
                      // Add to favorites
                      addFavoriteTool({
                        name: category.title,
                        href: category.href,
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${getIconPath(category.icon)}</svg>`
                      })
                    }
                  }}
                />
              )
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-6">
          {favoriteTools.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No favorite tools yet</h3>
              <p className="text-muted-foreground mb-4">
                Add tools to your favorites for quick access
              </p>
              <Button onClick={() => setActiveTab("all")}>
                Browse All Tools
              </Button>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={favoriteTools.map(tool => tool.href)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {favoriteTools.map((tool) => (
                    <SortableFavoriteCard key={tool.href} tool={tool} />
                  ))}
                  <Card className="hover:shadow-md transition-shadow border-dashed">
                    <CardContent className="p-3 flex flex-col items-center justify-center h-full min-h-[120px]">
                      <Button 
                        variant="ghost" 
                        className="flex flex-col h-full w-full gap-2"
                        onClick={() => setActiveTab("all")}
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-sm">Add Favorite</span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>
        
        {/* Temporarily hidden until implementation is fixed
        <TabsContent value="recent" className="mt-6">
          {recentTools.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No recent activity</h3>
              <p className="text-muted-foreground mb-4">
                Your recently used tools will appear here
              </p>
              <Button onClick={() => setActiveTab("all")}>
                Browse All Tools
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recentTools.map((tool) => (
                <RecentToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          )}
        </TabsContent>
        */}
      </Tabs>
      
      <div className="text-center space-y-4 pt-8">
        <h2 className="text-2xl font-semibold">Why DevKit Pro?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <h3 className="font-semibold">⚡ Blazing Fast</h3>
            <p className="text-sm text-muted-foreground">
              All tools run locally in your browser with no server delays
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">🔒 Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              Your data never leaves your device - everything is processed locally
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">💰 Completely Free</h3>
            <p className="text-sm text-muted-foreground">
              No subscriptions, no limits, no hidden costs - forever free
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get SVG path for an icon
function getIconPath(iconName: string): string {
  const iconPaths: Record<string, string> = {
    'Type': '<path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path>',
    'Image': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>',
    'Code': '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
    'Wand2': '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path>'
  }
  
  return iconPaths[iconName] || ''
}