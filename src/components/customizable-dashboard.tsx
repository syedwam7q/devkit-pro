"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
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
  const { theme } = useTheme()
  
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
    <div className="space-y-12">
      {/* Hero section with animated gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Clean logo placement */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="relative transition-all duration-300 group-hover:scale-105">
                <img 
                  src="/docs/logo/devkitlogo.png" 
                  alt="DevKit Pro Logo" 
                  className="h-40 w-40 md:h-48 md:w-48 lg:h-56 lg:w-56 object-contain opacity-90 group-hover:opacity-100 transition-all duration-300"
                  style={{
                    filter: theme === 'light' 
                      ? 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(200deg) brightness(104%) contrast(97%)'
                      : theme === 'blackwhite'
                      ? 'brightness(0) saturate(100%) invert(100%)'
                      : 'none'
                  }}
                />
              </div>
            </div>
          </div>
          
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight pb-1 drop-shadow-sm ${
            theme === 'blackwhite' 
              ? 'text-white font-mono' 
              : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-500'
          }`}>
            {theme === 'blackwhite' ? '> DevKit Pro_' : 'Welcome to DevKit Pro'}
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === 'blackwhite' 
              ? 'text-gray-300 font-mono' 
              : 'text-foreground/80'
          }`}>
            {theme === 'blackwhite' 
              ? '// Your ultimate developer toolbox\n// Fast, free, and works entirely in your browser.' 
              : <>
                  Your ultimate toolbox for development, design, and content creation. 
                  <span className="text-blue-600 dark:text-blue-400 font-medium"> Fast, free, and works entirely in your browser.</span>
                </>
            }
          </p>
          
          <div className="pt-4">
            <Button asChild size="lg" className={`rounded-full px-8 py-3 transition-all duration-300 ${
              theme === 'blackwhite'
                ? 'bg-white text-black hover:bg-gray-200 border border-white font-mono'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 border-0'
            }`}>
              <Link href="/settings" className="flex items-center justify-center">
                <Settings className="h-5 w-5 mr-2" />
                {theme === 'blackwhite' ? '> customize_experience()' : 'Customize Your Experience'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tools section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Powerful Tools
          </h2>
          <p className="text-muted-foreground text-lg mb-4">
            Choose from our comprehensive collection of development tools
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
            {categories.reduce((acc, cat) => acc + cat.tools.length, 0)} tools available
          </div>
        </div>
        
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${densityClasses.grid[uiDensity]}`}>
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
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Why DevKit Pro?</h2>
          <p className="text-muted-foreground text-lg">
            Built with developers in mind, designed for everyone
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
            <CardHeader className="pb-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <CardTitle className="text-xl">100% Free</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                All tools are completely free to use. No hidden fees, no subscriptions, no limits.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
            <CardHeader className="pb-4 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Privacy First</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Everything runs in your browser. Your data never leaves your device.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
            <CardHeader className="pb-4 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <CardTitle className="text-xl">Always Updated</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Regular updates with new tools and improvements based on user feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}