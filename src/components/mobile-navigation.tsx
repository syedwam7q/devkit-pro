"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useUserPreferences } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllTools, getToolsByCategory } from "@/lib/tool-routes"
import {
  Home,
  Search,
  MessageCircle,
  Settings,
  Type,
  Image,
  Code,
  Wand2,
  X,
  ChevronRight,
  Grid2X2,
  List
} from "lucide-react"

// Tool categories for quick access
const toolCategories = [
  {
    name: "Text Tools",
    icon: Type,
    href: "/text-formatter",
    description: "Format, count, and edit text"
  },
  {
    name: "Image Tools",
    icon: Image,
    href: "/image-resizer",
    description: "Resize, compress, and convert images"
  },
  {
    name: "Developer Tools",
    icon: Code,
    href: "/pdf-viewer",
    description: "PDF viewer, JSON, regex, and more"
  },
  {
    name: "Advanced Tools",
    icon: Wand2,
    href: "/text-diff",
    description: "Compare text, format code, create SVGs"
  }
]

export function MobileNavigation() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"all" | "categories">("all")
  const pathname = usePathname()
  
  // Get all tools
  const allTools = getAllTools()
  
  // Filter tools based on search query
  const filteredTools = searchQuery 
    ? allTools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allTools
  
  // Listen for chatbot state changes
  useEffect(() => {
    const handleChatbotOpen = () => setChatbotOpen(true)
    const handleChatbotClose = () => setChatbotOpen(false)
    
    window.addEventListener('chatbot-opened', handleChatbotOpen)
    window.addEventListener('chatbot-closed', handleChatbotClose)
    
    return () => {
      window.removeEventListener('chatbot-opened', handleChatbotOpen)
      window.removeEventListener('chatbot-closed', handleChatbotClose)
    }
  }, [])
  
  return (
    <>
      {/* Bottom Navigation Bar - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t z-40 pb-safe-area shadow-lg">
        <div className="flex items-center justify-around p-2 px-4">
          <Link 
            href="/" 
            className={cn(
              "flex flex-col items-center p-2 rounded-md transition-colors",
              pathname === "/" ? "bg-primary/10" : "hover:bg-accent/50"
            )}
          >
            <Home className={cn(
              "h-5 w-5",
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs mt-1",
              pathname === "/" ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              Home
            </span>
          </Link>
          
          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "flex flex-col items-center p-2 h-auto rounded-md",
                  searchOpen ? "bg-primary/10" : "hover:bg-accent/50"
                )}
              >
                <Search className={cn(
                  "h-5 w-5",
                  searchOpen ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs mt-1",
                  searchOpen ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  Tools
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-xl px-4 pb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">DevKit Tools</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mb-4">
                <Input
                  type="search"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Tabs defaultValue="all" className="mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all" onClick={() => setViewMode("all")}>
                    <List className="h-4 w-4 mr-2" />
                    All Tools
                  </TabsTrigger>
                  <TabsTrigger value="categories" onClick={() => setViewMode("categories")}>
                    <Grid2X2 className="h-4 w-4 mr-2" />
                    Categories
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredTools.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.route}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent active:bg-accent/80 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{tool.name}</h3>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="categories" className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {toolCategories.map((category) => {
                      const Icon = category.icon
                      return (
                        <Link
                          key={category.name}
                          href={category.href}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent active:bg-accent/80 transition-colors"
                        >
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{category.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground ml-2 mt-1 flex-shrink-0" />
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
          
          <Button 
            variant="ghost" 
            className={cn(
              "flex flex-col items-center p-2 h-auto rounded-md transition-colors",
              chatbotOpen ? "bg-primary/10" : "hover:bg-accent/50"
            )}
            onClick={() => {
              // This will be handled by the Chatbot component
              const chatbotToggleEvent = new CustomEvent('toggle-chatbot')
              window.dispatchEvent(chatbotToggleEvent)
            }}
          >
            <MessageCircle className={cn(
              "h-5 w-5",
              chatbotOpen ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs mt-1",
              chatbotOpen ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              Chat
            </span>
          </Button>
          
          <Link 
            href="/settings" 
            className={cn(
              "flex flex-col items-center p-2 rounded-md transition-colors",
              pathname === "/settings" ? "bg-primary/10" : "hover:bg-accent/50"
            )}
          >
            <Settings className={cn(
              "h-5 w-5",
              pathname === "/settings" ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs mt-1",
              pathname === "/settings" ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              Settings
            </span>
          </Link>
        </div>
      </div>
      
      {/* Add padding to the bottom of the page on mobile to account for the navigation bar */}
      <div className="md:hidden h-20" />
    </>
  )
}