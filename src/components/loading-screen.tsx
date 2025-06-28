"use client"

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

interface LoadingScreenProps {
  onComplete?: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const getThemeSpecificSteps = () => {
    switch (resolvedTheme) {
      case 'blackwhite':
        return [
          "> DevKit Pro CLI v1.1.0",
          "> Scanning tools directory...",
          "> Bundling modules and utilities...",
          "> Optimizing developer interface...",
          "> Starting toolbox engine...",
        ]
      case 'light':
        return [
          "DevKit Pro CLI v1.1.0",
          "Loading developer tools...",
          "Preparing workspace...",
          "Initializing components...",
          "Ready to launch...",
        ]
      default: // dark
        return [
          "DevKit Pro CLI v1.1.0",
          "Scanning tools directory...",
          "Bundling modules and utilities...",
          "Optimizing developer interface...",
          "Starting toolbox engine...",
        ]
    }
  }

  const getInitialText = () => {
    switch (resolvedTheme) {
      case 'blackwhite':
        return "> Initializing DevKit Pro..."
      case 'light':
        return "Initializing DevKit Pro..."
      default:
        return "Initializing DevKit Pro..."
    }
  }

  useEffect(() => {
    // Initialize display text based on theme
    if (currentStep === 0 && displayText === "") {
      setDisplayText(getInitialText())
    }
  }, [resolvedTheme])

  useEffect(() => {
    const steps = getThemeSpecificSteps()
    const timer = setTimeout(() => {
      if (currentStep < steps.length) {
        setDisplayText(prev => prev + `\n${steps[currentStep]}`)
        setCurrentStep(prev => prev + 1)
      } else if (!isComplete) {
        const readyMessage = resolvedTheme === 'blackwhite' ? '\n> DevKit Pro ready.' : '\n> DevKit Pro ready.'
        setDisplayText(prev => prev + readyMessage)
        setIsComplete(true)
        // Auto-complete after showing final message
        setTimeout(() => {
          setFadeOut(true)
          setTimeout(() => {
            onComplete?.()
          }, 500)
        }, 800)
      }
    }, currentStep === 0 ? 300 : 100)

    return () => clearTimeout(timer)
  }, [currentStep, isComplete, onComplete, resolvedTheme])



  // Theme-based styling
  const getThemeStyles = () => {
    switch (resolvedTheme) {
      case 'light':
        return {
          backgroundColor: '#ffffff',
          color: '#1f2937',
          logoFilter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(200deg) brightness(104%) contrast(97%)',
          cursorColor: '#3b82f6'
        }
      case 'blackwhite':
        return {
          backgroundColor: '#000000',
          color: '#ffffff',
          logoFilter: 'brightness(0) saturate(100%) invert(100%)',
          cursorColor: '#ffffff'
        }
      default: // dark
        return {
          backgroundColor: '#0f172a',
          color: '#f4c38c',
          logoFilter: 'none',
          cursorColor: '#fcd68e'
        }
    }
  }

  const themeStyles = getThemeStyles()

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap');
        
        .loading-screen {
          transition: opacity 0.5s ease-out;
        }
        
        .loading-screen.fade-out {
          opacity: 0;
        }
        
        .terminal-text {
          font-family: 'IBM Plex Mono', monospace;
          white-space: pre-wrap;
          line-height: 1.6;
          animation: fadeInUp 0.6s ease-out;
        }
        
        .logo-container {
          animation: logoFadeIn 1s ease-out 0.3s both;
        }
        
        .cursor {
          display: inline-block;
          width: 10px;
          height: 18px;
          background-color: ${themeStyles.cursorColor};
          margin-left: 3px;
          animation: blink 0.8s steps(2, start) infinite;
        }
        
        @keyframes blink {
          50% { opacity: 0; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes logoFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 0.6;
            transform: scale(1);
          }
        }
        

      `}</style>
      
      <div 
        className={`loading-screen fixed inset-0 z-[9999] overflow-hidden ${fadeOut ? 'fade-out' : ''}`}
        style={{ 
          backgroundColor: themeStyles.backgroundColor,
          color: themeStyles.color,
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          padding: '30px'
        }}
      >
        {/* Logo positioned subtly in top right */}
        <div 
          className="logo-container absolute top-8 right-8"
          style={{ opacity: 0.6 }}
        >
          <img 
            src="/docs/logo/devkitlogo.png" 
            alt="DevKit Pro" 
            className="h-12 w-12 object-contain"
            style={{
              filter: themeStyles.logoFilter
            }}
          />
        </div>
        
        {/* Terminal text */}
        <div className="terminal-text">
          {displayText}
          {!isComplete && <span className="cursor"></span>}
        </div>
        

      </div>
    </>
  )
}