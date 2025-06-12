# DevKit Pro

<div align="center">
  <img src="public/logo.png" alt="DevKit Pro Logo" width="120" />
  <h3>Your Ultimate Developer Toolbox</h3>
  <p>A comprehensive collection of browser-based tools for developers, designers, and content creators.</p>
  <p><a href="https://devkit-pro.vercel.app" target="_blank">View Live Demo</a></p>
  
  <div>
    <img src="https://img.shields.io/badge/Next.js-14.0.4-black" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-18-blue" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind-3.3.0-38B2AC" alt="Tailwind" />
    <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
  </div>
</div>

## ✨ Features

DevKit Pro offers a wide range of tools to streamline your workflow:

### 📝 Text Tools
- **Text Formatter** - Transform, clean, and format text
- **Word Counter** - Count words, characters, and estimate reading time
- **Markdown Editor** - Edit markdown with live preview

### 🖼️ Image Tools
- **Image Resizer** - Resize images while maintaining quality
- **Image Compressor** - Reduce image file size
- **Color Picker** - Select colors and generate palettes
- **Image Converter** - Convert between image formats

### 🛠️ Developer Tools
- **JSON Formatter** - Format and validate JSON
- **Regex Tester** - Test and debug regular expressions
- **Base64 Encoder** - Encode and decode Base64
- **UUID Generator** - Generate random UUIDs
- **JWT Decoder** - Decode and verify JWT tokens
- **URL Parser** - Parse and analyze URLs

### 🔧 Advanced Tools
- **Text Diff** - Compare text and highlight differences
- **Code Formatter** - Format code in multiple languages
- **SVG Generator** - Create and customize SVG graphics
- **Meme Generator** - Create custom memes

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/syedwam7q/devkit-pro.git
   cd devkit-pro
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build

To build the application for production:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## 🧪 Testing

Run tests with:

```bash
npm run test
# or
yarn test
```

## 🌐 Deployment

### This version of DevKit Pro (1.0.0) is Live on Vercel (https://vercel.com/syed-wamiqs-projects/devkit-pro)

## 🧩 Project Structure

```
devkit-pro/
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   │   ├── ui/        # UI components
│   │   └── ...        # Feature components
│   ├── lib/           # Utility functions
│   └── styles/        # Global styles
├── docs/              # Documentation
├── .env.example       # Environment variables example
├── next.config.js     # Next.js configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## 🛡️ Privacy & Security

DevKit Pro is designed with privacy in mind:

- **No Server Processing**: All tools run entirely in your browser
- **No Data Collection**: Your data never leaves your device
- **No Tracking**: No analytics or tracking scripts
- **Open Source**: All code is transparent and auditable

## 🔌 Extending DevKit Pro

### Adding a New Tool

1. Create a new page in `src/app/[tool-name]/page.tsx`
2. Add the tool to the tools array in `src/config/tools.ts`
3. Implement the tool's functionality
4. Add any necessary UI components

Example of a minimal tool implementation:

```tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewToolPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const processInput = () => {
    // Tool-specific logic here
    setOutput(input.toUpperCase())
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Tool</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-32 p-2 border rounded"
          />
          <button 
            onClick={processInput}
            className="mt-2 px-4 py-2 bg-primary text-white rounded"
          >
            Process
          </button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full min-h-32 p-2 border rounded">
            {output}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Syed Wamiq** - [GitHub](https://github.com/syedwam7q)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icons
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- All the open-source libraries that made this project possible
