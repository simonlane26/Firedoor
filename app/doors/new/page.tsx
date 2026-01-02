'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CompactCard, CompactSection, CompactField } from '@/components/ui/compact-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { HelpTooltip, InfoBanner } from '@/components/ui/help-tooltip'

interface Building {
  id: string
  name: string
  address: string
  topStoreyHeight: number
  buildingType: string
}

export default function NewDoorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [certificationKey, setCertificationKey] = useState<string | null>(null)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [formData, setFormData] = useState({
    buildingId: '',
    doorNumber: '',
    location: '',
    doorType: 'FLAT_ENTRANCE',
    fireRating: 'FD30',
    installationDate: '',
    hasIntumescentStrips: true,
    hasSmokeSeal: false,
    hasLetterbox: false,
    hasAirTransferGrille: false,
    hasGlazing: false,
    notes: ''
  })

  useEffect(() => {
    fetchBuildings()
  }, [])

  const fetchBuildings = async () => {
    const res = await fetch('/api/buildings')
    const data = await res.json()
    setBuildings(data)
  }

  const handleBuildingChange = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId)
    setSelectedBuilding(building || null)
    setFormData({ ...formData, buildingId })
  }

  const getInspectionFrequency = () => {
    const isCommunalDoor = ['COMMUNAL_STAIRWAY', 'COMMUNAL_CORRIDOR', 'COMMUNAL_LOBBY'].includes(formData.doorType)
    const buildingHeight = selectedBuilding?.topStoreyHeight || 0
    const buildingType = selectedBuilding?.buildingType || ''

    // Flat entrance doors in buildings > 11m - Annually (LEGAL)
    if (formData.doorType === 'FLAT_ENTRANCE' && buildingHeight > 11) {
      return 'Annually (12 months) - Legal requirement for blocks > 11m'
    }

    // Communal doors in buildings > 11m - Quarterly (LEGAL)
    if (isCommunalDoor && buildingHeight > 11) {
      return 'Quarterly (3 months) - Legal requirement for blocks > 11m'
    }

    // Schools, Hospitals, Childcare, Healthcare - 3-6 months based on risk
    if (['EDUCATION', 'HEALTHCARE', 'CHILDCARE', 'CARE_FACILITY'].includes(buildingType)) {
      return '3-6 months - Based on risk/usage (Schools/Hospitals/Healthcare)'
    }

    // Commercial, Industrial, Hotels, Entertainment, Transport - 6-monthly minimum
    if (['COMMERCIAL', 'INDUSTRIAL', 'HOTEL', 'HOSTEL', 'GUEST_HOUSE', 'ENTERTAINMENT', 'TRANSPORT'].includes(buildingType)) {
      return '6-monthly minimum - More often if high use (Commercial/Industrial)'
    }

    // HMOs and smaller residential - 6-monthly recommended
    if (['HMO', 'RESIDENTIAL'].includes(buildingType) || buildingHeight <= 11) {
      return '6-monthly recommended (Smaller residential/HMOs/Low-rise)'
    }

    // Flat entrance doors general
    if (formData.doorType === 'FLAT_ENTRANCE') {
      return 'Annually (12 months) - Recommended'
    }

    // Communal doors general
    if (isCommunalDoor) {
      return '6-monthly (Recommended for communal areas)'
    }

    // Default
    return '6-monthly (Recommended)'
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      // Step 1: Get presigned upload URL from API
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          folder: 'certifications'
        })
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        alert(error.error || 'Failed to get upload URL')
        return
      }

      const { uploadUrl, key } = await uploadResponse.json()

      // Step 2: Upload file directly to S3 using presigned URL
      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      })

      if (!s3Response.ok) {
        alert('Failed to upload file to storage')
        return
      }

      // Step 3: Save S3 key for later use
      setCertificationKey(key)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/doors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          certificationUrl: certificationKey
        })
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Failed to register door: ${error.error || 'Unknown error'}`)
        return
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to create door', error)
      alert('Failed to register door. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>

        <CompactCard title="Register Fire Door" description="Add a fire door to the inspection system">
          <form onSubmit={handleSubmit} className="space-y-3">
              <InfoBanner variant="info">
                <strong>Inspection Frequencies:</strong> Communal doors (blocks &gt;11m): Quarterly - Legal | Flat entrance doors (blocks &gt;11m): Annually - Legal | Commercial/Industrial: 6-monthly minimum | Schools/Hospitals/Childcare/Healthcare: 3-6 months based on risk | Smaller residential/HMOs: 6-monthly recommended
              </InfoBanner>

              <CompactSection title="Basic Information">
                <CompactField label="Building" required>
                  <Select value={formData.buildingId} onValueChange={handleBuildingChange} required>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map(building => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CompactField>

                <div className="grid grid-cols-2 gap-2">
                  <CompactField label="Door Number / ID" required>
                    <Input
                      className="h-9"
                      value={formData.doorNumber}
                      onChange={(e) => setFormData({ ...formData, doorNumber: e.target.value })}
                      placeholder="e.g. FD-001"
                      required
                    />
                  </CompactField>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <label className="text-xs font-medium text-slate-700">
                        Fire Rating<span className="text-red-500 ml-1">*</span>
                      </label>
                      <HelpTooltip content="FD30 = Minimum 30 minutes fire resistance. FD60 = 60 minutes, etc. This indicates how long the door can withstand fire exposure." />
                    </div>
                    <Select
                      value={formData.fireRating}
                      onValueChange={(value) => setFormData({ ...formData, fireRating: value })}
                      required
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FD20">FD20 (20 min)</SelectItem>
                        <SelectItem value="FD30">FD30 (30 min)</SelectItem>
                        <SelectItem value="FD60">FD60 (60 min)</SelectItem>
                        <SelectItem value="FD90">FD90 (90 min)</SelectItem>
                        <SelectItem value="FD120">FD120 (120 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <CompactField label="Location" required>
                  <Input
                    className="h-9"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Ground Floor, East Wing"
                    required
                  />
                </CompactField>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-medium text-slate-700">
                      Door Type<span className="text-red-500 ml-1">*</span>
                    </label>
                    <HelpTooltip content="Inspection frequency depends on door type and building: Communal doors (>11m): Quarterly (legal). Flat entrance (>11m): Annually (legal). Commercial/Industrial: 6-monthly min. Schools/Hospitals: 3-6 months. HMOs/Low-rise: 6-monthly recommended." />
                  </div>
                  <Select
                    value={formData.doorType}
                    onValueChange={(value) => setFormData({ ...formData, doorType: value })}
                    required
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FLAT_ENTRANCE">Flat Entrance</SelectItem>
                      <SelectItem value="COMMUNAL_STAIRWAY">Communal Stairway</SelectItem>
                      <SelectItem value="COMMUNAL_CORRIDOR">Communal Corridor</SelectItem>
                      <SelectItem value="COMMUNAL_LOBBY">Communal Lobby</SelectItem>
                      <SelectItem value="PLANT_ROOM">Plant Room</SelectItem>
                      <SelectItem value="SERVICE_RISER">Service Riser</SelectItem>
                      <SelectItem value="RISER_CUPBOARD">Riser Cupboard</SelectItem>
                      <SelectItem value="METER_CUPBOARD">Meter Cupboard</SelectItem>
                      <SelectItem value="KITCHEN">Kitchen</SelectItem>
                      <SelectItem value="HALLWAY">Hallway</SelectItem>
                      <SelectItem value="DINING_AREA">Dining Area</SelectItem>
                      <SelectItem value="OFFICE">Office</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.doorType && (
                    <Badge variant="secondary" className="text-xs mt-1">{getInspectionFrequency()}</Badge>
                  )}
                </div>

                <CompactField label="Installation Date">
                  <Input
                    className="h-9"
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                  />
                </CompactField>
              </CompactSection>

              <CompactSection title="Certification">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-medium text-slate-700">
                      Upload Document (PDF or image, max 10MB)
                    </label>
                    <HelpTooltip content="Certification should prove door meets manufacture standards (BWF-CERTIFIRE, BM TRADA, etc.). Upload test certificates, installation records, or product data sheets." />
                  </div>
                  <Input
                    className="h-9"
                    type="file"
                    accept=".pdf,image/jpeg,image/jpg,image/png"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
                  {certificationKey && (
                    <div className="flex items-center gap-2 p-1.5 bg-green-50 border border-green-200 rounded mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-green-700">File uploaded successfully</span>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/s3-url?key=${encodeURIComponent(certificationKey)}`)
                            const data = await res.json()
                            if (res.ok) {
                              window.open(data.url, '_blank')
                            } else {
                              alert('Failed to generate view URL')
                            }
                          } catch (error) {
                            alert('Failed to view file')
                          }
                        }}
                        className="text-xs text-blue-600 hover:underline ml-auto"
                      >
                        View
                      </button>
                    </div>
                  )}
                </div>
              </CompactSection>

              <CompactSection title="Door Features">
                <InfoBanner variant="warning">
                  Intumescent strips expand when heated to seal gaps. Smoke seals prevent smoke spread. All features must be inspected for compliance.
                </InfoBanner>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Checkbox
                      id="hasIntumescentStrips"
                      checked={formData.hasIntumescentStrips}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasIntumescentStrips: checked as boolean })}
                    />
                    <Label htmlFor="hasIntumescentStrips" className="text-xs font-normal">Intumescent strips</Label>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Checkbox
                      id="hasSmokeSeal"
                      checked={formData.hasSmokeSeal}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasSmokeSeal: checked as boolean })}
                    />
                    <Label htmlFor="hasSmokeSeal" className="text-xs font-normal">Smoke seal</Label>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Checkbox
                      id="hasLetterbox"
                      checked={formData.hasLetterbox}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasLetterbox: checked as boolean })}
                    />
                    <Label htmlFor="hasLetterbox" className="text-xs font-normal">Letterbox</Label>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Checkbox
                      id="hasAirTransferGrille"
                      checked={formData.hasAirTransferGrille}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasAirTransferGrille: checked as boolean })}
                    />
                    <Label htmlFor="hasAirTransferGrille" className="text-xs font-normal">Air transfer grille</Label>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Checkbox
                      id="hasGlazing"
                      checked={formData.hasGlazing}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasGlazing: checked as boolean })}
                    />
                    <Label htmlFor="hasGlazing" className="text-xs font-normal">Glazing</Label>
                  </div>
                </div>
              </CompactSection>

              <CompactField label="Additional Notes">
                <Textarea
                  className="text-sm"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows={2}
                />
              </CompactField>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register Door'}
                </Button>
              </div>
            </form>
          </CompactCard>
      </div>
    </div>
  )
}
