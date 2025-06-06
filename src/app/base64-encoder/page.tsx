"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Key, Copy, ArrowUpDown, Upload, Download } from "lucide-react"

export default function Base64EncoderPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [error, setError] = useState("")

  const encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
      setError("")
    } catch (err) {
      setError("Failed to encode: " + (err instanceof Error ? err.message : "Unknown error"))
      setOutput("")
    }
  }

  const decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)))
      setOutput(decoded)
      setError("")
    } catch (err) {
      setError("Failed to decode: Invalid Base64 string")
      setOutput("")
    }
  }

  const handleProcess = () => {
    if (mode === "encode") {
      encode()
    } else {
      decode()
    }
  }

  const swapInputOutput = () => {
    const temp = input
    setInput(output)
    setOutput(temp)
    setMode(mode === "encode" ? "decode" : "encode")
    setError("")
  }

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        if (mode === "encode") {
          // For text files, use the text content
          setInput(result)
        } else {
          // For decode mode, assume it's already base64
          setInput(result)
        }
      } else if (result instanceof ArrayBuffer) {
        // For binary files, convert to base64
        const bytes = new Uint8Array(result)
        const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('')
        const base64 = btoa(binary)
        if (mode === "encode") {
          setOutput(base64)
        } else {
          setInput(base64)
        }
      }
    }
    
    if (mode === "encode" && file.type.startsWith('text/')) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  }

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${mode}d_output.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Base64 Encoder/Decoder</h1>
          <p className="text-muted-foreground">
            Encode and decode text or files to/from Base64 format
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={mode === "encode" ? "default" : "outline"}
          onClick={() => setMode("encode")}
        >
          Encode
        </Button>
        <Button
          variant={mode === "decode" ? "default" : "outline"}
          onClick={() => setMode("decode")}
        >
          Decode
        </Button>
        <Button onClick={swapInputOutput} variant="outline">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Swap
        </Button>
        <Button onClick={handleProcess} disabled={!input.trim()}>
          {mode === "encode" ? "Encode" : "Decode"}
        </Button>
        {output && (
          <>
            <Button onClick={copyOutput} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button onClick={downloadOutput} variant="outline">
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
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
            </CardTitle>
            <CardDescription>
              {mode === "encode" 
                ? "Enter text or upload a file to encode to Base64"
                : "Enter Base64 encoded text to decode"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={mode === "encode" 
                ? "Enter text to encode..."
                : "Enter Base64 string to decode..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                variant="outline"
                size="sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <span className="text-sm text-muted-foreground">
                {mode === "encode" ? "Upload any file to encode" : "Upload Base64 file"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "encode" ? "Base64 Encoded" : "Decoded Text"}
            </CardTitle>
            <CardDescription>
              {mode === "encode" 
                ? "Base64 encoded result"
                : "Decoded text result"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              className="min-h-[300px] font-mono text-sm"
              placeholder={mode === "encode" 
                ? "Base64 encoded text will appear here..."
                : "Decoded text will appear here..."
              }
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Base64</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Base64</strong> is a binary-to-text encoding scheme that represents binary data 
            in an ASCII string format by translating it into a radix-64 representation.
          </p>
          <p>
            <strong>Common uses:</strong> Email attachments, data URLs, API tokens, 
            storing binary data in text-based formats like JSON or XML.
          </p>
          <p>
            <strong>Note:</strong> Base64 encoding increases the size of data by approximately 33%.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}