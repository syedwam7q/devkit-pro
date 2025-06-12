"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Play, Download, Copy, RotateCcw } from "lucide-react"
import { downloadFile } from "@/lib/utils"
import Editor from "@monaco-editor/react"

// Default code templates
const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML/CSS Playground</title>
</head>
<body>
  <div class="container">
    <h1>Hello, World!</h1>
    <p>This is a simple HTML/CSS playground.</p>
    <button class="btn">Click Me</button>
  </div>
</body>
</html>`

const defaultCss = `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
  margin: 0;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #0066cc;
  margin-top: 0;
}

.btn {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #0052a3;
}`

const defaultJs = `// Add your JavaScript code here
document.querySelector('.btn').addEventListener('click', function() {
  alert('Button clicked!');
});

// You can also modify elements
// document.querySelector('h1').style.color = 'purple';
`

export default function HtmlCssPlaygroundPage() {
  const [html, setHtml] = useState(defaultHtml)
  const [css, setCss] = useState(defaultCss)
  const [js, setJs] = useState(defaultJs)
  const [output, setOutput] = useState("")
  const [activeTab, setActiveTab] = useState("html")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [editorTheme, setEditorTheme] = useState("vs-dark")

  // Generate output HTML with embedded CSS and JS
  const generateOutput = () => {
    // Extract the body content from the HTML
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    const headMatch = html.match(/<head[^>]*>([\s\S]*)<\/head>/i)
    
    const bodyContent = bodyMatch ? bodyMatch[1] : html
    const headContent = headMatch ? headMatch[1] : ""
    
    const outputHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${css}</style>
        ${headContent}
      </head>
      <body>
        ${bodyContent}
        <script>${js}</script>
      </body>
      </html>
    `
    
    setOutput(outputHtml)
    
    // Update iframe content
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(outputHtml)
        iframeDoc.close()
      }
    }
  }

  // Auto-refresh when code changes
  useEffect(() => {
    if (autoRefresh) {
      const timer = setTimeout(() => {
        generateOutput()
      }, 1000) // Debounce for 1 second
      
      return () => clearTimeout(timer)
    }
  }, [html, css, js, autoRefresh])

  // Initial render
  useEffect(() => {
    generateOutput()
  }, [])

  // Reset to defaults
  const resetToDefaults = () => {
    setHtml(defaultHtml)
    setCss(defaultCss)
    setJs(defaultJs)
  }

  // Download as HTML file
  const downloadHtml = () => {
    downloadFile(output, "playground.html", "text/html")
  }

  // Copy HTML to clipboard
  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(output)
    } catch (err) {
      console.error("Failed to copy HTML: ", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Code className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">HTML/CSS Playground</h1>
          <p className="text-muted-foreground">
            Live preview of HTML, CSS, and JavaScript code
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={generateOutput} variant="default">
          <Play className="mr-2 h-4 w-4" />
          Run
        </Button>
        <Button onClick={downloadHtml} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download HTML
        </Button>
        <Button onClick={copyHtml} variant="outline">
          <Copy className="mr-2 h-4 w-4" />
          Copy HTML
        </Button>
        <Button onClick={resetToDefaults} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <div className="flex items-center ml-auto">
          <input
            type="checkbox"
            id="autoRefresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="autoRefresh" className="text-sm">Auto-refresh</label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor Section */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Code Editor</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="js">JavaScript</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] border-t">
              <TabsContent value="html" className="h-full m-0">
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  value={html}
                  onChange={(value) => setHtml(value || "")}
                  theme={editorTheme}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                  }}
                />
              </TabsContent>
              <TabsContent value="css" className="h-full m-0">
                <Editor
                  height="100%"
                  defaultLanguage="css"
                  value={css}
                  onChange={(value) => setCss(value || "")}
                  theme={editorTheme}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                  }}
                />
              </TabsContent>
              <TabsContent value="js" className="h-full m-0">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  value={js}
                  onChange={(value) => setJs(value || "")}
                  theme={editorTheme}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                  }}
                />
              </TabsContent>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Live preview of your HTML, CSS, and JavaScript
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t h-[500px] overflow-hidden">
              <iframe
                ref={iframeRef}
                title="HTML Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tips & Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">HTML Tips</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use semantic tags like <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code></li>
                <li>Add <code>class</code> attributes for styling</li>
                <li>Use <code>&lt;div&gt;</code> for grouping elements</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">CSS Tips</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use <code>class</code> selectors for styling</li>
                <li>Try <code>display: flex</code> for layouts</li>
                <li>Use <code>:hover</code> for interactive elements</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">JavaScript Tips</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use <code>querySelector()</code> to select elements</li>
                <li>Add event listeners for interactivity</li>
                <li>Use <code>console.log()</code> for debugging</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}