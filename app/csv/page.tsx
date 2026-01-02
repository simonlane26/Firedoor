'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  Download,
  FileText,
  Building2,
  DoorOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react'

interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: Array<{ row: number; error: string; data?: any }>
}

export default function CSVImportExportPage() {
  const { data: session } = useSession()
  const [importing, setImporting] = useState(false)
  const [importingType, setImportingType] = useState<'buildings' | 'doors' | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'buildings' | 'doors') => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImportingType(type)
      setImportResult(null)
    }
  }

  const handleImport = async (type: 'buildings' | 'doors') => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    setImporting(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`/api/csv/import/${type}`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setImportResult(result)
    } catch (error) {
      console.error('Import error:', error)
      alert(error instanceof Error ? error.message : 'Failed to import CSV')
    } finally {
      setImporting(false)
      setSelectedFile(null)
      setImportingType(null)
    }
  }

  const handleDownloadTemplate = async (type: 'buildings' | 'doors' | 'guide') => {
    try {
      const response = await fetch(`/api/csv/templates?type=${type}`)

      if (!response.ok) throw new Error('Failed to download template')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-template.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download template')
    }
  }

  const handleExport = async (type: 'buildings' | 'doors' | 'inspections') => {
    try {
      const response = await fetch(`/api/csv/export/${type}`)

      if (!response.ok) throw new Error('Failed to export data')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data')
    }
  }

  // Check if user has permission (Admin or Manager)
  const canImport = session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session?.user.name}</span>
            <Badge variant="outline">{session?.user.role}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">CSV Import/Export</h1>
          <p className="text-slate-600 mt-2">Bulk import and export data for buildings, doors, and inspections</p>
        </div>

      {/* Info Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Important:</strong> When importing fire doors, make sure the buildings already exist in the system.
          The building name must match exactly.
        </AlertDescription>
      </Alert>

      {/* Import Result */}
      {importResult && (
        <Alert className={`mb-6 ${importResult.success ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          {importResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          )}
          <AlertDescription className={importResult.success ? 'text-green-800' : 'text-yellow-800'}>
            <div className="font-semibold mb-2">
              Import completed: {importResult.imported} successful, {importResult.failed} failed
            </div>
            {importResult.errors.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold mb-1">Errors:</div>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {importResult.errors.slice(0, 10).map((error, idx) => (
                    <li key={idx}>
                      Row {error.row}: {error.error}
                    </li>
                  ))}
                  {importResult.errors.length > 10 && (
                    <li className="text-gray-600">...and {importResult.errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Import Buildings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Import Buildings
            </CardTitle>
            <CardDescription>Bulk import buildings from CSV file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="buildings-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Buildings CSV
              </label>
              <input
                id="buildings-upload"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect(e, 'buildings')}
                disabled={!canImport || importing}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>
            {selectedFile && importingType === 'buildings' && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                {selectedFile.name}
              </div>
            )}
            <Button
              onClick={() => handleImport('buildings')}
              disabled={!canImport || importing || !selectedFile || importingType !== 'buildings'}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {importing && importingType === 'buildings' ? 'Importing...' : 'Import Buildings'}
            </Button>
            <Button
              onClick={() => handleDownloadTemplate('buildings')}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            {!canImport && (
              <p className="text-sm text-red-600">Only Admins and Managers can import data</p>
            )}
          </CardContent>
        </Card>

        {/* Import Fire Doors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />
              Import Fire Doors
            </CardTitle>
            <CardDescription>Bulk import fire doors from CSV file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="doors-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Fire Doors CSV
              </label>
              <input
                id="doors-upload"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect(e, 'doors')}
                disabled={!canImport || importing}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>
            {selectedFile && importingType === 'doors' && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                {selectedFile.name}
              </div>
            )}
            <Button
              onClick={() => handleImport('doors')}
              disabled={!canImport || importing || !selectedFile || importingType !== 'doors'}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {importing && importingType === 'doors' ? 'Importing...' : 'Import Fire Doors'}
            </Button>
            <Button
              onClick={() => handleDownloadTemplate('doors')}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            {!canImport && (
              <p className="text-sm text-red-600">Only Admins and Managers can import data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>Download your data as CSV files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleExport('buildings')}
              variant="outline"
              className="h-20 flex-col"
            >
              <Building2 className="h-6 w-6 mb-2" />
              Export Buildings
            </Button>
            <Button
              onClick={() => handleExport('doors')}
              variant="outline"
              className="h-20 flex-col"
            >
              <DoorOpen className="h-6 w-6 mb-2" />
              Export Fire Doors
            </Button>
            <Button
              onClick={() => handleExport('inspections')}
              variant="outline"
              className="h-20 flex-col"
            >
              <FileText className="h-6 w-6 mb-2" />
              Export Inspections
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Import Guide
          </CardTitle>
          <CardDescription>Learn about valid values and formatting requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Building Types</h3>
              <div className="flex flex-wrap gap-2">
                {['RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'INDUSTRIAL', 'PUBLIC'].map((type) => (
                  <span key={type} className="px-3 py-1 bg-gray-100 rounded-md text-sm">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Fire Ratings</h3>
              <div className="flex flex-wrap gap-2">
                {['FD30', 'FD60', 'FD90', 'FD120'].map((rating) => (
                  <span key={rating} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                    {rating}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Door Types</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'FLAT_ENTRANCE',
                  'COMMUNAL_STAIRWAY',
                  'COMMUNAL_CORRIDOR',
                  'RISER_CUPBOARD',
                  'METER_CUPBOARD',
                  'OTHER',
                ].map((type) => (
                  <span key={type} className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                    {type.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
            <Button
              onClick={() => handleDownloadTemplate('guide')}
              variant="outline"
              className="w-full md:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Full Import Guide
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
