import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, CheckCircle2, DoorOpen } from 'lucide-react'

interface BrandingPreviewProps {
  companyName: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  backgroundColor: string
}

export function BrandingPreview({
  companyName,
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
  textColor,
  backgroundColor,
}: BrandingPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700 mb-2">Preview</div>

      {/* Header Preview */}
      <div
        className="rounded-lg p-4 border shadow-sm"
        style={{ backgroundColor: backgroundColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="h-10 w-auto" />
            ) : (
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <DoorOpen className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold" style={{ color: textColor }}>
                {companyName}
              </h1>
              <p className="text-sm text-gray-500">Fire Door Inspector</p>
            </div>
          </div>
          <div
            className="px-4 py-2 rounded-md text-white font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            Dashboard
          </div>
        </div>
      </div>

      {/* Cards Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={{ backgroundColor: backgroundColor, borderColor: primaryColor }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Doors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: textColor }}>
              150
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: backgroundColor }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: primaryColor }}>
              120
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: backgroundColor }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: secondaryColor }}>
              5
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buttons Preview */}
      <div className="flex flex-wrap gap-3">
        <button
          className="px-4 py-2 rounded-md text-white font-medium"
          style={{ backgroundColor: primaryColor }}
        >
          Primary Action
        </button>
        <button
          className="px-4 py-2 rounded-md text-white font-medium"
          style={{ backgroundColor: secondaryColor }}
        >
          Secondary Action
        </button>
        <button
          className="px-4 py-2 rounded-md text-white font-medium"
          style={{ backgroundColor: accentColor }}
        >
          Accent Action
        </button>
      </div>

      {/* Status Badges Preview */}
      <div className="flex flex-wrap gap-3">
        <div
          className="px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <CheckCircle2 className="inline h-4 w-4 mr-1" />
          Pass
        </div>
        <div
          className="px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: secondaryColor }}
        >
          Fail
        </div>
        <div
          className="px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: accentColor }}
        >
          Pending
        </div>
      </div>

      {/* Color Swatches */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Color Palette</div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <div
              className="h-16 rounded-md"
              style={{ backgroundColor: primaryColor }}
            />
            <div className="text-xs text-center font-mono text-gray-600">{primaryColor}</div>
            <div className="text-xs text-center text-gray-500">Primary</div>
          </div>
          <div className="flex-1 space-y-1">
            <div
              className="h-16 rounded-md"
              style={{ backgroundColor: secondaryColor }}
            />
            <div className="text-xs text-center font-mono text-gray-600">{secondaryColor}</div>
            <div className="text-xs text-center text-gray-500">Secondary</div>
          </div>
          <div className="flex-1 space-y-1">
            <div
              className="h-16 rounded-md"
              style={{ backgroundColor: accentColor }}
            />
            <div className="text-xs text-center font-mono text-gray-600">{accentColor}</div>
            <div className="text-xs text-center text-gray-500">Accent</div>
          </div>
          <div className="flex-1 space-y-1">
            <div
              className="h-16 rounded-md border"
              style={{ backgroundColor: textColor }}
            />
            <div className="text-xs text-center font-mono text-gray-600">{textColor}</div>
            <div className="text-xs text-center text-gray-500">Text</div>
          </div>
          <div className="flex-1 space-y-1">
            <div
              className="h-16 rounded-md border"
              style={{ backgroundColor: backgroundColor }}
            />
            <div className="text-xs text-center font-mono text-gray-600">{backgroundColor}</div>
            <div className="text-xs text-center text-gray-500">Background</div>
          </div>
        </div>
      </div>
    </div>
  )
}
