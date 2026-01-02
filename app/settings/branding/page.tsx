'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { BrandingPreview } from '@/components/branding-preview'
import {
  Upload,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Eye,
  Code,
} from 'lucide-react'

interface BrandingConfig {
  companyName: string
  logoUrl: string | null
  faviconUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  backgroundColor: string
  brandingEnabled: boolean
  customCss: string | null
}

export default function BrandingSettingsPage() {
  const { data: session } = useSession()
  const [branding, setBranding] = useState<BrandingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [showCustomCss, setShowCustomCss] = useState(false)

  useEffect(() => {
    fetchBranding()
  }, [])

  const fetchBranding = async () => {
    try {
      const response = await fetch('/api/branding')
      if (!response.ok) {
        if (response.status === 400) {
          const error = await response.json()
          if (error.error === 'No tenant found') {
            setMessage({
              type: 'error',
              text: 'No tenant configured. Please set up your tenant first at Settings.'
            })
            setLoading(false)
            return
          }
        }
        throw new Error('Failed to fetch branding')
      }
      const data = await response.json()
      // Ensure null values stay as null, not empty strings
      const sanitizedData = {
        ...data,
        logoUrl: data.logoUrl || null,
        faviconUrl: data.faviconUrl || null,
        customCss: data.customCss || null,
      }
      setBranding(sanitizedData)
    } catch (error) {
      console.error('Error fetching branding:', error)
      setMessage({ type: 'error', text: 'Failed to load branding settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!branding) return

    setSaving(true)
    setMessage(null)

    try {
      // Sanitize data: convert empty strings to null for URL fields
      const sanitizedBranding = {
        ...branding,
        logoUrl: !branding.logoUrl || branding.logoUrl.trim() === '' ? null : branding.logoUrl,
        faviconUrl: !branding.faviconUrl || branding.faviconUrl.trim() === '' ? null : branding.faviconUrl,
        customCss: !branding.customCss || branding.customCss.trim() === '' ? null : branding.customCss,
      }

      // Debug: log what we're sending
      console.log('Sending branding data:', sanitizedBranding)
      console.log('logoUrl:', sanitizedBranding.logoUrl)
      console.log('faviconUrl:', sanitizedBranding.faviconUrl)

      const response = await fetch('/api/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedBranding),
      })

      if (!response.ok) {
        const error = await response.json()
        const errorMsg = error.errors
          ? `Validation failed: ${error.errors.join(', ')}`
          : (error.error || 'Failed to save branding')
        throw new Error(errorMsg)
      }

      const updated = await response.json()
      setBranding(updated)
      setMessage({ type: 'success', text: 'Branding settings saved successfully!' })
    } catch (error) {
      console.error('Error saving branding:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save branding settings',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(type)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/branding/upload-logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload file')
      }

      const result = await response.json()

      setBranding((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          ...(type === 'logo' ? { logoUrl: result.url } : { faviconUrl: result.url }),
        }
      })

      setMessage({ type: 'success', text: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!` })
    } catch (error) {
      console.error('Error uploading file:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upload file',
      })
    } finally {
      setUploading(null)
    }
  }

  const handleReset = () => {
    if (confirm('Reset all branding to defaults? This cannot be undone.')) {
      setBranding({
        companyName: branding?.companyName || 'Fire Door Inspector',
        logoUrl: null,
        faviconUrl: null,
        primaryColor: '#dc2626',
        secondaryColor: '#991b1b',
        accentColor: '#f59e0b',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        brandingEnabled: true,
        customCss: null,
      })
      setMessage({ type: 'success', text: 'Branding reset to defaults. Click Save to apply.' })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading branding settings...</div>
        </div>
      </div>
    )
  }

  if (!branding) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Failed to load branding settings</div>
        </div>
      </div>
    )
  }

  // Check if user is admin
  const isAdmin = session?.user?.role === 'ADMIN'

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Only administrators can manage branding settings.
          </AlertDescription>
        </Alert>
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

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Branding Settings</h1>
            <p className="text-gray-600 mt-2">Customize your organization's brand appearance</p>
          </div>
          <div className="flex gap-3">
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Column */}
        <div className="space-y-6">
          {/* Company Name */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={branding.companyName}
                  onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo & Favicon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Logo & Favicon
              </CardTitle>
              <CardDescription>Upload your brand assets (max 2MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  {branding.logoUrl && (
                    <img src={branding.logoUrl} alt="Logo" className="h-12 w-auto border rounded" />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      disabled={uploading !== null}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      {uploading === 'logo' ? 'Uploading...' : 'Upload Logo'}
                    </div>
                  </label>
                </div>
              </div>

              {/* Favicon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                <div className="flex items-center gap-4">
                  {branding.faviconUrl && (
                    <img src={branding.faviconUrl} alt="Favicon" className="h-8 w-8 border rounded" />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/x-icon"
                      onChange={(e) => handleFileUpload(e, 'favicon')}
                      disabled={uploading !== null}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      {uploading === 'favicon' ? 'Uploading...' : 'Upload Favicon'}
                    </div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Scheme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Scheme
              </CardTitle>
              <CardDescription>Customize your brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      aria-label="Primary color picker"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                      placeholder="#dc2626"
                      aria-label="Primary color hex value"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      aria-label="Secondary color picker"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                      placeholder="#991b1b"
                      aria-label="Secondary color hex value"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      aria-label="Accent color picker"
                    />
                    <input
                      type="text"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                      placeholder="#f59e0b"
                      aria-label="Accent color hex value"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.textColor}
                      onChange={(e) => setBranding({ ...branding, textColor: e.target.value })}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      aria-label="Text color picker"
                    />
                    <input
                      type="text"
                      value={branding.textColor}
                      onChange={(e) => setBranding({ ...branding, textColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                      placeholder="#1f2937"
                      aria-label="Text color hex value"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.backgroundColor}
                      onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      aria-label="Background color picker"
                    />
                    <input
                      type="text"
                      value={branding.backgroundColor}
                      onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                      placeholder="#ffffff"
                      aria-label="Background color hex value"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom CSS */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Custom CSS
                  </CardTitle>
                  <CardDescription>Advanced styling (optional)</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomCss(!showCustomCss)}
                >
                  {showCustomCss ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardHeader>
            {showCustomCss && (
              <CardContent>
                <textarea
                  value={branding.customCss || ''}
                  onChange={(e) => setBranding({ ...branding, customCss: e.target.value })}
                  placeholder="/* Add custom CSS here */"
                  className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use CSS variables: --brand-primary, --brand-secondary, --brand-accent, --brand-text, --brand-background
                </p>
              </CardContent>
            )}
          </Card>

          {/* Branding Toggle */}
          <Card>
            <CardHeader>
              <CardTitle>Branding Status</CardTitle>
              <CardDescription>Enable or disable custom branding</CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={branding.brandingEnabled}
                  onChange={(e) => setBranding({ ...branding, brandingEnabled: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium">Enable custom branding</span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                When disabled, the default Fire Door Inspector branding will be used
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Hide' : 'Show'}
                </Button>
              </div>
              <CardDescription>See how your branding will look</CardDescription>
            </CardHeader>
            {showPreview && (
              <CardContent>
                <BrandingPreview
                  companyName={branding.companyName}
                  logoUrl={branding.logoUrl}
                  primaryColor={branding.primaryColor}
                  secondaryColor={branding.secondaryColor}
                  accentColor={branding.accentColor}
                  textColor={branding.textColor}
                  backgroundColor={branding.backgroundColor}
                />
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
    </div>
  )
}
