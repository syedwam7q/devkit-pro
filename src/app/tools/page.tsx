"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  FileSpreadsheet,
  Globe,
  Lock,
  QrCode,
  ScanText,
  NotebookPen,
  Search,
  Grid3X3,
  List,
  ExternalLink,
  ArrowRight,
  LayoutGrid
} from "lucide-react"

const toolCategories = [
  {
    name: "Text Tools",
    icon: Type,
    description: "Format, count, and manipulate text content",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    tools: [
      { 
        name: "Text Formatter", 
        href: "/text-formatter", 
        icon: Type,
        description: "Format and style your text with various options"
      },
      { 
        name: "Word Counter", 
        href: "/word-counter", 
        icon: Hash,
        description: "Count words, characters, and analyze text statistics"
      },
      { 
        name: "Markdown Editor", 
        href: "/markdown-editor", 
        icon: FileText,
        description: "Write and preview markdown with live rendering"
      },
    ]
  },
  {
    name: "Image Tools",
    icon: Image,
    description: "Process, edit, and convert images",
    color: "bg-green-500/10 text-green-700 dark:text-green-300",
    tools: [
      { 
        name: "Image Resizer", 
        href: "/image-resizer", 
        icon: Image,
        description: "Resize images to specific dimensions"
      },
      { 
        name: "Image Compressor", 
        href: "/image-compressor", 
        icon: Image,
        description: "Compress images to reduce file size"
      },
      { 
        name: "Color Picker", 
        href: "/color-picker", 
        icon: Palette,
        description: "Pick colors from images and generate palettes"
      },
      { 
        name: "Image Converter", 
        href: "/image-converter", 
        icon: Image,
        description: "Convert images between different formats"
      },
      { 
        name: "Image to Text", 
        href: "/image-to-text", 
        icon: ScanText,
        description: "Extract text from images using OCR"
      },
    ]
  },
  {
    name: "Developer Tools",
    icon: Code,
    description: "Essential tools for developers and programmers",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    tools: [
      { 
        name: "PDF Viewer", 
        href: "/pdf-viewer", 
        icon: FileText,
        description: "View and analyze PDF documents"
      },
      { 
        name: "PDF Compressor", 
        href: "/pdf-compressor", 
        icon: FileText,
        description: "Compress PDF files to reduce size"
      },
      { 
        name: "JSON Formatter", 
        href: "/json-formatter", 
        icon: Code,
        description: "Format and validate JSON data"
      },
      { 
        name: "CSV/Excel Viewer", 
        href: "/csv-excel-viewer", 
        icon: FileSpreadsheet,
        description: "View and analyze CSV and Excel files"
      },
      { 
        name: "API Tester", 
        href: "/api-tester", 
        icon: Globe,
        description: "Test REST APIs with various HTTP methods"
      },
      { 
        name: "Regex Tester", 
        href: "/regex-tester", 
        icon: Regex,
        description: "Test and debug regular expressions"
      },
      { 
        name: "Base64 Encoder", 
        href: "/base64-encoder", 
        icon: Key,
        description: "Encode and decode Base64 strings"
      },
      { 
        name: "UUID Generator", 
        href: "/uuid-generator", 
        icon: Hash,
        description: "Generate unique identifiers (UUIDs)"
      },
      { 
        name: "Password Generator", 
        href: "/password-generator", 
        icon: Lock,
        description: "Generate secure passwords with custom options"
      },
      { 
        name: "JWT Decoder", 
        href: "/jwt-decoder", 
        icon: Key,
        description: "Decode and analyze JWT tokens"
      },
      { 
        name: "URL Parser", 
        href: "/url-parser", 
        icon: LinkIcon,
        description: "Parse and analyze URL components"
      },
    ]
  },
  {
    name: "Advanced Tools",
    icon: Wand2,
    description: "Specialized tools for advanced use cases",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    tools: [
      { 
        name: "Text Diff", 
        href: "/text-diff", 
        icon: Diff,
        description: "Compare text and highlight differences"
      },
      { 
        name: "Code Formatter", 
        href: "/code-formatter", 
        icon: Code,
        description: "Format and beautify code in various languages"
      },
      { 
        name: "HTML/CSS Playground", 
        href: "/html-css-playground", 
        icon: Code,
        description: "Write and test HTML/CSS code live"
      },
      { 
        name: "QR Code Generator", 
        href: "/qr-code-generator", 
        icon: QrCode,
        description: "Generate QR codes for text and URLs"
      },
      { 
        name: "SVG Generator", 
        href: "/svg-generator", 
        icon: Wand2,
        description: "Create and edit SVG graphics"
      },
      { 
        name: "Meme Generator", 
        href: "/meme-generator", 
        icon: Smile,
        description: "Create memes with custom text and images"
      },
      { 
        name: "Flow Notes", 
        href: "https://coming-soon-ten-roan.vercel.app/", 
        icon: NotebookPen,
        description: "Advanced note-taking and workflow management",
        external: true
      },
    ]
  }
]

