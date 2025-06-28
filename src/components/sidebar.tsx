"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUserPreferences } from "@/lib/store"
import { FlowNotesSuggestion } from "@/components/flow-notes-suggestion"
import {
  Type,
  Image,
  Code,
  Palette,
  FileText,
  Hash,
  Regex,
  Key,
  Link as LinkIcon,
  Diff,
  Wand2,
  Smile,
  Menu,
  X,
  FileSpreadsheet,
  Globe,
  Lock,
  QrCode,
  Settings,
  ChevronRight,
  ChevronDown,
  Home,
  FileIcon,
  ScanText,
  NotebookPen,
  Grid3X3
} from "lucide-react"

const tools = [
  {
    category: "Text Tools",
    icon: Type,
    items: [
      { name: "Text Formatter", href: "/text-formatter", icon: Type },
      { name: "Word Counter", href: "/word-counter", icon: Hash },
      { name: "Markdown Editor", href: "/markdown-editor", icon: FileText },
    ]
  },
  {
    category: "Image Tools", 
    icon: Image,
    items: [
      { name: "Image Resizer", href: "/image-resizer", icon: Image },
      { name: "Image Compressor", href: "/image-compressor", icon: Image },
      { name: "Color Picker", href: "/color-picker", icon: Palette },
      { name: "Image Converter", href: "/image-converter", icon: Image },
      { name: "Image to Text", href: "/image-to-text", icon: ScanText },
    ]
  },
  // Document Tools category removed - PDF Viewer moved to Developer Tools
  {
    category: "Developer Tools",
    icon: Code,
    items: [
      { name: "PDF Viewer", href: "/pdf-viewer", icon: FileText },
      { name: "PDF Compressor", href: "/pdf-compressor", icon: FileText },
      { name: "JSON Formatter", href: "/json-formatter", icon: Code },
      { name: "CSV/Excel Viewer", href: "/csv-excel-viewer", icon: FileSpreadsheet },
      { name: "API Tester", href: "/api-tester", icon: Globe },
      { name: "Regex Tester", href: "/regex-tester", icon: Regex },
      { name: "Base64 Encoder", href: "/base64-encoder", icon: Key },
      { name: "UUID Generator", href: "/uuid-generator", icon: Hash },
      { name: "Password Generator", href: "/password-generator", icon: Lock },
      { name: "JWT Decoder", href: "/jwt-decoder", icon: Key },
      { name: "URL Parser", href: "/url-parser", icon: LinkIcon },
    ]
  },
  {
    category: "Advanced Tools",
    icon: Wand2,
    items: [
      { name: "Text Diff", href: "/text-diff", icon: Diff },
      { name: "Code Formatter", href: "/code-formatter", icon: Code },
      { name: "HTML/CSS Playground", href: "/html-css-playground", icon: Code },
      { name: "QR Code Generator", href: "/qr-code-generator", icon: QrCode },
      { name: "SVG Generator", href: "/svg-generator", icon: Wand2 },
      { name: "Meme Generator", href: "/meme-generator", icon: Smile },
      { name: "Flow Notes", href: "https://coming-soon-ten-roan.vercel.app/", icon: NotebookPen, external: true },
    ]
  }
]

