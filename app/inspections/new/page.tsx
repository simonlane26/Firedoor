'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { HelpTooltip, InfoBanner } from '@/components/ui/help-tooltip'

interface Building {
  id: string
  name: string
  address: string
}

interface FireDoor {
  id: string
  doorNumber: string
  location: string
  doorType: string
  fireRating: string
  hasIntumescentStrips: boolean
  hasSmokeSeal: boolean
  hasLetterbox: boolean
  hasAirTransferGrille: boolean
}

export default function NewInspectionPage() {
  const router = useRouter()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [doors, setDoors] = useState<FireDoor[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState('')
  const [selectedDoor, setSelectedDoor] = useState<FireDoor | null>(null)
  const [inspectionType, setInspectionType] = useState<'THREE_MONTH' | 'TWELVE_MONTH' | 'AD_HOC'>('TWELVE_MONTH')
  const [isLoadingFromQR, setIsLoadingFromQR] = useState(false)

  const [formData, setFormData] = useState({
    doorConstruction: '' as 'STEEL' | 'WOOD' | 'GLASS' | '',
    certificationProvided: null as boolean | null,
    visualInspectionOk: null as boolean | null,
    visualInspectionComments: '',
    doorLeafFrameSameRating: null as boolean | null,
    doorLeafFrameRatingComments: '',
    excessiveGapsOrDamage: null as boolean | null,
    excessiveGapsOrDamageComments: '',
    doorClosesCompletelyOk: null as boolean | null,
    doorClosesCompletelyComments: '',
    doorClosesFromAnyAngleOk: null as boolean | null,
    doorClosesFromAnyAngleComments: '',
    doorOpensInDirectionOfTravelOk: null as boolean | null,
    doorOpensInDirectionOfTravelComments: '',
    frameGapsAcceptableOk: null as boolean | null,
    frameGapsAcceptableComments: '',
    damageOrDefects: false,
    damageDescription: '',
    doorLeafFrameOk: false,
    doorClosesCompletely: false,
    doorClosesFromAnyAngle: false,
    doorOpensInDirectionOfTravel: false,
    frameGapsAcceptable: false,
    maxGapSize: '',
    hingesSecure: false,
    hingesCEMarked: null as boolean | null,
    hingesGoodCondition: null as boolean | null,
    screwsInPlaceAndSecure: null as boolean | null,
    hingeCount: '',
    minimumHingesPresent: false,
    intumescentStripsIntact: false,
    doorSignageCorrect: null as boolean | null,
    doorSignageComments: '',
    smokeSealsIntact: false,
    letterboxClosesProperly: false,
    glazingIntact: null as boolean | null,
    airTransferGrilleIntact: false,
    accessDenied: false,
    accessDeniedReason: '',
    inspectorNotes: ''
  })

  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    fetchBuildings()

    // Check if there's a doorId query parameter (from QR code scan)
    const urlParams = new URLSearchParams(window.location.search)
    const doorId = urlParams.get('doorId')

    if (doorId) {
      loadDoorFromQR(doorId)
    }
  }, [])

  useEffect(() => {
    if (selectedBuilding) {
      fetchDoors(selectedBuilding)
    }
  }, [selectedBuilding])

  const loadDoorFromQR = async (doorId: string) => {
    setIsLoadingFromQR(true)
    try {
      const res = await fetch(`/api/doors/${doorId}`)
      if (res.ok) {
        const door = await res.json()
        setSelectedBuilding(door.buildingId)
        // Wait for doors to be fetched, then select the door
        setTimeout(() => {
          setSelectedDoor(door)
        }, 500)
      }
    } catch (error) {
      console.error('Failed to load door from QR code:', error)
    } finally {
      setIsLoadingFromQR(false)
    }
  }

  const fetchBuildings = async () => {
    const res = await fetch('/api/buildings')
    const data = await res.json()
    setBuildings(data)
  }

  const fetchDoors = async (buildingId: string) => {
    const res = await fetch(`/api/doors?buildingId=${buildingId}`)
    const data = await res.json()
    setDoors(data)
  }

  const handleDoorSelect = (doorId: string) => {
    const door = doors.find(d => d.id === doorId)
    setSelectedDoor(door || null)
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const newPhotos = [...photos, ...newFiles]
    setPhotos(newPhotos)

    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))
    setPhotoPreviewUrls([...photoPreviewUrls, ...newPreviewUrls])
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newPreviewUrls = photoPreviewUrls.filter((_, i) => i !== index)

    // Revoke the URL to free memory
    URL.revokeObjectURL(photoPreviewUrls[index])

    setPhotos(newPhotos)
    setPhotoPreviewUrls(newPreviewUrls)
  }

  const calculateResult = () => {
    if (formData.accessDenied) return 'PASS'

    const criticalFails = [
      formData.certificationProvided === false,
      formData.visualInspectionOk === false,
      formData.doorLeafFrameSameRating === false,
      formData.excessiveGapsOrDamage === true,
      formData.doorClosesCompletelyOk === false,
      formData.doorClosesFromAnyAngleOk === false,
      formData.doorOpensInDirectionOfTravelOk === false,
      formData.frameGapsAcceptableOk === true,
      !formData.hingesSecure,
      formData.hingesCEMarked === false,
      formData.hingesGoodCondition === false,
      formData.screwsInPlaceAndSecure === false,
      !formData.minimumHingesPresent
    ]

    if (selectedDoor?.hasIntumescentStrips && !formData.intumescentStripsIntact) {
      criticalFails.push(true)
    }

    if (criticalFails.some(fail => fail)) {
      return 'FAIL'
    }

    const minorIssues = [
      selectedDoor?.hasSmokeSeal && !formData.smokeSealsIntact,
      selectedDoor?.hasLetterbox && !formData.letterboxClosesProperly,
      formData.doorSignageCorrect === false
    ]

    if (minorIssues.some(issue => issue)) {
      return 'REQUIRES_ATTENTION'
    }

    return 'PASS'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoor) return

    setLoading(true)

    try {
      const result = calculateResult()
      const actionRequired = result === 'FAIL' || result === 'REQUIRES_ATTENTION'

      const actionDescription = []
      if (formData.certificationProvided === false) actionDescription.push('Certification not provided')
      if (formData.visualInspectionOk === false) actionDescription.push(`Visual inspection failed: ${formData.visualInspectionComments}`)
      if (formData.doorLeafFrameSameRating === false) actionDescription.push(`Door leaf/frame rating issue: ${formData.doorLeafFrameRatingComments}`)
      if (formData.excessiveGapsOrDamage === true) actionDescription.push(`Excessive gaps or damage: ${formData.excessiveGapsOrDamageComments}`)
      if (formData.doorClosesCompletelyOk === false) actionDescription.push(`Door does not close completely: ${formData.doorClosesCompletelyComments}`)
      if (formData.doorClosesFromAnyAngleOk === false) actionDescription.push(`Self-closing device issue: ${formData.doorClosesFromAnyAngleComments}`)
      if (formData.doorOpensInDirectionOfTravelOk === false) actionDescription.push(`Door does not open in direction of travel: ${formData.doorOpensInDirectionOfTravelComments}`)
      if (formData.frameGapsAcceptableOk === true) actionDescription.push(`Frame gaps exceed 4mm: ${formData.frameGapsAcceptableComments}`)
      if (!formData.hingesSecure) actionDescription.push('Hinges are not secure')
      if (formData.hingesCEMarked === false) actionDescription.push('Hinges not CE marked')
      if (formData.hingesGoodCondition === false) actionDescription.push('Hinges have rust or oil leaks')
      if (formData.screwsInPlaceAndSecure === false) actionDescription.push('Screws not in place or not secure')
      if (!formData.minimumHingesPresent) actionDescription.push('Insufficient number of hinges')
      if (selectedDoor.hasIntumescentStrips && !formData.intumescentStripsIntact) {
        actionDescription.push('Intumescent strips damaged')
      }
      if (formData.doorSignageCorrect === false) {
        actionDescription.push(`Door signage missing or incorrect: ${formData.doorSignageComments}`)
      }

      // Calculate next inspection date
      const calculateNextInspectionDate = () => {
        const today = new Date()
        let monthsToAdd = 12 // Default to 12 months

        // Flat entrance doors: 12 months
        if (selectedDoor.doorType === 'FLAT_ENTRANCE') {
          monthsToAdd = 12
        }
        // Default: 12 months for all other doors
        else {
          monthsToAdd = 12
        }

        const nextDate = new Date(today)
        nextDate.setMonth(nextDate.getMonth() + monthsToAdd)
        return nextDate
      }

      const inspection = {
        fireDoorId: selectedDoor.id,
        inspectionType,
        status: actionRequired ? 'REQUIRES_ACTION' : 'COMPLETED',
        overallResult: result,
        nextInspectionDate: calculateNextInspectionDate(),
        doorConstruction: formData.doorConstruction,
        certificationProvided: formData.certificationProvided,
        damageOrDefects: formData.damageOrDefects,
        damageDescription: formData.damageDescription,
        // Map the "Ok" fields to the actual database field names
        doorLeafFrameOk: formData.doorLeafFrameSameRating === true,
        doorClosesCompletely: formData.doorClosesCompletelyOk === true,
        doorClosesFromAnyAngle: formData.doorClosesFromAnyAngleOk === true,
        doorOpensInDirectionOfTravel: formData.doorOpensInDirectionOfTravelOk === true,
        frameGapsAcceptable: formData.frameGapsAcceptableOk === false, // Note: inverted - true means gaps exceed 4mm
        maxGapSize: formData.maxGapSize ? parseFloat(formData.maxGapSize) : null,
        hingesSecure: formData.hingesSecure,
        hingesCEMarked: formData.hingesCEMarked,
        hingesGoodCondition: formData.hingesGoodCondition,
        screwsInPlaceAndSecure: formData.screwsInPlaceAndSecure,
        hingeCount: formData.hingeCount ? parseInt(formData.hingeCount) : null,
        minimumHingesPresent: formData.minimumHingesPresent,
        intumescentStripsIntact: selectedDoor.hasIntumescentStrips ? formData.intumescentStripsIntact : null,
        doorSignageCorrect: formData.doorSignageCorrect,
        doorSignageComments: formData.doorSignageComments,
        smokeSealsIntact: selectedDoor.hasSmokeSeal ? formData.smokeSealsIntact : null,
        letterboxClosesProperly: selectedDoor.hasLetterbox ? formData.letterboxClosesProperly : null,
        glazingIntact: formData.glazingIntact,
        airTransferGrilleIntact: formData.airTransferGrilleIntact,
        accessDenied: formData.accessDenied,
        accessDeniedReason: formData.accessDeniedReason,
        inspectorNotes: formData.inspectorNotes,
        actionRequired,
        actionDescription: actionDescription.join('; '),
        priority: result === 'FAIL' ? 'HIGH' : result === 'REQUIRES_ATTENTION' ? 'MEDIUM' : null,
        completedAt: !actionRequired ? new Date() : null
      }

      const createRes = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspection)
      })

      const created = await createRes.json()

      await fetch('/api/inspections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: created.id, ...inspection })
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to create inspection', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Fire Door Inspection</CardTitle>
            <CardDescription>
              Complete inspection in accordance with Fire Safety (England) Regulations 2022
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <InfoBanner variant="info">
                <strong>Compliant:</strong> All requirements met. <strong>Requires Attention:</strong> Minor defects (smoke seals, letterbox, glazing). <strong>Non-Compliant:</strong> Critical failure - door cannot perform its fire resistance function. Immediate action required.
              </InfoBanner>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Building</Label>
                  <Select value={selectedBuilding} onValueChange={setSelectedBuilding} required>
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label>Fire Door</Label>
                  <Select
                    value={selectedDoor?.id || ''}
                    onValueChange={handleDoorSelect}
                    disabled={!selectedBuilding}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select door" />
                    </SelectTrigger>
                    <SelectContent>
                      {doors.map(door => (
                        <SelectItem key={door.id} value={door.id}>
                          {door.doorNumber} - {door.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedDoor && (
                <>
                  <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <Badge>{selectedDoor.doorType.replace(/_/g, ' ')}</Badge>
                      <Badge variant="outline">{selectedDoor.fireRating}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">Location: {selectedDoor.location}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Inspection Type</Label>
                    <Select value={inspectionType} onValueChange={(v: any) => setInspectionType(v)} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="THREE_MONTH">3-Month Inspection</SelectItem>
                        <SelectItem value="TWELVE_MONTH">12-Month Inspection</SelectItem>
                        <SelectItem value="AD_HOC">Ad-hoc Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg">Access</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accessDenied"
                        checked={formData.accessDenied}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, accessDenied: checked as boolean })
                        }
                      />
                      <Label htmlFor="accessDenied" className="font-normal">
                        Access denied / Unable to inspect
                      </Label>
                    </div>
                    {formData.accessDenied && (
                      <Textarea
                        placeholder="Reason for access denial..."
                        value={formData.accessDeniedReason}
                        onChange={(e) => setFormData({ ...formData, accessDeniedReason: e.target.value })}
                      />
                    )}
                  </div>

                  {!formData.accessDenied && (
                    <>
                      <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-lg">Door Construction</h3>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="constructionSteel"
                              checked={formData.doorConstruction === 'STEEL'}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, doorConstruction: checked ? 'STEEL' : '' })
                              }
                            />
                            <Label htmlFor="constructionSteel" className="font-normal">
                              Steel
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="constructionWood"
                              checked={formData.doorConstruction === 'WOOD'}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, doorConstruction: checked ? 'WOOD' : '' })
                              }
                            />
                            <Label htmlFor="constructionWood" className="font-normal">
                              Wood
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="constructionGlass"
                              checked={formData.doorConstruction === 'GLASS'}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, doorConstruction: checked ? 'GLASS' : '' })
                              }
                            />
                            <Label htmlFor="constructionGlass" className="font-normal">
                              Glass
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">Certification</h3>
                          <HelpTooltip content="Certification proves door meets manufacture standards (BWF-CERTIFIRE, BM TRADA, etc.). Missing certification is a critical fail." />
                        </div>
                        <div className="space-y-2">
                          <Label>Has appropriate certification been provided for this door?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="certificationYes"
                                checked={formData.certificationProvided === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, certificationProvided: checked ? true : null })
                                }
                              />
                              <Label htmlFor="certificationYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="certificationNo"
                                checked={formData.certificationProvided === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, certificationProvided: checked ? false : null })
                                }
                              />
                              <Label htmlFor="certificationNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!formData.accessDenied && (
                    <>
                      <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">Visual Inspection</h3>
                          <HelpTooltip content="Check for obvious damage, warping, holes, or modifications. Any visible damage that affects fire resistance is a fail." />
                        </div>

                        <div className="space-y-2">
                          <Label>Visual inspection passed?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="visualInspectionYes"
                                checked={formData.visualInspectionOk === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, visualInspectionOk: checked ? true : null })
                                }
                              />
                              <Label htmlFor="visualInspectionYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="visualInspectionNo"
                                checked={formData.visualInspectionOk === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, visualInspectionOk: checked ? false : null })
                                }
                              />
                              <Label htmlFor="visualInspectionNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        {formData.visualInspectionOk === false && (
                          <Textarea
                            placeholder="Record findings..."
                            value={formData.visualInspectionComments}
                            onChange={(e) => setFormData({ ...formData, visualInspectionComments: e.target.value })}
                            required
                          />
                        )}
                      </div>

                      <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">Door Leaf / Frame</h3>
                          <HelpTooltip content="Door leaf and frame must have the same fire rating. Mismatched ratings compromise fire resistance and are a critical fail." />
                        </div>

                        <div className="space-y-2">
                          <Label>Same rating as fire door?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="doorLeafFrameSameRatingYes"
                                checked={formData.doorLeafFrameSameRating === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, doorLeafFrameSameRating: checked ? true : null })
                                }
                              />
                              <Label htmlFor="doorLeafFrameSameRatingYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="doorLeafFrameSameRatingNo"
                                checked={formData.doorLeafFrameSameRating === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, doorLeafFrameSameRating: checked ? false : null })
                                }
                              />
                              <Label htmlFor="doorLeafFrameSameRatingNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        {formData.doorLeafFrameSameRating === false && (
                          <Textarea
                            placeholder="Record findings..."
                            value={formData.doorLeafFrameRatingComments}
                            onChange={(e) => setFormData({ ...formData, doorLeafFrameRatingComments: e.target.value })}
                            required
                          />
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            <Label>Excessive gaps or damage?</Label>
                            <HelpTooltip content="Gaps over 4mm between door and frame allow smoke/fire spread. Critical fail." />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="excessiveGapsOrDamageYes"
                                checked={formData.excessiveGapsOrDamage === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, excessiveGapsOrDamage: checked ? true : null })
                                }
                              />
                              <Label htmlFor="excessiveGapsOrDamageYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="excessiveGapsOrDamageNo"
                                checked={formData.excessiveGapsOrDamage === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, excessiveGapsOrDamage: checked ? false : null })
                                }
                              />
                              <Label htmlFor="excessiveGapsOrDamageNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        {formData.excessiveGapsOrDamage === true && (
                          <Textarea
                            placeholder="Record findings..."
                            value={formData.excessiveGapsOrDamageComments}
                            onChange={(e) => setFormData({ ...formData, excessiveGapsOrDamageComments: e.target.value })}
                            required
                          />
                        )}
                      </div>

                      <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">Door Operation & Gaps</h3>
                          <HelpTooltip content="Door must close fully and latch properly. Self-closing device must work from any angle. Essential for fire containment." />
                        </div>

                        <div className="space-y-2">
                          <Label>Door closes completely into frame?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="doorClosesCompletelyYes"
                                checked={formData.doorClosesCompletelyOk === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, doorClosesCompletelyOk: checked ? true : null })
                                }
                              />
                              <Label htmlFor="doorClosesCompletelyYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="doorClosesCompletelyNo"
                                checked={formData.doorClosesCompletelyOk === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, doorClosesCompletelyOk: checked ? false : null })
                                }
                              />
                              <Label htmlFor="doorClosesCompletelyNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        {formData.doorClosesCompletelyOk === false && (
                          <Textarea
                            placeholder="Record findings..."
                            value={formData.doorClosesCompletelyComments}
                            onChange={(e) => setFormData({ ...formData, doorClosesCompletelyComments: e.target.value })}
                            required
                          />
                        )}

                        <div className="space-y-2">
                          <Label>Self-closing device works from any angle?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="doorClosesFromAnyAngleYes"
                                checked={formData.doorClosesFromAnyAngleOk === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, doorClosesFromAnyAngleOk: checked ? true : null })
                                }
                              />
                              <Label htmlFor="doorClosesFromAnyAngleYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="doorClosesFromAnyAngleNo"
                                checked={formData.doorClosesFromAnyAngleOk === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, doorClosesFromAnyAngleOk: checked ? false : null })
                                }
                              />
                              <Label htmlFor="doorClosesFromAnyAngleNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        {formData.doorClosesFromAnyAngleOk === false && (
                          <Textarea
                            placeholder="Record findings..."
                            value={formData.doorClosesFromAnyAngleComments}
                            onChange={(e) => setFormData({ ...formData, doorClosesFromAnyAngleComments: e.target.value })}
                            required
                          />
                        )}

                        <div className="space-y-2">
                          <Label>Door opens in the direction of travel?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="doorOpensInDirectionOfTravelYes"
                                checked={formData.doorOpensInDirectionOfTravelOk === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, doorOpensInDirectionOfTravelOk: checked ? true : null })
                                }
                              />
                              <Label htmlFor="doorOpensInDirectionOfTravelYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="doorOpensInDirectionOfTravelNo"
                                checked={formData.doorOpensInDirectionOfTravelOk === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, doorOpensInDirectionOfTravelOk: checked ? false : null })
                                }
                              />
                              <Label htmlFor="doorOpensInDirectionOfTravelNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        {formData.doorOpensInDirectionOfTravelOk === false && (
                          <Textarea
                            placeholder="Record findings..."
                            value={formData.doorOpensInDirectionOfTravelComments}
                            onChange={(e) => setFormData({ ...formData, doorOpensInDirectionOfTravelComments: e.target.value })}
                            required
                          />
                        )}

                        <div className="space-y-2">
                          <Label>Gaps exceed 4mm (except door bottom)?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="frameGapsAcceptableYes"
                                checked={formData.frameGapsAcceptableOk === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, frameGapsAcceptableOk: checked ? true : null })
                                }
                              />
                              <Label htmlFor="frameGapsAcceptableYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="frameGapsAcceptableNo"
                                checked={formData.frameGapsAcceptableOk === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, frameGapsAcceptableOk: checked ? false : null })
                                }
                              />
                              <Label htmlFor="frameGapsAcceptableNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        {formData.frameGapsAcceptableOk === true && (
                          <Textarea
                            placeholder="Record findings..."
                            value={formData.frameGapsAcceptableComments}
                            onChange={(e) => setFormData({ ...formData, frameGapsAcceptableComments: e.target.value })}
                            required
                          />
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="maxGapSize">Maximum gap size (mm)</Label>
                          <Input
                            id="maxGapSize"
                            type="number"
                            step="0.1"
                            value={formData.maxGapSize}
                            onChange={(e) => setFormData({ ...formData, maxGapSize: e.target.value })}
                            placeholder="e.g. 3.5"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">Hinges & Hardware</h3>
                          <HelpTooltip content="Hinges must be CE marked for fire safety. Minimum 3 hinges required. Rust or loose screws compromise door operation and are critical fails." />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hingesSecure"
                            checked={formData.hingesSecure}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, hingesSecure: checked as boolean })
                            }
                          />
                          <Label htmlFor="hingesSecure" className="font-normal">
                            All hinges secure and in good condition
                          </Label>
                        </div>

                        <div className="space-y-2">
                          <Label>Are the hinges CE marked?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="hingesCEMarkedYes"
                                checked={formData.hingesCEMarked === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, hingesCEMarked: checked ? true : null })
                                }
                              />
                              <Label htmlFor="hingesCEMarkedYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="hingesCEMarkedNo"
                                checked={formData.hingesCEMarked === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, hingesCEMarked: checked ? false : null })
                                }
                              />
                              <Label htmlFor="hingesCEMarkedNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Are the hinges in good condition with no rust or oil leaks?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="hingesGoodConditionYes"
                                checked={formData.hingesGoodCondition === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, hingesGoodCondition: checked ? true : null })
                                }
                              />
                              <Label htmlFor="hingesGoodConditionYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="hingesGoodConditionNo"
                                checked={formData.hingesGoodCondition === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, hingesGoodCondition: checked ? false : null })
                                }
                              />
                              <Label htmlFor="hingesGoodConditionNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Are all the screws in place and secure?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="screwsSecureYes"
                                checked={formData.screwsInPlaceAndSecure === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, screwsInPlaceAndSecure: checked ? true : null })
                                }
                              />
                              <Label htmlFor="screwsSecureYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="screwsSecureNo"
                                checked={formData.screwsInPlaceAndSecure === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, screwsInPlaceAndSecure: checked ? false : null })
                                }
                              />
                              <Label htmlFor="screwsSecureNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        {formData.doorConstruction && (
                          <div className="space-y-2">
                            <Label>
                              {formData.doorConstruction === 'STEEL'
                                ? 'Are there a minimum of 4 hinges per door present?'
                                : 'Are there a minimum of 3 hinges per door present?'}
                            </Label>
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="minimumHingesYes"
                                  checked={formData.minimumHingesPresent === true}
                                  onCheckedChange={(checked) =>
                                    setFormData({ ...formData, minimumHingesPresent: checked ? true : false })
                                  }
                                />
                                <Label htmlFor="minimumHingesYes" className="font-normal">
                                  Yes
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="minimumHingesNo"
                                  checked={formData.minimumHingesPresent === false}
                                  onCheckedChange={(checked) =>
                                    setFormData({ ...formData, minimumHingesPresent: checked ? false : true })
                                  }
                                />
                                <Label htmlFor="minimumHingesNo" className="font-normal">
                                  No
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="hingeCount">Number of hinges</Label>
                          <Input
                            id="hingeCount"
                            type="number"
                            value={formData.hingeCount}
                            onChange={(e) => setFormData({ ...formData, hingeCount: e.target.value })}
                            placeholder="e.g. 3"
                          />
                        </div>
                      </div>

                      {selectedDoor.hasIntumescentStrips && (
                        <div className="space-y-4 border-t pt-4">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">Intumescent Strips</h3>
                            <HelpTooltip content="Intumescent strips expand when heated to seal gaps between door and frame. Damaged or missing strips are a critical fail." />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="intumescentStripsIntact"
                              checked={formData.intumescentStripsIntact}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, intumescentStripsIntact: checked as boolean })
                              }
                            />
                            <Label htmlFor="intumescentStripsIntact" className="font-normal">
                              Intumescent strips intact and in good condition
                            </Label>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-lg">Door Signage</h3>
                        <div className="space-y-2">
                          <Label>Is correct signage in place on both sides of the door?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="doorSignageCorrectYes"
                                checked={formData.doorSignageCorrect === true}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, doorSignageCorrect: checked ? true : null })
                                }
                              />
                              <Label htmlFor="doorSignageCorrectYes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="doorSignageCorrectNo"
                                checked={formData.doorSignageCorrect === false}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, doorSignageCorrect: checked ? false : null })
                                }
                              />
                              <Label htmlFor="doorSignageCorrectNo" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        {formData.doorSignageCorrect === false && (
                          <Textarea
                            placeholder="Record findings..."
                            value={formData.doorSignageComments}
                            onChange={(e) => setFormData({ ...formData, doorSignageComments: e.target.value })}
                            required
                          />
                        )}
                      </div>

                      {selectedDoor.hasSmokeSeal && (
                        <div className="space-y-4 border-t pt-4">
                          <h3 className="font-semibold text-lg">Smoke Seals</h3>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="smokeSealsIntact"
                              checked={formData.smokeSealsIntact}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, smokeSealsIntact: checked as boolean })
                              }
                            />
                            <Label htmlFor="smokeSealsIntact" className="font-normal">
                              Smoke seals intact and in good condition
                            </Label>
                          </div>
                        </div>
                      )}

                      {selectedDoor.hasLetterbox && (
                        <div className="space-y-4 border-t pt-4">
                          <h3 className="font-semibold text-lg">Letterbox</h3>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="letterboxClosesProperly"
                              checked={formData.letterboxClosesProperly}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, letterboxClosesProperly: checked as boolean })
                              }
                            />
                            <Label htmlFor="letterboxClosesProperly" className="font-normal">
                              Letterbox closes properly
                            </Label>
                          </div>
                        </div>
                      )}

                      {true && (
                        <div className="space-y-4 border-t pt-4">
                          <h3 className="font-semibold text-lg">Glazing</h3>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="glazingIntact"
                              checked={formData.glazingIntact ?? undefined}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, glazingIntact: checked as boolean })
                              }
                            />
                            <Label htmlFor="glazingIntact" className="font-normal">
                              Glazing intact and in good condition
                            </Label>
                          </div>
                        </div>
                      )}

                      {true && (
                        <div className="space-y-4 border-t pt-4">
                          <h3 className="font-semibold text-lg">Air Transfer Grille</h3>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="airTransferGrilleIntact"
                              checked={formData.airTransferGrilleIntact}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, airTransferGrilleIntact: checked as boolean })
                              }
                            />
                            <Label htmlFor="airTransferGrilleIntact" className="font-normal">
                              Air transfer grille intact
                            </Label>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-lg">Additional Notes</h3>
                        <Textarea
                          placeholder="Any additional observations or notes..."
                          value={formData.inspectorNotes}
                          onChange={(e) => setFormData({ ...formData, inspectorNotes: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </>
                  )}

                  {!formData.accessDenied && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-lg">Photo Documentation</h3>
                      <p className="text-sm text-slate-600">
                        Capture photos of the door and any issues found during inspection
                      </p>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Label htmlFor="photo-input" className="sr-only">
                            Inspection photos
                          </Label>
                          <input
                            type="file"
                            id="photo-input"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoCapture}
                            className="hidden"
                            aria-label="Inspection photos"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('photo-input')?.click()}
                            className="w-full"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Capture/Upload Photos
                          </Button>
                        </div>

                        {photoPreviewUrls.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {photoPreviewUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Inspection photo ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => removePhoto(index)}
                                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  aria-label={`Remove photo ${index + 1}`}
                                  title={`Remove photo ${index + 1}`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                  Photo {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {photos.length > 0 && (
                          <p className="text-sm text-slate-600">
                            {photos.length} photo{photos.length !== 1 ? 's' : ''} ready to upload
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Complete Inspection'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
