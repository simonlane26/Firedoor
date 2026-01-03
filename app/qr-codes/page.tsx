'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, QrCode, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FireDoor {
  id: string
  doorNumber: string
  location: string
  fireRating: string
  qrCodeUrl: string | null
  building: {
    id: string
    name: string
  }
}

interface QRCodeData {
  doorId: string
  doorNumber: string
  qrCodeDataUrl: string
  verificationUrl: string
}

export default function QRCodesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [doors, setDoors] = useState<FireDoor[]>([])
  const [selectedDoors, setSelectedDoors] = useState<Set<string>>(new Set())
  const [generatedQRCodes, setGeneratedQRCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchDoors()
  }, [])

  async function fetchDoors() {
    try {
      const response = await fetch('/api/doors')
      const data = await response.json()

      // Check if data is an array (successful response)
      if (Array.isArray(data)) {
        setDoors(data)
      } else {
        // Handle error response
        console.error('Error fetching doors:', data.error || 'Unknown error')
        setDoors([])
      }
    } catch (error) {
      console.error('Error fetching doors:', error)
      setDoors([])
    } finally {
      setLoading(false)
    }
  }

  function toggleDoorSelection(doorId: string) {
    const newSelection = new Set(selectedDoors)
    if (newSelection.has(doorId)) {
      newSelection.delete(doorId)
    } else {
      newSelection.add(doorId)
    }
    setSelectedDoors(newSelection)
  }

  function selectAll() {
    setSelectedDoors(new Set(doors.map((d) => d.id)))
  }

  function deselectAll() {
    setSelectedDoors(new Set())
  }

  async function generateQRCodes() {
    if (selectedDoors.size === 0) {
      alert('Please select at least one door')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doorIds: Array.from(selectedDoors) }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate QR codes')
      }

      const data = await response.json()
      setGeneratedQRCodes(data.qrCodes)

      // Refresh doors to get updated qrCodeUrl
      await fetchDoors()
    } catch (error) {
      console.error('Error generating QR codes:', error)
      alert('Failed to generate QR codes')
    } finally {
      setGenerating(false)
    }
  }

  function downloadQRCode(qrCode: QRCodeData) {
    const link = document.createElement('a')
    link.href = qrCode.qrCodeDataUrl
    link.download = `qr-code-door-${qrCode.doorNumber}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function downloadAllQRCodes() {
    generatedQRCodes.forEach((qrCode) => {
      setTimeout(() => downloadQRCode(qrCode), 100)
    })
  }

  function printQRCodes() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fire Door QR Codes</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .page-break {
                page-break-after: always;
              }
            }
            body {
              font-family: Arial, sans-serif;
            }
            .qr-container {
              display: inline-block;
              width: 48%;
              margin: 1%;
              padding: 20px;
              border: 2px solid #333;
              border-radius: 8px;
              text-align: center;
              vertical-align: top;
              box-sizing: border-box;
            }
            .qr-container img {
              width: 100%;
              max-width: 300px;
              height: auto;
            }
            .door-info {
              margin-top: 10px;
              font-weight: bold;
              font-size: 16px;
            }
            .scan-instruction {
              margin-top: 5px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${generatedQRCodes
            .map(
              (qrCode, index) => `
            <div class="qr-container${(index + 1) % 4 === 0 ? ' page-break' : ''}">
              <img src="${qrCode.qrCodeDataUrl}" alt="QR Code for Door ${qrCode.doorNumber}" />
              <div class="door-info">Door ${qrCode.doorNumber}</div>
              <div class="scan-instruction">Scan to view door status or start inspection</div>
            </div>
          `
            )
            .join('')}
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading doors...</p>
        </div>
      </div>
    )
  }

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

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">QR Code Management</h1>
          <p className="text-slate-600">Generate QR codes for fire doors. Inspectors can scan to start inspections, building users can scan to check compliance status.</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Door Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Select Doors
            </CardTitle>
            <CardDescription>Choose which doors to generate QR codes for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={selectAll} variant="outline" size="sm">
                  Select All
                </Button>
                <Button onClick={deselectAll} variant="outline" size="sm">
                  Deselect All
                </Button>
              </div>

              <div className="border rounded-lg p-4 max-h-[500px] overflow-y-auto space-y-3">
                {doors.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No doors found. Please register a door first.
                  </p>
                ) : (
                  doors.map((door) => (
                    <div
                      key={door.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <Checkbox
                        id={door.id}
                        checked={selectedDoors.has(door.id)}
                        onCheckedChange={() => toggleDoorSelection(door.id)}
                      />
                      <label
                        htmlFor={door.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">Door {door.doorNumber}</div>
                        <div className="text-sm text-gray-600">
                          {door.location} - {door.fireRating} - {door.building.name}
                        </div>
                        {door.qrCodeUrl && (
                          <div className="text-xs text-green-600 mt-1">QR Code exists</div>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>

              <Button
                onClick={generateQRCodes}
                disabled={selectedDoors.size === 0 || generating}
                className="w-full"
              >
                {generating ? 'Generating...' : `Generate QR Codes (${selectedDoors.size})`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated QR Codes Card */}
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Codes</CardTitle>
            <CardDescription>
              {generatedQRCodes.length > 0
                ? `${generatedQRCodes.length} QR code(s) generated`
                : 'QR codes will appear here after generation'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedQRCodes.length > 0 ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={downloadAllQRCodes} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                  <Button onClick={printQRCodes} variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print All
                  </Button>
                </div>

                <div className="border rounded-lg p-4 max-h-[500px] overflow-y-auto space-y-4">
                  {generatedQRCodes.map((qrCode) => (
                    <div key={qrCode.doorId} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-4">
                        <img
                          src={qrCode.qrCodeDataUrl}
                          alt={`QR Code for Door ${qrCode.doorNumber}`}
                          className="w-32 h-32 border-2 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            Door {qrCode.doorNumber}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 break-all">
                            {qrCode.verificationUrl}
                          </p>
                          <Button
                            onClick={() => downloadQRCode(qrCode)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <QrCode className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Select doors and click "Generate QR Codes" to begin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
