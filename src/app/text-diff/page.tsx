"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Diff, Copy, RotateCcw } from "lucide-react"

interface DiffResult {
  type: 'equal' | 'insert' | 'delete'
  text: string
}

// Simple diff algorithm (Myers' algorithm simplified)
function computeDiff(text1: string, text2: string): DiffResult[] {
  const lines1 = text1.split('\n')
  const lines2 = text2.split('\n')
  
  const result: DiffResult[] = []
  let i = 0, j = 0
  
  while (i < lines1.length || j < lines2.length) {
    if (i >= lines1.length) {
      // Only text2 lines remaining
      result.push({ type: 'insert', text: lines2[j] })
      j++
    } else if (j >= lines2.length) {
      // Only text1 lines remaining
      result.push({ type: 'delete', text: lines1[i] })
      i++
    } else if (lines1[i] === lines2[j]) {
      // Lines are equal
      result.push({ type: 'equal', text: lines1[i] })
      i++
      j++
    } else {
      // Lines are different - look ahead to find best match
      let found = false
      
      // Look for line1[i] in upcoming lines2
      for (let k = j + 1; k < Math.min(j + 5, lines2.length); k++) {
        if (lines1[i] === lines2[k]) {
          // Found match, insert lines2[j] to lines2[k-1]
          for (let l = j; l < k; l++) {
            result.push({ type: 'insert', text: lines2[l] })
          }
          result.push({ type: 'equal', text: lines1[i] })
          i++
          j = k + 1
          found = true
          break
        }
      }
      
      if (!found) {
        // Look for line2[j] in upcoming lines1
        for (let k = i + 1; k < Math.min(i + 5, lines1.length); k++) {
          if (lines2[j] === lines1[k]) {
            // Found match, delete lines1[i] to lines1[k-1]
            for (let l = i; l < k; l++) {
              result.push({ type: 'delete', text: lines1[l] })
            }
            result.push({ type: 'equal', text: lines2[j] })
            i = k + 1
            j++
            found = true
            break
          }
        }
      }
      
      if (!found) {
        // No match found, treat as replacement
        result.push({ type: 'delete', text: lines1[i] })
        result.push({ type: 'insert', text: lines2[j] })
        i++
        j++
      }
    }
  }
  
  return result
}

export default function TextDiffPage() {
  const [text1, setText1] = useState("")
  const [text2, setText2] = useState("")
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side")

  const diffResult = useMemo(() => {
    if (!text1 && !text2) return []
    return computeDiff(text1, text2)
  }, [text1, text2])

  const stats = useMemo(() => {
    const additions = diffResult.filter(d => d.type === 'insert').length
    const deletions = diffResult.filter(d => d.type === 'delete').length
    const unchanged = diffResult.filter(d => d.type === 'equal').length
    
    return { additions, deletions, unchanged }
  }, [diffResult])

  const copyDiff = async () => {
    const diffText = diffResult.map(diff => {
      switch (diff.type) {
        case 'insert': return `+ ${diff.text}`
        case 'delete': return `- ${diff.text}`
        case 'equal': return `  ${diff.text}`
      }
    }).join('\n')
    
    try {
      await navigator.clipboard.writeText(diffText)
    } catch (err) {
      console.error('Failed to copy diff: ', err)
    }
  }

  const swapTexts = () => {
    const temp = text1
    setText1(text2)
    setText2(temp)
  }

  const clearAll = () => {
    setText1("")
    setText2("")
  }

  const renderSideBySide = () => {
    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    const maxLines = Math.max(lines1.length, lines2.length)
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Original Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
              {Array.from({ length: maxLines }, (_, i) => {
                const line = lines1[i] || ""
                const isDeleted = diffResult.some(d => d.type === 'delete' && d.text === line)
                return (
                  <div
                    key={i}
                    className={`px-2 py-1 ${isDeleted ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' : ''}`}
                  >
                    <span className="text-muted-foreground mr-2 select-none">{i + 1}</span>
                    {line || '\u00A0'}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Modified Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
              {Array.from({ length: maxLines }, (_, i) => {
                const line = lines2[i] || ""
                const isAdded = diffResult.some(d => d.type === 'insert' && d.text === line)
                return (
                  <div
                    key={i}
                    className={`px-2 py-1 ${isAdded ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : ''}`}
                  >
                    <span className="text-muted-foreground mr-2 select-none">{i + 1}</span>
                    {line || '\u00A0'}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderUnified = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Unified Diff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
            {diffResult.map((diff, index) => (
              <div
                key={index}
                className={`px-2 py-1 ${
                  diff.type === 'insert' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                    : diff.type === 'delete'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    : ''
                }`}
              >
                <span className="mr-2 select-none">
                  {diff.type === 'insert' ? '+' : diff.type === 'delete' ? '-' : ' '}
                </span>
                {diff.text || '\u00A0'}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Diff className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Text Diff Checker</h1>
          <p className="text-muted-foreground">
            Compare two texts and see the differences line by line
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={viewMode === "side-by-side" ? "default" : "outline"}
          onClick={() => setViewMode("side-by-side")}
        >
          Side by Side
        </Button>
        <Button
          variant={viewMode === "unified" ? "default" : "outline"}
          onClick={() => setViewMode("unified")}
        >
          Unified View
        </Button>
        <Button onClick={swapTexts} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          Swap Texts
        </Button>
        {diffResult.length > 0 && (
          <Button onClick={copyDiff} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy Diff
          </Button>
        )}
        <Button onClick={clearAll} variant="destructive">
          Clear All
        </Button>
      </div>

      {diffResult.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Diff Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.additions}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Additions</div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.deletions}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Deletions</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{stats.unchanged}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Unchanged</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Original Text</CardTitle>
            <CardDescription>
              Enter the original text to compare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter original text here..."
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modified Text</CardTitle>
            <CardDescription>
              Enter the modified text to compare against
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter modified text here..."
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {diffResult.length > 0 && (
        <div>
          {viewMode === "side-by-side" ? renderSideBySide() : renderUnified()}
        </div>
      )}
    </div>
  )
}