"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Copy, Download, Upload } from "lucide-react"
import { downloadFile } from "@/lib/utils"

// Import Monaco Editor dynamically
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse rounded" />
})

const languages = [
  { value: 'javascript', label: 'JavaScript', extension: '.js' },
  { value: 'typescript', label: 'TypeScript', extension: '.ts' },
  { value: 'python', label: 'Python', extension: '.py' },
  { value: 'java', label: 'Java', extension: '.java' },
  { value: 'csharp', label: 'C#', extension: '.cs' },
  { value: 'cpp', label: 'C++', extension: '.cpp' },
  { value: 'html', label: 'HTML', extension: '.html' },
  { value: 'css', label: 'CSS', extension: '.css' },
  { value: 'json', label: 'JSON', extension: '.json' },
  { value: 'xml', label: 'XML', extension: '.xml' },
  { value: 'sql', label: 'SQL', extension: '.sql' },
  { value: 'php', label: 'PHP', extension: '.php' },
  { value: 'go', label: 'Go', extension: '.go' },
  { value: 'rust', label: 'Rust', extension: '.rs' },
  { value: 'yaml', label: 'YAML', extension: '.yml' },
]

// Format code using Monaco Editor's formatting capabilities when available
// and fall back to simple formatters for other languages
const formatCode = (code: string, language: string): string => {
  // Don't try to format empty code
  if (!code.trim()) {
    return code;
  }

  switch (language) {
    case 'json':
      try {
        return JSON.stringify(JSON.parse(code), null, 2)
      } catch (e) {
        throw new Error(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`)
      }
    
    case 'javascript':
    case 'typescript':
      try {
        // Basic JS/TS formatter that handles indentation and semicolons
        return formatJavaScript(code)
      } catch {
        return code
      }
    
    case 'xml':
    case 'html':
      // Simple XML/HTML formatter
      try {
        return code
          .replace(/></g, '>\n<')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map((line, index, array) => {
            const depth = getXMLDepth(array.slice(0, index))
            return '  '.repeat(depth) + line
          })
          .join('\n')
      } catch {
        return code
      }
    
    case 'css':
      // Simple CSS formatter
      try {
        return code
          .replace(/\{/g, ' {\n')
          .replace(/\}/g, '\n}\n')
          .replace(/;/g, ';\n')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            if (line.includes('{') || line.includes('}')) {
              return line
            }
            return '  ' + line
          })
          .join('\n')
      } catch {
        return code
      }
    
    case 'python':
      try {
        // Basic Python formatter
        return formatPython(code)
      } catch {
        return code
      }
    
    default:
      // For other languages, just do basic indentation
      try {
        return code
          .split('\n')
          .map(line => line.trim())
          .join('\n')
      } catch {
        return code
      }
  }
}

// Basic JavaScript/TypeScript formatter
const formatJavaScript = (code: string): string => {
  let formatted = '';
  let indentLevel = 0;
  const lines = code.split(/\r?\n/);
  
  for (let line of lines) {
    line = line.trim();
    if (!line) {
      formatted += '\n';
      continue;
    }
    
    // Decrease indent for closing braces/brackets
    if (line.startsWith('}') || line.startsWith(')') || line.startsWith(']')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    // Add the line with proper indentation
    formatted += '  '.repeat(indentLevel) + line + '\n';
    
    // Increase indent for opening braces/brackets
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/\]/g) || []).length;
    
    // Only increase indent if there are more opening than closing braces on this line
    indentLevel += (openBraces - closeBraces) + (openParens - closeParens) + (openBrackets - closeBrackets);
    indentLevel = Math.max(0, indentLevel);
  }
  
  return formatted.trim();
}

// Basic Python formatter
const formatPython = (code: string): string => {
  let formatted = '';
  let indentLevel = 0;
  const lines = code.split(/\r?\n/);
  
  for (let line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      formatted += '\n';
      continue;
    }
    
    // Check for dedent keywords
    if (trimmedLine.startsWith('else:') || 
        trimmedLine.startsWith('elif ') || 
        trimmedLine.startsWith('except') || 
        trimmedLine.startsWith('finally:')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    // Add the line with proper indentation
    formatted += '    '.repeat(indentLevel) + trimmedLine + '\n';
    
    // Check for indent keywords
    if (trimmedLine.endsWith(':')) {
      indentLevel += 1;
    }
  }
  
  return formatted.trim();
}

const getXMLDepth = (lines: string[]): number => {
  let depth = 0
  for (const line of lines) {
    const openTags = (line.match(/</g) || []).length
    const closeTags = (line.match(/>/g) || []).length
    const selfClosing = (line.match(/\/>/g) || []).length
    depth += openTags - closeTags - selfClosing
  }
  return Math.max(0, depth)
}

// Example code snippets for different languages
const exampleSnippets = {
  javascript: `// Unformatted JavaScript example
function calculateTotal(items) {
const total = items.reduce((acc, item) => {
return acc + item.price * item.quantity;
}, 0);
return total.toFixed(2);
}

const items = [
{name: "Widget", price: 9.99, quantity: 2},
{name: "Gadget", price: 14.95, quantity: 1}
];

console.log(\`Total: $\${calculateTotal(items)}\`);`,

  python: `# Unformatted Python example
def calculate_total(items):
    total = 0
    for item in items:
        total += item['price'] * item['quantity']
    return round(total, 2)

items = [
{'name': 'Widget', 'price': 9.99, 'quantity': 2},
{'name': 'Gadget', 'price': 14.95, 'quantity': 1}
]

print("Total: $" + str(calculate_total(items)))`,

  json: `{"name":"DevKit Pro","version":"1.1.0","description":"A collection of developer tools","tools":[{"id":1,"name":"Code Formatter","category":"Developer Tools"},{"id":2,"name":"JSON Formatter","category":"Developer Tools"},{"id":3,"name":"Image Resizer","category":"Image Tools"}],"settings":{"theme":"dark","language":"en"}}`,

  html: `<!DOCTYPE html><html><head><title>DevKit Pro</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="styles.css"></head><body><header><h1>DevKit Pro</h1><nav><ul><li><a href="/">Home</a></li><li><a href="/tools">Tools</a></li><li><a href="/about">About</a></li></ul></nav></header><main><section><h2>Welcome to DevKit Pro</h2><p>Your ultimate toolbox for development, design, and content creation.</p></section></main><footer><p>&copy; 2023 DevKit Pro</p></footer></body></html>`,

  css: `body{font-family:Arial,sans-serif;margin:0;padding:0;line-height:1.6;}header{background-color:#333;color:white;padding:1rem;text-align:center;}nav ul{list-style:none;display:flex;justify-content:center;}nav ul li{margin:0 1rem;}nav a{color:white;text-decoration:none;}main{max-width:1200px;margin:0 auto;padding:1rem;}footer{background-color:#333;color:white;text-align:center;padding:1rem;margin-top:2rem;}`,

  sql: `SELECT p.product_name, c.category_name, p.price, p.stock_quantity
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.price > 10.00
AND p.stock_quantity > 0
ORDER BY p.price DESC
LIMIT 10;`
};

export default function CodeFormatterPage() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [formattedCode, setFormattedCode] = useState("")
  const [error, setError] = useState("")
  const [isFormatting, setIsFormatting] = useState(false)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load example snippet when language changes
  useEffect(() => {
    if (!code || code === exampleSnippets[language as keyof typeof exampleSnippets]) {
      const snippet = exampleSnippets[language as keyof typeof exampleSnippets];
      if (snippet) {
        setCode(snippet);
        setFormattedCode("");
        setError("");
      }
    }
  }, [language]);

  const handleFormat = () => {
    if (!code.trim()) {
      setError("Please enter some code to format");
      return;
    }

    setIsFormatting(true);
    setError("");
    
    // Use setTimeout to allow UI to update before potentially heavy formatting
    setTimeout(() => {
      try {
        const formatted = formatCode(code, language);
        setFormattedCode(formatted);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to format code");
        setFormattedCode("");
      } finally {
        setIsFormatting(false);
      }
    }, 10);
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCode(content)
      setFormattedCode("")
      setError("")
      
      // Auto-detect language from file extension
      const extension = file.name.split('.').pop()?.toLowerCase()
      const detectedLang = languages.find(lang => 
        lang.extension.slice(1) === extension
      )
      if (detectedLang) {
        setLanguage(detectedLang.value)
      }
    }
    reader.readAsText(file)
  }

  const copyCode = async (codeText: string, type: 'input' | 'output') => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopySuccess(type === 'input' ? 'input' : 'output')
      
      // Clear the success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(null)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
      setCopySuccess(null)
    }
  }

  const downloadCode = (codeText: string) => {
    const selectedLang = languages.find(lang => lang.value === language)
    const extension = selectedLang?.extension || '.txt'
    downloadFile(codeText, `formatted_code${extension}`, 'text/plain')
  }

  const clearAll = () => {
    setCode("")
    setFormattedCode("")
    setError("")
  }
  
  const loadExample = () => {
    const snippet = exampleSnippets[language as keyof typeof exampleSnippets];
    if (snippet) {
      setCode(snippet);
      setFormattedCode("");
      setError("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Code className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Code Formatter</h1>
          <p className="text-muted-foreground">
            Format and beautify code in multiple programming languages
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formatter Settings</CardTitle>
          <CardDescription>
            Choose the programming language and upload or paste your code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <label className="text-sm font-medium">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end gap-2 flex-wrap">
              <Button onClick={loadExample} variant="outline">
                <Code className="mr-2 h-4 w-4" />
                Load Example
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <Button 
                onClick={handleFormat} 
                disabled={!code.trim() || isFormatting}
                className={isFormatting ? "opacity-80" : ""}
              >
                {isFormatting ? "Formatting..." : "Format Code"}
              </Button>
              <Button onClick={clearAll} variant="destructive">
                Clear All
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".js,.ts,.py,.java,.cs,.cpp,.html,.css,.json,.xml,.sql,.php,.go,.rs,.yml,.yaml"
            onChange={handleFileUpload}
            className="hidden"
          />

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Code</CardTitle>
            <CardDescription>
              Paste or upload your code to format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <MonacoEditor
                height="400px"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => copyCode(code, 'input')} 
                  variant="outline" 
                  size="sm"
                  className={copySuccess === 'input' ? "bg-green-100 dark:bg-green-900" : ""}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copySuccess === 'input' ? "Copied!" : "Copy"}
                </Button>
                <Button onClick={() => downloadCode(code)} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted Code</CardTitle>
            <CardDescription>
              Formatted and beautified code will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <MonacoEditor
                height="400px"
                language={language}
                value={formattedCode}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
              {formattedCode && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => copyCode(formattedCode, 'output')} 
                    variant="outline" 
                    size="sm"
                    className={copySuccess === 'output' ? "bg-green-100 dark:bg-green-900" : ""}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copySuccess === 'output' ? "Copied!" : "Copy"}
                  </Button>
                  <Button onClick={() => downloadCode(formattedCode)} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supported Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {languages.map((lang) => (
              <div
                key={lang.value}
                className="p-2 text-center text-sm bg-muted rounded cursor-pointer hover:bg-muted/80"
                onClick={() => setLanguage(lang.value)}
              >
                {lang.label}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Note: Advanced formatting features are available for JavaScript, TypeScript, JSON, and other languages 
            supported by Monaco Editor. Basic formatting is provided for other languages.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}