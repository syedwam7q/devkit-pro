"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link, Copy, Trash, Plus, X, Globe, AlertCircle } from "lucide-react"

interface ParsedUrl {
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  host: string
  username: string
  password: string
}

interface QueryParam {
  key: string
  value: string
}

export default function UrlParserPage() {
  const [url, setUrl] = useState("")
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null)
  const [queryParams, setQueryParams] = useState<QueryParam[]>([])
  const [error, setError] = useState<string | null>(null)
  const [urlHistory, setUrlHistory] = useState<string[]>([])
  const [newUrl, setNewUrl] = useState<ParsedUrl | null>(null)
  const [newQueryParams, setNewQueryParams] = useState<QueryParam[]>([])
  const [activeTab, setActiveTab] = useState("parse")

  // Load URL history from localStorage on component mount
  useEffect(() => {
    const savedUrls = localStorage.getItem('urlHistory')
    if (savedUrls) {
      try {
        setUrlHistory(JSON.parse(savedUrls))
      } catch (e) {
        console.error('Failed to load URL history', e)
      }
    }
  }, [])

  // Save URL history to localStorage when it changes
  useEffect(() => {
    if (urlHistory.length > 0) {
      localStorage.setItem('urlHistory', JSON.stringify(urlHistory))
    }
  }, [urlHistory])

  // Initialize the builder with the parsed URL when switching tabs
  useEffect(() => {
    if (activeTab === "build" && parsedUrl) {
      setNewUrl(parsedUrl)
      setNewQueryParams(queryParams)
    }
  }, [activeTab, parsedUrl, queryParams])

  const parseUrl = (urlToParse: string = url) => {
    setError(null)
    
    if (!urlToParse.trim()) {
      setError("Please enter a URL")
      return
    }
    
    try {
      // Add protocol if missing
      let normalizedUrl = urlToParse
      if (!normalizedUrl.match(/^[a-zA-Z]+:\/\//)) {
        normalizedUrl = "https://" + normalizedUrl
      }
      
      const urlObj = new URL(normalizedUrl)
      
      // Extract URL parts
      const parsed: ParsedUrl = {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        origin: urlObj.origin,
        host: urlObj.host,
        username: urlObj.username,
        password: urlObj.password
      }
      
      setParsedUrl(parsed)
      
      // Parse query parameters
      const params: QueryParam[] = []
      urlObj.searchParams.forEach((value, key) => {
        params.push({ key, value })
      })
      setQueryParams(params)
      
      // Add to history if not already there
      if (!urlHistory.includes(urlToParse)) {
        setUrlHistory(prev => [urlToParse, ...prev].slice(0, 10))
      }
      
      setUrl(urlToParse)
    } catch (err) {
      console.error('Error parsing URL:', err)
      setError("Failed to parse URL. Please check if the URL is valid.")
      setParsedUrl(null)
      setQueryParams([])
    }
  }

  const clearUrl = () => {
    setUrl("")
    setParsedUrl(null)
    setQueryParams([])
    setError(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy: ', err))
  }

  const removeFromHistory = (urlToRemove: string) => {
    setUrlHistory(prev => prev.filter(u => u !== urlToRemove))
  }

  const clearHistory = () => {
    setUrlHistory([])
    localStorage.removeItem('urlHistory')
  }

  const handleQueryParamChange = (index: number, field: 'key' | 'value', value: string) => {
    setNewQueryParams(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addQueryParam = () => {
    setNewQueryParams(prev => [...prev, { key: '', value: '' }])
  }

  const removeQueryParam = (index: number) => {
    setNewQueryParams(prev => prev.filter((_, i) => i !== index))
  }

  const handleUrlPartChange = (part: keyof ParsedUrl, value: string) => {
    if (newUrl) {
      setNewUrl(prev => ({ ...prev!, [part]: value }))
    }
  }

  const buildUrl = () => {
    if (!newUrl) return ""
    
    try {
      // Start with the protocol and hostname
      let protocol = newUrl.protocol
      if (!protocol.endsWith(':')) protocol += ':'
      
      let builtUrl = `${protocol}//${newUrl.hostname}`
      
      // Add port if present
      if (newUrl.port) {
        builtUrl += `:${newUrl.port}`
      }
      
      // Add pathname
      let pathname = newUrl.pathname
      if (pathname && !pathname.startsWith('/')) {
        pathname = '/' + pathname
      }
      builtUrl += pathname
      
      // Add query parameters
      if (newQueryParams.length > 0) {
        const searchParams = new URLSearchParams()
        newQueryParams.forEach(param => {
          if (param.key) {
            searchParams.append(param.key, param.value)
          }
        })
        const searchString = searchParams.toString()
        if (searchString) {
          builtUrl += `?${searchString}`
        }
      }
      
      // Add hash
      if (newUrl.hash) {
        let hash = newUrl.hash
        if (!hash.startsWith('#')) {
          hash = '#' + hash
        }
        builtUrl += hash
      }
      
      return builtUrl
    } catch (err) {
      console.error('Error building URL:', err)
      return ""
    }
  }

  const copyBuiltUrl = () => {
    const builtUrl = buildUrl()
    if (builtUrl) {
      copyToClipboard(builtUrl)
    }
  }

  const parseBuiltUrl = () => {
    const builtUrl = buildUrl()
    if (builtUrl) {
      parseUrl(builtUrl)
      setActiveTab("parse")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Link className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">URL Parser</h1>
          <p className="text-muted-foreground">
            Parse, analyze, and build URLs
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="parse">Parse URL</TabsTrigger>
          <TabsTrigger value="build">Build URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parse">
          <Card>
            <CardHeader>
              <CardTitle>Enter URL</CardTitle>
              <CardDescription>
                Paste a URL to parse and analyze its components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/path?query=value#hash"
                    className="font-mono text-sm"
                  />
                  <Button onClick={() => parseUrl()}>Parse</Button>
                </div>
                
                {error && (
                  <div className="text-destructive flex items-center text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {error}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={clearUrl}>Clear</Button>
                
                {url && (
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(url)}
                    className="ml-auto"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {parsedUrl && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>URL Components</CardTitle>
                <CardDescription>
                  Detailed breakdown of the URL structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Protocol</label>
                      <div className="flex">
                        <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm">
                          {parsedUrl.protocol}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-1"
                          onClick={() => copyToClipboard(parsedUrl.protocol)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hostname</label>
                      <div className="flex">
                        <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm break-all">
                          {parsedUrl.hostname}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-1"
                          onClick={() => copyToClipboard(parsedUrl.hostname)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {parsedUrl.port && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Port</label>
                        <div className="flex">
                          <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm">
                            {parsedUrl.port}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="ml-1"
                            onClick={() => copyToClipboard(parsedUrl.port)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Path</label>
                      <div className="flex">
                        <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm break-all">
                          {parsedUrl.pathname || "/"}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-1"
                          onClick={() => copyToClipboard(parsedUrl.pathname || "/")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {parsedUrl.hash && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hash (Fragment)</label>
                        <div className="flex">
                          <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm break-all">
                            {parsedUrl.hash}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="ml-1"
                            onClick={() => copyToClipboard(parsedUrl.hash)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Origin</label>
                      <div className="flex">
                        <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm break-all">
                          {parsedUrl.origin}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-1"
                          onClick={() => copyToClipboard(parsedUrl.origin)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {(parsedUrl.username || parsedUrl.password) && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Authentication</label>
                        <div className="flex">
                          <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm">
                            {parsedUrl.username && <span>Username: {parsedUrl.username}</span>}
                            {parsedUrl.password && <span> Password: {parsedUrl.password}</span>}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="ml-1"
                            onClick={() => copyToClipboard(`${parsedUrl.username}:${parsedUrl.password}`)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {queryParams.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Query Parameters</h3>
                      <div className="space-y-2">
                        {queryParams.map((param, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="p-2 bg-muted rounded-md font-mono text-sm break-all">
                              {param.key}
                            </div>
                            <div className="flex">
                              <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm break-all">
                                {param.value}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="ml-1"
                                onClick={() => copyToClipboard(param.value)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Complete URL</h3>
                    <div className="flex">
                      <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm break-all">
                        {url}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-1"
                        onClick={() => copyToClipboard(url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" onClick={() => setActiveTab("build")}>
                    Edit this URL
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="build">
          <Card>
            <CardHeader>
              <CardTitle>Build URL</CardTitle>
              <CardDescription>
                Create or modify a URL by specifying its components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {newUrl && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Protocol</label>
                      <Input
                        value={newUrl.protocol}
                        onChange={(e) => handleUrlPartChange('protocol', e.target.value)}
                        placeholder="https:"
                        className="font-mono"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hostname</label>
                      <Input
                        value={newUrl.hostname}
                        onChange={(e) => handleUrlPartChange('hostname', e.target.value)}
                        placeholder="example.com"
                        className="font-mono"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Port (optional)</label>
                      <Input
                        value={newUrl.port}
                        onChange={(e) => handleUrlPartChange('port', e.target.value)}
                        placeholder="443"
                        className="font-mono"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Path</label>
                      <Input
                        value={newUrl.pathname}
                        onChange={(e) => handleUrlPartChange('pathname', e.target.value)}
                        placeholder="/path/to/resource"
                        className="font-mono"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hash (Fragment)</label>
                      <Input
                        value={newUrl.hash}
                        onChange={(e) => handleUrlPartChange('hash', e.target.value)}
                        placeholder="#section"
                        className="font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-lg font-medium">Query Parameters</label>
                      <Button variant="outline" size="sm" onClick={addQueryParam}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Parameter
                      </Button>
                    </div>
                    
                    {newQueryParams.length > 0 ? (
                      <div className="space-y-2">
                        {newQueryParams.map((param, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={param.key}
                              onChange={(e) => handleQueryParamChange(index, 'key', e.target.value)}
                              placeholder="key"
                              className="font-mono"
                            />
                            <span>=</span>
                            <Input
                              value={param.value}
                              onChange={(e) => handleQueryParamChange(index, 'value', e.target.value)}
                              placeholder="value"
                              className="font-mono"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQueryParam(index)}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground bg-muted rounded-md">
                        No query parameters. Click "Add Parameter" to add one.
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Generated URL</h3>
                    <div className="flex">
                      <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm break-all">
                        {buildUrl()}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-1"
                        onClick={copyBuiltUrl}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={parseBuiltUrl}>
                      Parse This URL
                    </Button>
                    <Button variant="outline" onClick={copyBuiltUrl}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                  </div>
                </>
              )}
              
              {!newUrl && (
                <div className="p-8 text-center text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No URL to build. Parse a URL first or start from scratch.</p>
                  <Button onClick={() => {
                    setNewUrl({
                      protocol: "https:",
                      hostname: "",
                      port: "",
                      pathname: "",
                      search: "",
                      hash: "",
                      origin: "",
                      host: "",
                      username: "",
                      password: ""
                    })
                    setNewQueryParams([])
                  }}>
                    Start from Scratch
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {urlHistory.length > 0 && activeTab === "parse" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>URL History</CardTitle>
              <Button variant="outline" size="sm" onClick={clearHistory}>
                <Trash className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
            <CardDescription>
              Recently parsed URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urlHistory.map((historyUrl, index) => (
                <div key={index} className="p-3 bg-muted rounded-md flex items-start group">
                  <div className="flex-1 font-mono text-sm truncate">
                    {historyUrl}
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => parseUrl(historyUrl)}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(historyUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeFromHistory(historyUrl)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About URLs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Uniform Resource Locators (URLs)</strong> are web addresses that specify the location of resources on the internet.
          </p>
          <p>
            A URL consists of several components:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Protocol</strong> - Specifies how the resource should be accessed (e.g., http:, https:, ftp:)</li>
            <li><strong>Hostname</strong> - The domain name or IP address of the server (e.g., example.com)</li>
            <li><strong>Port</strong> - Optional port number for the server (e.g., :443 for HTTPS)</li>
            <li><strong>Path</strong> - The specific location of the resource on the server (e.g., /products/item)</li>
            <li><strong>Query Parameters</strong> - Additional data passed to the server (e.g., ?id=123&sort=asc)</li>
            <li><strong>Fragment</strong> - A reference to a specific section within the resource (e.g., #section1)</li>
          </ul>
          <p className="mt-2">
            Example URL: <code>https://user:pass@example.com:443/path/to/page?name=value&foo=bar#section</code>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}