"use client"

import { useState } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Download, Copy } from "lucide-react"
import { downloadFile } from "@/lib/utils"

const defaultMarkdown = `# Welcome to Markdown Editor

This is a **live** markdown editor with *real-time* preview.

## Features

- Live preview
- GitHub Flavored Markdown support
- Tables, code blocks, and more
- Export as markdown file

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Table Example

| Feature | Supported |
|---------|-----------|
| Tables | ✅ |
| Code | ✅ |
| Links | ✅ |

### Links and Lists

- [GitHub](https://github.com)
- [Markdown Guide](https://www.markdownguide.org)

> This is a blockquote. You can use it to highlight important information.

---

Happy writing! 🚀`

export default function MarkdownEditorPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown)

  const downloadMarkdown = () => {
    downloadFile(markdown, 'document.md', 'text/markdown')
  }

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
    } catch (err) {
      console.error('Failed to copy markdown: ', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Markdown Editor</h1>
          <p className="text-muted-foreground">
            Write markdown with live preview and GitHub Flavored Markdown support
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={copyMarkdown} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button onClick={downloadMarkdown}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Markdown Input</CardTitle>
            <CardDescription>
              Write your markdown here
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="h-full resize-none font-mono text-sm"
              placeholder="# Start writing markdown..."
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your markdown will look
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}