// Flatten all tools for easy lookup
const allTools = tools.flatMap(category => 
  category.items.map(item => ({
    ...item,
    category: category.category
  }))
)

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Text Tools": true,
    "Image Tools": true,
    "Developer Tools": true,
    "Advanced Tools": true,
    "Document Tools": true
  })
  const pathname = usePathname()
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed,
    fontSize
  } = useUserPreferences()

  // We've removed tracking of recent tools

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Font size classes based on user preference
  const fontSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base"
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-1 rounded-md">
            <img 
              src="/docs/logo/devkitproicon.png" 
              alt="DevKit Pro Logo" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <h1 className="text-xl font-bold">DevKit Pro</h1>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-5">
          {/* Home link */}
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === "/" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                fontSizeClasses[fontSize]
              )}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/tools"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === "/tools" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                fontSizeClasses[fontSize]
              )}
            >
              <Grid3X3 className="h-4 w-4" />
              Tools Explorer
            </Link>
          </div>


          
          {/* Tool Categories */}
          {tools.map((category) => (
            <div key={category.category}>
              <div 
                className="flex items-center justify-between mb-2 cursor-pointer"
                onClick={() => toggleSection(category.category)}
              >
                <h3 className={cn("text-sm font-semibold text-muted-foreground uppercase tracking-wider", fontSizeClasses[fontSize])}>
                  {category.category}
                </h3>
                {expandedSections[category.category] ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              {expandedSections[category.category] && (
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon
                    const isExternal = (item as any).external
                    
                    if (isExternal) {
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground",
                            fontSizeClasses[fontSize]
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                          <svg className="h-3 w-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )
                    }
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                          fontSizeClasses[fontSize]
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
      
      {/* Flow Notes Suggestion Card */}
      <FlowNotesSuggestion />
      
      <div className="p-4 border-t mt-auto">
        <Link
          href="/settings"
          onClick={() => setIsOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 mb-4 transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === "/settings" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            fontSizeClasses[fontSize]
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        
        <div className="text-xs text-muted-foreground space-y-1 max-w-full">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1">
            <span className="whitespace-nowrap">Developed by:</span>
            <a 
              href="https://my-portfolio-eight-rust-75.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors hover:underline break-words"
            >
              Syed Wamiq
            </a>
          </div>
          <div className="flex items-center">
            <a 
              href="https://github.com/syedwam7q" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:text-foreground transition-colors text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 flex-shrink-0">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              <span className="truncate">GitHub</span>
            </a>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} DevKit Pro</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button with improved styling */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm shadow-sm border"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay with blur effect for better aesthetics */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[85%] max-w-[300px] bg-background border-r transition-transform duration-300 ease-in-out md:translate-x-0 md:w-64 overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 h-full bg-background border-r">
        <SidebarContent />
      </aside>
    </>
  )
}

// Helper function to get SVG path for an icon
function getIconPath(iconName: string): string {
  const iconPaths: Record<string, string> = {
    'Type': '<path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path>',
    'Image': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>',
    'Code': '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
    'Wand2': '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path>',
    'Hash': '<line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line>',
    'FileText': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><line x1="10" x2="8" y1="9" y2="9"></line>',
    'Palette': '<circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>',
    'Regex': '<path d="M17 3v10"></path><path d="m12.67 5.5 8.66 5"></path><path d="m12.67 10.5 8.66-5"></path><path d="M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z"></path>',
    'Key': '<circle cx="7.5" cy="15.5" r="5.5"></circle><path d="m21 2-9.6 9.6"></path><path d="m15.5 7.5 3 3L22 7l-3-3"></path>',
    'Link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>',
    'Diff': '<path d="M12 3v14"></path><path d="M5 10h14"></path><path d="M5 21h14"></path>',
    'Smile': '<circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line>',
    'FileSpreadsheet': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h2"></path><path d="M8 17h2"></path><path d="M14 13h2"></path><path d="M14 17h2"></path>',
    'Globe': '<circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
    'Lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    'QrCode': '<rect width="5" height="5" x="3" y="3" rx="1"></rect><rect width="5" height="5" x="16" y="3" rx="1"></rect><rect width="5" height="5" x="3" y="16" rx="1"></rect><path d="M21 16h-3a2 2 0 0 0-2 2v3"></path><path d="M21 21v.01"></path><path d="M12 7v3a2 2 0 0 1-2 2H7"></path><path d="M3 12h.01"></path><path d="M12 3h.01"></path><path d="M12 16v.01"></path><path d="M16 12h1"></path><path d="M21 12v.01"></path><path d="M12 21v-1"></path>'
  }
  
  return iconPaths[iconName] || ''
}