"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Download, Copy, Settings, RefreshCw } from "lucide-react"
import QRCode from 'qrcode'

// QR Code types
type QRCodeType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard"

// QR Code options
interface QRCodeOptions {
  errorCorrectionLevel: "L" | "M" | "Q" | "H"
  margin: number
  scale: number
  color: {
    dark: string
    light: string
  }
}

export default function QrCodeGeneratorPage() {
  // QR Code content state
  const [qrType, setQrType] = useState<QRCodeType>("url")
  const [url, setUrl] = useState("https://example.com")
  const [text, setText] = useState("Hello, world!")
  const [email, setEmail] = useState({ address: "", subject: "", body: "" })
  const [phone, setPhone] = useState("")
  const [sms, setSms] = useState({ number: "", message: "" })
  const [wifi, setWifi] = useState({ ssid: "", password: "", encryption: "WPA" })
  const [vcard, setVcard] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    note: ""
  })
  
  // QR Code options state
  const [options, setOptions] = useState<QRCodeOptions>({
    errorCorrectionLevel: "M",
    margin: 4,
    scale: 8,
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  })
  
  // QR Code image state
  const [qrCodeDataURL, setQrCodeDataURL] = useState("")
  const [error, setError] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Generate QR code when content or options change
  useEffect(() => {
    generateQRCode()
  }, [qrType, url, text, email, phone, sms, wifi, vcard, options])
  
  // Get QR code content based on type
  const getQRContent = (): string => {
    switch (qrType) {
      case "url":
        return url
      case "text":
        return text
      case "email":
        let emailContent = `mailto:${email.address}`
        if (email.subject) emailContent += `?subject=${encodeURIComponent(email.subject)}`
        if (email.body) emailContent += `${email.subject ? '&' : '?'}body=${encodeURIComponent(email.body)}`
        return emailContent
      case "phone":
        return `tel:${phone}`
      case "sms":
        return `sms:${sms.number}${sms.message ? `?body=${encodeURIComponent(sms.message)}` : ''}`
      case "wifi":
        return `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};;`
      case "vcard":
        return `BEGIN:VCARD
VERSION:3.0
N:${vcard.lastName};${vcard.firstName};;;
FN:${vcard.firstName} ${vcard.lastName}
ORG:${vcard.organization}
TITLE:${vcard.title}
EMAIL:${vcard.email}
TEL:${vcard.phone}
URL:${vcard.website}
ADR:;;${vcard.address};;;
NOTE:${vcard.note}
END:VCARD`
      default:
        return ""
    }
  }
  
  // Generate QR code
  const generateQRCode = async () => {
    try {
      setError("")
      const content = getQRContent()
      
      if (!content) {
        setError("Please enter content for the QR code")
        return
      }
      
      const dataURL = await QRCode.toDataURL(content, {
        errorCorrectionLevel: options.errorCorrectionLevel,
        margin: options.margin,
        scale: options.scale,
        color: {
          dark: options.color.dark,
          light: options.color.light
        }
      })
      
      setQrCodeDataURL(dataURL)
      
    } catch (err) {
      setError("Failed to generate QR code")
      console.error(err)
    }
  }
  
  // Download QR code as PNG
  const downloadQRCode = () => {
    if (!qrCodeDataURL) return
    
    const link = document.createElement('a')
    link.href = qrCodeDataURL
    link.download = `qrcode-${qrType}-${new Date().getTime()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Copy QR code as data URL
  const copyQRCode = async () => {
    if (!qrCodeDataURL) return
    
    try {
      await navigator.clipboard.writeText(qrCodeDataURL)
    } catch (err) {
      console.error("Failed to copy QR code: ", err)
    }
  }
  
  // Update a specific option
  const updateOption = <K extends keyof QRCodeOptions>(key: K, value: QRCodeOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }
  
  // Update color option
  const updateColor = (type: "dark" | "light", value: string) => {
    setOptions(prev => ({
      ...prev,
      color: {
        ...prev.color,
        [type]: value
      }
    }))
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <QrCode className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">QR Code Generator</h1>
          <p className="text-muted-foreground">
            Generate QR codes for URLs, text, contact info, and more
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Content */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Content</CardTitle>
            <CardDescription>
              Select the type of QR code and enter the content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={qrType} onValueChange={(value) => setQrType(value as QRCodeType)} className="w-full">
              <TabsList className="grid grid-cols-4 md:grid-cols-7">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="wifi">WiFi</TabsTrigger>
                <TabsTrigger value="vcard">vCard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Website URL</label>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Text Content</label>
                    <Textarea
                      placeholder="Enter your text here"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={5}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="email" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="example@example.com"
                      value={email.address}
                      onChange={(e) => setEmail({ ...email, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject (Optional)</label>
                    <Input
                      type="text"
                      placeholder="Email subject"
                      value={email.subject}
                      onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Body (Optional)</label>
                    <Textarea
                      placeholder="Email body"
                      value={email.body}
                      onChange={(e) => setEmail({ ...email, body: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="phone" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sms" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={sms.number}
                      onChange={(e) => setSms({ ...sms, number: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message (Optional)</label>
                    <Textarea
                      placeholder="SMS message"
                      value={sms.message}
                      onChange={(e) => setSms({ ...sms, message: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="wifi" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Network Name (SSID)</label>
                    <Input
                      type="text"
                      placeholder="WiFi Network Name"
                      value={wifi.ssid}
                      onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="text"
                      placeholder="WiFi Password"
                      value={wifi.password}
                      onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Encryption</label>
                    <select
                      value={wifi.encryption}
                      onChange={(e) => setWifi({ ...wifi, encryption: e.target.value })}
                      className="w-full p-2 rounded-md border bg-background"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None</option>
                    </select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="vcard" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        type="text"
                        placeholder="John"
                        value={vcard.firstName}
                        onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        type="text"
                        placeholder="Doe"
                        value={vcard.lastName}
                        onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Organization</label>
                    <Input
                      type="text"
                      placeholder="Company Name"
                      value={vcard.organization}
                      onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Job Title</label>
                    <Input
                      type="text"
                      placeholder="Software Developer"
                      value={vcard.title}
                      onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      value={vcard.email}
                      onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={vcard.phone}
                      onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={vcard.website}
                      onChange={(e) => setVcard({ ...vcard, website: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      type="text"
                      placeholder="123 Main St, City, Country"
                      value={vcard.address}
                      onChange={(e) => setVcard({ ...vcard, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Note</label>
                    <Textarea
                      placeholder="Additional information"
                      value={vcard.note}
                      onChange={(e) => setVcard({ ...vcard, note: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* QR Code Display */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated QR Code</CardTitle>
              <CardDescription>
                Scan with a QR code reader
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {error ? (
                <div className="p-4 bg-red-100 text-red-800 rounded-md">
                  {error}
                </div>
              ) : qrCodeDataURL ? (
                <div className="p-4 bg-white rounded-md">
                  <img
                    src={qrCodeDataURL}
                    alt="QR Code"
                    className="max-w-full h-auto"
                  />
                </div>
              ) : (
                <div className="p-4 text-muted-foreground">
                  QR code will appear here
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button onClick={generateQRCode} variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                <Button onClick={downloadQRCode} variant="outline" disabled={!qrCodeDataURL}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button onClick={copyQRCode} variant="outline" disabled={!qrCodeDataURL}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* QR Code Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                QR Code Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Error Correction Level</label>
                <select
                  value={options.errorCorrectionLevel}
                  onChange={(e) => updateOption('errorCorrectionLevel', e.target.value as "L" | "M" | "Q" | "H")}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Higher levels make QR codes more resistant to damage but increase size
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Margin (Quiet Zone)</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">0</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={options.margin}
                    onChange={(e) => updateOption('margin', Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm">10</span>
                </div>
                <p className="text-xs text-muted-foreground">Current: {options.margin}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Scale</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">2</span>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    value={options.scale}
                    onChange={(e) => updateOption('scale', Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm">16</span>
                </div>
                <p className="text-xs text-muted-foreground">Current: {options.scale}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Foreground Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={options.color.dark}
                      onChange={(e) => updateColor('dark', e.target.value)}
                      className="w-10 h-10 rounded"
                    />
                    <Input
                      type="text"
                      value={options.color.dark}
                      onChange={(e) => updateColor('dark', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={options.color.light}
                      onChange={(e) => updateColor('light', e.target.value)}
                      className="w-10 h-10 rounded"
                    />
                    <Input
                      type="text"
                      value={options.color.light}
                      onChange={(e) => updateColor('light', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>About QR Codes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-2">What is a QR Code?</h3>
              <p className="text-muted-foreground">
                QR (Quick Response) codes are two-dimensional barcodes that can be scanned by smartphone cameras to quickly access information or perform actions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Error Correction</h3>
              <p className="text-muted-foreground">
                QR codes include error correction data that allows them to be readable even if partially damaged or obscured. Higher error correction levels make the code more resilient but larger.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Usage Tips</h3>
              <p className="text-muted-foreground">
                For best results, maintain high contrast between foreground and background colors. Test your QR code with multiple devices before distributing it widely.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}