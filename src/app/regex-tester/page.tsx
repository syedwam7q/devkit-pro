"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Regex, Copy, BookOpen, Info } from "lucide-react"

const commonPatterns = [
  { name: "Email", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
  { name: "Phone (US)", pattern: "^\\+?1?[-.\\s]?\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$" },
  { name: "URL", pattern: "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$" },
  { name: "IPv4 Address", pattern: "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" },
  { name: "Credit Card", pattern: "^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$" },
  { name: "Date (YYYY-MM-DD)", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
  { name: "Time (HH:MM)", pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$" },
  { name: "Hex Color", pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
]

// Helper function to explain regex patterns
const explainRegex = (pattern: string): string[] => {
  if (!pattern) return [];
  
  const explanations: string[] = [];
  
  // Character classes
  if (pattern.includes('[0-9]') || pattern.includes('\\d')) 
    explanations.push('Matches any digit (0-9)');
  if (pattern.includes('[a-z]')) 
    explanations.push('Matches any lowercase letter (a-z)');
  if (pattern.includes('[A-Z]')) 
    explanations.push('Matches any uppercase letter (A-Z)');
  if (pattern.includes('[a-zA-Z]')) 
    explanations.push('Matches any letter (a-z, A-Z)');
  if (pattern.includes('\\w')) 
    explanations.push('Matches any word character (alphanumeric + underscore)');
  if (pattern.includes('\\s')) 
    explanations.push('Matches any whitespace character (space, tab, newline)');
  
  // Anchors
  if (pattern.includes('^')) 
    explanations.push('^ matches the start of the string');
  if (pattern.includes('$')) 
    explanations.push('$ matches the end of the string');
  
  // Quantifiers
  if (pattern.includes('*')) 
    explanations.push('* matches 0 or more of the preceding character/group');
  if (pattern.includes('+')) 
    explanations.push('+ matches 1 or more of the preceding character/group');
  if (pattern.includes('?')) 
    explanations.push('? matches 0 or 1 of the preceding character/group');
  if (pattern.match(/\{\d+,?\d*\}/)) 
    explanations.push('{n,m} matches between n and m of the preceding character/group');
  
  // Groups and alternation
  if (pattern.includes('(') && pattern.includes(')')) 
    explanations.push('(...) creates a capturing group');
  if (pattern.includes('|')) 
    explanations.push('| acts as an OR operator between alternatives');
  
  // Escapes
  if (pattern.includes('\\')) 
    explanations.push('\\x escapes a special character x or introduces a special sequence');
  
  return explanations;
};

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState("g")
  const [testString, setTestString] = useState("")
  const [error, setError] = useState("")
  const [showExplanation, setShowExplanation] = useState(false)

  const results = useMemo(() => {
    if (!pattern) {
      return { matches: [], isValid: true }
    }

    try {
      const regex = new RegExp(pattern, flags)
      
      // If there's no test string, just validate the regex
      if (!testString) {
        setError("")
        return { matches: [], isValid: true }
      }
      
      // Get all matches
      const matches = Array.from(testString.matchAll(regex))
      setError("")
      
      return {
        matches: matches.map((match, index) => ({
          index,
          match: match[0],
          groups: match.slice(1),
          start: match.index || 0,
          end: (match.index || 0) + match[0].length
        })),
        isValid: true
      }
    } catch (err) {
      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.message.includes('Invalid regular expression')) {
          // Extract the specific syntax error if available
          const errorMatch = err.message.match(/Invalid regular expression:(.+)/)
          if (errorMatch && errorMatch[1]) {
            setError(`Invalid regex: ${errorMatch[1].trim()}`)
          } else {
            setError(err.message)
          }
        } else {
          setError(err.message)
        }
      } else {
        setError("Invalid regex pattern")
      }
      
      return { matches: [], isValid: false }
    }
  }, [pattern, flags, testString])

  const highlightMatches = (text: string) => {
    if (!results.matches.length) return text

    // Sort matches by start position to handle them in order
    const sortedMatches = [...results.matches].sort((a, b) => a.start - b.start)
    
    // Create an array of segments to build the highlighted text
    const segments: { text: string; isMatch: boolean }[] = []
    let lastEnd = 0
    
    sortedMatches.forEach((match) => {
      // Add text before this match if there is any
      if (match.start > lastEnd) {
        segments.push({
          text: text.slice(lastEnd, match.start),
          isMatch: false
        })
      }
      
      // Add the matched text
      segments.push({
        text: text.slice(match.start, match.end),
        isMatch: true
      })
      
      lastEnd = match.end
    })
    
    // Add any remaining text after the last match
    if (lastEnd < text.length) {
      segments.push({
        text: text.slice(lastEnd),
        isMatch: false
      })
    }
    
    // Build the highlighted HTML
    return segments.map(segment => 
      segment.isMatch 
        ? `<mark class="bg-yellow-200 dark:bg-yellow-800">${segment.text}</mark>` 
        : segment.text
    ).join('')
  }

  const copyPattern = async () => {
    try {
      await navigator.clipboard.writeText(pattern)
    } catch (err) {
      console.error('Failed to copy pattern: ', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Regex className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Regex Tester</h1>
          <p className="text-muted-foreground">
            Test and debug regular expressions with live matching
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Regular Expression</CardTitle>
            <CardDescription>
              Enter your regex pattern and flags
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Pattern</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter regex pattern..."
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="font-mono"
                />
                <Button onClick={copyPattern} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Flags</label>
              <Input
                placeholder="g, i, m, s, u, y"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                g=global, i=ignoreCase, m=multiline, s=dotAll, u=unicode, y=sticky
              </p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {results.isValid && pattern && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex justify-between items-center">
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    ✅ Valid regex pattern
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="h-8 px-2"
                  >
                    <Info className="h-4 w-4 mr-1" />
                    {showExplanation ? "Hide" : "Explain"} Pattern
                  </Button>
                </div>
                
                {showExplanation && (
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      Pattern Explanation
                    </h4>
                    {explainRegex(pattern).length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300 space-y-1">
                        {explainRegex(pattern).map((explanation, i) => (
                          <li key={i}>{explanation}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-700 dark:text-green-300">
                        No specific explanation available for this pattern.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test String</CardTitle>
            <CardDescription>
              Enter text to test against your regex
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter test string here..."
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {results.matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matches ({results.matches.length})</CardTitle>
            <CardDescription>
              Found {results.matches.length} match{results.matches.length !== 1 ? 'es' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Highlighted Text</h4>
              <div 
                className="font-mono text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightMatches(testString) }}
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Match Details</h4>
              {results.matches.map((match) => (
                <div key={match.index} className="p-3 border rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Match:</span>
                      <code className="ml-1 px-1 bg-muted rounded">{match.match}</code>
                    </div>
                    <div>
                      <span className="font-medium">Position:</span>
                      <span className="ml-1">{match.start}-{match.end}</span>
                    </div>
                    <div>
                      <span className="font-medium">Length:</span>
                      <span className="ml-1">{match.match.length}</span>
                    </div>
                    {match.groups.length > 0 && (
                      <div>
                        <span className="font-medium">Groups:</span>
                        <span className="ml-1">{match.groups.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Common Patterns</CardTitle>
          <CardDescription>
            Click to use these common regex patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {commonPatterns.map((item) => (
              <Button
                key={item.name}
                variant="outline"
                onClick={() => setPattern(item.pattern)}
                className="justify-start h-auto p-3"
              >
                <div className="text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {item.pattern.slice(0, 20)}...
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}