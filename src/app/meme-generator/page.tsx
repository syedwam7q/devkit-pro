"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image, Upload, Download, RotateCcw, Plus, Trash, Type, Move, PanelTop, PanelBottom, AlignCenter } from "lucide-react"

// Meme template interface
interface MemeTemplate {
  id: string
  name: string
  url: string
  width: number
  height: number
}

// Text element interface
interface TextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  color: string
  strokeColor: string
  strokeWidth: number
  align: 'left' | 'center' | 'right'
  position: 'top' | 'middle' | 'bottom'
}

// Popular meme templates
const popularTemplates: MemeTemplate[] = [
  {
    id: "drake",
    name: "Drake Hotline Bling",
    url: "https://i.imgflip.com/30b1gx.jpg",
    width: 1200,
    height: 1200
  },
  {
    id: "distracted",
    name: "Distracted Boyfriend",
    url: "https://i.imgflip.com/1ur9b0.jpg",
    width: 1200,
    height: 800
  },
  {
    id: "buttons",
    name: "Two Buttons",
    url: "https://i.imgflip.com/1g8my4.jpg",
    width: 600,
    height: 908
  },
  {
    id: "change-mind",
    name: "Change My Mind",
    url: "https://i.imgflip.com/24y43o.jpg",
    width: 482,
    height: 361
  },
  {
    id: "expanding-brain",
    name: "Expanding Brain",
    url: "https://i.imgflip.com/1jwhww.jpg",
    width: 857,
    height: 1202
  },
  {
    id: "doge",
    name: "Doge",
    url: "https://i.imgflip.com/4t0m5.jpg",
    width: 620,
    height: 620
  },
  {
    id: "one-does-not",
    name: "One Does Not Simply",
    url: "https://i.imgflip.com/1bij.jpg",
    width: 568,
    height: 335
  },
  {
    id: "success-kid",
    name: "Success Kid",
    url: "https://i.imgflip.com/1bhk.jpg",
    width: 500,
    height: 500
  }
]

// Font options
const fontOptions = [
  "Impact, sans-serif",
  "Arial, sans-serif",
  "Helvetica, sans-serif",
  "Comic Sans MS, cursive",
  "Times New Roman, serif",
  "Courier New, monospace",
  "Verdana, sans-serif",
  "Georgia, serif"
]

