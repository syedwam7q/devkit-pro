"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// We've removed Tabs imports
import { useUserPreferences } from "@/lib/store"
import { 
  Settings, 
  ArrowRight
} from "lucide-react"
import { cn, getDensityClasses } from "@/lib/utils"

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
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className={cn(uiDensity === 'compact' ? 'p-4' : '')}>
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className={cn("bg-primary/10 rounded-lg", densityClasses.padding[uiDensity])}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn(uiDensity === 'compact' ? 'p-4 pt-0' : '')}>
        <div className={cn(densityClasses.margin[uiDensity])}>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className={cn(
                  "px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm",
                  uiDensity === 'compact' ? 'text-xs' : uiDensity === 'spacious' ? 'text-sm px-3 py-1.5' : ''
                )}
              >
                {tool}
              </span>
            ))}
          </div>
          <Link href={href}>
            <Button 
              className={cn(
                "w-full group",
                uiDensity === 'spacious' ? 'mt-4 py-6' : ''
              )}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
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
      
      <div className="flex justify-end mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Link>
        </Button>
      </div>
      
      <div className={cn("mt-6", uiDensity === 'spacious' ? 'mt-8' : uiDensity === 'compact' ? 'mt-4' : '')}>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${densityClasses.grid[uiDensity]}`}>
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

// We've removed the getIconPath function since we no longer need it