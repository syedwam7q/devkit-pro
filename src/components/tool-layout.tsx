"use client"

import { ReactNode } from "react"
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage"

interface ToolLayoutProps {
  children: ReactNode
}

export function ToolLayout({ children }: ToolLayoutProps) {
  // Track tool usage for recent tools
  useTrackToolUsage()
  
  return <>{children}</>
}