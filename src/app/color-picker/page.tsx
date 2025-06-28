"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Copy, History, Plus, Trash } from "lucide-react"
import { useTheme } from "next-themes"

// Color conversion utilities
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360
  s /= 100
  l /= 100
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

// Color contrast calculation
const calculateContrast = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 0
  
  const luminance1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b)
  const luminance2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const brightest = Math.max(luminance1, luminance2)
  const darkest = Math.min(luminance1, luminance2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

const calculateLuminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

// Get contrast rating
const getContrastRating = (ratio: number): { rating: string; pass: boolean } => {
  if (ratio >= 7) {
    return { rating: "AAA", pass: true }
  } else if (ratio >= 4.5) {
    return { rating: "AA", pass: true }
  } else if (ratio >= 3) {
    return { rating: "AA Large", pass: true }
  } else {
    return { rating: "Fail", pass: false }
  }
}

// Generate complementary color
const getComplementaryColor = (hex: string): string => {
  const rgb = hexToRgb(hex)
  if (!rgb) return "#000000"
  
  const r = 255 - rgb.r
  const g = 255 - rgb.g
  const b = 255 - rgb.b
  
  return rgbToHex(r, g, b)
}

// Generate analogous colors
const getAnalogousColors = (hex: string): string[] => {
  const rgb = hexToRgb(hex)
  if (!rgb) return ["#000000", "#000000"]
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  const hsl1 = { ...hsl, h: (hsl.h + 30) % 360 }
  const hsl2 = { ...hsl, h: (hsl.h + 330) % 360 }
  
  const rgb1 = hslToRgb(hsl1.h, hsl1.s, hsl1.l)
  const rgb2 = hslToRgb(hsl2.h, hsl2.s, hsl2.l)
  
  return [rgbToHex(rgb1.r, rgb1.g, rgb1.b), rgbToHex(rgb2.r, rgb2.g, rgb2.b)]
}

// Generate triadic colors
const getTriadicColors = (hex: string): string[] => {
  const rgb = hexToRgb(hex)
  if (!rgb) return ["#000000", "#000000"]
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  const hsl1 = { ...hsl, h: (hsl.h + 120) % 360 }
  const hsl2 = { ...hsl, h: (hsl.h + 240) % 360 }
  
  const rgb1 = hslToRgb(hsl1.h, hsl1.s, hsl1.l)
  const rgb2 = hslToRgb(hsl2.h, hsl2.s, hsl2.l)
  
  return [rgbToHex(rgb1.r, rgb1.g, rgb1.b), rgbToHex(rgb2.r, rgb2.g, rgb2.b)]
}

// Generate shades
const getShades = (hex: string, count: number = 5): string[] => {
  const rgb = hexToRgb(hex)
  if (!rgb) return Array(count).fill("#000000")
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const step = 100 / (count + 1)
  
  return Array.from({ length: count }, (_, i) => {
    const lightness = step * (i + 1)
    const newRgb = hslToRgb(hsl.h, hsl.s, lightness)
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
  })
}

// Color palette type
type ColorPalette = {
  name: string
  colors: string[]
}

export default function ColorPickerPage() {
  const [color, setColor] = useState("#3b82f6")
  const [rgbValues, setRgbValues] = useState({ r: 59, g: 130, b: 246 })
  const [hslValues, setHslValues] = useState({ h: 217, s: 91, l: 60 })
  const [colorHistory, setColorHistory] = useState<string[]>([])
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([])
  const [currentPalette, setCurrentPalette] = useState<string[]>([])
  const [paletteName, setPaletteName] = useState("")
  const [eyeDropperSupported, setEyeDropperSupported] = useState(false)
  const [contrastColor, setContrastColor] = useState("#ffffff")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { resolvedTheme } = useTheme()

  // Check if EyeDropper API is supported
  useEffect(() => {
    setEyeDropperSupported('EyeDropper' in window)
    
    // Load saved palettes from localStorage
    const savedPalettesData = localStorage.getItem('colorPalettes')
    if (savedPalettesData) {
      try {
        setSavedPalettes(JSON.parse(savedPalettesData))
      } catch (e) {
        console.error('Failed to load saved palettes', e)
      }
    }
    
    // Load color history from localStorage
    const colorHistoryData = localStorage.getItem('colorHistory')
    if (colorHistoryData) {
      try {
        setColorHistory(JSON.parse(colorHistoryData))
      } catch (e) {
        console.error('Failed to load color history', e)
      }
    }
  }, [])
  
  // Save palettes to localStorage when they change
  useEffect(() => {
    if (savedPalettes.length > 0) {
      localStorage.setItem('colorPalettes', JSON.stringify(savedPalettes))
    }
  }, [savedPalettes])
  
  // Save color history to localStorage when it changes
  useEffect(() => {
    if (colorHistory.length > 0) {
      localStorage.setItem('colorHistory', JSON.stringify(colorHistory))
    }
  }, [colorHistory])

  // Update RGB and HSL values when color changes
  useEffect(() => {
    const rgb = hexToRgb(color)
    if (rgb) {
      setRgbValues(rgb)
      setHslValues(rgbToHsl(rgb.r, rgb.g, rgb.b))
      
      // Generate a palette based on the current color
      const complementary = getComplementaryColor(color)
      const analogous = getAnalogousColors(color)
      const triadic = getTriadicColors(color)
      
      setCurrentPalette([color, ...analogous, complementary, ...triadic])
    }
  }, [color])

  const handleColorChange = (newColor: string) => {
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      setColor(newColor)
      addToHistory(newColor)
    }
  }

  const handleRgbChange = (key: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgbValues, [key]: value }
    setRgbValues(newRgb)
    const newColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setColor(newColor)
    addToHistory(newColor)
  }

  const handleHslChange = (key: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...hslValues, [key]: value }
    setHslValues(newHsl)
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
    setRgbValues(rgb)
    const newColor = rgbToHex(rgb.r, rgb.g, rgb.b)
    setColor(newColor)
    addToHistory(newColor)
  }

  const addToHistory = (newColor: string) => {
    setColorHistory(prev => {
      // Don't add if it's the same as the last color
      if (prev.length > 0 && prev[0] === newColor) return prev
      
      // Add to the beginning, limit to 20 colors
      const updated = [newColor, ...prev.filter(c => c !== newColor)].slice(0, 20)
      return updated
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy: ', err))
  }

  const savePalette = () => {
    if (paletteName.trim() === '') return
    
    const newPalette: ColorPalette = {
      name: paletteName,
      colors: currentPalette
    }
    
    setSavedPalettes(prev => [...prev, newPalette])
    setPaletteName('')
  }

  const deletePalette = (index: number) => {
    setSavedPalettes(prev => prev.filter((_, i) => i !== index))
  }

  const useEyeDropper = async () => {
    if (!('EyeDropper' in window)) return
    
    try {
      // @ts-ignore - EyeDropper API is not in TypeScript yet
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      handleColorChange(result.sRGBHex)
    } catch (e) {
      console.error('Failed to use eye dropper', e)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        if (!canvasRef.current) return
        
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        // Resize canvas to match image
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0)
        
        // Get dominant color (simple implementation - average of pixels)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        let r = 0, g = 0, b = 0
        const pixelCount = data.length / 4
        
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        }
        
        r = Math.floor(r / pixelCount)
        g = Math.floor(g / pixelCount)
        b = Math.floor(b / pixelCount)
        
        const dominantColor = rgbToHex(r, g, b)
        handleColorChange(dominantColor)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const contrastRatio = calculateContrast(color, contrastColor)
  const contrastRating = getContrastRating(contrastRatio)

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .color-display {
          border: 2px solid ${resolvedTheme === 'blackwhite' ? '#ffffff' : 'hsl(var(--border))'} !important;
        }
        .color-swatch {
          border: 1px solid ${resolvedTheme === 'blackwhite' ? '#ffffff' : 'hsl(var(--border))'} !important;
        }
      `}</style>
      
      <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Palette className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Color Picker</h1>
            <p className="text-muted-foreground">
              Select, analyze, and create color palettes
            </p>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Picker</CardTitle>
              <CardDescription>
                Select a color using different methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hex">
                <TabsList className="mb-4">
                  <TabsTrigger value="hex">Hex</TabsTrigger>
                  <TabsTrigger value="rgb">RGB</TabsTrigger>
                  <TabsTrigger value="hsl">HSL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="hex" className="space-y-4">
                  <div className="flex gap-4">
                    <div 
                      className="w-16 h-16 rounded-md color-display"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <label className="text-sm font-medium">Hex Color</label>
                      <div className="flex mt-1">
                        <Input
                          value={color}
                          onChange={(e) => handleColorChange(e.target.value)}
                          className="font-mono"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="ml-2"
                          onClick={() => copyToClipboard(color)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {eyeDropperSupported && (
                      <Button variant="outline" onClick={useEyeDropper}>
                        Pick Color from Screen
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Extract from Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="rgb" className="space-y-4">
                  <div className="flex gap-4">
                    <div 
                      className="w-16 h-16 rounded-md color-display"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Red ({rgbValues.r})</label>
                          <Slider
                            value={[rgbValues.r]}
                            min={0}
                            max={255}
                            step={1}
                            onValueChange={(value) => handleRgbChange('r', value[0])}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Green ({rgbValues.g})</label>
                          <Slider
                            value={[rgbValues.g]}
                            min={0}
                            max={255}
                            step={1}
                            onValueChange={(value) => handleRgbChange('g', value[0])}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Blue ({rgbValues.b})</label>
                          <Slider
                            value={[rgbValues.b]}
                            min={0}
                            max={255}
                            step={1}
                            onValueChange={(value) => handleRgbChange('b', value[0])}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex">
                        <Input
                          value={`rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`}
                          readOnly
                          className="font-mono"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="ml-2"
                          onClick={() => copyToClipboard(`rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="hsl" className="space-y-4">
                  <div className="flex gap-4">
                    <div 
                      className="w-16 h-16 rounded-md color-display"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Hue ({hslValues.h}°)</label>
                          <Slider
                            value={[hslValues.h]}
                            min={0}
                            max={360}
                            step={1}
                            onValueChange={(value) => handleHslChange('h', value[0])}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Saturation ({hslValues.s}%)</label>
                          <Slider
                            value={[hslValues.s]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value) => handleHslChange('s', value[0])}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Lightness ({hslValues.l}%)</label>
                          <Slider
                            value={[hslValues.l]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value) => handleHslChange('l', value[0])}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex">
                        <Input
                          value={`hsl(${hslValues.h}, ${hslValues.s}%, ${hslValues.l}%)`}
                          readOnly
                          className="font-mono"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="ml-2"
                          onClick={() => copyToClipboard(`hsl(${hslValues.h}, ${hslValues.s}%, ${hslValues.l}%)`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>
                Harmonious colors based on your selection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-6 gap-2">
                {currentPalette.map((paletteColor, index) => (
                  <div key={index} className="space-y-1">
                    <div
                      className="h-12 rounded-md border cursor-pointer"
                      style={{ backgroundColor: paletteColor }}
                      onClick={() => handleColorChange(paletteColor)}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono">{paletteColor}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(paletteColor)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium">Palette Name</label>
                  <Input
                    value={paletteName}
                    onChange={(e) => setPaletteName(e.target.value)}
                    placeholder="My Color Palette"
                    className="mt-1"
                  />
                </div>
                <Button onClick={savePalette} disabled={paletteName.trim() === ''}>
                  <Plus className="mr-2 h-4 w-4" />
                  Save Palette
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contrast Checker</CardTitle>
              <CardDescription>
                Check color contrast for accessibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Background Color</label>
                  <div className="flex mt-1">
                    <div
                      className="w-10 h-10 rounded-l-md color-display"
                      style={{ backgroundColor: color }}
                    />
                    <Input
                      value={color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="font-mono rounded-l-none"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="text-sm font-medium">Text Color</label>
                  <div className="flex mt-1">
                    <div
                      className="w-10 h-10 rounded-l-md border-y border-l"
                      style={{ backgroundColor: contrastColor }}
                    />
                    <Input
                      value={contrastColor}
                      onChange={(e) => setContrastColor(e.target.value)}
                      className="font-mono rounded-l-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-md color-display" style={{ backgroundColor: color }}>
                <p className="text-2xl font-bold" style={{ color: contrastColor }}>
                  Sample Text
                </p>
                <p className="text-sm" style={{ color: contrastColor }}>
                  This is an example of how text would appear with these colors.
                </p>
              </div>
              
              <div className="flex gap-4 text-center">
                <div className="flex-1 p-3 rounded-md bg-muted">
                  <div className="text-2xl font-bold">{contrastRatio.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Contrast Ratio</div>
                </div>
                
                <div className={`flex-1 p-3 rounded-md ${contrastRating.pass ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <div className={`text-2xl font-bold ${contrastRating.pass ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {contrastRating.rating}
                  </div>
                  <div className="text-sm text-muted-foreground">WCAG Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color History</CardTitle>
              <CardDescription>
                Recently used colors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {colorHistory.map((historyColor, index) => (
                  <div
                    key={index}
                    className="h-10 rounded-md border cursor-pointer relative group"
                    style={{ backgroundColor: historyColor }}
                    onClick={() => handleColorChange(historyColor)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-md transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(historyColor)
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {colorHistory.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No color history yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Palettes</CardTitle>
              <CardDescription>
                Your custom color palettes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedPalettes.map((palette, paletteIndex) => (
                  <div key={paletteIndex} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{palette.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => deletePalette(paletteIndex)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex">
                      {palette.colors.map((paletteColor, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="flex-1 h-8 cursor-pointer first:rounded-l-md last:rounded-r-md"
                          style={{ backgroundColor: paletteColor }}
                          onClick={() => handleColorChange(paletteColor)}
                          title={paletteColor}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                
                {savedPalettes.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No saved palettes yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shades & Tints</CardTitle>
              <CardDescription>
                Variations of the selected color
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {getShades(color, 9).map((shade, index) => (
                  <div
                    key={index}
                    className="flex items-center h-8 cursor-pointer group"
                    onClick={() => handleColorChange(shade)}
                  >
                    <div
                      className="w-full h-full rounded-l-md"
                      style={{ backgroundColor: shade }}
                    />
                    <div className="bg-muted px-2 h-full flex items-center rounded-r-md">
                      <span className="text-xs font-mono">{shade}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(shade)
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}