"use client"

import { CustomizableDashboard } from "@/components/customizable-dashboard"

// Define categories with string icon names instead of React components
const categories = [
  {
    title: "Text Tools",
    description: "Format text, count words, and edit markdown",
    icon: "Type",
    tools: ["Text Formatter", "Word Counter", "Markdown Editor"],
    href: "/text-formatter"
  },
  {
    title: "Image Tools", 
    description: "Resize, compress, manipulate images, and extract text",
    icon: "Image",
    tools: ["Image Resizer", "Image Compressor", "Color Picker", "Image Converter", "Image to Text"],
    href: "/image-resizer"
  },
  // Document Tools category removed - PDF Viewer moved to Developer Tools
  {
    title: "Developer Tools",
    description: "PDF viewer, JSON, CSV/Excel, API testing, and more developer utilities",
    icon: "Code",
    tools: ["PDF Viewer", "JSON Formatter", "CSV/Excel Viewer", "API Tester", "Regex Tester", "Password Generator", "Base64 Encoder", "UUID Generator", "JWT Decoder", "URL Parser"],
    href: "/pdf-viewer"
  },
  {
    title: "Advanced Tools",
    description: "Diff checker, code formatter, SVG and meme generators",
    icon: "Wand2",
    tools: ["Text Diff", "Code Formatter", "HTML/CSS Playground", "SVG Generator", "Meme Generator"],
    href: "/text-diff"
  }
]

export default function HomePage() {
  return (
    <>
      <CustomizableDashboard categories={categories} />
      
      <div className="border-t pt-8 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>
            <p>© {new Date().getFullYear()} DevKit Pro. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span>Developed by:</span>
              <a 
                href="https://my-portfolio-eight-rust-75.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 flex items-center hover:text-foreground transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                Syed Wamiq
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}