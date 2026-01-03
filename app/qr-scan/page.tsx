'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { QrCode, Camera, AlertCircle } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const mountedRef = useRef(false)

  useEffect(() => {
    // Prevent double mounting in dev mode
    if (mountedRef.current) return
    mountedRef.current = true

    // Get available cameras
    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        setCameras(devices.map(d => ({ id: d.id, label: d.label || `Camera ${d.id}` })))
        // Auto-select rear camera if available
        const rearCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'))
        const cameraId = rearCamera ? rearCamera.id : devices[0].id
        setSelectedCamera(cameraId)
        startScanning(cameraId)
      } else {
        setError('No cameras found on this device')
      }
    }).catch((err) => {
      setError(`Error accessing cameras: ${err.message || 'Unknown error'}`)
      console.error('Camera enumeration error:', err)
    })

    return () => {
      stopScanning()
    }
  }, [])

  async function startScanning(cameraId: string) {
    setError('')
    setSuccess('')

    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          handleQRCodeDetected(decodedText)
        },
        (errorMessage) => {
          // Error callback - ignore, these fire constantly while scanning
        }
      )

      setScanning(true)
    } catch (err: any) {
      setError(`Failed to start camera: ${err.message || 'Unknown error'}. Please ensure camera permissions are granted.`)
      console.error('Scanner start error:', err)
    }
  }

  async function stopScanning() {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
      scannerRef.current = null
    }
    setScanning(false)
  }

  function handleQRCodeDetected(url: string) {
    setSuccess(`QR Code detected! Redirecting...`)

    // Check if it's a door verification URL
    const match = url.match(/\/verify\/([a-zA-Z0-9-]+)/)
    if (match) {
      const doorId = match[1]
      // Stop scanning before redirect
      stopScanning()
      // Redirect to verification page
      setTimeout(() => {
        router.push(`/verify/${doorId}`)
      }, 500)
    } else {
      setError('Invalid QR code. Please scan a fire door QR code.')
      setTimeout(() => {
        setError('')
      }, 3000)
    }
  }

  async function switchCamera(cameraId: string) {
    setSelectedCamera(cameraId)
    await stopScanning()
    await startScanning(cameraId)
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

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              Scan QR Code
            </CardTitle>
            <CardDescription>
              Position the QR code within the camera frame to start inspection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                  {success}
                </div>
              )}

              {cameras.length > 1 && (
                <div>
                  <label htmlFor="camera-select" className="text-sm font-medium mb-2 block">Select Camera</label>
                  <select
                    id="camera-select"
                    value={selectedCamera}
                    onChange={(e) => switchCamera(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    aria-label="Select camera for scanning"
                  >
                    {cameras.map((camera) => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>

              {!scanning && !error && (
                <div className="text-center py-8">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
                  <p className="text-gray-600">Initializing camera...</p>
                </div>
              )}

              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                <p className="font-medium mb-2">Tips for scanning:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Allow camera access when prompted</li>
                  <li>Hold your device steady</li>
                  <li>Ensure good lighting</li>
                  <li>Position the QR code within the red scanning frame</li>
                  <li>Keep the QR code in focus and not too close</li>
                </ul>
              </div>

              <div className="text-xs text-gray-500 text-center">
                <p>After scanning, you'll be redirected to the door's verification page where you can start the inspection.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
