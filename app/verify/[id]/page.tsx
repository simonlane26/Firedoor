'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, AlertCircle, Building, MapPin, Clock, ClipboardCheck, History } from 'lucide-react'

interface DoorVerification {
  door: {
    id: string
    doorNumber: string
    location: string
    fireRating: string
    building: {
      name: string
      address: string
    }
  }
  latestInspection: {
    id: string
    inspectionDate: string
    status: string
    actionRequired: boolean
    actionDescription: string | null
    nextInspectionDate: string | null
  } | null
  inspectionHistory: Array<{
    id: string
    inspectionDate: string
    status: string
    actionRequired: boolean
  }>
  complianceStatus: {
    isCompliant: boolean
    requiresAction: boolean
    lastInspected?: string
    nextInspectionDue?: string | null
    message?: string
  }
}

export default function VerifyDoorPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [data, setData] = useState<DoorVerification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isInspector = status === 'authenticated' && session?.user

  useEffect(() => {
    async function fetchDoorData() {
      try {
        const response = await fetch(`/api/public/doors/${params.id}/verify`)

        if (!response.ok) {
          throw new Error('Door not found')
        }

        const doorData = await response.json()
        setData(doorData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load door information')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDoorData()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading door information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <CardTitle>Door Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {error || 'The requested fire door could not be found.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />
      case 'FAIL':
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PASS: 'default',
      FAIL: 'destructive',
    }
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Fire Door Verification</h1>
            <p className="text-gray-600">
              {isInspector ? 'Inspector View' : 'Public inspection record'}
            </p>
          </div>
          {isInspector && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/inspections/new?doorId=${data?.door.id}`)}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                New Inspection
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/doors/${data?.door.id}`)}
              >
                <History className="h-4 w-4 mr-2" />
                View Full History
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Door Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Door Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Door Number</p>
              <p className="text-lg font-semibold">{data.door.doorNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fire Rating</p>
              <p className="text-lg font-semibold">{data.door.fireRating}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-lg">{data.door.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Building</p>
              <p className="text-lg">{data.door.building.name}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Building Address
            </p>
            <p className="text-base">{data.door.building.address}</p>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data.complianceStatus.isCompliant ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.latestInspection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {data.complianceStatus.isCompliant ? 'Compliant' : 'Non-Compliant'}
                </span>
                {getStatusBadge(data.latestInspection.status)}
              </div>

              {data.complianceStatus.requiresAction && data.latestInspection.actionDescription && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Action Required</p>
                  <p className="text-sm text-yellow-700">{data.latestInspection.actionDescription}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Last Inspected
                  </p>
                  <p className="text-base">
                    {new Date(data.latestInspection.inspectionDate).toLocaleDateString()}
                  </p>
                </div>
                {data.latestInspection.nextInspectionDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Next Inspection Due
                    </p>
                    <p className="text-base">
                      {new Date(data.latestInspection.nextInspectionDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                {data.complianceStatus.message || 'No inspections recorded'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspection History Card */}
      {data.inspectionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inspection History</CardTitle>
            <CardDescription>
              {isInspector
                ? `Last ${data.inspectionHistory.length} inspections`
                : 'Recent compliance checks'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isInspector ? (
                // Inspector view: Show all inspection history
                data.inspectionHistory.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => router.push(`/inspections/${inspection.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(inspection.status)}
                      <div>
                        <p className="font-medium">
                          {new Date(inspection.inspectionDate).toLocaleDateString()}
                        </p>
                        {inspection.actionRequired && (
                          <p className="text-sm text-yellow-600">Action Required</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(inspection.status)}
                  </div>
                ))
              ) : (
                // Resident view: Show simplified summary
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm">
                      This door has been inspected {data.inspectionHistory.length} time{data.inspectionHistory.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {data.latestInspection && (
                    <p className="text-sm text-gray-600 px-3">
                      Most recent inspection: {new Date(data.latestInspection.inspectionDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        {isInspector ? (
          <p>Use the buttons above to perform a new inspection or view the complete inspection history.</p>
        ) : (
          <p>This is a public verification page. For detailed inspection records, please contact the building manager.</p>
        )}
      </div>
    </div>
  )
}
