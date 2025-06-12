"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Send, Copy, Clock, Download } from "lucide-react"
import { downloadFile } from "@/lib/utils"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// HTTP method types
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS"

// Content type options
const contentTypes = [
  { value: "application/json", label: "JSON" },
  { value: "application/x-www-form-urlencoded", label: "Form URL Encoded" },
  { value: "multipart/form-data", label: "Multipart Form Data" },
  { value: "text/plain", label: "Plain Text" },
  { value: "application/xml", label: "XML" },
]

// Auth types
type AuthType = "none" | "basic" | "bearer" | "api-key"

interface RequestHeader {
  key: string
  value: string
  enabled: boolean
}

interface RequestParam {
  key: string
  value: string
  enabled: boolean
}

interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  time: number
  size: number
  error?: string
}

export default function ApiTesterPage() {
  // Request state
  const [url, setUrl] = useState("")
  const [method, setMethod] = useState<HttpMethod>("GET")
  const [contentType, setContentType] = useState("application/json")
  const [requestBody, setRequestBody] = useState("")
  const [headers, setHeaders] = useState<RequestHeader[]>([
    { key: "Accept", value: "application/json", enabled: true }
  ])
  const [params, setParams] = useState<RequestParam[]>([
    { key: "", value: "", enabled: true }
  ])
  const [authType, setAuthType] = useState<AuthType>("none")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [apiKeyName, setApiKeyName] = useState("X-API-Key")
  const [apiKeyLocation, setApiKeyLocation] = useState<"header" | "query">("header")

  // Response state
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeResponseTab, setActiveResponseTab] = useState("body")
  const [history, setHistory] = useState<Array<{
    url: string
    method: HttpMethod
    timestamp: Date
  }>>([])

  // Add a new header
  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "", enabled: true }])
  }

  // Update a header
  const updateHeader = (index: number, field: keyof RequestHeader, value: string | boolean) => {
    const newHeaders = [...headers]
    newHeaders[index] = { ...newHeaders[index], [field]: value }
    setHeaders(newHeaders)
  }

  // Remove a header
  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  // Add a new query parameter
  const addParam = () => {
    setParams([...params, { key: "", value: "", enabled: true }])
  }

  // Update a query parameter
  const updateParam = (index: number, field: keyof RequestParam, value: string | boolean) => {
    const newParams = [...params]
    newParams[index] = { ...newParams[index], [field]: value }
    setParams(newParams)
  }

  // Remove a query parameter
  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index))
  }

  // Build the request URL with query parameters
  const buildUrl = () => {
    try {
      const urlObj = new URL(url)
      
      // Add enabled query parameters
      params.forEach(param => {
        if (param.enabled && param.key) {
          urlObj.searchParams.append(param.key, param.value)
        }
      })
      
      // Add API key if it's in query params
      if (authType === "api-key" && apiKeyLocation === "query" && apiKey) {
        urlObj.searchParams.append(apiKeyName, apiKey)
      }
      
      return urlObj.toString()
    } catch (error) {
      // If URL is invalid, just return it as is
      return url
    }
  }

  // Build request headers
  const buildHeaders = () => {
    const requestHeaders: Record<string, string> = {}
    
    // Add enabled headers
    headers.forEach(header => {
      if (header.enabled && header.key) {
        requestHeaders[header.key] = header.value
      }
    })
    
    // Add content type header if not a GET request
    if (method !== "GET" && method !== "HEAD") {
      requestHeaders["Content-Type"] = contentType
    }
    
    // Add auth headers
    if (authType === "basic") {
      const base64Credentials = btoa(`${username}:${password}`)
      requestHeaders["Authorization"] = `Basic ${base64Credentials}`
    } else if (authType === "bearer" && token) {
      requestHeaders["Authorization"] = `Bearer ${token}`
    } else if (authType === "api-key" && apiKeyLocation === "header" && apiKey) {
      requestHeaders[apiKeyName] = apiKey
    }
    
    return requestHeaders
  }

  // Send the API request
  const sendRequest = async () => {
    if (!url) return
    
    setIsLoading(true)
    setResponse(null)
    
    const requestUrl = buildUrl()
    const requestHeaders = buildHeaders()
    const startTime = performance.now()
    
    try {
      const options: RequestInit = {
        method,
        headers: requestHeaders,
        // Don't add body for GET and HEAD requests
        ...(method !== "GET" && method !== "HEAD" && requestBody ? {
          body: contentType === "application/json" 
            ? JSON.stringify(JSON.parse(requestBody)) 
            : requestBody
        } : {})
      }
      
      const res = await fetch(requestUrl, options)
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      // Get response headers
      const responseHeaders: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      
      // Try to parse response as JSON, fallback to text
      let data
      const responseContentType = res.headers.get("content-type") || ""
      if (responseContentType.includes("application/json")) {
        data = await res.json()
      } else {
        data = await res.text()
      }
      
      // Calculate response size
      const responseSize = JSON.stringify(data).length
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data,
        time: responseTime,
        size: responseSize
      })
      
      // Add to history
      setHistory(prev => [
        { url: requestUrl, method, timestamp: new Date() },
        ...prev.slice(0, 9) // Keep only the last 10 items
      ])
      
    } catch (error) {
      const endTime = performance.now()
      setResponse({
        status: 0,
        statusText: "Error",
        headers: {},
        data: null,
        time: endTime - startTime,
        size: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy response to clipboard
  const copyResponse = async () => {
    if (!response) return
    
    try {
      const textToCopy = typeof response.data === 'object' 
        ? JSON.stringify(response.data, null, 2) 
        : String(response.data)
      
      await navigator.clipboard.writeText(textToCopy)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // Download response as JSON or text file
  const downloadResponse = () => {
    if (!response) return
    
    const isJson = typeof response.data === 'object'
    const content = isJson 
      ? JSON.stringify(response.data, null, 2) 
      : String(response.data)
    
    const contentType = isJson ? 'application/json' : 'text/plain'
    const extension = isJson ? 'json' : 'txt'
    
    downloadFile(
      content, 
      `api-response-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`, 
      contentType
    )
  }

  // Load a request from history
  const loadFromHistory = (historyItem: { url: string, method: HttpMethod }) => {
    setUrl(historyItem.url)
    setMethod(historyItem.method)
  }

  // Format JSON for display
  const formatJson = (data: any) => {
    try {
      if (typeof data === 'object') {
        return JSON.stringify(data, null, 2)
      }
      return data
    } catch (e) {
      return String(data)
    }
  }

  // Determine response status color
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-500"
    if (status >= 300 && status < 400) return "text-blue-500"
    if (status >= 400 && status < 500) return "text-yellow-500"
    if (status >= 500) return "text-red-500"
    return "text-gray-500"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">API Tester</h1>
          <p className="text-muted-foreground">
            Test API endpoints with different methods and parameters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Request URL and Method */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="w-full md:w-1/4">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as HttpMethod)}
                    className="w-full p-2 rounded-md border bg-background"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                    <option value="HEAD">HEAD</option>
                    <option value="OPTIONS">OPTIONS</option>
                  </select>
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="https://api.example.com/endpoint"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Button onClick={sendRequest} disabled={!url || isLoading}>
                    {isLoading ? (
                      <div className="animate-spin mr-2">⟳</div>
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Configuration Tabs */}
          <Tabs defaultValue="params" className="w-full">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="params">Params</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="auth">Auth</TabsTrigger>
            </TabsList>

            {/* Query Parameters Tab */}
            <TabsContent value="params">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Query Parameters</CardTitle>
                  <CardDescription>
                    Add query parameters to your request URL
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {params.map((param, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={param.enabled}
                          onChange={(e) => updateParam(index, "enabled", e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Input
                          placeholder="Parameter name"
                          value={param.key}
                          onChange={(e) => updateParam(index, "key", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Value"
                          value={param.value}
                          onChange={(e) => updateParam(index, "value", e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeParam(index)}
                          className="text-destructive"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addParam} className="w-full mt-2">
                      Add Parameter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Headers Tab */}
            <TabsContent value="headers">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Headers</CardTitle>
                  <CardDescription>
                    Add HTTP headers to your request
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {headers.map((header, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={header.enabled}
                          onChange={(e) => updateHeader(index, "enabled", e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Input
                          placeholder="Header name"
                          value={header.key}
                          onChange={(e) => updateHeader(index, "key", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Value"
                          value={header.value}
                          onChange={(e) => updateHeader(index, "value", e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHeader(index)}
                          className="text-destructive"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addHeader} className="w-full mt-2">
                      Add Header
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Request Body Tab */}
            <TabsContent value="body">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Request Body</CardTitle>
                  <CardDescription>
                    Add a body to your request (not applicable for GET/HEAD requests)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Content Type</label>
                      <select
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value)}
                        className="w-full p-2 mt-1 rounded-md border bg-background"
                        disabled={method === "GET" || method === "HEAD"}
                      >
                        {contentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Textarea
                        placeholder={
                          contentType === "application/json"
                            ? '{\n  "key": "value"\n}'
                            : "Request body"
                        }
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                        disabled={method === "GET" || method === "HEAD"}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Authentication Tab */}
            <TabsContent value="auth">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>
                    Add authentication to your request
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Auth Type</label>
                      <select
                        value={authType}
                        onChange={(e) => setAuthType(e.target.value as AuthType)}
                        className="w-full p-2 mt-1 rounded-md border bg-background"
                      >
                        <option value="none">No Auth</option>
                        <option value="basic">Basic Auth</option>
                        <option value="bearer">Bearer Token</option>
                        <option value="api-key">API Key</option>
                      </select>
                    </div>

                    {authType === "basic" && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium">Username</label>
                          <Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Password</label>
                          <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {authType === "bearer" && (
                      <div>
                        <label className="text-sm font-medium">Token</label>
                        <Input
                          type="text"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          placeholder="Bearer token"
                        />
                      </div>
                    )}

                    {authType === "api-key" && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium">Key Name</label>
                          <Input
                            type="text"
                            value={apiKeyName}
                            onChange={(e) => setApiKeyName(e.target.value)}
                            placeholder="X-API-Key"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Key Value</label>
                          <Input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Your API key"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Add to</label>
                          <select
                            value={apiKeyLocation}
                            onChange={(e) => setApiKeyLocation(e.target.value as "header" | "query")}
                            className="w-full p-2 mt-1 rounded-md border bg-background"
                          >
                            <option value="header">Header</option>
                            <option value="query">Query Parameter</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Response Section */}
          {response && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Response</CardTitle>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={getStatusColor(response.status)}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="text-muted-foreground">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {response.time.toFixed(0)} ms
                    </span>
                    <span className="text-muted-foreground">
                      {(response.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyResponse}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadResponse}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeResponseTab} onValueChange={setActiveResponseTab}>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="body" className="mt-2">
                    {response.error ? (
                      <div className="text-destructive p-4 border border-destructive rounded-md">
                        {response.error}
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <SyntaxHighlighter
                          language={typeof response.data === 'object' ? 'json' : 'text'}
                          style={vscDarkPlus}
                          customStyle={{ margin: 0, borderRadius: 0 }}
                        >
                          {formatJson(response.data)}
                        </SyntaxHighlighter>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="headers" className="mt-2">
                    <div className="border rounded-md p-4 bg-muted/50">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="flex py-1 border-b last:border-0">
                          <span className="font-medium w-1/3">{key}:</span>
                          <span className="w-2/3">{value}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request History</CardTitle>
              <CardDescription>
                Your recent API requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-sm">No requests yet</p>
              ) : (
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => loadFromHistory(item)}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          item.method === 'GET' ? 'bg-green-100 text-green-800' :
                          item.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          item.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          item.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.method}
                        </span>
                        <span className="text-sm truncate flex-1">{item.url}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <h3 className="font-medium">HTTP Methods</h3>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>GET</strong>: Retrieve data</li>
                  <li><strong>POST</strong>: Create new data</li>
                  <li><strong>PUT</strong>: Update existing data</li>
                  <li><strong>DELETE</strong>: Remove data</li>
                  <li><strong>PATCH</strong>: Partially update data</li>
                  <li><strong>HEAD</strong>: Same as GET but without response body</li>
                  <li><strong>OPTIONS</strong>: Get supported methods for a URL</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Common Status Codes</h3>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong className="text-green-500">200</strong>: OK</li>
                  <li><strong className="text-green-500">201</strong>: Created</li>
                  <li><strong className="text-blue-500">301</strong>: Moved Permanently</li>
                  <li><strong className="text-blue-500">302</strong>: Found</li>
                  <li><strong className="text-yellow-500">400</strong>: Bad Request</li>
                  <li><strong className="text-yellow-500">401</strong>: Unauthorized</li>
                  <li><strong className="text-yellow-500">403</strong>: Forbidden</li>
                  <li><strong className="text-yellow-500">404</strong>: Not Found</li>
                  <li><strong className="text-red-500">500</strong>: Internal Server Error</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}