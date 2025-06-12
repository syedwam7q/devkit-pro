// Map of tool names to their routes
export const toolRoutes: Record<string, string> = {
  // Text Tools
  "Text Formatter": "/text-formatter",
  "Word Counter": "/word-counter",
  "Markdown Editor": "/markdown-editor",
  
  // Image Tools
  "Image Resizer": "/image-resizer",
  "Image Compressor": "/image-compressor",
  "Color Picker": "/color-picker",
  "Image Converter": "/image-converter",
  "Image to Text": "/image-to-text",
  
  // Developer Tools
  "PDF Viewer": "/pdf-viewer",
  "JSON Formatter": "/json-formatter",
  "CSV/Excel Viewer": "/csv-excel-viewer",
  "API Tester": "/api-tester",
  "Regex Tester": "/regex-tester",
  "Password Generator": "/password-generator",
  "Base64 Encoder": "/base64-encoder",
  "UUID Generator": "/uuid-generator",
  "JWT Decoder": "/jwt-decoder",
  "URL Parser": "/url-parser",
  
  // Advanced Tools
  "Text Diff": "/text-diff",
  "Code Formatter": "/code-formatter",
  "HTML/CSS Playground": "/html-css-playground",
  "SVG Generator": "/svg-generator",
  "Meme Generator": "/meme-generator",
};

// Get all tools with their routes
export function getAllTools() {
  return Object.entries(toolRoutes).map(([name, route]) => ({
    name,
    route
  }));
}

// Get tools by category
export function getToolsByCategory(categoryTitle: string) {
  const categoryMap: Record<string, string[]> = {
    "Text Tools": ["Text Formatter", "Word Counter", "Markdown Editor"],
    "Image Tools": ["Image Resizer", "Image Compressor", "Color Picker", "Image Converter", "Image to Text"],
    "Developer Tools": ["PDF Viewer", "JSON Formatter", "CSV/Excel Viewer", "API Tester", "Regex Tester", "Password Generator", "Base64 Encoder", "UUID Generator", "JWT Decoder", "URL Parser"],
    "Advanced Tools": ["Text Diff", "Code Formatter", "HTML/CSS Playground", "SVG Generator", "Meme Generator"],
  };
  
  const toolNames = categoryMap[categoryTitle] || [];
  return toolNames.map(name => ({
    name,
    route: toolRoutes[name] || "/"
  }));
}