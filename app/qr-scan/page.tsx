'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { QrCode, X } from 'lucide-react'

export default function QRScanPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    startScanning()
    return () => {
      stopScanning()
    }
  }, [])

  async function startScanning() {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setScanning(true)

        // Start detecting QR codes
        detectQRCode()
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.')
      console.error('Camera error:', err)
    }
  }

  function stopScanning() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setScanning(false)
  }

  async function detectQRCode() {
    if (!videoRef.current || !scanning) return

    try {
      // Use BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code']
        })

        const detect = async () => {
          if (!videoRef.current || !scanning) return

          try {
            const barcodes = await barcodeDetector.detect(videoRef.current)
            if (barcodes.length > 0) {
              const qrData = barcodes[0].rawValue
              handleQRCodeDetected(qrData)
              return
            }
          } catch (err) {
            // Continue scanning
          }

          requestAnimationFrame(detect)
        }

        detect()
      } else {
        setError('QR code scanning not supported on this device. Please use your camera app to scan QR codes.')
      }
    } catch (err) {
      setError('QR code detection failed. Please use your camera app to scan QR codes.')
    }
  }

  function handleQRCodeDetected(url: string) {
    stopScanning()

    // Check if it's a door verification URL
    const match = url.match(/\/verify\/([a-zA-Z0-9-]+)/)
    if (match) {
      const doorId = match[1]
      // Redirect to verification page
      router.push(`/verify/${doorId}`)
    } else {
      setError('Invalid QR code. Please scan a fire door QR code.')
      setTimeout(() => {
        setError('')
        startScanning()
      }, 2000)
    }
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
                  {error}
                </div>
              )}

              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-4 border-white rounded-lg opacity-50"></div>
                  </div>
                )}

                {!scanning && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white text-center">
                      <QrCode className="h-16 w-16 mx-auto mb-4" />
                      <p>Initializing camera...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {scanning ? (
                  <Button
                    onClick={stopScanning}
                    variant="outline"
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Stop Scanning
                  </Button>
                ) : (
                  <Button
                    onClick={startScanning}
                    className="w-full"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Start Scanning
                  </Button>
                )}
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                <p className="font-medium mb-2">Tips for scanning:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hold your device steady</li>
                  <li>Ensure good lighting</li>
                  <li>Position the QR code within the white frame</li>
                  <li>Keep the QR code in focus</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
