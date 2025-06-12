import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Type,
  Image,
  Code,
  Wand2,
  ArrowRight
} from "lucide-react"

const categories = [
  {
    title: "Text Tools",
    description: "Format text, count words, and edit markdown",
    icon: Type,
    tools: ["Text Formatter", "Word Counter", "Markdown Editor"],
    href: "/text-formatter"
  },
  {
    title: "Image Tools", 
    description: "Resize, compress, and manipulate images",
    icon: Image,
    tools: ["Image Resizer", "Image Compressor", "Color Picker", "Image Converter"],
    href: "/image-resizer"
  },
  {
    title: "Developer Tools",
    description: "JSON, CSV/Excel, API testing, regex, encoding, and more",
    icon: Code,
    tools: ["JSON Formatter", "CSV/Excel Viewer", "API Tester", "Regex Tester", "Password Generator", "Base64 Encoder", "UUID Generator"],
    href: "/json-formatter"
  },
  {
    title: "Advanced Tools",
    description: "Diff checker, code formatter, HTML/CSS playground, QR codes, and generators",
    icon: Wand2,
    tools: ["Text Diff", "Code Formatter", "HTML/CSS Playground", "QR Code Generator", "SVG Generator", "Meme Generator"],
    href: "/text-diff"
  }
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to DevKit Pro
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your ultimate toolbox for development, design, and content creation. 
          Fast, free, and works entirely in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Card key={category.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {category.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                  <Link href={category.href}>
                    <Button className="w-full group">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
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
      
      <div className="border-t pt-8 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>
            <p>© {new Date().getFullYear()} DevKit Pro. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span>Developed by:</span>
              <a 
                href="https://github.com/syedwam7q" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 flex items-center hover:text-foreground transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                Syed Wamiq
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}