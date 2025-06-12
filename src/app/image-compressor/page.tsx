"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Image as ImageIcon, Download, RotateCcw } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import imageCompression from "browser-image-compression"
import { FileUpload } from "@/components/file-upload"
import { ToolLayout } from "@/components/tool-layout"

// Add type declaration for the window object
declare global {
  interface Window {
    qualityChangeTimeout: ReturnType<typeof setTimeout> | undefined;
  }
}

export default function ImageCompressorPage() {
  return (
    <ToolLayout>
      <ImageCompressor />
    </ToolLayout>
  )
}

function ImageCompressor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [compressedImage, setCompressedImage] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [quality, setQuality] = useState(80)
  const [fileName, setFileName] = useState("")
  const [imageType, setImageType] = useState("image/jpeg")
  const [isCompressing, setIsCompressing] = useState(false)
  const [originalFile, setOriginalFile] = useState<File | null>(null)

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      reset()
      return
    }

    setFileName(file.name)
    setOriginalSize(file.size)
    setCompressedImage(null)
    setOriginalFile(file)
    
    // Auto-detect image type
    if (file.type.includes("png")) {
      setImageType("image/png")
    } else if (file.type.includes("webp")) {
      setImageType("image/webp")
    } else {
      setImageType("image/jpeg")
    }

    // Display original image
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Compress the image
    await compressImage(file, quality)
  }

  const compressImage = async (file: File, qualityValue: number) => {
    try {
      setIsCompressing(true)
      setCompressedImage(null)
      
      console.log(`Compressing with quality: ${qualityValue}%, format: ${imageType}`);
      
      // Try using the browser-image-compression library first
      try {
        // Compression options
        const options = {
          maxSizeMB: 10, // Maximum file size in MB
          maxWidthOrHeight: 1920, // Maximum width or height
          useWebWorker: true, // Use web worker for better performance
          fileType: imageType,
          initialQuality: qualityValue / 100, // Convert from 0-100 to 0-1
          alwaysKeepResolution: true, // Maintain original resolution
        }
  
        console.log("Compression options:", options);
  
        // Compress the image
        const compressedFile = await imageCompression(file, options)
        console.log("Original size:", formatBytes(file.size));
        console.log("Compressed size:", formatBytes(compressedFile.size));
        
        // If the compression didn't reduce the size significantly, use the canvas method
        if (compressedFile.size > file.size * 0.9 && qualityValue < 90) {
          console.log("Library compression not effective, using canvas method");
          await compressWithCanvas(file, qualityValue);
          return;
        }
        
        // Convert to data URL for display
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setCompressedImage(result)
          
          // Calculate compressed size
          setCompressedSize(compressedFile.size)
          setIsCompressing(false)
        }
        reader.readAsDataURL(compressedFile)
      } catch (libraryError) {
        console.error('Error with library compression, falling back to canvas method:', libraryError)
        await compressWithCanvas(file, qualityValue);
      }
    } catch (error) {
      console.error('Error compressing image:', error)
      setIsCompressing(false)
    }
  }
  
  const compressWithCanvas = async (file: File, qualityValue: number) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Create an image element
        const img = new Image();
        img.onload = () => {
          // Create a canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsCompressing(false);
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image to canvas
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          // Convert canvas to compressed data URL
          const quality = qualityValue / 100;
          const compressedDataUrl = canvas.toDataURL(imageType, quality);
          setCompressedImage(compressedDataUrl);
          
          // Calculate compressed size
          const base64String = compressedDataUrl.split(',')[1];
          const compressedBytes = atob(base64String).length;
          setCompressedSize(compressedBytes);
          setIsCompressing(false);
          resolve();
        };
        
        img.onerror = (err) => {
          setIsCompressing(false);
          reject(err);
        };
        
        // Load the image from the file
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setIsCompressing(false);
        reject(error);
      }
    });
  }

  const handleQualityChange = async (value: number[]) => {
    const newQuality = value[0]
    setQuality(newQuality)
    
    // We need to debounce this to avoid too many recompressions
    // when the user is dragging the slider
    if (window.qualityChangeTimeout) {
      clearTimeout(window.qualityChangeTimeout)
    }
    
    window.qualityChangeTimeout = setTimeout(() => {
      if (originalFile) {
        compressImage(originalFile, newQuality)
      }
    }, 300) // 300ms debounce
  }

  const handleFormatChange = (newFormat: string) => {
    setImageType(newFormat)
    if (originalFile) {
      compressImage(originalFile, quality)
    }
  }

  const downloadCompressedImage = () => {
    if (!compressedImage) return
    
    const link = document.createElement('a')
    const extension = imageType.split('/')[1]
    link.download = `compressed_${fileName.split('.')[0]}.${extension}`
    link.href = compressedImage
    link.click()
  }

  const reset = () => {
    setOriginalImage(null)
    setCompressedImage(null)
    setOriginalSize(0)
    setCompressedSize(0)
    setQuality(80)
    setFileName("")
    setIsCompressing(false)
    setOriginalFile(null)
    if (window.qualityChangeTimeout) {
      clearTimeout(window.qualityChangeTimeout)
    }
  }

  const compressionRatio = originalSize > 0 && compressedSize > 0 ? 
    (1 - (compressedSize / originalSize)) * 100 : 0
  const sizeDifference = originalSize - compressedSize

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ImageIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Image Compressor</h1>
          <p className="text-muted-foreground">
            Compress and optimize images while maintaining quality
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
          Select an image file to compress (JPG, PNG, WebP)
        </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <div className="space-y-4">
            <FileUpload 
              onFileChange={handleFileChange}
              acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
              maxFileSizeMB={10}
              label="Drag & drop your image here or click to browse"
              showPreview={true}
            />
            {originalImage && (
              <Button onClick={reset} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {originalImage && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Compression Settings</CardTitle>
              <CardDescription>
                Adjust the quality level to control file size and image quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Quality: {quality}%</span>
                  <span className="text-sm text-muted-foreground">
                    Lower quality = smaller file size
                  </span>
                </div>
                <Slider
                  value={[quality]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={handleQualityChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Original Size</div>
                  <div className="text-2xl font-bold">{formatBytes(originalSize)}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Compressed Size</div>
                  <div className="text-2xl font-bold">{formatBytes(compressedSize)}</div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm text-green-700 dark:text-green-300">Saved</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {compressionRatio.toFixed(1)}% ({formatBytes(sizeDifference)})
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="space-x-2">
                  <span className="text-sm font-medium">Output Format:</span>
                  <select
                    value={imageType}
                    onChange={(e) => handleFormatChange(e.target.value)}
                    className="px-2 py-1 text-sm border rounded"
                  >
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </div>
                <Button onClick={downloadCompressedImage} disabled={!compressedImage}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Compressed Image
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Original Image</CardTitle>
                <CardDescription>
                  {formatBytes(originalSize)}
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
                <CardTitle>Compressed Image</CardTitle>
                <CardDescription>
                  {formatBytes(compressedSize)} ({compressionRatio.toFixed(1)}% smaller)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {compressedImage ? (
                  <img
                    src={compressedImage}
                    alt="Compressed"
                    className="max-w-full h-auto border rounded"
                  />
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center bg-muted rounded">
                    <div className="mb-2">
                      {isCompressing ? (
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {isCompressing ? "Compressing image..." : "No compressed image yet"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>


        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Image Compression</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Image compression</strong> reduces file size while maintaining acceptable visual quality.
            This tool uses lossy compression, which slightly reduces image quality to achieve smaller file sizes.
          </p>
          <p>
            <strong>Tips for best results:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use JPEG for photographs and complex images with many colors</li>
            <li>Use PNG for images with transparency or sharp edges</li>
            <li>WebP often provides the best compression but has less compatibility with older browsers</li>
            <li>Quality settings between 70-85% usually offer the best balance between size and quality</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}