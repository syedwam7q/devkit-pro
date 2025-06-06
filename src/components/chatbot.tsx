"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

// Message types
type MessageRole = "user" | "assistant" | "system"

interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
}

// Tool information for the chatbot to reference
const toolInfo = [
  {
    name: "Text Formatter",
    path: "/text-formatter",
    description: "Format and beautify text with various options",
    keywords: ["text", "format", "beautify", "case", "capitalize", "uppercase", "lowercase"]
  },
  {
    name: "Word Counter",
    path: "/word-counter",
    description: "Count words, characters, and paragraphs in text",
    keywords: ["count", "words", "characters", "paragraphs", "text", "length"]
  },
  {
    name: "Markdown Editor",
    path: "/markdown-editor",
    description: "Create and edit Markdown with live preview",
    keywords: ["markdown", "md", "editor", "preview", "format"]
  },
  {
    name: "Image Resizer",
    path: "/image-resizer",
    description: "Resize images to specific dimensions",
    keywords: ["image", "resize", "dimensions", "width", "height", "scale"]
  },
  {
    name: "Image Compressor",
    path: "/image-compressor",
    description: "Compress images to reduce file size",
    keywords: ["image", "compress", "reduce", "size", "optimization"]
  },
  {
    name: "Color Picker",
    path: "/color-picker",
    description: "Pick colors and generate color schemes",
    keywords: ["color", "picker", "palette", "scheme", "hex", "rgb", "hsl"]
  },
  {
    name: "Image Converter",
    path: "/image-converter",
    description: "Convert images between different formats",
    keywords: ["image", "convert", "format", "jpg", "png", "webp", "gif"]
  },
  {
    name: "JSON Formatter",
    path: "/json-formatter",
    description: "Format, validate, and beautify JSON data",
    keywords: ["json", "format", "validate", "beautify", "minify", "parse"]
  },
  {
    name: "Regex Tester",
    path: "/regex-tester",
    description: "Test and debug regular expressions",
    keywords: ["regex", "regular expression", "test", "match", "pattern"]
  },
  {
    name: "Base64 Encoder",
    path: "/base64-encoder",
    description: "Encode and decode Base64 data",
    keywords: ["base64", "encode", "decode", "conversion"]
  },
  {
    name: "UUID Generator",
    path: "/uuid-generator",
    description: "Generate random UUIDs and GUIDs",
    keywords: ["uuid", "guid", "generate", "random", "id"]
  },
  {
    name: "JWT Decoder",
    path: "/jwt-decoder",
    description: "Decode and verify JWT tokens",
    keywords: ["jwt", "token", "decode", "verify", "json web token"]
  },
  {
    name: "URL Parser",
    path: "/url-parser",
    description: "Parse and analyze URL components",
    keywords: ["url", "parse", "query", "parameters", "domain"]
  },
  {
    name: "Text Diff",
    path: "/text-diff",
    description: "Compare and find differences between texts",
    keywords: ["diff", "compare", "difference", "text", "changes"]
  },
  {
    name: "Code Formatter",
    path: "/code-formatter",
    description: "Format and beautify code in various languages",
    keywords: ["code", "format", "beautify", "indent", "syntax", "highlight"]
  },
  {
    name: "SVG Generator",
    path: "/svg-generator",
    description: "Create and customize SVG graphics",
    keywords: ["svg", "vector", "graphics", "create", "generate", "design"]
  },
  {
    name: "Meme Generator",
    path: "/meme-generator",
    description: "Create custom memes with templates or your own images",
    keywords: ["meme", "generator", "image", "text", "template", "funny"]
  }
]

