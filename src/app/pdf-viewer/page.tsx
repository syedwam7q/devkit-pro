"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Loader2 } from "lucide-react"
import { ToolLayout } from "@/components/tool-layout"
import { FileUpload } from "@/components/file-upload"

export default function PDFViewerPage() {
  return (
    <ToolLayout>
      <PDFViewer />
    </ToolLayout>
  )
}

function PDFViewer() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Cleanup function to revoke object URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  const handleFileChange = (file: File | null) => {
    // Reset error state
    setError(null)
    
    if (file) {
      // Revoke previous URL to prevent memory leaks
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
      
      try {
        setIsLoading(true)
        setPdfFile(file)
        const fileUrl = URL.createObjectURL(file)
        setPdfUrl(fileUrl)
        setIsLoading(false)
      } catch (error) {
        console.error('Error creating object URL:', error)
        setError('Failed to process the PDF file. Please try again.')
        setIsLoading(false)
      }
    } else {
      setPdfFile(null)
      setPdfUrl(null)
      setIsLoading(false)
    }
  }

  const downloadPdf = () => {
    if (pdfUrl && pdfFile) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = pdfFile.name || 'document.pdf'
      link.click()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">PDF Viewer</h1>
          <p className="text-muted-foreground">
            View and navigate PDF documents
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload PDF</CardTitle>
          <CardDescription>
            Upload a PDF file to view its contents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload 
            onFileChange={handleFileChange}
            acceptedFileTypes={['.pdf']}
            maxFileSizeMB={10}
            label="Drag & drop your PDF file here or click to browse"
          />
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium">Processing PDF file...</p>
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
            <p className="text-lg font-medium text-destructive">Error Loading PDF</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null)
                setPdfUrl(null)
                setPdfFile(null)
              }}
            >
              Try Another File
            </Button>
          </CardContent>
        </Card>
      )}
      
      {pdfUrl && !isLoading && !error && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>{pdfFile?.name || 'PDF Document'}</CardTitle>
              <CardDescription>
                Use browser controls to navigate the PDF
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={downloadPdf} title="Download">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-hidden border">
              <iframe 
                src={pdfUrl} 
                className="w-full h-[70vh]" 
                title="PDF Viewer"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}