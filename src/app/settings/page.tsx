
"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserPreferences } from "@/lib/store"
import { 
  ArrowLeft, 
  Monitor, 
  Moon, 
  Sun, 
  Type
} from "lucide-react"

import { useTheme } from "next-themes"
import { cn, getDensityClasses } from "@/lib/utils"

export default function SettingsPage() {
  const { 
    uiDensity, 
    setUiDensity, 
    fontSize, 
    setFontSize
  } = useUserPreferences()
  
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("appearance")
  
  return (
    <div className={cn(
      "max-w-4xl mx-auto",
      resolvedTheme === 'blackwhite' && "font-mono"
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className={cn(
            "text-2xl font-bold",
            resolvedTheme === 'blackwhite' && "font-mono"
          )}>
            {resolvedTheme === 'blackwhite' ? '> settings.config' : 'Settings'}
          </h1>
        </div>
      </div>
      
      <Tabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="appearance">
            {resolvedTheme === 'blackwhite' ? 'appearance()' : 'Appearance'}
          </TabsTrigger>
          <TabsTrigger value="about">
            {resolvedTheme === 'blackwhite' ? 'about()' : 'About'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose your preferred color theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                defaultValue={theme} 
                onValueChange={(value) => setTheme(value)}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="light" 
                    id="theme-light" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    Light
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="dark" 
                    id="theme-dark" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    Dark
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="blackwhite" 
                    id="theme-blackwhite" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="theme-blackwhite"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="mb-3 h-6 w-6 font-mono text-lg flex items-center justify-center font-bold">&lt;&gt;</span>
                    dev.tsx
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="system" 
                    id="theme-system" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Monitor className="mb-3 h-6 w-6" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>UI Density</CardTitle>
              <CardDescription>
                Adjust the spacing between elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  This setting affects spacing throughout the app. Changes are applied immediately.
                </p>
                <div className={cn(
                  "p-3 border rounded-md mb-4 bg-card",
                  uiDensity === 'compact' ? 'p-2' : uiDensity === 'spacious' ? 'p-5' : ''
                )}>
                  <div className={cn(
                    "flex items-center",
                    uiDensity === 'compact' ? 'gap-2' : uiDensity === 'spacious' ? 'gap-4' : 'gap-3'
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-md bg-primary/20",
                      uiDensity === 'compact' ? 'w-6 h-6' : uiDensity === 'spacious' ? 'w-10 h-10' : ''
                    )}></div>
                    <div>
                      <p className="font-medium">Preview</p>
                      <p className="text-sm text-muted-foreground">Current density: {uiDensity}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <RadioGroup 
                defaultValue={uiDensity} 
                onValueChange={(value) => setUiDensity(value as 'compact' | 'comfortable' | 'spacious')}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="compact" 
                    id="density-compact" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="density-compact"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="flex flex-col items-center gap-0.5 mb-3">
                      <div className="w-6 h-1 bg-primary rounded-full"></div>
                      <div className="w-6 h-1 bg-primary rounded-full"></div>
                      <div className="w-6 h-1 bg-primary rounded-full"></div>
                    </div>
                    Compact
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="comfortable" 
                    id="density-comfortable" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="density-comfortable"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="flex flex-col items-center gap-1 mb-3">
                      <div className="w-6 h-1 bg-primary rounded-full"></div>
                      <div className="w-6 h-1 bg-primary rounded-full"></div>
                      <div className="w-6 h-1 bg-primary rounded-full"></div>
                    </div>
                    Comfortable
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="spacious" 
                    id="density-spacious" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="density-spacious"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="flex flex-col items-center gap-2 mb-3">
                      <div className="w-6 h-1 bg-primary rounded-full"></div>
                      <div className="w-6 h-1 bg-primary rounded-full"></div>
                      <div className="w-6 h-1 bg-primary rounded-full"></div>
                    </div>
                    Spacious
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Font Size</CardTitle>
              <CardDescription>
                Adjust the text size throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                defaultValue={fontSize} 
                onValueChange={(value) => setFontSize(value as 'small' | 'medium' | 'large')}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="small" 
                    id="font-small" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="font-small"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Type className="mb-3 h-4 w-4" />
                    Small
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="medium" 
                    id="font-medium" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="font-medium"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Type className="mb-3 h-5 w-5" />
                    Medium
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="large" 
                    id="font-large" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="font-large"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Type className="mb-3 h-6 w-6" />
                    Large
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Favorites tab has been removed */}
        
        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <img 
                    src="/docs/logo/devkitproicon.png" 
                    alt="DevKit Pro Logo" 
                    className="h-16 w-16 object-contain"
                  />
                </div>
                <div>
                  <CardTitle>About DevKit Pro</CardTitle>
                  <CardDescription>
                    Information about this application
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Elegant poster section */}
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <img 
                      src="/docs/logo/devkitabouticon.png" 
                      alt="DevKit Pro About Poster" 
                      className="h-32 w-32 md:h-40 md:w-40 object-contain opacity-90 rounded-lg shadow-sm"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Your Complete Development Toolkit
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      DevKit Pro is a comprehensive collection of developer tools designed to streamline your workflow. 
                      From text formatting to image processing, API testing to code formatting - everything you need in one place.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Version</h3>
                <p className="text-sm text-muted-foreground">1.1.0</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Developer</h3>
                <p className="text-sm text-muted-foreground">
                  <a 
                    href="http://syedwamiq.framer.website" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Syed Wamiq
                  </a>
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                    Next.js 14
                  </span>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                    React 18
                  </span>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                    Tailwind CSS
                  </span>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                    shadcn/ui
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Keyboard Shortcuts</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  DevKit Pro supports keyboard shortcuts for faster navigation and usage.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Simulate pressing the ? key to show shortcuts
                    const event = new KeyboardEvent('keydown', { key: '?' })
                    window.dispatchEvent(event)
                  }}
                >
                  View Keyboard Shortcuts
                </Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  DevKit Pro processes all data locally in your browser. 
                  No data is sent to any server or third party.
                </p>
              </div>
              
              <div className="pt-4">
                <Button asChild>
                  <a 
                    href="https://github.com/syedwam7q/devkit-pro" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View on GitHub
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}