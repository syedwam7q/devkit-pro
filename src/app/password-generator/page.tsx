"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Key, Copy, RefreshCw, Check, AlertTriangle, Info } from "lucide-react"

// Character sets for password generation
const CHAR_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}

// Password strength levels
type StrengthLevel = 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'

interface PasswordOptions {
  length: number
  includeLowercase: boolean
  includeUppercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

export default function PasswordGeneratorPage() {
  // Default password options
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  })
  
  const [password, setPassword] = useState("")
  const [strength, setStrength] = useState<StrengthLevel>("medium")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const [passwordHistory, setPasswordHistory] = useState<string[]>([])
  
  // Generate password on initial load and when options change
  useEffect(() => {
    generatePassword()
  }, [])
  
  // Calculate password strength
  const calculateStrength = (pwd: string): StrengthLevel => {
    if (!pwd) return 'very-weak'
    
    let score = 0
    
    // Length contribution (up to 30 points)
    score += Math.min(30, pwd.length * 2)
    
    // Character variety contribution
    if (/[a-z]/.test(pwd)) score += 10
    if (/[A-Z]/.test(pwd)) score += 10
    if (/[0-9]/.test(pwd)) score += 10
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 15
    
    // Variety of characters
    const uniqueChars = new Set(pwd.split('')).size
    score += Math.min(15, uniqueChars)
    
    // Determine strength level based on score
    if (score < 30) return 'very-weak'
    if (score < 50) return 'weak'
    if (score < 70) return 'medium'
    if (score < 90) return 'strong'
    return 'very-strong'
  }
  
  // Generate a random password based on options
  const generatePassword = () => {
    try {
      setError("")
      
      // Create character pool based on selected options
      let charPool = ''
      
      if (options.includeLowercase) charPool += CHAR_SETS.lowercase
      if (options.includeUppercase) charPool += CHAR_SETS.uppercase
      if (options.includeNumbers) charPool += CHAR_SETS.numbers
      if (options.includeSymbols) charPool += CHAR_SETS.symbols
      
      // Remove similar characters if option is selected
      if (options.excludeSimilar) {
        charPool = charPool.replace(/[il1Lo0O]/g, '')
      }
      
      // Remove ambiguous characters if option is selected
      if (options.excludeAmbiguous) {
        charPool = charPool.replace(/[{}()\[\]\/\\'"~,;:.<>]/g, '')
      }
      
      // Validate that we have characters to work with
      if (!charPool) {
        setError("Please select at least one character type")
        return
      }
      
      // Generate the password
      let newPassword = ''
      const charPoolLength = charPool.length
      
      for (let i = 0; i < options.length; i++) {
        const randomIndex = Math.floor(Math.random() * charPoolLength)
        newPassword += charPool.charAt(randomIndex)
      }
      
      // Ensure the password meets the selected criteria
      let meetsRequirements = true
      
      if (options.includeLowercase && !/[a-z]/.test(newPassword)) meetsRequirements = false
      if (options.includeUppercase && !/[A-Z]/.test(newPassword)) meetsRequirements = false
      if (options.includeNumbers && !/[0-9]/.test(newPassword)) meetsRequirements = false
      if (options.includeSymbols && !/[^a-zA-Z0-9]/.test(newPassword)) meetsRequirements = false
      
      // If the password doesn't meet requirements, generate a new one
      if (!meetsRequirements) {
        generatePassword()
        return
      }
      
      // Set the new password and calculate its strength
      setPassword(newPassword)
      setStrength(calculateStrength(newPassword))
      setCopied(false)
      
      // Add to history (keep last 5)
      setPasswordHistory(prev => {
        const newHistory = [newPassword, ...prev]
        return newHistory.slice(0, 5)
      })
      
    } catch (err) {
      setError("Failed to generate password")
      console.error(err)
    }
  }
  
  // Copy password to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      
      // Reset copied status after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError("Failed to copy to clipboard")
      console.error(err)
    }
  }
  
  // Update a specific option
  const updateOption = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }
  
  // Get color class based on password strength
  const getStrengthColor = (): string => {
    switch (strength) {
      case 'very-weak': return 'bg-red-500'
      case 'weak': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
      case 'very-strong': return 'bg-emerald-500'
      default: return 'bg-gray-300'
    }
  }
  
  // Get width percentage based on password strength
  const getStrengthWidth = (): string => {
    switch (strength) {
      case 'very-weak': return '20%'
      case 'weak': return '40%'
      case 'medium': return '60%'
      case 'strong': return '80%'
      case 'very-strong': return '100%'
      default: return '0%'
    }
  }
  
  // Get text label based on password strength
  const getStrengthLabel = (): string => {
    switch (strength) {
      case 'very-weak': return 'Very Weak'
      case 'weak': return 'Weak'
      case 'medium': return 'Medium'
      case 'strong': return 'Strong'
      case 'very-strong': return 'Very Strong'
      default: return 'Unknown'
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Password Generator</h1>
          <p className="text-muted-foreground">
            Create secure passwords with customizable options
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Password Display */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Generated Password</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={password}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button onClick={copyToClipboard} variant="outline" className="min-w-[100px]">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button onClick={generatePassword}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </div>
              
              {error && (
                <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-md flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Password Strength:</span>
                  <span className="font-medium">{getStrengthLabel()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${getStrengthColor()}`}
                    style={{ width: getStrengthWidth() }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Password Options */}
          <Card>
            <CardHeader>
              <CardTitle>Password Options</CardTitle>
              <CardDescription>
                Customize your password generation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Length */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Password Length: {options.length}</label>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">8</span>
                  <Slider
                    value={[options.length]}
                    min={8}
                    max={64}
                    step={1}
                    onValueChange={(value) => updateOption('length', value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm">64</span>
                </div>
              </div>
              
              {/* Character Types */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Character Types</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeLowercase"
                      checked={options.includeLowercase}
                      onChange={(e) => updateOption('includeLowercase', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="includeLowercase" className="text-sm">
                      Include Lowercase (a-z)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeUppercase"
                      checked={options.includeUppercase}
                      onChange={(e) => updateOption('includeUppercase', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="includeUppercase" className="text-sm">
                      Include Uppercase (A-Z)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeNumbers"
                      checked={options.includeNumbers}
                      onChange={(e) => updateOption('includeNumbers', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="includeNumbers" className="text-sm">
                      Include Numbers (0-9)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeSymbols"
                      checked={options.includeSymbols}
                      onChange={(e) => updateOption('includeSymbols', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="includeSymbols" className="text-sm">
                      Include Symbols (!@#$%^&*)
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Advanced Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Advanced Options</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="excludeSimilar"
                      checked={options.excludeSimilar}
                      onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="excludeSimilar" className="text-sm">
                      Exclude Similar Characters (i, l, 1, L, o, 0, O)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="excludeAmbiguous"
                      checked={options.excludeAmbiguous}
                      onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="excludeAmbiguous" className="text-sm">
                      Exclude Ambiguous Characters (&#123; &#125;[ ]( )/ \ &apos; &quot; ~ , ; : . &lt; &gt;)
                    </label>
                  </div>
                </div>
              </div>
              
              <Button onClick={generatePassword} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Password
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Password History */}
          <Card>
            <CardHeader>
              <CardTitle>Password History</CardTitle>
              <CardDescription>
                Recently generated passwords
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm">No password history yet</p>
              ) : (
                <div className="space-y-2">
                  {passwordHistory.map((pwd, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <code className="text-xs font-mono truncate max-w-[180px]">{pwd}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(pwd)
                        }}
                        className="h-6 w-6"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Password Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Password Security Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p>Use a different password for each of your accounts.</p>
              </div>
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p>Passwords should be at least 12 characters long. The longer, the better.</p>
              </div>
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p>Use a mix of uppercase, lowercase, numbers, and symbols.</p>
              </div>
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p>Consider using a password manager to store your passwords securely.</p>
              </div>
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p>Change your passwords periodically, especially for important accounts.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}