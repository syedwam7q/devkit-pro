"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useUserPreferences } from "@/lib/store"
import {
  Home,
  Search,
  Star,
  Menu,
  Settings,
  Type,
  Image,
  Code,
  Wand2,
  X,
  ChevronRight
} from "lucide-react"

// Tool categories for quick access
const toolCategories = [
  {
    name: "Text Tools",
    icon: Type,
    href: "/text-formatter"
  },
  {
    name: "Image Tools",
    icon: Image,
    href: "/image-resizer"
  },
  {
    name: "Developer Tools",
    icon: Code,
    href: "/json-formatter"
  },
  {
    name: "Advanced Tools",
    icon: Wand2,
    href: "/text-diff"
  }
]

export function MobileNavigation() {
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const { favoriteTools } = useUserPreferences()
  
  return (
    <>
      {/* Bottom Navigation Bar - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40 pb-safe-area">
        <div className="flex items-center justify-around p-2">
          <Link href="/" className="flex flex-col items-center p-2">
            <Home className={cn(
              "h-5 w-5",
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs mt-1",
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            )}>
              Home
            </span>
          </Link>
          
          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center p-2 h-auto">
                <Search className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs mt-1 text-muted-foreground">
                  Tools
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Tool Categories</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {toolCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{category.name}</h3>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                      </div>
                    </Link>
                  )
                })}
              </div>
              
              {favoriteTools.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-muted-foreground mt-8 mb-4">
                    Favorites
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {favoriteTools.slice(0, 4).map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-2 p-3 rounded-md border"
                      >
                        <span className="text-primary" dangerouslySetInnerHTML={{ __html: tool.icon }} />
                        <span className="text-sm">{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
          
          <Link href="/settings" className="flex flex-col items-center p-2">
            <Star className={cn(
              "h-5 w-5",
              pathname.includes("/favorites") ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs mt-1",
              pathname.includes("/favorites") ? "text-primary" : "text-muted-foreground"
            )}>
              Favorites
            </span>
          </Link>
          
          <Link href="/settings" className="flex flex-col items-center p-2">
            <Settings className={cn(
              "h-5 w-5",
              pathname === "/settings" ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs mt-1",
              pathname === "/settings" ? "text-primary" : "text-muted-foreground"
            )}>
              Settings
            </span>
          </Link>
        </div>
      </div>
      
      {/* Add padding to the bottom of the page on mobile to account for the navigation bar */}
      <div className="md:hidden h-16" />
    </>
  )
}