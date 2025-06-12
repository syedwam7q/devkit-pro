"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileSpreadsheet, Upload, Download, RotateCcw, Plus, Trash, Save } from "lucide-react"
import { downloadFile } from "@/lib/utils"
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

// Types for our data
type CellData = string | number | null
type RowData = CellData[]
type TableData = RowData[]

export default function CsvExcelViewerPage() {
  const [data, setData] = useState<TableData>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState<"csv" | "excel" | "">("")
  const [activeTab, setActiveTab] = useState("viewer")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editableData, setEditableData] = useState<TableData>([])
  const [editableHeaders, setEditableHeaders] = useState<string[]>([])

  // Reset all state
  const resetState = () => {
    setData([])
    setHeaders([])
    setFileName("")
    setFileType("")
    setEditableData([])
    setEditableHeaders([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    
    const reader = new FileReader()
    
    if (file.name.endsWith('.csv')) {
      setFileType("csv")
      reader.onload = (e) => {
        const csvData = e.target?.result as string
        Papa.parse(csvData, {
          complete: (results) => {
            const parsedData = results.data as string[][]
            if (parsedData.length > 0) {
              // First row as headers
              const headers = parsedData[0]
              // Rest as data
              const rows = parsedData.slice(1).filter(row => row.some(cell => cell.trim() !== '')) as TableData
              setHeaders(headers)
              setData(rows)
              setEditableHeaders([...headers])
              setEditableData([...rows])
            }
          },
          header: false
        })
      }
      reader.readAsText(file)
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setFileType("excel")
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 })
        
        if (jsonData.length > 0) {
          // First row as headers
          const headers = jsonData[0].map(String)
          // Rest as data
          const rows = jsonData.slice(1).filter(row => row.length > 0) as TableData
          setHeaders(headers)
          setData(rows)
          setEditableHeaders([...headers])
          setEditableData([...rows])
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  // Add a new row
  const addRow = () => {
    const newRow = Array(editableHeaders.length).fill("")
    setEditableData([...editableData, newRow])
  }

  // Add a new column
  const addColumn = () => {
    const newHeader = `Column ${editableHeaders.length + 1}`
    setEditableHeaders([...editableHeaders, newHeader])
    setEditableData(editableData.map(row => [...row, ""]))
  }

  // Delete a row
  const deleteRow = (rowIndex: number) => {
    setEditableData(editableData.filter((_, index) => index !== rowIndex))
  }

  // Delete a column
  const deleteColumn = (colIndex: number) => {
    setEditableHeaders(editableHeaders.filter((_, index) => index !== colIndex))
    setEditableData(editableData.map(row => row.filter((_, index) => index !== colIndex)))
  }

  // Update cell value
  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...editableData]
    newData[rowIndex][colIndex] = value
    setEditableData(newData)
  }

  // Update header value
  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = [...editableHeaders]
    newHeaders[colIndex] = value
    setEditableHeaders(newHeaders)
  }

  // Export as CSV
  const exportCSV = () => {
    const csvData = [
      editableHeaders,
      ...editableData
    ]
    const csv = Papa.unparse(csvData)
    downloadFile(csv, `${fileName.replace(/\.(csv|xlsx|xls)$/, '')}_edited.csv`, 'text/csv')
  }

  // Export as Excel
  const exportExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      editableHeaders,
      ...editableData
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
    XLSX.writeFile(wb, `${fileName.replace(/\.(csv|xlsx|xls)$/, '')}_edited.xlsx`)
  }

  // Effect to sync data when switching tabs
  useEffect(() => {
    if (activeTab === "editor" && data.length > 0 && headers.length > 0) {
      setEditableData([...data])
      setEditableHeaders([...headers])
    }
  }, [activeTab, data, headers])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">CSV/Excel Viewer & Editor</h1>
          <p className="text-muted-foreground">
            View, edit, and convert between CSV and Excel formats
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Select a CSV or Excel file to view and edit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              {fileName && (
                <Button onClick={resetState} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            {fileName && (
              <p className="text-sm text-muted-foreground">
                Selected: {fileName}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {data.length > 0 && headers.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="viewer">Viewer</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="viewer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>File Viewer</CardTitle>
                <CardDescription>
                  Viewing {fileName} ({fileType === "csv" ? "CSV" : "Excel"} format)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        {headers.map((header, index) => (
                          <th key={index} className="border px-4 py-2 text-left">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border px-4 py-2">
                              {String(cell ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>File Editor</CardTitle>
                <CardDescription>
                  Edit data and export in CSV or Excel format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={addRow} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Row
                  </Button>
                  <Button onClick={addColumn} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Column
                  </Button>
                  <Button onClick={exportCSV} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export as CSV
                  </Button>
                  <Button onClick={exportExcel} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export as Excel
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border px-2 py-1 w-10">#</th>
                        {editableHeaders.map((header, index) => (
                          <th key={index} className="border px-2 py-1 min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={header}
                                onChange={(e) => updateHeader(index, e.target.value)}
                                className="w-full p-1 bg-transparent border-b border-dashed focus:outline-none focus:border-primary"
                              />
                              <Button
                                onClick={() => deleteColumn(index)}
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {editableData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                          <td className="border px-2 py-1 text-center">
                            <Button
                              onClick={() => deleteRow(rowIndex)}
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </td>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border px-2 py-1">
                              <input
                                type="text"
                                value={String(cell ?? "")}
                                onChange={(e) => updateCell(rowIndex, cellIndex, e.target.value)}
                                className="w-full p-1 bg-transparent focus:outline-none focus:bg-muted/50"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}