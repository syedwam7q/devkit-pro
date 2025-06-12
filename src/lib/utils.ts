import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadImage(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL()
  link.click()
}

// UI Density utility functions
export const getDensityClasses = (density: 'compact' | 'comfortable' | 'spacious') => {
  // Spacing classes for different UI densities
  const spacingClasses = {
    // Grid gap classes
    grid: {
      compact: "gap-3",
      comfortable: "gap-6",
      spacious: "gap-8"
    },
    // Padding classes
    padding: {
      compact: "p-2",
      comfortable: "p-4",
      spacious: "p-6"
    },
    // Margin classes
    margin: {
      compact: "space-y-2",
      comfortable: "space-y-4",
      spacious: "space-y-6"
    },
    // Card padding
    card: {
      compact: "p-3",
      comfortable: "p-4",
      spacious: "p-6"
    }
  }
  
  return spacingClasses
}