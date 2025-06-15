"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Loader2, Settings } from "lucide-react"
import { ToolLayout } from "@/components/tool-layout"
import { FileUpload } from "@/components/file-upload"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PDFDocument } from "pdf-lib"

export default function PDFCompressorPage() {
  return (
    <ToolLayout>
      <PDFCompressor />
    </ToolLayout>
  )
}

function PDFCompressor() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [compressionLevel, setCompressionLevel] = useState<number>(70)
  const [compressionMode, setCompressionMode] = useState<string>("balanced")
  
  // Cleanup function to revoke object URL when component unmounts
  useEffect(() => {
    return () => {
      if (compressedPdfUrl) {
        URL.revokeObjectURL(compressedPdfUrl)
      }
    }
  }, [compressedPdfUrl])

  const handleFileChange = (file: File | null) => {
    // Reset error state
    setError(null)
    setCompressedPdfUrl(null)
    setCompressedSize(0)
    
    if (file) {
      setPdfFile(file)
      setOriginalSize(file.size)
    } else {
      setPdfFile(null)
      setOriginalSize(0)
    }
  }

  const compressPdf = async () => {
    if (!pdfFile) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Read the PDF file
      const fileArrayBuffer = await pdfFile.arrayBuffer()
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(fileArrayBuffer)
      
      // Apply compression settings based on the selected mode and level
      const options: any = {
        useObjectStreams: true,
      }
      
      // Different compression strategies based on mode
      if (compressionMode === "maximum") {
        // Maximum compression - might affect quality significantly
        options.objectCompressionMethod = { flate: { level: 9 } }
      } else if (compressionMode === "minimum") {
        // Minimum compression - preserves quality
        options.objectCompressionMethod = { flate: { level: 1 } }
      } else {
        // Balanced compression
        options.objectCompressionMethod = { flate: { level: Math.floor(compressionLevel / 10) } }
      }
      
      // Save the PDF with compression options
      const compressedPdfBytes = await pdfDoc.save(options)
      
      // Create a blob from the compressed PDF
      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' })
      
      // Revoke previous URL to prevent memory leaks
      if (compressedPdfUrl) {
        URL.revokeObjectURL(compressedPdfUrl)
      }
      
      // Create a URL for the compressed PDF
      const url = URL.createObjectURL(blob)
      setCompressedPdfUrl(url)
      setCompressedSize(blob.size)
      setIsLoading(false)
    } catch (err) {
      console.error('Error compressing PDF:', err)
      setError('Failed to compress the PDF file. Please try again with a different file.')
      setIsLoading(false)
    }
  }

  const downloadCompressedPdf = () => {
    if (compressedPdfUrl && pdfFile) {
      const link = document.createElement('a')
      link.href = compressedPdfUrl
      
      // Create a filename with "compressed" added
      const fileName = pdfFile.name
      const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName
      link.download = `${fileNameWithoutExt}-compressed.pdf`
      
      link.click()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const calculateReduction = (): string => {
    if (originalSize === 0 || compressedSize === 0) return '0%'
    
    const reduction = ((originalSize - compressedSize) / originalSize) * 100
    return `${reduction.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">PDF Compressor</h1>
          <p className="text-muted-foreground">
            Reduce PDF file size while preserving quality
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload PDF</CardTitle>
          <CardDescription>
            Upload a PDF file to compress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload 
            onFileChange={handleFileChange}
            acceptedFileTypes={['.pdf']}
            maxFileSizeMB={20}
            label="Drag & drop your PDF file here or click to browse"
          />
        </CardContent>
      </Card>

      {pdfFile && !isLoading && !compressedPdfUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Compression Settings</CardTitle>
            <CardDescription>
              Adjust settings to control the compression level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="compression-level">Compression Level: {compressionLevel}%</Label>
                <span className="text-sm text-muted-foreground">
                  {compressionLevel < 30 ? 'Better Quality' : 
                   compressionLevel > 70 ? 'Smaller Size' : 'Balanced'}
                </span>
              </div>
              <Slider
                id="compression-level"
                min={10}
                max={90}
                step={10}
                value={[compressionLevel]}
                onValueChange={(value) => setCompressionLevel(value[0])}
                disabled={compressionMode !== "balanced"}
              />
            </div>

            <div className="space-y-2">
              <Label>Compression Mode</Label>
              <RadioGroup 
                value={compressionMode} 
                onValueChange={setCompressionMode}
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="minimum" id="minimum" />
                  <Label htmlFor="minimum" className="flex-1 cursor-pointer">Minimum</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced" className="flex-1 cursor-pointer">Balanced</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="maximum" id="maximum" />
                  <Label htmlFor="maximum" className="flex-1 cursor-pointer">Maximum</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              className="w-full" 
              onClick={compressPdf}
            >
              <Settings className="mr-2 h-4 w-4" />
              Compress PDF
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium">Compressing PDF...</p>
            <p className="text-sm text-muted-foreground">This may take a moment depending on the file size.</p>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <FileText className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-lg font-medium text-destructive">Error Compressing PDF</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null)
                setCompressedPdfUrl(null)
                setCompressedSize(0)
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
      
      {compressedPdfUrl && !isLoading && !error && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Compression Complete</CardTitle>
              <CardDescription>
                Your PDF has been compressed successfully
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={downloadCompressedPdf}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm font-medium mb-1">Original Size</p>
                <p className="text-xl font-bold">{formatFileSize(originalSize)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm font-medium mb-1">Compressed Size</p>
                <p className="text-xl font-bold">{formatFileSize(compressedSize)}</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-sm font-medium mb-1">Reduction</p>
                <p className="text-xl font-bold text-primary">{calculateReduction()}</p>
              </div>
            </div>
            
            <div className="rounded-md overflow-hidden border">
              <iframe 
                src={compressedPdfUrl} 
                className="w-full h-[50vh]" 
                title="Compressed PDF Preview"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}