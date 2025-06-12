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
    </>
  )
}