"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// We've removed Tabs imports
import { useUserPreferences } from "@/lib/store"
import { 
  Settings, 
  ArrowRight,
  ChevronDown
} from "lucide-react"
import { cn, getDensityClasses } from "@/lib/utils"
import { getToolsByCategory } from "@/lib/tool-routes"

// We've removed DND libraries since we no longer need drag and drop functionality

// Tool card component
interface ToolCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  tools: string[]
}

function ToolCard({ title, description, icon, href, tools }: ToolCardProps) {
  const { uiDensity } = useUserPreferences()
  const densityClasses = getDensityClasses(uiDensity)
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down')
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const [isMounted, setIsMounted] = useState(false)
  const categoryTools = getToolsByCategory(title)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Calculate dropdown position based on available space
  const calculateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 200
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    // Calculate fixed positioning coordinates
    const left = rect.left
    const width = rect.width
    
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      // Show dropdown upward
      setDropdownPosition('up')
      setDropdownStyle({
        position: 'fixed',
        top: rect.top - dropdownHeight - 4,
        left: left,
        width: width,
        maxHeight: Math.min(dropdownHeight, spaceAbove - 8)
      })
    } else {
      // Show dropdown downward
      setDropdownPosition('down')
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: left,
        width: width,
        maxHeight: Math.min(dropdownHeight, spaceBelow - 8)
      })
    }
  }, [])

  // Handle dropdown toggle with position calculation
  const handleDropdownToggle = () => {
    if (!showDropdown) {
      calculateDropdownPosition()
    }
    setShowDropdown(!showDropdown)
  }

  // Close dropdown when clicking outside or pressing escape, and handle repositioning
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowDropdown(false)
      }
    }

    function handleResize() {
      if (showDropdown) {
        calculateDropdownPosition()
      }
    }

    function handleScroll() {
      if (showDropdown) {
        calculateDropdownPosition()
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleScroll, true)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscapeKey)
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [showDropdown, calculateDropdownPosition])
  
  return (
    <Card className="overflow-visible hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 group relative backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
      
      <CardHeader className={cn(
        "flex flex-row items-start gap-4",
        uiDensity === 'compact' ? 'p-4' : uiDensity === 'spacious' ? 'p-6' : 'p-5'
      )}>
        <div className={cn(
          "bg-primary/10 rounded-xl flex items-center justify-center",
          densityClasses.padding[uiDensity],
          "transition-all duration-300 group-hover:bg-primary/20"
        )}>
          {icon}
        </div>
        
        <div className="flex-1">
          <CardTitle className={cn(
            "text-xl transition-colors duration-300 group-hover:text-primary",
            uiDensity === 'compact' ? 'text-lg' : uiDensity === 'spacious' ? 'text-2xl' : 'text-xl'
          )}>
            {title}
          </CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        uiDensity === 'compact' ? 'p-4 pt-0' : uiDensity === 'spacious' ? 'p-6 pt-0' : 'p-5 pt-0'
      )}>
        <div className={cn(densityClasses.margin[uiDensity])}>
          <div className="flex flex-wrap gap-2 mb-4">
            {tools.slice(0, 5).map((tool) => (
              <span
                key={tool}
                className={cn(
                  "px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-md text-sm",
                  "transition-colors duration-300 hover:bg-secondary",
                  uiDensity === 'compact' ? 'text-xs' : uiDensity === 'spacious' ? 'text-sm px-3 py-1.5' : ''
                )}
              >
                {tool}
              </span>
            ))}
            {tools.length > 5 && (
              <span className="px-2 py-1 bg-secondary/30 text-secondary-foreground rounded-md text-sm">
                +{tools.length - 5} more
              </span>
            )}
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <Button 
              ref={buttonRef}
              onClick={handleDropdownToggle}
              className={cn(
                "w-full group relative overflow-hidden",
                "transition-all duration-300",
                uiDensity === 'spacious' ? 'py-6' : uiDensity === 'compact' ? 'py-1.5' : 'py-2'
              )}
            >
              <span className="relative z-10 flex items-center justify-center">
                Choose Tool
                <ChevronDown className={cn(
                  "ml-2 h-4 w-4 transition-transform duration-200",
                  showDropdown && dropdownPosition === 'down' && "rotate-180",
                  showDropdown && dropdownPosition === 'up' && "rotate-0"
                )} />
              </span>
              <span className="absolute inset-0 bg-primary/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
            
            {showDropdown && isMounted && typeof window !== 'undefined' && createPortal(
              (
                <>
                  {/* Backdrop overlay */}
                  <div 
                    className="fixed inset-0 bg-black/10 z-[9998]" 
                    onClick={() => setShowDropdown(false)} 
                  />
                  
                  {/* Dropdown menu */}
                  <div 
                    ref={dropdownRef}
                    style={dropdownStyle}
                    className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-2xl z-[9999] overflow-hidden"
                  >
                    <div className="py-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted" style={{ maxHeight: dropdownStyle.maxHeight }}>
                    {categoryTools.slice(0, 8).map((tool, index) => (
                      <Link
                        key={tool.name}
                        href={tool.route}
                        className="flex items-center px-3 py-1.5 hover:bg-muted/70 transition-colors text-sm group/item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <span className="text-primary/70 font-mono text-xs mr-2 w-6 text-center group-hover/item:text-primary">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate group-hover/item:text-primary transition-colors">
                          {tool.name}
                        </span>
                      </Link>
                    ))}
                    
                    {categoryTools.length > 8 && (
                      <div className="px-3 py-1 text-xs text-muted-foreground bg-muted/30">
                        +{categoryTools.length - 8} more tools...
                      </div>
                    )}
                    
                    <div className="border-t border-border/30 mt-1">
                      <Link
                        href={href}
                        className="flex items-center px-3 py-1.5 hover:bg-primary/10 transition-colors text-sm text-muted-foreground hover:text-primary"
                        onClick={() => setShowDropdown(false)}
                      >
                        <ArrowRight className="h-3 w-3 mr-2" />
                        <span className="text-xs">View all tools</span>
                      </Link>
                    </div>
                    </div>
                  </div>
                </>
              ),
              document.body
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// We've removed the SortableFavoriteCard and RecentToolCard components

// Import all icons
import * as LucideIcons from "lucide-react"

// Main dashboard component
export function CustomizableDashboard({ categories }: { categories: any[] }) {
  const { 
    uiDensity
  } = useUserPreferences()
  
  // We've removed DND sensors and handlers
  
  // Get spacing classes based on UI density
  const densityClasses = getDensityClasses(uiDensity)
  
  // Helper function to get icon component from string name
  const getIconComponent = (iconName: string) => {
    // @ts-ignore - Dynamic access to Lucide icons
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle
    return IconComponent
  }
  
  return (
    <div className="space-y-8">
      {/* Hero section with animated gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 md:p-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 pb-1">
            Welcome to DevKit Pro
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Your ultimate toolbox for development, design, and content creation. 
            Fast, free, and works entirely in your browser.
          </p>
          
          <div className="pt-2">
            <Button asChild size="lg" className="rounded-full px-6 bg-primary/90 hover:bg-primary">
              <Link href="/settings" className="flex items-center justify-center">
                <Settings className="h-4 w-4 mr-2" />
                Customize Your Experience
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tools section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center md:text-left">
          Powerful Tools
          <span className="ml-2 inline-block px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-normal">
            {categories.reduce((acc, cat) => acc + cat.tools.length, 0)} tools
          </span>
        </h2>
        
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 ${densityClasses.grid[uiDensity]}`}>
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.icon)
            
            return (
              <ToolCard 
                key={category.title}
                title={category.title}
                description={category.description}
                icon={<IconComponent className="h-6 w-6 text-primary" />}
                href={category.href}
                tools={category.tools}
              />
            )
          })}
        </div>
      </div>
      
      {/* Features section with cards */}
      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-semibold text-center md:text-left">Why DevKit Pro?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-primary/10 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                100% Free
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                All tools are completely free to use. No hidden fees, no subscriptions, no limits.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-primary/10 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                Privacy First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Everything runs in your browser. Your data never leaves your device.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-primary/10 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                Always Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Regular updates with new tools and improvements based on user feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}