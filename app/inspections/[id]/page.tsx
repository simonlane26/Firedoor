import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getInspectionDetails(inspectionId: string, userId: string) {
  const inspection = await prisma.inspection.findFirst({
    where: {
      id: inspectionId,
      fireDoor: {
        building: { managerId: userId }
      }
    },
    include: {
      fireDoor: {
        include: {
          building: true
        }
      },
      inspector: {
        select: {
          name: true,
          email: true,
          role: true
        }
      }
    }
  })

  if (!inspection) {
    return null
  }

  return inspection
}

export default async function InspectionDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const inspection = await getInspectionDetails(id, session.user.id)

  if (!inspection) {
    notFound()
  }

  const getStatusBadge = (result: string) => {
    if (result === 'PASS') {
      return <Badge className="bg-green-600 text-lg px-4 py-1">Pass</Badge>
    }
    if (result === 'FAIL') {
      return <Badge className="bg-red-600 text-lg px-4 py-1">Fail</Badge>
    }
    if (result === 'PENDING') {
      return <Badge className="bg-blue-600 text-lg px-4 py-1">Pending</Badge>
    }
    return <Badge className="bg-amber-600 text-lg px-4 py-1">Requires Action</Badge>
  }

  const CheckItem = ({ label, value }: { label: string; value: boolean | null }) => {
    if (value === null) return null
    return (
      <div className="flex items-center justify-between py-2 border-b">
        <span className="text-sm text-slate-700">{label}</span>
        {value ? (
          <Badge className="bg-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Pass
          </Badge>
        ) : (
          <Badge className="bg-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Fail
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/inspections">
              <Button variant="ghost" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Inspections
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session.user.name}</span>
            <Badge variant="outline">{session.user.role}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Inspection Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Inspection Report</h1>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(inspection.inspectionDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {inspection.inspector.name}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/api/reports/pdf/inspection/${inspection.id}`} target="_blank">
                <Button variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Overall Result Card */}
        <Card className={`mb-6 ${
          inspection.overallResult === 'PASS' ? 'border-green-200 bg-green-50' :
          inspection.overallResult === 'FAIL' ? 'border-red-200 bg-red-50' :
          inspection.status === 'PENDING' ? 'border-blue-200 bg-blue-50' :
          'border-amber-200 bg-amber-50'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium mb-1">Overall Result</div>
                <div className="text-2xl font-bold">
                  {inspection.overallResult === 'PASS' && 'Inspection Passed'}
                  {inspection.overallResult === 'FAIL' && 'Inspection Failed'}
                  {inspection.overallResult === 'REQUIRES_ATTENTION' && 'Requires Attention'}
                  {inspection.status === 'PENDING' && 'Inspection Pending'}
                  {!inspection.overallResult && inspection.status !== 'PENDING' && 'In Progress'}
                </div>
              </div>
              {inspection.overallResult ? getStatusBadge(inspection.overallResult) : <Badge className="bg-blue-600 text-lg px-4 py-1">{inspection.status}</Badge>}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Door & Building Details */}
          <Card>
            <CardHeader>
              <CardTitle>Fire Door Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">Door Number</div>
                <div className="font-semibold">{inspection.fireDoor.doorNumber}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Location</div>
                <div className="font-semibold">{inspection.fireDoor.location}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Fire Rating</div>
                <div className="font-semibold">{inspection.fireDoor.fireRating}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Door Type</div>
                <div className="font-semibold">{inspection.fireDoor.doorType.replace(/_/g, ' ')}</div>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-slate-500 mb-2">Building</div>
                <Link href={`/buildings/${inspection.fireDoor.building.id}`}>
                  <Button variant="outline" className="w-full">
                    {inspection.fireDoor.building.name} →
                  </Button>
                </Link>
              </div>
              <div>
                <Link href={`/doors/${inspection.fireDoor.id}`}>
                  <Button variant="outline" className="w-full">
                    View Door Details →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Inspection Checklist */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Inspection Checklist</CardTitle>
              <CardDescription>Detailed inspection findings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Door Construction & Certification */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Door Construction & Certification</h3>
                <div className="space-y-1">
                  <CheckItem label="Door construction type specified" value={inspection.doorConstruction !== null} />
                  <CheckItem label="Certification provided" value={inspection.certificationProvided} />
                </div>
              </div>

              {/* Damage Assessment */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Damage Assessment</h3>
                <div className="space-y-1">
                  <CheckItem label="No damage or defects present" value={!inspection.damageOrDefects} />
                  <CheckItem label="Door leaf and frame OK" value={inspection.doorLeafFrameOk} />
                </div>
              </div>

              {/* Door Operation */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Door Operation</h3>
                <div className="space-y-1">
                  <CheckItem label="Door closes completely" value={inspection.doorClosesCompletely} />
                  <CheckItem label="Door closes from any angle" value={inspection.doorClosesFromAnyAngle} />
                </div>
              </div>

              {/* Frame & Gaps */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Frame & Gaps</h3>
                <div className="space-y-1">
                  <CheckItem label="Frame gaps acceptable" value={inspection.frameGapsAcceptable} />
                  {inspection.maxGapSize && (
                    <div className="text-sm text-slate-600 ml-6">Max gap size: {inspection.maxGapSize}mm</div>
                  )}
                </div>
              </div>

              {/* Hardware */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Hardware</h3>
                <div className="space-y-1">
                  <CheckItem label="Hinges secure" value={inspection.hingesSecure} />
                  <CheckItem label="Intumescent strips intact" value={inspection.intumescentStripsIntact} />
                  <CheckItem label="Smoke seals intact" value={inspection.smokeSealsIntact} />
                </div>
              </div>

              {/* Glazing & Openings */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Glazing & Openings</h3>
                <div className="space-y-1">
                  <CheckItem label="Glazing intact" value={inspection.glazingIntact} />
                  <CheckItem label="Letterbox closes properly" value={inspection.letterboxClosesProperly} />
                  <CheckItem label="Air transfer grille intact" value={inspection.airTransferGrilleIntact} />
                </div>
              </div>

              {/* Additional Notes */}
              {inspection.inspectorNotes && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-slate-900 mb-3">Inspector Notes</h3>
                  <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                    {inspection.inspectorNotes}
                  </div>
                </div>
              )}

              {/* Next Inspection */}
              {inspection.nextInspectionDate && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-semibold mb-1">Next Inspection Due</div>
                      <div className="text-sm text-slate-500">
                        Based on {inspection.fireDoor.doorType.includes('FLAT') ? '12-month' : '3-month'} inspection cycle
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      new Date(inspection.nextInspectionDate) < new Date()
                        ? 'text-red-600'
                        : 'text-slate-900'
                    }`}>
                      {new Date(inspection.nextInspectionDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
