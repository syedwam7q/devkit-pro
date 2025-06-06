"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Hash, Copy, RefreshCw, Download } from "lucide-react"

// UUID v4 generator
function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// UUID v1 generator (timestamp-based)
function generateUUIDv1(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(16).substring(2, 15)
  const clockSeq = Math.random().toString(16).substring(2, 6)
  const node = Math.random().toString(16).substring(2, 14)
  
  const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0')
  const timeMid = ((timestamp >> 32) & 0xffff).toString(16).padStart(4, '0')
  const timeHigh = (((timestamp >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0')
  
  return `${timeLow}-${timeMid}-${timeHigh}-${clockSeq}-${node}`
}

// Nil UUID
const NIL_UUID = "00000000-0000-0000-0000-000000000000"

// Max UUID
const MAX_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff"

export default function UUIDGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(1)
  const [version, setVersion] = useState<"v1" | "v4" | "nil" | "max">("v4")

  const generateUUIDs = () => {
    const newUuids: string[] = []
    
    for (let i = 0; i < count; i++) {
      switch (version) {
        case "v1":
          newUuids.push(generateUUIDv1())
          break
        case "v4":
          newUuids.push(generateUUIDv4())
          break
        case "nil":
          newUuids.push(NIL_UUID)
          break
        case "max":
          newUuids.push(MAX_UUID)
          break
      }
    }
    
    setUuids(newUuids)
  }

  const copyUUID = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid)
    } catch (err) {
      console.error('Failed to copy UUID: ', err)
    }
  }

  const copyAllUUIDs = async () => {
    try {
      await navigator.clipboard.writeText(uuids.join('\n'))
    } catch (err) {
      console.error('Failed to copy UUIDs: ', err)
    }
  }

  const downloadUUIDs = () => {
    const content = uuids.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `uuids_${version}_${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const nilRegex = /^00000000-0000-0000-0000-000000000000$/
    const maxRegex = /^ffffffff-ffff-ffff-ffff-ffffffffffff$/i
    
    return uuidRegex.test(uuid) || nilRegex.test(uuid) || maxRegex.test(uuid)
  }

  const getUUIDVersion = (uuid: string): string => {
    if (uuid === NIL_UUID) return "Nil"
    if (uuid.toLowerCase() === MAX_UUID) return "Max"
    
    const versionChar = uuid.charAt(14)
    switch (versionChar) {
      case '1': return "v1 (Timestamp)"
      case '2': return "v2 (DCE Security)"
      case '3': return "v3 (MD5 Hash)"
      case '4': return "v4 (Random)"
      case '5': return "v5 (SHA-1 Hash)"
      default: return "Unknown"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Hash className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">UUID Generator</h1>
          <p className="text-muted-foreground">
            Generate universally unique identifiers (UUIDs) in various formats
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generator Settings</CardTitle>
          <CardDescription>
            Configure UUID generation options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">UUID Version</label>
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="v4">Version 4 (Random)</option>
                <option value="v1">Version 1 (Timestamp)</option>
                <option value="nil">Nil UUID</option>
                <option value="max">Max UUID</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Count</label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value))))}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={generateUUIDs} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {version === "v4" && "Version 4 UUIDs are randomly generated and provide the best uniqueness guarantees."}
            {version === "v1" && "Version 1 UUIDs are based on timestamp and MAC address (simulated)."}
            {version === "nil" && "Nil UUID is a special UUID with all bits set to zero."}
            {version === "max" && "Max UUID is a special UUID with all bits set to one."}
          </div>
        </CardContent>
      </Card>

      {uuids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated UUIDs ({uuids.length})</CardTitle>
            <CardDescription>
              Click on any UUID to copy it to clipboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={copyAllUUIDs} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>
              <Button onClick={downloadUUIDs} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uuids.map((uuid, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer group"
                  onClick={() => copyUUID(uuid)}
                >
                  <div className="flex-1">
                    <code className="font-mono text-sm">{uuid}</code>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getUUIDVersion(uuid)} • Valid: {validateUUID(uuid) ? "✅" : "❌"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyUUID(uuid)
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>UUID Validator</CardTitle>
          <CardDescription>
            Validate and analyze existing UUIDs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UUIDValidator />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About UUIDs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>UUID (Universally Unique Identifier)</strong> is a 128-bit identifier 
            used to uniquely identify information in computer systems.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-medium text-foreground">Version 1 (Timestamp)</h4>
              <p>Based on timestamp and MAC address. Provides temporal ordering.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground">Version 4 (Random)</h4>
              <p>Randomly generated. Most commonly used due to privacy and simplicity.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UUIDValidator() {
  const [inputUUID, setInputUUID] = useState("")
  
  const isValid = inputUUID ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(inputUUID) || 
                              inputUUID === "00000000-0000-0000-0000-000000000000" ||
                              inputUUID.toLowerCase() === "ffffffff-ffff-ffff-ffff-ffffffffffff" : null

  const getVersion = (uuid: string): string => {
    if (uuid === "00000000-0000-0000-0000-000000000000") return "Nil UUID"
    if (uuid.toLowerCase() === "ffffffff-ffff-ffff-ffff-ffffffffffff") return "Max UUID"
    
    const versionChar = uuid.charAt(14)
    switch (versionChar) {
      case '1': return "Version 1 (Timestamp-based)"
      case '2': return "Version 2 (DCE Security)"
      case '3': return "Version 3 (MD5 Hash)"
      case '4': return "Version 4 (Random)"
      case '5': return "Version 5 (SHA-1 Hash)"
      default: return "Unknown version"
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Enter UUID to validate (e.g., 550e8400-e29b-41d4-a716-446655440000)"
        value={inputUUID}
        onChange={(e) => setInputUUID(e.target.value)}
        className="font-mono"
      />
      
      {inputUUID && (
        <div className={`p-3 rounded-lg border ${isValid ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
          <div className="flex items-center gap-2">
            <span className={isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
              {isValid ? '✅ Valid UUID' : '❌ Invalid UUID'}
            </span>
          </div>
          {isValid && (
            <div className="mt-2 text-sm text-muted-foreground">
              <p><strong>Type:</strong> {getVersion(inputUUID)}</p>
              <p><strong>Format:</strong> Standard UUID format (8-4-4-4-12)</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}