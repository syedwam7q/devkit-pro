"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
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
  X
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
    ]
  },
  {
    category: "Developer Tools",
    icon: Code,
    items: [
      { name: "JSON Formatter", href: "/json-formatter", icon: Code },
      { name: "Regex Tester", href: "/regex-tester", icon: Regex },
      { name: "Base64 Encoder", href: "/base64-encoder", icon: Key },
      { name: "UUID Generator", href: "/uuid-generator", icon: Hash },
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
      { name: "SVG Generator", href: "/svg-generator", icon: Wand2 },
      { name: "Meme Generator", href: "/meme-generator", icon: Smile },
    ]
  }
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">DevKit Pro</h1>
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
        <div className="space-y-6">
          {tools.map((category) => (
            <div key={category.category}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {category.category}
              </h3>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t text-xs text-muted-foreground">
        <div className="flex flex-col space-y-1">
          <p>Developed by: Syed Wamiq</p>
          <div className="flex items-center gap-2">
            <a 
              href="https://github.com/syedwam7q" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              github.com/syedwam7q
            </a>
          </div>
          <p>© {new Date().getFullYear()} DevKit Pro</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-background border-r transition-transform md:translate-x-0",
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