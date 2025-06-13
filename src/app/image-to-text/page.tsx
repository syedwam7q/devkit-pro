"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScanText, Copy, Loader2, AlertCircle } from "lucide-react"
import { ToolLayout } from "@/components/tool-layout"
import { FileUpload } from "@/components/file-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Available languages for OCR
const languages = [
  { code: 'eng', name: 'English' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'spa', name: 'Spanish' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'rus', name: 'Russian' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'chi_tra', name: 'Chinese (Traditional)' },
  { code: 'kor', name: 'Korean' },
  { code: 'ara', name: 'Arabic' },
  { code: 'hin', name: 'Hindi' },
]

export default function ImageToTextPage() {
  return (
    <ToolLayout>
      <ImageToText />
    </ToolLayout>
  )
}

function ImageToText() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [language, setLanguage] = useState<string>("eng")
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [worker, setWorker] = useState<any>(null)

  // Clean up image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
      if (worker) {
        worker.terminate().catch(console.warn)
      }
    }
  }, [imagePreview, worker])

  const handleFileChange = (file: File | null) => {
    setError(null)
    setExtractedText("")
    
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file.")
        setImageFile(null)
        setImagePreview(null)
        return
      }
      
      setImageFile(file)
      
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    } else {
      setImageFile(null)
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
      setImagePreview(null)
    }
  }

  const processImage = async () => {
    if (!imageFile) {
      setError("Please select an image file first.")
      return
    }
    
    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setExtractedText("")
    setStatusMessage("Initializing OCR...")

    try {
      // Dynamic import to avoid SSR issues
      const { createWorker } = await import('tesseract.js')
      
      setProgress(5)
      setStatusMessage("Creating OCR worker...")
      
      // Create worker with minimal configuration
      const newWorker = await createWorker()
      setWorker(newWorker)
      
      setProgress(20)
      setStatusMessage(`Loading ${language} language...`)
      
      // Load and initialize language
      await newWorker.loadLanguage(language)
      
      setProgress(40)
      setStatusMessage("Initializing OCR engine...")
      
      await newWorker.initialize(language)
      
      setProgress(60)
      setStatusMessage("Processing image...")
      
      // Convert image to canvas to avoid cloning issues
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          resolve(null)
        }
        img.onerror = reject
        img.src = URL.createObjectURL(imageFile)
      })
      
      setProgress(70)
      setStatusMessage("Recognizing text...")
      
      // Recognize text from canvas
      const { data: { text } } = await newWorker.recognize(canvas)
      
      setProgress(100)
      
      if (text.trim().length === 0) {
        setError("No text was found in the image. Please try with a clearer image containing text.")
      } else {
        setExtractedText(text.trim())
        setStatusMessage("Text extraction completed!")
      }
      
    } catch (err) {
      console.error('OCR Error:', err)
      let errorMessage = "Text extraction failed"
      
      if (err instanceof Error) {
        errorMessage = err.message
        
        // Provide specific error messages for common issues
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = "Network error: Please check your internet connection and try again."
        } else if (errorMessage.includes('WASM')) {
          errorMessage = "WebAssembly loading error: Your browser may not support this feature."
        } else if (errorMessage.includes('worker')) {
          errorMessage = "Worker initialization failed: Please refresh the page and try again."
        } else if (errorMessage.includes('clone')) {
          errorMessage = "Image processing error: Please try with a different image format."
        }
      }
      
      setError(errorMessage)
    } finally {
      // Clean up worker
      if (worker) {
        try {
          await worker.terminate()
          setWorker(null)
        } catch (terminateErr) {
          console.warn('Error terminating worker:', terminateErr)
        }
      }
      setIsProcessing(false)
      setProgress(0)
      setStatusMessage("")
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ScanText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Image to Text</h1>
          <p className="text-muted-foreground">
            Extract text from images using OCR technology
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Upload an image containing text to extract. Best results with clear, high-contrast text.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onFileChange={handleFileChange}
                acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                maxFileSizeMB={5}
                label="Drag & drop your image here or click to browse"
                showPreview={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OCR Settings</CardTitle>
              <CardDescription>
                Configure text extraction options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <Select
                  value={language}
                  onValueChange={setLanguage}
                  disabled={isProcessing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={processImage} 
                disabled={!imageFile || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing ({Math.round(progress)}%)
                  </>
                ) : (
                  "Extract Text"
                )}
              </Button>
              
              {isProcessing && (
                <div className="space-y-2">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {statusMessage && (
                    <div className="text-sm text-muted-foreground text-center">
                      {statusMessage}
                    </div>
                  )}
                </div>
              )}
              
              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <p className="font-medium mb-1">Tips for better results:</p>
                <ul className="space-y-1">
                  <li>• Use images with clear, readable text</li>
                  <li>• Ensure good contrast between text and background</li>
                  <li>• Avoid blurry or low-resolution images</li>
                  <li>• Works best with printed text (not handwriting)</li>
                  <li>• First run may take longer due to loading OCR engine</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>Extracted Text</CardTitle>
            <CardDescription>
              Text extracted from your image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={extractedText}
              readOnly
              className="min-h-[300px]"
              placeholder="Extracted text will appear here..."
            />
            {extractedText && (
              <Button onClick={copyToClipboard} className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
            )}
          </CardContent>
        </Card>

        {imagePreview && (
          <Card>
            <CardHeader>
              <CardTitle>Image Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full object-contain max-h-[300px]" 
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}