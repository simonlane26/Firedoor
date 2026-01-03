'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { QrCode, X, Camera } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function QRScanPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    startScanning()

    return () => {
      stopScanning()
    }
  }, [])

  function startScanning() {
    setError('')
    setSuccess('')
    setScanning(true)

    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      },
      false
    )

    scanner.render(
      (decodedText) => {
        // Success callback
        handleQRCodeDetected(decodedText)
      },
      (errorMessage) => {
        // Error callback - ignore frequent scanning errors
        // Only log actual errors
      }
    )

    scannerRef.current = scanner
  }

  function stopScanning() {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((err) => {
        console.error('Error clearing scanner:', err)
      })
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

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                  {success}
                </div>
              )}

              <div id="qr-reader" className="w-full"></div>

              {!scanning && (
                <div className="text-center py-8">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Camera initializing...</p>
                </div>
              )}

              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                <p className="font-medium mb-2">Tips for scanning:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Allow camera access when prompted</li>
                  <li>Hold your device steady</li>
                  <li>Ensure good lighting (use torch button if needed)</li>
                  <li>Position the QR code within the scanning frame</li>
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
