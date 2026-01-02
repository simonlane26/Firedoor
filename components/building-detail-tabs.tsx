'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { FileDown, Shield, Building2, AlertCircle, TrendingUp, FileText } from 'lucide-react'
import { EvidenceUpload } from '@/components/evidence-upload'
import { EvidenceList } from '@/components/evidence-list'

interface BuildingDetailTabsProps {
  building: any
  totalDoors: number
  passedDoors: number
  failedDoors: number
  requiresActionDoors: number
  uninspectedDoors: number
  complianceRate: string
}

export function BuildingDetailTabs({
  building,
  totalDoors,
  passedDoors,
  failedDoors,
  requiresActionDoors,
  uninspectedDoors,
  complianceRate
}: BuildingDetailTabsProps) {
  const [downloading, setDownloading] = useState(false)
  const [evidenceRefresh, setEvidenceRefresh] = useState(0)

  const getStatusBadge = (door: any) => {
    if (door.inspections.length === 0) {
      return <Badge variant="outline" className="bg-slate-100">Not Inspected</Badge>
    }
    const result = door.inspections[0].overallResult
    if (result === 'PASS') {
      return <Badge className="bg-green-600">Pass</Badge>
    }
    if (result === 'FAIL') {
      return <Badge className="bg-red-600">Fail</Badge>
    }
    return <Badge className="bg-amber-600">Requires Action</Badge>
  }

  const handleDownloadSafetyPack = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/reports/safety-evidence-pack/${building.id}`)
      if (!response.ok) throw new Error('Failed to download')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `safety-evidence-pack-${building.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading safety pack:', error)
      alert('Failed to download safety evidence pack')
    } finally {
      setDownloading(false)
    }
  }

  const inspectionRegime =
    building.topStoreyHeight && building.topStoreyHeight > 11
      ? '3-monthly inspections for communal doors (Building >11m), Annual for flat entrance doors'
      : '12-monthly inspections for all fire doors'

  const criticalDoors = building.fireDoors.filter((door: any) =>
    door.inspections[0]?.overallResult === 'FAIL'
  )

  const attentionDoors = building.fireDoors.filter((door: any) =>
    door.inspections[0]?.overallResult === 'REQUIRES_ATTENTION'
  )

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="overview">
          <Building2 className="h-4 w-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="safety-case">
          <Shield className="h-4 w-4 mr-2" />
          Safety Case
        </TabsTrigger>
        <TabsTrigger value="evidence">
          <FileText className="h-4 w-4 mr-2" />
          Evidence
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Building Details */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Building Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {building.numberOfStoreys && (
                <div>
                  <div className="text-sm text-slate-500">Number of Storeys</div>
                  <div className="font-semibold">{building.numberOfStoreys}</div>
                </div>
              )}
              {building.topStoreyHeight && (
                <div>
                  <div className="text-sm text-slate-500">Top Storey Height</div>
                  <div className="font-semibold">{building.topStoreyHeight}m</div>
                  {building.topStoreyHeight > 11 && (
                    <Badge variant="destructive" className="mt-1 text-xs">High-Rise Building</Badge>
                  )}
                </div>
              )}
              {building.contactName && (
                <div>
                  <div className="text-sm text-slate-500">Responsible Person</div>
                  <div className="font-semibold">{building.contactName}</div>
                </div>
              )}
              {building.contactEmail && (
                <div>
                  <div className="text-sm text-slate-500">Contact Email</div>
                  <div className="font-semibold">{building.contactEmail}</div>
                </div>
              )}
              {building.contactPhone && (
                <div>
                  <div className="text-sm text-slate-500">Contact Phone</div>
                  <div className="font-semibold">{building.contactPhone}</div>
                </div>
              )}
              <div className="pt-4 space-y-2">
                <div className="text-sm font-semibold text-slate-700 mb-3">Standard Reports</div>
                <Link href={`/api/reports/pdf/building/${building.id}`}>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Building Summary Report
                  </Button>
                </Link>
                <Link href={`/api/reports/pdf/building/${building.id}/doors`}>
                  <Button variant="outline" className="w-full">
                    <FileDown className="h-4 w-4 mr-2" />
                    All Door Reports (ZIP)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Fire Doors List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Fire Doors ({totalDoors})</CardTitle>
              <CardDescription>All fire doors registered in this building</CardDescription>
            </CardHeader>
            <CardContent>
              {totalDoors === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">No fire doors registered yet</p>
                  <Link href={`/doors/new?buildingId=${building.id}`}>
                    <Button className="bg-red-600 hover:bg-red-700">
                      Add First Fire Door
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {building.fireDoors.map((door: any) => (
                    <Link key={door.id} href={`/doors/${door.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center text-red-700 font-bold">
                            {door.doorNumber}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{door.location}</div>
                            <div className="text-sm text-slate-500">
                              {door.fireRating} • {door.doorType.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(door)}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Safety Case Tab */}
      <TabsContent value="safety-case">
        <div className="space-y-6">
          {/* Generate Evidence Pack Button */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Shield className="h-6 w-6" />
                Building Safety Evidence Pack
              </CardTitle>
              <CardDescription className="text-red-800">
                Generate comprehensive regulatory compliance documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-900 mb-4">
                This evidence pack contains all required documentation for Fire Safety (England) Regulations 2022 compliance,
                including building overview, asset register, inspection performance, defect tracking, evidence media, audit trail,
                and statement of ongoing control.
              </p>
              <Button
                onClick={handleDownloadSafetyPack}
                disabled={downloading}
                className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
                size="lg"
              >
                <FileDown className="h-5 w-5 mr-2" />
                {downloading ? 'Generating Evidence Pack...' : 'Generate Safety Evidence Pack'}
              </Button>
            </CardContent>
          </Card>

          {/* Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Compliance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Compliance Rate</span>
                    <span className="text-2xl font-bold text-green-600">{complianceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${complianceRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-xs text-slate-500">Passed</div>
                    <div className="text-lg font-semibold text-green-600">{passedDoors}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Total Doors</div>
                    <div className="text-lg font-semibold">{totalDoors}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Risk Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical (Failed)</span>
                  <Badge variant="destructive">{failedDoors}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Requires Attention</span>
                  <Badge className="bg-amber-600">{requiresActionDoors}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Not Inspected</span>
                  <Badge variant="outline">{uninspectedDoors}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inspection Regime */}
          <Card>
            <CardHeader>
              <CardTitle>Inspection Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{inspectionRegime}</p>
              {building.topStoreyHeight && building.topStoreyHeight > 11 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">
                    <strong>High-Rise Building:</strong> This building requires enhanced inspection frequency
                    for communal fire doors (every 3 months) due to exceeding 11 meters in height.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Critical Issues */}
          {criticalDoors.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-900">Critical Issues Requiring Immediate Action</CardTitle>
                <CardDescription>Doors that have failed inspection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalDoors.map((door: any) => (
                    <Link key={door.id} href={`/doors/${door.id}`}>
                      <div className="p-3 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-red-900">
                              Door {door.doorNumber} - {door.location}
                            </div>
                            {door.inspections[0]?.actionDescription && (
                              <div className="text-sm text-red-700 mt-1">
                                Issue: {door.inspections[0].actionDescription}
                              </div>
                            )}
                          </div>
                          <Badge variant="destructive">FAIL</Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doors Requiring Attention */}
          {attentionDoors.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">Doors Requiring Attention</CardTitle>
                <CardDescription>Minor issues identified during inspection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attentionDoors.map((door: any) => (
                    <Link key={door.id} href={`/doors/${door.id}`}>
                      <div className="p-3 border border-amber-200 rounded-lg hover:bg-amber-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-amber-900">
                              Door {door.doorNumber} - {door.location}
                            </div>
                            {door.inspections[0]?.actionDescription && (
                              <div className="text-sm text-amber-700 mt-1">
                                Issue: {door.inspections[0].actionDescription}
                              </div>
                            )}
                          </div>
                          <Badge className="bg-amber-600">ATTENTION</Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statement of Control */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Statement of Ongoing Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-900 leading-relaxed">
                This building maintains a structured fire door inspection regime aligned to Fire Safety (England) Regulations 2022.
                All fire doors are inspected according to the required schedule. All defects are logged within the system and tracked
                to closure. Each inspection is carried out by qualified personnel and documented with photographic evidence where applicable.
                The asset register is maintained and updated following each inspection cycle. Evidence of compliance, including inspection
                certificates, photographs, and manufacturer documentation, is stored securely and made available for regulatory review upon request.
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Evidence Tab */}
      <TabsContent value="evidence">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <EvidenceUpload
              entityType="BUILDING"
              entityId={building.id}
              onUploadComplete={() => setEvidenceRefresh(prev => prev + 1)}
            />
          </div>
          <div className="lg:col-span-2">
            <EvidenceList
              entityType="BUILDING"
              entityId={building.id}
              refreshTrigger={evidenceRefresh}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
