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
    if (!imageFile) return
    
    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setExtractedText("")
    
    try {
      // @ts-ignore - Tesseract types are not correctly defined
      const worker = await createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100)
          }
        },
      })
      
      // @ts-ignore - Tesseract types are not correctly defined
      await worker.loadLanguage(language)
      // @ts-ignore - Tesseract types are not correctly defined
      await worker.initialize(language)
      
      // @ts-ignore - Tesseract types are not correctly defined
      const { data } = await worker.recognize(imageFile)
      setExtractedText(data.text)
      
      // @ts-ignore - Tesseract types are not correctly defined
      await worker.terminate()
    } catch (err) {
      console.error('OCR Error:', err)
      setError("An error occurred during text extraction. Please try again with a different image.")
    } finally {
      setIsProcessing(false)
      setProgress(0)
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
                Upload an image containing text to extract
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
              
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
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