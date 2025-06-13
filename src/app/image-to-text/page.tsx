"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScanText, Copy, Loader2 } from "lucide-react"
import { ToolLayout } from "@/components/tool-layout"
import { FileUpload } from "@/components/file-upload"
import { createWorker } from 'tesseract.js'
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

  // Clean up image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

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
    setStatusMessage("Initializing OCR worker...")
    
    let worker = null
    
    try {
      console.log('Starting OCR process...')
      
      // Create worker with better configuration for static export
      worker = await createWorker({
        logger: (m) => {
          console.log('Tesseract status:', m.status, 'progress:', m.progress)
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100))
            setStatusMessage('Recognizing text...')
          } else if (m.status === 'loading tesseract core') {
            setProgress(10)
            setStatusMessage('Loading OCR engine...')
          } else if (m.status === 'initializing tesseract') {
            setProgress(20)
            setStatusMessage('Initializing OCR engine...')
          } else if (m.status === 'loading language traineddata') {
            setProgress(30)
            setStatusMessage(`Loading ${language} language data...`)
          } else if (m.status === 'initializing api') {
            setProgress(40)
            setStatusMessage('Preparing text recognition...')
          }
        }
      })
      
      console.log('Worker created successfully')
      
      // Load language with better error handling
      setProgress(10)
      console.log(`Loading language: ${language}`)
      await worker.loadLanguage(language)
      
      setProgress(30)
      console.log('Initializing worker...')
      await worker.initialize(language)
      
      // Set parameters for better text recognition
      await worker.setParameters({
        tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
        tessedit_char_whitelist: '', // Allow all characters
      })
      
      setProgress(50)
      console.log('Starting text recognition...')
      
      // Convert File to ImageData or use direct file processing
      const result = await worker.recognize(imageFile)
      
      console.log('OCR result:', result)
      
      if (result && result.data && result.data.text) {
        const extractedTextResult = result.data.text.trim()
        if (extractedTextResult.length === 0) {
          setError("No text was found in the image. Please try with a clearer image containing text.")
        } else {
          setExtractedText(extractedTextResult)
          setStatusMessage("Text extraction completed!")
          console.log('Text extracted successfully:', extractedTextResult.substring(0, 100) + '...')
        }
      } else {
        throw new Error("No text data returned from OCR")
      }
      
      setProgress(100)
      
    } catch (err) {
      console.error('OCR Error details:', err)
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
        }
      }
      
      setError(errorMessage)
    } finally {
      // Ensure worker is terminated
      if (worker) {
        try {
          console.log('Terminating worker...')
          await worker.terminate()
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
                <p className="text-sm text-destructive">{error}</p>
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