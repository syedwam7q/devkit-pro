"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Upload, Download, RotateCcw, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { formatBytes } from "@/lib/utils"

// Define supported formats
const supportedFormats = [
  { value: "image/jpeg", label: "JPEG", extension: ".jpg" },
  { value: "image/png", label: "PNG", extension: ".png" },
  { value: "image/webp", label: "WebP", extension: ".webp" },
  { value: "image/gif", label: "GIF", extension: ".gif" },
  { value: "image/bmp", label: "BMP", extension: ".bmp" }
]

export default function ImageConverterPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [convertedImage, setConvertedImage] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [convertedSize, setConvertedSize] = useState(0)
  const [fileName, setFileName] = useState("")
  const [originalFormat, setOriginalFormat] = useState("")
  const [targetFormat, setTargetFormat] = useState("image/png")
  const [isConverting, setIsConverting] = useState(false)
  const [quality, setQuality] = useState(90)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(100)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalImageRef = useRef<HTMLImageElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name.split('.')[0])
    setOriginalSize(file.size)
    setOriginalFormat(file.type)
    setConvertedImage(null)
    setRotation(0)
    setZoom(100)
    
    // Set a default target format different from the original
    if (file.type === "image/png") {
      setTargetFormat("image/jpeg")
    } else {
      setTargetFormat("image/png")
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const convertImage = () => {
    if (!originalImage || !canvasRef.current || !originalImageRef.current) return
    
    setIsConverting(true)
    
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setIsConverting(false)
        return
      }
      
      const img = originalImageRef.current
      
      // Set canvas dimensions based on the image and zoom level
      const scaleFactor = zoom / 100
      canvas.width = img.naturalWidth * scaleFactor
      canvas.height = img.naturalHeight * scaleFactor
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Apply rotation if needed
      if (rotation !== 0) {
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        
        // Draw the image centered
        ctx.drawImage(
          img,
          -img.naturalWidth * scaleFactor / 2,
          -img.naturalHeight * scaleFactor / 2,
          img.naturalWidth * scaleFactor,
          img.naturalHeight * scaleFactor
        )
        
        ctx.restore()
      } else {
        // Draw the image without rotation
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      
      // Convert canvas to the target format
      const convertedDataUrl = canvas.toDataURL(targetFormat, quality / 100)
      setConvertedImage(convertedDataUrl)
      
      // Calculate converted size
      const base64String = convertedDataUrl.split(',')[1]
      const convertedBytes = atob(base64String).length
      setConvertedSize(convertedBytes)
      
      setIsConverting(false)
    } catch (error) {
      console.error('Error converting image:', error)
      setIsConverting(false)
    }
  }

  const downloadConvertedImage = () => {
    if (!convertedImage) return
    
    const link = document.createElement('a')
    const extension = supportedFormats.find(format => format.value === targetFormat)?.extension || '.png'
    link.download = `${fileName}_converted${extension}`
    link.href = convertedImage
    link.click()
  }

  const reset = () => {
    setOriginalImage(null)
    setConvertedImage(null)
    setOriginalSize(0)
    setConvertedSize(0)
    setFileName("")
    setOriginalFormat("")
    setTargetFormat("image/png")
    setIsConverting(false)
    setRotation(0)
    setZoom(100)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const rotateImage = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360)
    // Clear the converted image so user knows they need to convert again
    setConvertedImage(null)
  }

  const adjustZoom = (amount: number) => {
    setZoom((prev) => Math.max(10, Math.min(200, prev + amount)))
    // Clear the converted image so user knows they need to convert again
    setConvertedImage(null)
  }

  const formatLabel = (mimeType: string): string => {
    return supportedFormats.find(format => format.value === mimeType)?.label || mimeType
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ImageIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Image Converter</h1>
          <p className="text-muted-foreground">
            Convert images between different formats
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Select an image file to convert
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Choose Image
              </Button>
              {originalImage && (
                <Button onClick={reset} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {fileName && (
              <p className="text-sm text-muted-foreground">
                Selected: {fileName} ({formatLabel(originalFormat)}, {formatBytes(originalSize)})
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {originalImage && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Conversion Settings</CardTitle>
              <CardDescription>
                Choose the target format and adjust image settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Format</label>
                  <select
                    value={targetFormat}
                    onChange={(e) => {
                      setTargetFormat(e.target.value)
                      setConvertedImage(null)
                    }}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    {supportedFormats.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Quality: {quality}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => {
                      setQuality(parseInt(e.target.value))
                      setConvertedImage(null)
                    }}
                    className="w-full mt-2"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button onClick={convertImage} className="w-full" disabled={isConverting}>
                    {isConverting ? "Converting..." : "Convert Image"}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => rotateImage(90)}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Rotate 90°
                </Button>
                <Button variant="outline" size="sm" onClick={() => rotateImage(-90)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Rotate -90°
                </Button>
                <Button variant="outline" size="sm" onClick={() => adjustZoom(10)}>
                  <ZoomIn className="mr-2 h-4 w-4" />
                  Zoom In
                </Button>
                <Button variant="outline" size="sm" onClick={() => adjustZoom(-10)}>
                  <ZoomOut className="mr-2 h-4 w-4" />
                  Zoom Out
                </Button>
                <div className="ml-auto text-sm text-muted-foreground">
                  Zoom: {zoom}% | Rotation: {rotation}°
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Original Image</CardTitle>
                <CardDescription>
                  {formatLabel(originalFormat)} • {formatBytes(originalSize)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden bg-muted/30 flex items-center justify-center p-2">
                  <img
                    ref={originalImageRef}
                    src={originalImage}
                    alt="Original"
                    className="max-w-full max-h-[400px] object-contain"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Converted Image</CardTitle>
                <CardDescription>
                  {convertedImage 
                    ? `${formatLabel(targetFormat)} • ${formatBytes(convertedSize)}`
                    : "Convert the image to see the result"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {convertedImage ? (
                  <div className="space-y-4">
                    <div className="border rounded-md overflow-hidden bg-muted/30 flex items-center justify-center p-2">
                      <img
                        src={convertedImage}
                        alt="Converted"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    </div>
                    <Button onClick={downloadConvertedImage} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Converted Image
                    </Button>
                  </div>
                ) : (
                  <div className="h-[400px] flex flex-col items-center justify-center bg-muted/30 rounded-md">
                    <div className="mb-2">
                      {isConverting ? (
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {isConverting ? "Converting image..." : "Click 'Convert Image' to see the result"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Image Conversion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Image conversion</strong> allows you to change the file format of your images.
            Different formats have different advantages:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>JPEG</strong> - Best for photographs and complex images with many colors. Lossy compression.</li>
            <li><strong>PNG</strong> - Supports transparency and is best for images with sharp edges, text, or screenshots. Lossless compression.</li>
            <li><strong>WebP</strong> - Modern format with better compression than JPEG and PNG, but less compatibility with older software.</li>
            <li><strong>GIF</strong> - Supports animation and transparency, but limited to 256 colors.</li>
            <li><strong>BMP</strong> - Uncompressed format that preserves all image data, but results in large file sizes.</li>
          </ul>
          <p className="mt-2">
            <strong>Note:</strong> Converting between formats may result in quality loss, especially when converting from lossless (PNG, BMP) to lossy (JPEG) formats.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}