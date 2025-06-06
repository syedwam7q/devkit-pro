"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { FileCode, Download, Copy, Trash, Plus, X, Palette, Square, Circle, Triangle, Type } from "lucide-react"

// SVG Shape Types
type ShapeType = "rect" | "circle" | "ellipse" | "line" | "polyline" | "polygon" | "path" | "text"

// SVG Shape Properties
interface SvgShape {
  id: string
  type: ShapeType
  properties: Record<string, string | number>
  style: Record<string, string>
}

// SVG Template
interface SvgTemplate {
  name: string
  width: number
  height: number
  shapes: SvgShape[]
}

// Predefined templates
const predefinedTemplates: SvgTemplate[] = [
  {
    name: "Simple Icon",
    width: 100,
    height: 100,
    shapes: [
      {
        id: "circle1",
        type: "circle",
        properties: {
          cx: 50,
          cy: 50,
          r: 40
        },
        style: {
          fill: "#3b82f6",
          stroke: "#1d4ed8",
          strokeWidth: "2"
        }
      },
      {
        id: "path1",
        type: "path",
        properties: {
          d: "M30,50 L70,50 M50,30 L50,70"
        },
        style: {
          fill: "none",
          stroke: "white",
          strokeWidth: "5",
          strokeLinecap: "round"
        }
      }
    ]
  },
  {
    name: "Abstract Pattern",
    width: 200,
    height: 200,
    shapes: [
      {
        id: "rect1",
        type: "rect",
        properties: {
          x: 10,
          y: 10,
          width: 180,
          height: 180,
          rx: 20
        },
        style: {
          fill: "#f3f4f6",
          stroke: "#d1d5db",
          strokeWidth: "2"
        }
      },
      {
        id: "circle1",
        type: "circle",
        properties: {
          cx: 100,
          cy: 100,
          r: 50
        },
        style: {
          fill: "#3b82f6",
          fillOpacity: "0.7"
        }
      },
      {
        id: "circle2",
        type: "circle",
        properties: {
          cx: 150,
          cy: 70,
          r: 30
        },
        style: {
          fill: "#ec4899",
          fillOpacity: "0.7"
        }
      },
      {
        id: "circle3",
        type: "circle",
        properties: {
          cx: 70,
          cy: 150,
          r: 25
        },
        style: {
          fill: "#10b981",
          fillOpacity: "0.7"
        }
      }
    ]
  },
  {
    name: "Logo Template",
    width: 150,
    height: 150,
    shapes: [
      {
        id: "rect1",
        type: "rect",
        properties: {
          x: 25,
          y: 25,
          width: 100,
          height: 100,
          rx: 10
        },
        style: {
          fill: "#3b82f6"
        }
      },
      {
        id: "text1",
        type: "text",
        properties: {
          x: 75,
          y: 85,
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          "font-size": 40,
          "font-weight": "bold",
          "font-family": "Arial, sans-serif"
        },
        style: {
          fill: "white"
        }
      }
    ]
  }
]

// Shape property definitions for UI
const shapeProperties: Record<ShapeType, { name: string, properties: Array<{ name: string, type: string, default: string | number }> }> = {
  rect: {
    name: "Rectangle",
    properties: [
      { name: "x", type: "number", default: 10 },
      { name: "y", type: "number", default: 10 },
      { name: "width", type: "number", default: 100 },
      { name: "height", type: "number", default: 50 },
      { name: "rx", type: "number", default: 0 },
      { name: "ry", type: "number", default: 0 }
    ]
  },
  circle: {
    name: "Circle",
    properties: [
      { name: "cx", type: "number", default: 50 },
      { name: "cy", type: "number", default: 50 },
      { name: "r", type: "number", default: 40 }
    ]
  },
  ellipse: {
    name: "Ellipse",
    properties: [
      { name: "cx", type: "number", default: 50 },
      { name: "cy", type: "number", default: 50 },
      { name: "rx", type: "number", default: 40 },
      { name: "ry", type: "number", default: 20 }
    ]
  },
  line: {
    name: "Line",
    properties: [
      { name: "x1", type: "number", default: 10 },
      { name: "y1", type: "number", default: 10 },
      { name: "x2", type: "number", default: 90 },
      { name: "y2", type: "number", default: 90 }
    ]
  },
  polyline: {
    name: "Polyline",
    properties: [
      { name: "points", type: "string", default: "10,10 30,30 50,10 70,30 90,10" }
    ]
  },
  polygon: {
    name: "Polygon",
    properties: [
      { name: "points", type: "string", default: "50,10 90,90 10,90" }
    ]
  },
  path: {
    name: "Path",
    properties: [
      { name: "d", type: "string", default: "M10,30 A20,20 0,0,1 50,30 A20,20 0,0,1 90,30 Q90,60 50,90 Q10,60 10,30 z" }
    ]
  },
  text: {
    name: "Text",
    properties: [
      { name: "x", type: "number", default: 50 },
      { name: "y", type: "number", default: 50 },
      { name: "text-anchor", type: "string", default: "middle" },
      { name: "dominant-baseline", type: "string", default: "middle" },
      { name: "font-size", type: "number", default: 16 },
      { name: "font-family", type: "string", default: "Arial, sans-serif" },
      { name: "content", type: "string", default: "Text" }
    ]
  }
}

