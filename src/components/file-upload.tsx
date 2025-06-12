"use client"

import { useState, useRef, ChangeEvent, DragEvent } from "react"
import { Upload, X, FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileChange: (file: File | null) => void
  acceptedFileTypes?: string[]
  maxFileSizeMB?: number
  label?: string
  className?: string
  showPreview?: boolean
}

export function FileUpload({
  onFileChange,
  acceptedFileTypes = [],
  maxFileSizeMB = 5,
  label = "Drag & drop your file here or click to browse",
  className,
  showPreview = true,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxFileSizeMB * 1024 * 1024

  const isImage = (file: File) => {
    return file.type.startsWith('image/')
  }

  const isPdf = (file: File) => {
    return file.type === 'application/pdf'
  }

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the maximum limit of ${maxFileSizeMB}MB.`)
      return false
    }

    // Check file type if acceptedFileTypes is provided
    if (acceptedFileTypes.length > 0) {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
      const fileType = file.type.toLowerCase()
      
      const isAccepted = acceptedFileTypes.some(type => {
        // Handle MIME types (e.g., 'image/png')
        if (type.includes('/')) {
          return fileType === type
        }
        // Handle extensions (e.g., '.png')
        return fileExtension === type.toLowerCase()
      })

      if (!isAccepted) {
        setError(`File type not accepted. Please upload ${acceptedFileTypes.join(', ')} files.`)
        return false
      }
    }

    setError(null)
    return true
  }

  const handleFileChange = (file: File | null) => {
    if (file && validateFile(file)) {
      setFile(file)
      onFileChange(file)
      
      // Create preview for images
      if (showPreview && isImage(file)) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else if (showPreview && isPdf(file)) {
        // For PDFs, just show an icon or thumbnail
        setPreview(null)
      } else {
        setPreview(null)
      }
    } else {
      setFile(null)
      setPreview(null)
      if (!file) {
        onFileChange(null)
      }
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    handleFileChange(selectedFile)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files?.[0] || null
    handleFileChange(droppedFile)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={acceptedFileTypes.join(',')}
        className="hidden"
      />
      
      {!file ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50",
          )}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{label}</p>
            <Button type="button" variant="secondary" size="sm">
              Select File
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {preview ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="h-12 w-12 object-cover rounded" 
                />
              ) : (
                <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
                  <FileIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRemoveFile}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}