// Predefined helpful responses
const helpfulResponses = [
  {
    trigger: ["hello", "hi", "hey", "greetings"],
    response: "Hello! I'm your DevKit Pro assistant. How can I help you today? I can guide you through our tools or help you find the right one for your task."
  },
  {
    trigger: ["help", "assist", "support"],
    response: "I'm here to help! You can ask me about any of our tools, how to use them, or what they do. For example, try asking 'How do I resize an image?' or 'What can the JSON formatter do?'"
  },
  {
    trigger: ["thank", "thanks", "appreciate"],
    response: "You're welcome! If you need any more help, just ask. I'm here to make your experience with DevKit Pro as smooth as possible."
  },
  {
    trigger: ["bye", "goodbye", "see you"],
    response: "Goodbye! Feel free to chat with me again if you need any assistance with our tools."
  },
  {
    trigger: ["list", "show", "all tools", "available tools", "what tools", "which tools"],
    response: "DevKit Pro offers these tools:\n• Text Tools: Text Formatter, Word Counter, Markdown Editor\n• Image Tools: Image Resizer, Image Compressor, Color Picker, Image Converter\n• Developer Tools: JSON Formatter, Regex Tester, Base64 Encoder, UUID Generator, JWT Decoder, URL Parser\n• Advanced Tools: Text Diff, Code Formatter, SVG Generator, Meme Generator\n\nWhat would you like to know more about?"
  },
  {
    trigger: ["features", "capabilities", "what can you do", "how can you help"],
    response: "I can help you with:\n• Finding the right tool for your task\n• Explaining how each tool works\n• Navigating directly to any tool\n• Answering questions about tool features\n• Providing guidance on how to use our tools\n\nJust tell me what you're trying to accomplish!"
  },
  {
    trigger: ["who made", "who created", "who developed", "who built", "creator", "developer", "author"],
    response: "DevKit Pro was developed by Syed Wamiq. You can find more of his work on GitHub at github.com/syedwam7q."
  }
]

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your DevKit Pro assistant. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastSuggestion, setLastSuggestion] = useState<{path?: string, toolName?: string} | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userInput = inputValue.trim()
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userInput,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Check if this is an affirmative response to a previous suggestion
    const isAffirmative = /^(yes|yeah|yep|sure|ok|okay|yup|y|take me there|go there|navigate|show me|open it|let's go|proceed|continue|go ahead|do it)$/i.test(userInput)
    
    if (isAffirmative && lastSuggestion && lastSuggestion.path) {
      // User is responding affirmatively to a previous suggestion
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `Taking you to ${lastSuggestion.toolName || "the requested page"}...`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
      setLastSuggestion(null)

      // Navigate to the suggested path
      setTimeout(() => {
        router.push(lastSuggestion.path!)
      }, 1000)
    } else {
      // Process the message and generate a new response
      setTimeout(() => {
        const response = generateResponse(userInput)
        
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.message,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)

        // Update last suggestion if this is a suggestion
        if (response.action === "suggest" && response.path) {
          // Extract tool name from the message
          let toolName: string | undefined = undefined
          for (const tool of toolInfo) {
            if (response.path === tool.path) {
              toolName = tool.name
              break
            }
          }
          setLastSuggestion({ path: response.path, toolName })
        } else {
          // Clear last suggestion if this is not a suggestion
          setLastSuggestion(null)
        }

        // If there's a navigation action, perform it after a short delay
        if (response.action === "navigate" && response.path) {
          setTimeout(() => {
            router.push(response.path!)
          }, 1000)
        }
      }, 600) // Simulate processing time
    }
  }

  const generateResponse = (userInput: string): { message: string, action?: string, path?: string } => {
    const input = userInput.toLowerCase().trim()

    // Check for predefined responses
    for (const item of helpfulResponses) {
      if (item.trigger.some(trigger => input.includes(trigger))) {
        return { message: item.response }
      }
    }

    // Check for home page navigation
    if (input.includes("home") || input.includes("main page") || input.includes("start")) {
      return {
        message: "Taking you to the home page.",
        action: "navigate",
        path: "/"
      }
    }

    // Check if the user is asking about a specific tool
    for (const tool of toolInfo) {
      const toolNameLower = tool.name.toLowerCase()
      const isToolMentioned = input.includes(toolNameLower) || 
                             tool.keywords.some(keyword => input.includes(keyword))

      if (isToolMentioned) {
        // If asking what a tool does
        if (input.includes("what") || input.includes("do") || input.includes("about") || input.includes("explain")) {
          return { 
            message: `The ${tool.name} is a tool that ${tool.description}. Would you like to try it out?`,
            action: "suggest",
            path: tool.path
          }
        }
        
        // If asking how to use a tool
        if (input.includes("how") || input.includes("use") || input.includes("help") || input.includes("guide")) {
          return { 
            message: `To use the ${tool.name}, I'll take you there now. Once there, you can ${tool.description.toLowerCase()}. Is there anything specific you'd like to know about using it?`,
            action: "navigate",
            path: tool.path
          }
        }
        
        // If just mentioning the tool or wanting to go there
        if (input.includes("go to") || input.includes("open") || input.includes("navigate") || 
            input.includes("take me") || input.includes("show me") || input.includes("access")) {
          return { 
            message: `I'll take you to the ${tool.name} right away.`,
            action: "navigate",
            path: tool.path
          }
        }
        
        // Default response for tool mention
        return { 
          message: `The ${tool.name} allows you to ${tool.description}. Would you like me to take you there?`,
          action: "suggest",
          path: tool.path
        }
      }
    }

    // Check for category-based inquiries
    if (input.includes("text tool") || (input.includes("text") && input.includes("tool"))) {
      return {
        message: "We have several text tools: Text Formatter for changing text case and format, Word Counter for analyzing text statistics, and Markdown Editor for creating formatted documents. Which one would you like to use?",
        action: "suggest"
      }
    }

    if (input.includes("image tool") || (input.includes("image") && input.includes("tool"))) {
      return {
        message: "Our image tools include: Image Resizer for changing dimensions, Image Compressor for reducing file size, Image Converter for changing formats, and Color Picker for working with colors. Which one interests you?",
        action: "suggest"
      }
    }

    if (input.includes("developer tool") || input.includes("dev tool") || (input.includes("developer") && input.includes("tool"))) {
      return {
        message: "Our developer tools include: JSON Formatter, Regex Tester, Base64 Encoder, UUID Generator, JWT Decoder, and URL Parser. What are you trying to accomplish?",
        action: "suggest"
      }
    }

    // Check for specific task inquiries
    if (input.includes("resize") && input.includes("image")) {
      return {
        message: "I'll take you to our Image Resizer tool where you can adjust the dimensions of your images.",
        action: "navigate",
        path: "/image-resizer"
      }
    }

    if (input.includes("compress") && input.includes("image")) {
      return {
        message: "I'll take you to our Image Compressor tool where you can reduce the file size of your images.",
        action: "navigate",
        path: "/image-compressor"
      }
    }

    if (input.includes("convert") && input.includes("image")) {
      return {
        message: "I'll take you to our Image Converter tool where you can change image formats.",
        action: "navigate",
        path: "/image-converter"
      }
    }

    if ((input.includes("format") || input.includes("beautify")) && input.includes("json")) {
      return {
        message: "I'll take you to our JSON Formatter tool where you can format and beautify JSON data.",
        action: "navigate",
        path: "/json-formatter"
      }
    }

    if ((input.includes("format") || input.includes("beautify")) && input.includes("code")) {
      return {
        message: "I'll take you to our Code Formatter tool where you can format and beautify code in various languages.",
        action: "navigate",
        path: "/code-formatter"
      }
    }

    // Check for general task inquiries
    if (input.includes("image") && (input.includes("edit") || input.includes("modify"))) {
      return { 
        message: "For image editing, we have several tools: Image Resizer, Image Compressor, and Image Converter. What specifically would you like to do with your image?",
        action: "suggest"
      }
    }

    if (input.includes("text") && (input.includes("edit") || input.includes("modify") || input.includes("format"))) {
      return { 
        message: "For text editing, you might want to try our Text Formatter, Markdown Editor, or Word Counter. What kind of text editing do you need to do?",
        action: "suggest"
      }
    }

    if (input.includes("code") || input.includes("json") || input.includes("regex")) {
      return { 
        message: "For code-related tasks, we have the Code Formatter, JSON Formatter, and Regex Tester. Which one would be most helpful for your current task?",
        action: "suggest"
      }
    }

    if (input.includes("create") || input.includes("generate") || input.includes("make")) {
      if (input.includes("meme")) {
        return { 
          message: "I'll take you to our Meme Generator where you can create custom memes with popular templates or your own images.",
          action: "navigate",
          path: "/meme-generator"
        }
      }
      if (input.includes("svg") || input.includes("vector") || input.includes("graphic")) {
        return { 
          message: "I'll take you to our SVG Generator where you can create and customize vector graphics.",
          action: "navigate",
          path: "/svg-generator"
        }
      }
      if (input.includes("uuid") || input.includes("guid") || input.includes("id")) {
        return { 
          message: "I'll take you to our UUID Generator where you can create random UUIDs and GUIDs.",
          action: "navigate",
          path: "/uuid-generator"
        }
      }
      if (input.includes("markdown") || input.includes("md") || input.includes("document")) {
        return {
          message: "I'll take you to our Markdown Editor where you can create formatted documents with live preview.",
          action: "navigate",
          path: "/markdown-editor"
        }
      }
    }

    // Handle color-related queries
    if (input.includes("color") || input.includes("palette") || input.includes("hex") || input.includes("rgb")) {
      return {
        message: "I'll take you to our Color Picker tool where you can select colors and generate color schemes.",
        action: "navigate",
        path: "/color-picker"
      }
    }

    // Handle encoding/decoding queries
    if (input.includes("encode") || input.includes("decode")) {
      if (input.includes("base64")) {
        return {
          message: "I'll take you to our Base64 Encoder tool where you can encode and decode Base64 data.",
          action: "navigate",
          path: "/base64-encoder"
        }
      }
      if (input.includes("jwt") || input.includes("token")) {
        return {
          message: "I'll take you to our JWT Decoder tool where you can decode and verify JWT tokens.",
          action: "navigate",
          path: "/jwt-decoder"
        }
      }
      return {
        message: "We have tools for encoding and decoding data, including Base64 Encoder and JWT Decoder. Which one would you like to use?",
        action: "suggest"
      }
    }

    // Handle URL-related queries
    if (input.includes("url") || input.includes("link") || input.includes("parse")) {
      return {
        message: "I'll take you to our URL Parser tool where you can analyze URL components.",
        action: "navigate",
        path: "/url-parser"
      }
    }

    // Handle comparison queries
    if (input.includes("compare") || input.includes("diff") || input.includes("difference")) {
      return {
        message: "I'll take you to our Text Diff tool where you can compare and find differences between texts.",
        action: "navigate",
        path: "/text-diff"
      }
    }

    // Default response if no specific intent is detected
    return { 
      message: "I'm not sure I understand what you're looking for. We have tools for text formatting, image editing, code formatting, and more. Could you tell me more about what you're trying to do? Or type 'list tools' to see all available tools." 
    }
  }

  const toggleChat = () => {
    setIsOpen(prev => !prev)
    setIsMinimized(false)
  }

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev)
  }

  return (
    <>
      {/* Chat button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0 shadow-lg"
        onClick={toggleChat}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className={`fixed bottom-20 right-4 w-80 md:w-96 shadow-xl transition-all duration-300 ${
          isMinimized ? 'h-14' : 'h-96'
        }`}>
          <CardHeader className="p-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">DevKit Pro Assistant</CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8">
              {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CardHeader>
          
          {!isMinimized && (
            <>
              <CardContent className="p-3 overflow-y-auto h-[calc(100%-7rem)]">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <p className="text-sm">Thinking...</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              
              <CardFooter className="p-3 pt-0">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  )
}