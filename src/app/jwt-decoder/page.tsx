"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Key, Copy, Trash, AlertCircle, CheckCircle2 } from "lucide-react"
import { jwtDecode } from "jwt-decode"

// Types for JWT token parts
interface JwtHeader {
  alg: string
  typ: string
  kid?: string
  [key: string]: any
}

interface JwtPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: any
}

export default function JwtDecoderPage() {
  const [token, setToken] = useState("")
  const [header, setHeader] = useState<JwtHeader | null>(null)
  const [payload, setPayload] = useState<JwtPayload | null>(null)
  const [signature, setSignature] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [tokenHistory, setTokenHistory] = useState<string[]>([])
  const [isExpired, setIsExpired] = useState<boolean | null>(null)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string | null>(null)

  // Load token history from localStorage on component mount
  useEffect(() => {
    const savedTokens = localStorage.getItem('jwtTokenHistory')
    if (savedTokens) {
      try {
        setTokenHistory(JSON.parse(savedTokens))
      } catch (e) {
        console.error('Failed to load token history', e)
      }
    }
  }, [])

  // Save token history to localStorage when it changes
  useEffect(() => {
    if (tokenHistory.length > 0) {
      localStorage.setItem('jwtTokenHistory', JSON.stringify(tokenHistory))
    }
  }, [tokenHistory])

  // Update expiry information when payload changes
  useEffect(() => {
    if (payload && payload.exp) {
      const expiryDate = new Date(payload.exp * 1000)
      const now = new Date()
      
      setIsExpired(now > expiryDate)
      
      if (now < expiryDate) {
        const updateExpiryInfo = () => {
          const now = new Date()
          const expiryDate = new Date(payload.exp! * 1000)
          
          if (now > expiryDate) {
            setIsExpired(true)
            setTimeUntilExpiry("Expired")
            return
          }
          
          const diff = expiryDate.getTime() - now.getTime()
          
          // Format the time difference
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((diff % (1000 * 60)) / 1000)
          
          let timeString = ""
          if (days > 0) timeString += `${days}d `
          if (hours > 0 || days > 0) timeString += `${hours}h `
          if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `
          timeString += `${seconds}s`
          
          setTimeUntilExpiry(timeString)
          setIsExpired(false)
        }
        
        updateExpiryInfo()
        const interval = setInterval(updateExpiryInfo, 1000)
        return () => clearInterval(interval)
      } else {
        setTimeUntilExpiry("Expired")
      }
    } else {
      setIsExpired(null)
      setTimeUntilExpiry(null)
    }
  }, [payload])

  const decodeToken = (tokenToDecode: string = token) => {
    setError(null)
    
    if (!tokenToDecode.trim()) {
      setError("Please enter a JWT token")
      return
    }
    
    try {
      // Split the token into parts
      const parts = tokenToDecode.split('.')
      if (parts.length !== 3) {
        setError("Invalid JWT format. A JWT consists of three parts separated by dots.")
        return
      }
      
      // Decode header
      const decodedHeader = jwtDecode<JwtHeader>(tokenToDecode, { header: true })
      setHeader(decodedHeader)
      
      // Decode payload
      const decodedPayload = jwtDecode<JwtPayload>(tokenToDecode)
      setPayload(decodedPayload)
      
      // Set signature (we can't decode this part, just store it)
      setSignature(parts[2])
      
      // Add to history if not already there
      if (!tokenHistory.includes(tokenToDecode)) {
        setTokenHistory(prev => [tokenToDecode, ...prev].slice(0, 10))
      }
      
      setToken(tokenToDecode)
    } catch (err) {
      console.error('Error decoding JWT:', err)
      setError("Failed to decode JWT. Please check if the token is valid.")
      setHeader(null)
      setPayload(null)
      setSignature("")
    }
  }

  const clearToken = () => {
    setToken("")
    setHeader(null)
    setPayload(null)
    setSignature("")
    setError(null)
    setIsExpired(null)
    setTimeUntilExpiry(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy: ', err))
  }

  const removeFromHistory = (tokenToRemove: string) => {
    setTokenHistory(prev => prev.filter(t => t !== tokenToRemove))
  }

  const clearHistory = () => {
    setTokenHistory([])
    localStorage.removeItem('jwtTokenHistory')
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString()
  }

  const formatJson = (obj: any): string => {
    return JSON.stringify(obj, null, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">JWT Decoder</h1>
          <p className="text-muted-foreground">
            Decode and inspect JSON Web Tokens
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter JWT Token</CardTitle>
          <CardDescription>
            Paste your JWT token to decode and analyze it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full h-24 p-2 border rounded-md font-mono text-sm"
            />
            
            {error && (
              <div className="text-destructive flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => decodeToken()}>Decode Token</Button>
            <Button variant="outline" onClick={clearToken}>Clear</Button>
            
            {token && (
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(token)}
                className="ml-auto"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Token
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {(header || payload) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Decoded Token</CardTitle>
              {isExpired !== null && (
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  isExpired 
                    ? 'bg-destructive/10 text-destructive' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {isExpired ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Expired
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Valid {timeUntilExpiry && `(Expires in ${timeUntilExpiry})`}
                    </>
                  )}
                </div>
              )}
            </div>
            <CardDescription>
              Detailed information extracted from the JWT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="payload">
              <TabsList className="mb-4">
                <TabsTrigger value="payload">Payload</TabsTrigger>
                <TabsTrigger value="header">Header</TabsTrigger>
                <TabsTrigger value="signature">Signature</TabsTrigger>
              </TabsList>
              
              <TabsContent value="payload" className="space-y-4">
                {payload && (
                  <>
                    <div className="space-y-4">
                      {/* Standard claims section */}
                      {(payload.iss || payload.sub || payload.aud || payload.exp || payload.nbf || payload.iat || payload.jti) && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Standard Claims</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {payload.iss && (
                              <div className="p-3 bg-muted rounded-md">
                                <div className="text-sm font-medium">Issuer (iss)</div>
                                <div className="text-sm font-mono break-all">{payload.iss}</div>
                              </div>
                            )}
                            
                            {payload.sub && (
                              <div className="p-3 bg-muted rounded-md">
                                <div className="text-sm font-medium">Subject (sub)</div>
                                <div className="text-sm font-mono break-all">{payload.sub}</div>
                              </div>
                            )}
                            
                            {payload.aud && (
                              <div className="p-3 bg-muted rounded-md">
                                <div className="text-sm font-medium">Audience (aud)</div>
                                <div className="text-sm font-mono break-all">
                                  {typeof payload.aud === 'string' 
                                    ? payload.aud 
                                    : Array.isArray(payload.aud) 
                                      ? payload.aud.join(', ') 
                                      : JSON.stringify(payload.aud)
                                  }
                                </div>
                              </div>
                            )}
                            
                            {payload.exp && (
                              <div className="p-3 bg-muted rounded-md">
                                <div className="text-sm font-medium">Expiration Time (exp)</div>
                                <div className="text-sm font-mono">{formatDate(payload.exp)}</div>
                                <div className="text-xs text-muted-foreground">{payload.exp}</div>
                              </div>
                            )}
                            
                            {payload.nbf && (
                              <div className="p-3 bg-muted rounded-md">
                                <div className="text-sm font-medium">Not Before (nbf)</div>
                                <div className="text-sm font-mono">{formatDate(payload.nbf)}</div>
                                <div className="text-xs text-muted-foreground">{payload.nbf}</div>
                              </div>
                            )}
                            
                            {payload.iat && (
                              <div className="p-3 bg-muted rounded-md">
                                <div className="text-sm font-medium">Issued At (iat)</div>
                                <div className="text-sm font-mono">{formatDate(payload.iat)}</div>
                                <div className="text-xs text-muted-foreground">{payload.iat}</div>
                              </div>
                            )}
                            
                            {payload.jti && (
                              <div className="p-3 bg-muted rounded-md">
                                <div className="text-sm font-medium">JWT ID (jti)</div>
                                <div className="text-sm font-mono break-all">{payload.jti}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Custom claims section */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">All Claims (JSON)</h3>
                        <div className="relative">
                          <pre className="p-4 bg-muted rounded-md overflow-auto max-h-96 text-sm font-mono">
                            {formatJson(payload)}
                          </pre>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(formatJson(payload))}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="header">
                {header && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {header.alg && (
                        <div className="p-3 bg-muted rounded-md">
                          <div className="text-sm font-medium">Algorithm (alg)</div>
                          <div className="text-sm font-mono">{header.alg}</div>
                        </div>
                      )}
                      
                      {header.typ && (
                        <div className="p-3 bg-muted rounded-md">
                          <div className="text-sm font-medium">Type (typ)</div>
                          <div className="text-sm font-mono">{header.typ}</div>
                        </div>
                      )}
                      
                      {header.kid && (
                        <div className="p-3 bg-muted rounded-md">
                          <div className="text-sm font-medium">Key ID (kid)</div>
                          <div className="text-sm font-mono break-all">{header.kid}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Complete Header (JSON)</h3>
                      <div className="relative">
                        <pre className="p-4 bg-muted rounded-md overflow-auto max-h-60 text-sm font-mono">
                          {formatJson(header)}
                        </pre>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(formatJson(header))}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="signature">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    The signature is used to verify that the sender of the JWT is who it says it is and to ensure that the message wasn't changed along the way.
                    It's created using the header, payload, and a secret key.
                  </p>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Encoded Signature</h3>
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-md overflow-auto text-sm font-mono break-all">
                        {signature}
                      </pre>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(signature)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-900/30">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      <AlertCircle className="h-4 w-4 inline-block mr-1" />
                      Note: This tool only decodes JWT tokens. It does not verify signatures or validate tokens against an issuer.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {tokenHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Token History</CardTitle>
              <Button variant="outline" size="sm" onClick={clearHistory}>
                <Trash className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
            <CardDescription>
              Recently decoded tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tokenHistory.map((historyToken, index) => (
                <div key={index} className="p-3 bg-muted rounded-md flex items-start group">
                  <div className="flex-1 font-mono text-sm truncate">
                    {historyToken}
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => decodeToken(historyToken)}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(historyToken)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeFromHistory(historyToken)}
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
          <CardTitle>About JWT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>JSON Web Tokens (JWT)</strong> are an open standard (RFC 7519) that define a compact and self-contained way for securely transmitting information between parties as a JSON object.
          </p>
          <p>
            JWTs consist of three parts separated by dots:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Header</strong> - Contains metadata about the token (type and signing algorithm)</li>
            <li><strong>Payload</strong> - Contains the claims (statements about an entity) and data</li>
            <li><strong>Signature</strong> - Verifies the sender and ensures the message wasn't changed</li>
          </ul>
          <p className="mt-2">
            JWTs are commonly used for:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Authentication and authorization in web applications</li>
            <li>Secure information exchange between parties</li>
            <li>Single sign-on (SSO) implementations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}