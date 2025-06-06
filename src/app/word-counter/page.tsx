"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Hash } from "lucide-react"

export default function WordCounterPage() {
  const [text, setText] = useState("")

  const stats = useMemo(() => {
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0
    const lines = text ? text.split('\n').length : 0

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines
    }
  }, [text])

  const statCards = [
    { label: "Characters", value: stats.characters, color: "text-blue-600" },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces, color: "text-green-600" },
    { label: "Words", value: stats.words, color: "text-purple-600" },
    { label: "Sentences", value: stats.sentences, color: "text-orange-600" },
    { label: "Paragraphs", value: stats.paragraphs, color: "text-red-600" },
    { label: "Lines", value: stats.lines, color: "text-indigo-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Hash className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Word Counter</h1>
          <p className="text-muted-foreground">
            Count words, characters, sentences, and paragraphs in your text
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Text Input</CardTitle>
          <CardDescription>
            Type or paste your text below to see live statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Start typing or paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[400px] resize-none"
          />
        </CardContent>
      </Card>

      {text && (
        <Card>
          <CardHeader>
            <CardTitle>Reading Time Estimate</CardTitle>
            <CardDescription>
              Based on average reading speed of 200 words per minute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg">
              <span className="font-semibold">
                {Math.ceil(stats.words / 200)} minute{Math.ceil(stats.words / 200) !== 1 ? 's' : ''}
              </span>
              <span className="text-muted-foreground ml-2">
                ({Math.round((stats.words / 200) * 60)} seconds)
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}