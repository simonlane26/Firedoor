'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Clock, FileText, History } from 'lucide-react'
import { EvidenceUpload } from '@/components/evidence-upload'
import { EvidenceList } from '@/components/evidence-list'
import { format, differenceInDays } from 'date-fns'

interface DoorDetailTabsProps {
  door: any
  latestInspection: any
  inspectionHistory: any[]
}

export function DoorDetailTabs({ door, latestInspection, inspectionHistory }: DoorDetailTabsProps) {
  const [evidenceRefresh, setEvidenceRefresh] = useState(0)

  const getStatusBadge = (result: string) => {
    if (result === 'PASS') {
      return <Badge className="bg-green-600">Pass</Badge>
    }
    if (result === 'FAIL') {
      return <Badge className="bg-red-600">Fail</Badge>
    }
    return <Badge className="bg-amber-600">Requires Action</Badge>
  }

  const installDate = door.installationDate ? new Date(door.installationDate) : null
  const firstInspection = inspectionHistory.length > 0 ? new Date(inspectionHistory[inspectionHistory.length - 1].inspectionDate) : null
  const doorAge = installDate ? differenceInDays(new Date(), installDate) : null
  const totalInspections = inspectionHistory.length
  const passedInspections = inspectionHistory.filter((i: any) => i.overallResult === 'PASS').length
  const failedInspections = inspectionHistory.filter((i: any) => i.overallResult === 'FAIL').length

  return (
    <Tabs defaultValue="latest" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="latest">
          <FileText className="h-4 w-4 mr-2" />
          Latest Inspection
        </TabsTrigger>
        <TabsTrigger value="lifecycle">
          <Clock className="h-4 w-4 mr-2" />
          Lifecycle
        </TabsTrigger>
        <TabsTrigger value="evidence">
          <FileText className="h-4 w-4 mr-2" />
          Evidence
        </TabsTrigger>
      </TabsList>

      {/* Latest Inspection Tab */}
      <TabsContent value="latest">
        <Card>
          <CardHeader>
            <CardTitle>Latest Inspection Status</CardTitle>
            <CardDescription>
              {latestInspection
                ? `Last inspected on ${format(new Date(latestInspection.inspectionDate), 'PPP')}`
                : 'No inspections recorded yet'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latestInspection ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-semibold mb-1">Overall Result</div>
                    <div className="text-sm text-slate-500">
                      Inspected by {latestInspection.inspector.name}
                    </div>
                  </div>
                  <div>
                    {latestInspection.overallResult && getStatusBadge(latestInspection.overallResult)}
                  </div>
                </div>

                {latestInspection.nextInspectionDate && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold mb-1">Next Inspection Due</div>
                      <div className="text-sm text-slate-500">
                        Based on {door.doorType.includes('FLAT') ? '12-month' : '3-month'} cycle
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      new Date(latestInspection.nextInspectionDate) < new Date()
                        ? 'text-red-600'
                        : 'text-slate-900'
                    }`}>
                      {format(new Date(latestInspection.nextInspectionDate), 'PP')}
                    </div>
                  </div>
                )}

                {latestInspection.inspectorNotes && (
                  <div className="p-4 border rounded-lg">
                    <div className="font-semibold mb-2">Notes</div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                      {latestInspection.inspectorNotes}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Link href={`/inspections/${latestInspection.id}`}>
                    <Button variant="outline" className="w-full">
                      View Full Inspection Report →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-slate-500 mb-4">No inspections recorded yet</p>
                <Link href={`/inspections/new?doorId=${door.id}`}>
                  <Button className="bg-red-600 hover:bg-red-700">
                    Perform First Inspection
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Lifecycle Tab */}
      <TabsContent value="lifecycle">
        <div className="space-y-6">
          {/* Lifecycle Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lifecycle Summary
              </CardTitle>
              <CardDescription>
                Complete lifecycle tracking from installation to current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800 mb-1">Installation Date</div>
                  <div className="text-lg font-semibold text-blue-900">
                    {installDate ? format(installDate, 'PP') : 'Not recorded'}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-800 mb-1">Door Age</div>
                  <div className="text-lg font-semibold text-green-900">
                    {doorAge ? `${Math.floor(doorAge / 365)} years` : 'Unknown'}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-800 mb-1">First Inspection</div>
                  <div className="text-lg font-semibold text-purple-900">
                    {firstInspection ? format(firstInspection, 'PP') : 'N/A'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-800 mb-1">Total Inspections</div>
                  <div className="text-lg font-semibold text-slate-900">{totalInspections}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance History */}
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>Inspection results over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{passedInspections}</div>
                  <div className="text-sm text-green-800 mt-1">Passed</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{failedInspections}</div>
                  <div className="text-sm text-red-800 mt-1">Failed</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-3xl font-bold text-amber-600">
                    {totalInspections - passedInspections - failedInspections}
                  </div>
                  <div className="text-sm text-amber-800 mt-1">Requires Attention</div>
                </div>
              </div>

              {totalInspections > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Pass Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {((passedInspections / totalInspections) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(passedInspections / totalInspections) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inspection History */}
          {inspectionHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Complete Inspection History ({inspectionHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inspectionHistory.map((inspection: any) => (
                    <Link key={inspection.id} href={`/inspections/${inspection.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">
                              {new Date(inspection.inspectionDate).getDate()}
                            </div>
                            <div className="text-xs text-slate-500">
                              {format(new Date(inspection.inspectionDate), 'MMM yyyy')}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">
                              Inspection #{inspection.id.slice(0, 8)}
                            </div>
                            <div className="text-sm text-slate-500">
                              Inspector: {inspection.inspector.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {inspection.overallResult && getStatusBadge(inspection.overallResult)}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      {/* Evidence Tab */}
      <TabsContent value="evidence">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <EvidenceUpload
              entityType="DOOR"
              entityId={door.id}
              onUploadComplete={() => setEvidenceRefresh(prev => prev + 1)}
            />
          </div>
          <div className="lg:col-span-2">
            <EvidenceList
              entityType="DOOR"
              entityId={door.id}
              refreshTrigger={evidenceRefresh}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
