"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Image, Upload, Download, RotateCcw } from "lucide-react"
import { formatBytes } from "@/lib/utils"

export default function ImageResizerPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [resizedImage, setResizedImage] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0, fileSize: 0 })
  const [targetSize, setTargetSize] = useState({ width: 0, height: 0 })
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        setOriginalImage(e.target?.result as string)
        setOriginalSize({
          width: img.width,
          height: img.height,
          fileSize: file.size
        })
        setTargetSize({
          width: img.width,
          height: img.height
        })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleWidthChange = (width: number) => {
    setTargetSize(prev => {
      if (maintainAspectRatio && originalSize.width > 0) {
        const aspectRatio = originalSize.height / originalSize.width
        return { width, height: Math.round(width * aspectRatio) }
      }
      return { ...prev, width }
    })
  }

  const handleHeightChange = (height: number) => {
    setTargetSize(prev => {
      if (maintainAspectRatio && originalSize.height > 0) {
        const aspectRatio = originalSize.width / originalSize.height
        return { width: Math.round(height * aspectRatio), height }
      }
      return { ...prev, height }
    })
  }

  const resizeImage = () => {
    if (!originalImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.onload = () => {
      canvas.width = targetSize.width
      canvas.height = targetSize.height
      
      ctx.drawImage(img, 0, 0, targetSize.width, targetSize.height)
      setResizedImage(canvas.toDataURL('image/png'))
    }
    img.src = originalImage
  }

  const downloadResizedImage = () => {
    if (!canvasRef.current) return
    
    const link = document.createElement('a')
    link.download = `resized_${fileName}`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const reset = () => {
    setOriginalImage(null)
    setResizedImage(null)
    setOriginalSize({ width: 0, height: 0, fileSize: 0 })
    setTargetSize({ width: 0, height: 0 })
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Image className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Image Resizer</h1>
          <p className="text-muted-foreground">
            Resize images while maintaining quality and aspect ratio
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Select an image file to resize (JPG, PNG, GIF, WebP)
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
                Selected: {fileName}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {originalImage && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Original Image</CardTitle>
                <CardDescription>
                  {originalSize.width} × {originalSize.height} pixels
                  <br />
                  File size: {formatBytes(originalSize.fileSize)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={originalImage}
                  alt="Original"
                  className="max-w-full h-auto border rounded"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resize Settings</CardTitle>
                <CardDescription>
                  Set the target dimensions for your image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Width (px)</label>
                    <Input
                      type="number"
                      value={targetSize.width}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Height (px)</label>
                    <Input
                      type="number"
                      value={targetSize.height}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aspectRatio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="aspectRatio" className="text-sm">
                    Maintain aspect ratio
                  </label>
                </div>

                <Button onClick={resizeImage} className="w-full">
                  Resize Image
                </Button>
              </CardContent>
            </Card>
          </div>

          {resizedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Resized Image</CardTitle>
                <CardDescription>
                  {targetSize.width} × {targetSize.height} pixels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={resizedImage}
                  alt="Resized"
                  className="max-w-full h-auto border rounded"
                />
                <Button onClick={downloadResizedImage} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Resized Image
                </Button>
              </CardContent>
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  )
}