// Common style properties
const styleProperties = [
  { name: "fill", type: "color", default: "#3b82f6" },
  { name: "stroke", type: "color", default: "none" },
  { name: "strokeWidth", type: "number", default: 1 },
  { name: "fillOpacity", type: "number", default: 1 },
  { name: "strokeOpacity", type: "number", default: 1 }
]

export default function SvgGeneratorPage() {
  const [svgWidth, setSvgWidth] = useState(200)
  const [svgHeight, setSvgHeight] = useState(200)
  const [shapes, setShapes] = useState<SvgShape[]>([])
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [svgCode, setSvgCode] = useState("")
  const [savedTemplates, setSavedTemplates] = useState<SvgTemplate[]>([])
  const [templateName, setTemplateName] = useState("")
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeTab, setActiveTab] = useState("editor")
  const [backgroundColor, setBackgroundColor] = useState("transparent")

  // Load saved templates from localStorage on component mount
  useEffect(() => {
    const savedTemplatesData = localStorage.getItem('svgTemplates')
    if (savedTemplatesData) {
      try {
        setSavedTemplates(JSON.parse(savedTemplatesData))
      } catch (e) {
        console.error('Failed to load saved templates', e)
      }
    }
  }, [])

  // Save templates to localStorage when they change
  useEffect(() => {
    if (savedTemplates.length > 0) {
      localStorage.setItem('svgTemplates', JSON.stringify(savedTemplates))
    }
  }, [savedTemplates])

  // Generate SVG code whenever shapes or dimensions change
  useEffect(() => {
    generateSvgCode()
  }, [shapes, svgWidth, svgHeight, backgroundColor])

  const generateSvgCode = () => {
    let code = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">\n`
    
    // Add background if not transparent
    if (backgroundColor !== "transparent") {
      code += `  <rect width="${svgWidth}" height="${svgHeight}" fill="${backgroundColor}" />\n`
    }
    
    // Add each shape
    shapes.forEach(shape => {
      code += `  <${shape.type}`
      
      // Add properties
      Object.entries(shape.properties).forEach(([key, value]) => {
        // Special handling for text content
        if (shape.type === "text" && key === "content") {
          return
        }
        code += ` ${key}="${value}"`
      })
      
      // Add style
      const styleString = Object.entries(shape.style)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`)
        .join(';')
      
      if (styleString) {
        code += ` style="${styleString}"`
      }
      
      // Close tag or add content for text
      if (shape.type === "text") {
        code += `>${shape.properties.content || ""}</text>\n`
      } else {
        code += ` />\n`
      }
    })
    
    code += `</svg>`
    setSvgCode(code)
  }

  const addShape = (type: ShapeType) => {
    const shapeProps = shapeProperties[type]
    const newShape: SvgShape = {
      id: `shape_${Date.now()}`,
      type,
      properties: {},
      style: {}
    }
    
    // Set default properties
    shapeProps.properties.forEach(prop => {
      if (prop.name === "content" && type === "text") {
        newShape.properties.content = prop.default
      } else {
        newShape.properties[prop.name] = prop.default
      }
    })
    
    // Set default styles
    styleProperties.forEach(prop => {
      newShape.style[prop.name] = String(prop.default)
    })
    
    setShapes(prev => [...prev, newShape])
    setSelectedShapeId(newShape.id)
  }

  const removeShape = (id: string) => {
    setShapes(prev => prev.filter(shape => shape.id !== id))
    if (selectedShapeId === id) {
      setSelectedShapeId(null)
    }
  }

  const updateShapeProperty = (id: string, propName: string, value: string | number) => {
    setShapes(prev => prev.map(shape => {
      if (shape.id === id) {
        return {
          ...shape,
          properties: {
            ...shape.properties,
            [propName]: value
          }
        }
      }
      return shape
    }))
  }

  const updateShapeStyle = (id: string, styleName: string, value: string) => {
    setShapes(prev => prev.map(shape => {
      if (shape.id === id) {
        return {
          ...shape,
          style: {
            ...shape.style,
            [styleName]: value
          }
        }
      }
      return shape
    }))
  }

  const moveShapeUp = (id: string) => {
    setShapes(prev => {
      const index = prev.findIndex(shape => shape.id === id)
      if (index < prev.length - 1) {
        const newShapes = [...prev]
        const temp = newShapes[index]
        newShapes[index] = newShapes[index + 1]
        newShapes[index + 1] = temp
        return newShapes
      }
      return prev
    })
  }

  const moveShapeDown = (id: string) => {
    setShapes(prev => {
      const index = prev.findIndex(shape => shape.id === id)
      if (index > 0) {
        const newShapes = [...prev]
        const temp = newShapes[index]
        newShapes[index] = newShapes[index - 1]
        newShapes[index - 1] = temp
        return newShapes
      }
      return prev
    })
  }

  const downloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${templateName || 'svg-generator'}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy: ', err))
  }

  const saveTemplate = () => {
    if (templateName.trim() === '') return
    
    const newTemplate: SvgTemplate = {
      name: templateName,
      width: svgWidth,
      height: svgHeight,
      shapes: shapes
    }
    
    setSavedTemplates(prev => [...prev, newTemplate])
    setTemplateName('')
  }

  const loadTemplate = (template: SvgTemplate) => {
    setSvgWidth(template.width)
    setSvgHeight(template.height)
    setShapes(template.shapes)
    setSelectedShapeId(null)
  }

  const deleteTemplate = (index: number) => {
    setSavedTemplates(prev => prev.filter((_, i) => i !== index))
  }

  const getSelectedShape = () => {
    return shapes.find(shape => shape.id === selectedShapeId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileCode className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">SVG Generator</h1>
          <p className="text-muted-foreground">
            Create and customize scalable vector graphics
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="code">SVG Code</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Canvas</CardTitle>
                  <CardDescription>
                    Preview your SVG design
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-hidden bg-muted/30 flex items-center justify-center p-4">
                    <div 
                      className="border border-dashed rounded-md overflow-hidden"
                      style={{ 
                        width: `${svgWidth}px`, 
                        height: `${svgHeight}px`,
                        backgroundColor
                      }}
                    >
                      <svg 
                        ref={svgRef}
                        width={svgWidth} 
                        height={svgHeight} 
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {shapes.map(shape => {
                          const isSelected = shape.id === selectedShapeId
                          
                          // Common props for all shapes
                          const commonProps = {
                            key: shape.id,
                            onClick: () => setSelectedShapeId(shape.id),
                            style: {
                              ...Object.fromEntries(
                                Object.entries(shape.style).map(([key, value]) => [
                                  key.replace(/([A-Z])/g, '-$1').toLowerCase(), 
                                  value
                                ])
                              ),
                              cursor: 'pointer',
                              outline: isSelected ? '2px dashed #3b82f6' : 'none'
                            }
                          }
                          
                          // Render different shape types
                          switch (shape.type) {
                            case 'rect':
                              return <rect 
                                {...commonProps}
                                x={shape.properties.x}
                                y={shape.properties.y}
                                width={shape.properties.width}
                                height={shape.properties.height}
                                rx={shape.properties.rx}
                                ry={shape.properties.ry}
                              />
                            case 'circle':
                              return <circle 
                                {...commonProps}
                                cx={shape.properties.cx}
                                cy={shape.properties.cy}
                                r={shape.properties.r}
                              />
                            case 'ellipse':
                              return <ellipse 
                                {...commonProps}
                                cx={shape.properties.cx}
                                cy={shape.properties.cy}
                                rx={shape.properties.rx}
                                ry={shape.properties.ry}
                              />
                            case 'line':
                              return <line 
                                {...commonProps}
                                x1={shape.properties.x1}
                                y1={shape.properties.y1}
                                x2={shape.properties.x2}
                                y2={shape.properties.y2}
                              />
                            case 'polyline':
                              return <polyline 
                                {...commonProps}
                                points={shape.properties.points as string}
                              />
                            case 'polygon':
                              return <polygon 
                                {...commonProps}
                                points={shape.properties.points as string}
                              />
                            case 'path':
                              return <path 
                                {...commonProps}
                                d={shape.properties.d as string}
                              />
                            case 'text':
                              return <text 
                                {...commonProps}
                                x={shape.properties.x}
                                y={shape.properties.y}
                                textAnchor={shape.properties["text-anchor"] as string}
                                dominantBaseline={shape.properties["dominant-baseline"] as string}
                                fontSize={shape.properties["font-size"]}
                                fontFamily={shape.properties["font-family"] as string}
                              >
                                {shape.properties.content}
                              </text>
                            default:
                              return null
                          }
                        })}
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Canvas Settings</CardTitle>
                  <CardDescription>
                    Adjust the dimensions and background of your SVG
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Width (px)</label>
                      <Input
                        type="number"
                        min="10"
                        max="1000"
                        value={svgWidth}
                        onChange={(e) => setSvgWidth(parseInt(e.target.value) || 100)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Height (px)</label>
                      <Input
                        type="number"
                        min="10"
                        max="1000"
                        value={svgHeight}
                        onChange={(e) => setSvgHeight(parseInt(e.target.value) || 100)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Background Color</label>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor }}
                        />
                        <Input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          placeholder="#ffffff or transparent"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Shapes</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => addShape("rect")}>
                        <Square className="h-4 w-4 mr-1" />
                        Rectangle
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addShape("circle")}>
                        <Circle className="h-4 w-4 mr-1" />
                        Circle
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addShape("path")}>
                        <Triangle className="h-4 w-4 mr-1" />
                        Path
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addShape("text")}>
                        <Type className="h-4 w-4 mr-1" />
                        Text
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Add and manage shapes in your SVG
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => addShape("ellipse")}>Ellipse</Button>
                      <Button variant="outline" size="sm" onClick={() => addShape("line")}>Line</Button>
                      <Button variant="outline" size="sm" onClick={() => addShape("polyline")}>Polyline</Button>
                      <Button variant="outline" size="sm" onClick={() => addShape("polygon")}>Polygon</Button>
                    </div>
                    
                    {shapes.length > 0 ? (
                      <div className="space-y-2">
                        {shapes.map((shape, index) => (
                          <div 
                            key={shape.id} 
                            className={`p-3 rounded-md flex items-center justify-between ${
                              selectedShapeId === shape.id ? 'bg-primary/10 border border-primary/30' : 'bg-muted'
                            }`}
                            onClick={() => setSelectedShapeId(shape.id)}
                          >
                            <div className="flex items-center">
                              <div className="w-6 h-6 flex items-center justify-center mr-2">
                                {shape.type === 'rect' && <Square className="h-4 w-4" />}
                                {shape.type === 'circle' && <Circle className="h-4 w-4" />}
                                {shape.type === 'ellipse' && <Circle className="h-4 w-4" />}
                                {shape.type === 'line' && <div className="w-4 h-0.5 bg-current transform rotate-45" />}
                                {shape.type === 'polyline' && <div className="w-4 h-4 flex items-center justify-center">
                                  <div className="w-3 h-0.5 bg-current transform -rotate-45" />
                                  <div className="w-3 h-0.5 bg-current transform rotate-45" />
                                </div>}
                                {shape.type === 'polygon' && <Triangle className="h-4 w-4" />}
                                {shape.type === 'path' && <Triangle className="h-4 w-4" />}
                                {shape.type === 'text' && <Type className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="font-medium">{shapeProperties[shape.type].name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {shape.type === 'text' 
                                    ? `"${shape.properties.content}"`
                                    : `${Object.keys(shape.properties).length} properties`
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveShapeUp(shape.id)
                                }}
                                disabled={index === shapes.length - 1}
                              >
                                <div className="transform rotate-90">→</div>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveShapeDown(shape.id)
                                }}
                                disabled={index === 0}
                              >
                                <div className="transform -rotate-90">→</div>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeShape(shape.id)
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No shapes added yet. Use the buttons above to add shapes to your SVG.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {selectedShapeId && getSelectedShape() && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shape Properties</CardTitle>
                    <CardDescription>
                      Edit the selected shape
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getSelectedShape() && (
                      <>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Properties</h3>
                          {shapeProperties[getSelectedShape()!.type].properties.map(prop => (
                            <div key={prop.name} className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm">{prop.name}</label>
                              {prop.type === "number" ? (
                                <Input
                                  type="number"
                                  className="col-span-2"
                                  value={getSelectedShape()!.properties[prop.name] || ""}
                                  onChange={(e) => updateShapeProperty(
                                    selectedShapeId,
                                    prop.name,
                                    e.target.value === "" ? "" : Number(e.target.value)
                                  )}
                                />
                              ) : (
                                <Input
                                  type="text"
                                  className="col-span-2"
                                  value={getSelectedShape()!.properties[prop.name] || ""}
                                  onChange={(e) => updateShapeProperty(
                                    selectedShapeId,
                                    prop.name,
                                    e.target.value
                                  )}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Style</h3>
                          {styleProperties.map(prop => (
                            <div key={prop.name} className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm">{prop.name}</label>
                              {prop.type === "color" ? (
                                <div className="col-span-2 flex gap-2">
                                  <div 
                                    className="w-8 h-8 rounded-md border"
                                    style={{ backgroundColor: getSelectedShape()!.style[prop.name] || "" }}
                                  />
                                  <Input
                                    type="text"
                                    className="flex-1"
                                    value={getSelectedShape()!.style[prop.name] || ""}
                                    onChange={(e) => updateShapeStyle(
                                      selectedShapeId,
                                      prop.name,
                                      e.target.value
                                    )}
                                  />
                                </div>
                              ) : prop.name.includes("Opacity") ? (
                                <div className="col-span-2 space-y-2">
                                  <Slider
                                    value={[parseFloat(getSelectedShape()!.style[prop.name] as string) || 1]}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    onValueChange={(value) => updateShapeStyle(
                                      selectedShapeId,
                                      prop.name,
                                      value[0].toString()
                                    )}
                                  />
                                  <div className="text-xs text-right">
                                    {getSelectedShape()!.style[prop.name] || 1}
                                  </div>
                                </div>
                              ) : (
                                <Input
                                  type="text"
                                  className="col-span-2"
                                  value={getSelectedShape()!.style[prop.name] || ""}
                                  onChange={(e) => updateShapeStyle(
                                    selectedShapeId,
                                    prop.name,
                                    e.target.value
                                  )}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Save & Export</CardTitle>
                  <CardDescription>
                    Save your design as a template or export as SVG
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template Name</label>
                    <div className="flex gap-2">
                      <Input
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="My SVG Design"
                      />
                      <Button 
                        onClick={saveTemplate}
                        disabled={!templateName.trim() || shapes.length === 0}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button onClick={downloadSvg} disabled={shapes.length === 0}>
                      <Download className="mr-2 h-4 w-4" />
                      Download SVG
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        copyToClipboard(svgCode)
                        setActiveTab("code")
                      }}
                      disabled={shapes.length === 0}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy SVG Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>SVG Code</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(svgCode)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
              </div>
              <CardDescription>
                The generated SVG code for your design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[500px] text-sm font-mono">
                  {svgCode}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Templates</CardTitle>
                <CardDescription>
                  Load or delete your saved templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedTemplates.length > 0 ? (
                  <div className="space-y-2">
                    {savedTemplates.map((template, index) => (
                      <div key={index} className="p-3 bg-muted rounded-md flex items-center justify-between">
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {template.width} × {template.height}, {template.shapes.length} shapes
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => loadTemplate(template)}
                          >
                            <FileCode className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteTemplate(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No saved templates yet. Create a design and save it as a template.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predefined Templates</CardTitle>
                <CardDescription>
                  Start with a predefined template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predefinedTemplates.map((template, index) => (
                    <div key={index} className="p-3 bg-muted rounded-md flex items-center justify-between">
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.width} × {template.height}, {template.shapes.length} shapes
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          loadTemplate(template)
                          setActiveTab("editor")
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>About SVG</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Scalable Vector Graphics (SVG)</strong> is an XML-based vector image format for two-dimensional graphics.
            Unlike raster formats such as JPEG or PNG, SVGs can be scaled to any size without losing quality.
          </p>
          <p>
            Key features of SVG:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Resolution-independent - looks crisp at any size</li>
            <li>Smaller file sizes for simple graphics</li>
            <li>Editable with text editors or vector graphics software</li>
            <li>Supports animation and interactivity</li>
            <li>Widely supported in modern browsers</li>
          </ul>
          <p className="mt-2">
            Common uses for SVG:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Icons and logos</li>
            <li>Illustrations and diagrams</li>
            <li>Charts and data visualizations</li>
            <li>Animated graphics</li>
            <li>Interactive web elements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}