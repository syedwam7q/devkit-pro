"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Type } from "lucide-react"
import { ToolLayout } from "@/components/tool-layout"

const formatOptions = [
  { name: "UPPERCASE", fn: (text: string) => text.toUpperCase() },
  { name: "lowercase", fn: (text: string) => text.toLowerCase() },
  { name: "Title Case", fn: (text: string) => text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) },
  { name: "camelCase", fn: (text: string) => text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '') },
  { name: "PascalCase", fn: (text: string) => text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '') },
  { name: "snake_case", fn: (text: string) => text.toLowerCase().replace(/\s+/g, '_') },
  { name: "kebab-case", fn: (text: string) => text.toLowerCase().replace(/\s+/g, '-') },
  { name: "CONSTANT_CASE", fn: (text: string) => text.toUpperCase().replace(/\s+/g, '_') },
]

export default function TextFormatterPage() {
  return (
    <ToolLayout>
      <TextFormatter />
    </ToolLayout>
  )
}

function TextFormatter() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("")

  const handleFormat = (formatFn: (text: string) => string, formatName: string) => {
    const formatted = formatFn(inputText)
    setOutputText(formatted)
    setSelectedFormat(formatName)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Type className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Text Formatter</h1>
          <p className="text-muted-foreground">
            Convert text between different cases and formats
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>
              Enter the text you want to format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted Output</CardTitle>
            <CardDescription>
              {selectedFormat ? `Formatted as ${selectedFormat}` : "Select a format to see the result"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={outputText}
                readOnly
                className="min-h-[200px]"
                placeholder="Formatted text will appear here..."
              />
              {outputText && (
                <Button onClick={copyToClipboard} className="w-full">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Format Options</CardTitle>
          <CardDescription>
            Choose how you want to format your text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {formatOptions.map((option) => (
              <Button
                key={option.name}
                variant={selectedFormat === option.name ? "default" : "outline"}
                onClick={() => handleFormat(option.fn, option.name)}
                disabled={!inputText.trim()}
                className="justify-start"
              >
                {option.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}