export default function MemeGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null)
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null)
  const [savedMemes, setSavedMemes] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState("editor")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load saved memes from localStorage on component mount
  useEffect(() => {
    const savedMemesData = localStorage.getItem('savedMemes')
    if (savedMemesData) {
      try {
        setSavedMemes(JSON.parse(savedMemesData))
      } catch (e) {
        console.error('Failed to load saved memes', e)
      }
    }
  }, [])

  // Save memes to localStorage when they change
  useEffect(() => {
    if (savedMemes.length > 0) {
      localStorage.setItem('savedMemes', JSON.stringify(savedMemes))
    }
  }, [savedMemes])

  // Add default text elements when a template is selected
  useEffect(() => {
    if (selectedTemplate || customImage) {
      // Add default text elements if none exist
      if (textElements.length === 0) {
        setTextElements([
          createDefaultTextElement('top'),
          createDefaultTextElement('bottom')
        ])
      }
      
      // Generate the meme with the current settings
      generateMeme()
    }
  }, [selectedTemplate, customImage])

  // Create a default text element
  const createDefaultTextElement = (position: 'top' | 'middle' | 'bottom'): TextElement => {
    return {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: position === 'top' ? 'TOP TEXT' : 'BOTTOM TEXT',
      x: 50, // center percentage
      y: position === 'top' ? 10 : position === 'middle' ? 50 : 90, // percentage from top
      fontSize: 36,
      fontFamily: "Impact, sans-serif",
      color: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 2,
      align: 'center',
      position
    }
  }

  // Handle template selection
  const selectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template)
    setCustomImage(null)
    setTextElements([
      createDefaultTextElement('top'),
      createDefaultTextElement('bottom')
    ])
    setSelectedTextId(null)
  }

  // Handle custom image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      // Create an image to get dimensions
      const img = new window.Image()
      img.onload = () => {
        setCustomImage(e.target?.result as string)
        setSelectedTemplate(null)
        setTextElements([
          createDefaultTextElement('top'),
          createDefaultTextElement('bottom')
        ])
        setSelectedTextId(null)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Add a new text element
  const addTextElement = () => {
    const newPosition = textElements.length === 0 
      ? 'top' 
      : textElements.length === 1 
        ? 'bottom' 
        : 'middle'
    
    const newElement = createDefaultTextElement(newPosition)
    setTextElements(prev => [...prev, newElement])
    setSelectedTextId(newElement.id)
  }

  // Remove a text element
  const removeTextElement = (id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id))
    if (selectedTextId === id) {
      setSelectedTextId(null)
    }
  }

  // Update a text element property
  const updateTextElement = (id: string, property: keyof TextElement, value: any) => {
    setTextElements(prev => prev.map(el => {
      if (el.id === id) {
        return { ...el, [property]: value }
      }
      return el
    }))
    
    // Regenerate the meme after a short delay
    setTimeout(generateMeme, 100)
  }

  // Get the selected text element
  const getSelectedTextElement = () => {
    return textElements.find(el => el.id === selectedTextId)
  }

  // Generate the meme
  const generateMeme = () => {
    if (!canvasRef.current) return
    if (!selectedTemplate && !customImage) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Load the image
    const img = new window.Image()
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Draw each text element
      textElements.forEach(el => {
        // Calculate actual position from percentages
        const x = (el.x / 100) * canvas.width
        const y = (el.y / 100) * canvas.height
        
        // Set text styles
        ctx.font = `${el.fontSize}px ${el.fontFamily}`
        ctx.fillStyle = el.color
        ctx.strokeStyle = el.strokeColor
        ctx.lineWidth = el.strokeWidth
        ctx.textAlign = el.align
        
        // Draw the text
        const lines = el.text.split('\n')
        const lineHeight = el.fontSize * 1.2
        
        lines.forEach((line, i) => {
          const yPos = y + (i * lineHeight)
          
          // Draw text stroke
          ctx.strokeText(line, x, yPos)
          
          // Draw text fill
          ctx.fillText(line, x, yPos)
        })
      })
      
      // Convert canvas to data URL
      setGeneratedMeme(canvas.toDataURL('image/png'))
    }
    
    // Set image source
    img.src = selectedTemplate ? selectedTemplate.url : customImage!
  }

  // Download the generated meme
  const downloadMeme = () => {
    if (!generatedMeme) return
    
    const link = document.createElement('a')
    link.download = `meme_${Date.now()}.png`
    link.href = generatedMeme
    link.click()
  }

  // Save the generated meme
  const saveMeme = () => {
    if (!generatedMeme) return
    
    setSavedMemes(prev => [generatedMeme, ...prev].slice(0, 10))
  }

  // Reset the meme generator
  const resetMeme = () => {
    setSelectedTemplate(null)
    setCustomImage(null)
    setTextElements([])
    setSelectedTextId(null)
    setGeneratedMeme(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle mouse down for dragging text
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (!containerRef.current) return
    
    setIsDragging(true)
    setSelectedTextId(id)
    
    const containerRect = containerRef.current.getBoundingClientRect()
    setDragStartPos({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top
    })
  }

  // Handle mouse move for dragging text
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedTextId || !containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - containerRect.left
    const y = e.clientY - containerRect.top
    
    // Calculate the new position as a percentage of the container
    const newX = (x / containerRect.width) * 100
    const newY = (y / containerRect.height) * 100
    
    // Update the text element position
    updateTextElement(selectedTextId, 'x', Math.max(0, Math.min(100, newX)))
    updateTextElement(selectedTextId, 'y', Math.max(0, Math.min(100, newY)))
  }

  // Handle mouse up for dragging text
  const handleMouseUp = () => {
    setIsDragging(false)
    generateMeme()
  }

  // Position text element based on preset position
  const positionText = (id: string, position: 'top' | 'middle' | 'bottom') => {
    updateTextElement(id, 'position', position)
    updateTextElement(id, 'y', position === 'top' ? 10 : position === 'middle' ? 50 : 90)
    updateTextElement(id, 'x', 50)
    updateTextElement(id, 'align', 'center')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Image className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Meme Generator</h1>
          <p className="text-muted-foreground">
            Create custom memes with popular templates or your own images
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="editor" id="editor-tab">Meme Editor</TabsTrigger>
          <TabsTrigger value="templates" id="templates-tab">Templates</TabsTrigger>
          <TabsTrigger value="saved" id="saved-tab">Saved Memes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meme Preview</CardTitle>
                  <CardDescription>
                    {selectedTemplate 
                      ? `Editing: ${selectedTemplate.name}`
                      : customImage 
                        ? "Editing: Custom Image"
                        : "Select a template or upload an image to get started"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(selectedTemplate || customImage) ? (
                    <div 
                      ref={containerRef}
                      className="relative border rounded-md overflow-hidden bg-muted/30 flex items-center justify-center p-4"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <div className="relative">
                        <img 
                          src={selectedTemplate ? selectedTemplate.url : customImage!}
                          alt="Meme template"
                          className="max-w-full max-h-[500px] object-contain"
                        />
                        
                        {/* Text element overlays for editing */}
                        {textElements.map(el => {
                          const isSelected = el.id === selectedTextId
                          
                          return (
                            <div
                              key={el.id}
                              className={`absolute cursor-move ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                              style={{
                                left: `${el.x}%`,
                                top: `${el.y}%`,
                                transform: 'translate(-50%, -50%)',
                                textAlign: el.align,
                                color: el.color,
                                fontSize: `${el.fontSize}px`,
                                fontFamily: el.fontFamily,
                                textShadow: `
                                  -${el.strokeWidth}px -${el.strokeWidth}px 0 ${el.strokeColor},
                                  ${el.strokeWidth}px -${el.strokeWidth}px 0 ${el.strokeColor},
                                  -${el.strokeWidth}px ${el.strokeWidth}px 0 ${el.strokeColor},
                                  ${el.strokeWidth}px ${el.strokeWidth}px 0 ${el.strokeColor}
                                `,
                                whiteSpace: 'pre-line',
                                padding: '5px'
                              }}
                              onClick={() => setSelectedTextId(el.id)}
                              onMouseDown={(e) => handleMouseDown(e, el.id)}
                            >
                              {el.text}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center bg-muted/30 rounded-md">
                      <Image className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Select a template or upload an image to get started
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Button onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab("templates")}>
                          Browse Templates
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <canvas ref={canvasRef} className="hidden" />
                </CardContent>
              </Card>

              {(selectedTemplate || customImage) && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Text Elements</CardTitle>
                      <Button variant="outline" size="sm" onClick={addTextElement}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Text
                      </Button>
                    </div>
                    <CardDescription>
                      Add and edit text on your meme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {textElements.length > 0 ? (
                        <div className="space-y-2">
                          {textElements.map((el, index) => (
                            <div 
                              key={el.id} 
                              className={`p-3 rounded-md flex items-start justify-between ${
                                selectedTextId === el.id ? 'bg-primary/10 border border-primary/30' : 'bg-muted'
                              }`}
                              onClick={() => setSelectedTextId(el.id)}
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  {el.position === 'top' 
                                    ? 'Top Text' 
                                    : el.position === 'bottom' 
                                      ? 'Bottom Text' 
                                      : `Text ${index + 1}`
                                  }
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {el.text || "(empty)"}
                                </div>
                                <textarea
                                  value={el.text}
                                  onChange={(e) => updateTextElement(el.id, 'text', e.target.value)}
                                  className="w-full mt-2 p-2 text-sm border rounded-md"
                                  rows={2}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div className="flex space-x-1 ml-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    positionText(el.id, 'top')
                                  }}
                                  title="Position at top"
                                >
                                  <PanelTop className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    positionText(el.id, 'middle')
                                  }}
                                  title="Position in middle"
                                >
                                  <AlignCenter className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    positionText(el.id, 'bottom')
                                  }}
                                  title="Position at bottom"
                                >
                                  <PanelBottom className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeTextElement(el.id)
                                  }}
                                  title="Remove text"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No text elements added yet. Click "Add Text" to add text to your meme.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {(selectedTemplate || customImage) && (
                <>
                  {selectedTextId && getSelectedTextElement() && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Text Properties</CardTitle>
                        <CardDescription>
                          Customize the selected text
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Font Family</label>
                          <select
                            value={getSelectedTextElement()!.fontFamily}
                            onChange={(e) => updateTextElement(selectedTextId, 'fontFamily', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            {fontOptions.map((font, index) => (
                              <option key={index} value={font} style={{ fontFamily: font }}>
                                {font.split(',')[0]}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Font Size: {getSelectedTextElement()!.fontSize}px</label>
                          <Slider
                            value={[getSelectedTextElement()!.fontSize]}
                            min={12}
                            max={72}
                            step={1}
                            onValueChange={(value) => updateTextElement(selectedTextId, 'fontSize', value[0])}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Text Color</label>
                            <div className="flex gap-2">
                              <div 
                                className="w-10 h-10 rounded-md border"
                                style={{ backgroundColor: getSelectedTextElement()!.color }}
                              />
                              <Input
                                type="text"
                                value={getSelectedTextElement()!.color}
                                onChange={(e) => updateTextElement(selectedTextId, 'color', e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Stroke Color</label>
                            <div className="flex gap-2">
                              <div 
                                className="w-10 h-10 rounded-md border"
                                style={{ backgroundColor: getSelectedTextElement()!.strokeColor }}
                              />
                              <Input
                                type="text"
                                value={getSelectedTextElement()!.strokeColor}
                                onChange={(e) => updateTextElement(selectedTextId, 'strokeColor', e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Stroke Width: {getSelectedTextElement()!.strokeWidth}px</label>
                          <Slider
                            value={[getSelectedTextElement()!.strokeWidth]}
                            min={0}
                            max={5}
                            step={0.5}
                            onValueChange={(value) => updateTextElement(selectedTextId, 'strokeWidth', value[0])}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Text Alignment</label>
                          <div className="flex gap-2">
                            <Button 
                              variant={getSelectedTextElement()!.align === 'left' ? 'default' : 'outline'}
                              className="flex-1"
                              onClick={() => updateTextElement(selectedTextId, 'align', 'left')}
                            >
                              Left
                            </Button>
                            <Button 
                              variant={getSelectedTextElement()!.align === 'center' ? 'default' : 'outline'}
                              className="flex-1"
                              onClick={() => updateTextElement(selectedTextId, 'align', 'center')}
                            >
                              Center
                            </Button>
                            <Button 
                              variant={getSelectedTextElement()!.align === 'right' ? 'default' : 'outline'}
                              className="flex-1"
                              onClick={() => updateTextElement(selectedTextId, 'align', 'right')}
                            >
                              Right
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-muted rounded-md flex items-center">
                          <Move className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Drag text directly on the image to position it
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Generate & Save</CardTitle>
                      <CardDescription>
                        Generate your meme and save or download it
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button onClick={generateMeme} className="w-full">
                        Generate Meme
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={downloadMeme} disabled={!generatedMeme} className="flex-1">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="outline" onClick={saveMeme} disabled={!generatedMeme} className="flex-1">
                          <Plus className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={resetMeme} className="flex-1">
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                      </div>
                      
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">
                          Click "Generate Meme" to create your meme with the current settings.
                          Then you can download it or save it to your collection.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Quick Start</CardTitle>
                  <CardDescription>
                    Upload your own image or select a template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Your Own Image
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {popularTemplates.slice(0, 4).map(template => (
                      <div 
                        key={template.id}
                        className="border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-colors"
                        onClick={() => selectTemplate(template)}
                      >
                        <img 
                          src={template.url} 
                          alt={template.name}
                          className="w-full h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("templates")}
                  >
                    Browse All Templates
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" id="templates-tab">
          <Card>
            <CardHeader>
              <CardTitle>Meme Templates</CardTitle>
              <CardDescription>
                Select a template to start creating your meme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {popularTemplates.map(template => (
                  <div 
                    key={template.id}
                    className="border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      selectTemplate(template)
                      setActiveTab("editor")
                    }}
                  >
                    <img 
                      src={template.url} 
                      alt={template.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-2">
                      <h3 className="text-sm font-medium truncate">{template.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-md text-center">
                <p className="text-muted-foreground">
                  Don't see what you're looking for? Upload your own image!
                </p>
                <Button onClick={() => {
                  fileInputRef.current?.click()
                  setActiveTab("editor")
                }} className="mt-2">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Custom Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="saved" id="saved-tab">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Saved Memes</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSavedMemes([])
                    localStorage.removeItem('savedMemes')
                  }}
                  disabled={savedMemes.length === 0}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
              <CardDescription>
                Your collection of saved memes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedMemes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {savedMemes.map((meme, index) => (
                    <div key={index} className="border rounded-md overflow-hidden">
                      <img 
                        src={meme} 
                        alt={`Saved meme ${index + 1}`}
                        className="w-full h-40 object-contain bg-muted/30"
                      />
                      <div className="p-2 flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.download = `meme_${Date.now()}.png`
                            link.href = meme
                            link.click()
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            setSavedMemes(prev => prev.filter((_, i) => i !== index))
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved memes yet. Create and save some memes to see them here.</p>
                  <Button 
                    onClick={() => setActiveTab("editor")}
                    className="mt-4"
                  >
                    Create a Meme
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>About Meme Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Meme Generator</strong> allows you to create custom memes using popular templates or your own images.
            Add text, customize fonts, colors, and positioning to create the perfect meme.
          </p>
          <p>
            Tips for creating great memes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Keep text concise and punchy</li>
            <li>Use contrasting colors for better readability</li>
            <li>Position text strategically to work with the image</li>
            <li>Consider your audience and the context</li>
            <li>Be creative and have fun!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}