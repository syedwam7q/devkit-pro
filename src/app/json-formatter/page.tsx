"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Code, Copy, Download, Minimize, Maximize } from "lucide-react"
import { downloadFile } from "@/lib/utils"

export default function JsonFormatterPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)

  const formatJson = (indent: number = 2) => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indent)
      setOutput(formatted)
      setError("")
      setIsValid(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      setOutput("")
      setIsValid(false)
    }
  }

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError("")
      setIsValid(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      setOutput("")
      setIsValid(false)
    }
  }

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output)
    } catch (err) {
      console.error('Failed to copy JSON: ', err)
    }
  }

  const downloadJson = () => {
    downloadFile(output, 'formatted.json', 'application/json')
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setError("")
    setIsValid(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Code className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">JSON Formatter & Validator</h1>
          <p className="text-muted-foreground">
            Format, validate, and beautify JSON data
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => formatJson(2)} disabled={!input.trim()}>
          <Maximize className="mr-2 h-4 w-4" />
          Format (2 spaces)
        </Button>
        <Button onClick={() => formatJson(4)} disabled={!input.trim()} variant="outline">
          Format (4 spaces)
        </Button>
        <Button onClick={minifyJson} disabled={!input.trim()} variant="outline">
          <Minimize className="mr-2 h-4 w-4" />
          Minify
        </Button>
        {output && (
          <>
            <Button onClick={copyOutput} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button onClick={downloadJson} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </>
        )}
        <Button onClick={clearAll} variant="destructive">
          Clear All
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">JSON Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {isValid && (
        <Card className="border-green-500">
          <CardContent className="pt-6">
            <p className="text-green-600 font-medium">✅ Valid JSON</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>JSON Input</CardTitle>
            <CardDescription>
              Paste your JSON data here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder='{"name": "John", "age": 30, "city": "New York"}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted Output</CardTitle>
            <CardDescription>
              Formatted and validated JSON will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              className="min-h-[400px] font-mono text-sm"
              placeholder="Formatted JSON will appear here..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}