// Flatten all tools for search
const allTools = toolCategories.flatMap(category => 
  category.tools.map(tool => ({
    ...tool,
    category: category.name,
    categoryColor: category.color
  }))
)

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"categories" | "list" | "icons">("categories")

  // Filter tools based on search query
  const filteredTools = searchQuery 
    ? allTools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allTools

  const filteredCategories = searchQuery
    ? toolCategories.map(category => ({
        ...category,
        tools: category.tools.filter(tool =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.tools.length > 0)
    : toolCategories

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Grid3X3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tools Explorer</h1>
            <p className="text-muted-foreground">
              Discover and access all DevKit Pro tools in one place
            </p>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "categories" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("categories")}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Categories
            </Button>
            <Button
              variant={viewMode === "icons" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("icons")}
              className="flex items-center gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Icons
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        </div>
      )}

      {/* Category View */}
      {viewMode === "categories" && (
        <div className="space-y-8">
          {filteredCategories.map((category) => {
            const CategoryIcon = category.icon
            return (
              <div key={category.name}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("p-2 rounded-lg", category.color)}>
                    <CategoryIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.tools.map((tool) => {
                    const ToolIcon = tool.icon
                    const isExternal = (tool as any).external
                    
                    const ToolCard = (
                      <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/20 cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                                <ToolIcon className="h-4 w-4 group-hover:text-primary transition-colors" />
                              </div>
                              <div>
                                <CardTitle className="text-base group-hover:text-primary transition-colors">
                                  {tool.name}
                                </CardTitle>
                              </div>
                            </div>
                            {isExternal && (
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                            {!isExternal && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-sm">
                            {tool.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    )

                    if (isExternal) {
                      return (
                        <a
                          key={tool.href}
                          href={tool.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {ToolCard}
                        </a>
                      )
                    }

                    return (
                      <Link key={tool.href} href={tool.href}>
                        {ToolCard}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Icon View */}
      {viewMode === "icons" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredTools.map((tool) => {
            const ToolIcon = tool.icon
            const isExternal = (tool as any).external
            
            const IconItem = (
              <div className="group flex flex-col items-center p-4 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer">
                <div className="relative mb-3">
                  <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors group-hover:scale-110 transform duration-200">
                    <ToolIcon className="h-6 w-6 group-hover:text-primary transition-colors" />
                  </div>
                  {isExternal && (
                    <div className="absolute -top-1 -right-1 p-1 bg-background rounded-full border shadow-sm">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {tool.category}
                  </p>
                </div>
              </div>
            )

            if (isExternal) {
              return (
                <a
                  key={tool.href}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${tool.name} - ${tool.description}`}
                >
                  {IconItem}
                </a>
              )
            }

            return (
              <Link 
                key={tool.href} 
                href={tool.href}
                title={`${tool.name} - ${tool.description}`}
              >
                {IconItem}
              </Link>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-2">
          {filteredTools.map((tool) => {
            const ToolIcon = tool.icon
            const isExternal = (tool as any).external
            
            const ToolItem = (
              <Card className="group hover:shadow-sm transition-all duration-200 hover:border-primary/20 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                        <ToolIcon className="h-4 w-4 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium group-hover:text-primary transition-colors">
                            {tool.name}
                          </h3>
                          <Badge variant="secondary" className={cn("text-xs", tool.categoryColor)}>
                            {tool.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExternal && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                      {!isExternal && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )

            if (isExternal) {
              return (
                <a
                  key={tool.href}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ToolItem}
                </a>
              )
            }

            return (
              <Link key={tool.href} href={tool.href}>
                {ToolItem}
              </Link>
            )
          })}
        </div>
      )}

      {/* No Results */}
      {searchQuery && filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No tools found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or browse all categories
          </p>
          <Button onClick={() => setSearchQuery("")} variant="outline">
            Clear Search
          </Button>
        </div>
      )}
    </div>
  )
}