import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DoorDetailTabs } from '@/components/door-detail-tabs'

async function getDoorDetails(doorId: string, userId: string) {
  const door = await prisma.fireDoor.findFirst({
    where: {
      id: doorId,
      building: { managerId: userId }
    },
    include: {
      building: true,
      inspections: {
        orderBy: { inspectionDate: 'desc' },
        include: {
          inspector: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  })

  if (!door) {
    return null
  }

  return door
}

export default async function DoorDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const door = await getDoorDetails(id, session.user.id)

  if (!door) {
    notFound()
  }

  const latestInspection = door.inspections[0]
  const inspectionHistory = door.inspections

  const getStatusBadge = (result: string) => {
    if (result === 'PASS') {
      return <Badge className="bg-green-600">Pass</Badge>
    }
    if (result === 'FAIL') {
      return <Badge className="bg-red-600">Fail</Badge>
    }
    return <Badge className="bg-amber-600">Requires Action</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/doors">
              <Button variant="ghost" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Doors
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
        {/* Door Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="h-16 w-16 rounded-lg bg-red-100 flex items-center justify-center text-red-700 font-bold text-2xl">
                  {door.doorNumber}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{door.location}</h1>
                  <Link href={`/buildings/${door.building.id}`} className="text-slate-600 hover:text-slate-900">
                    {door.building.name}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline">{door.fireRating}</Badge>
                <Badge variant="outline">{door.doorType.replace(/_/g, ' ')}</Badge>
                {latestInspection && latestInspection.overallResult && getStatusBadge(latestInspection.overallResult)}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/inspections/new?doorId=${door.id || ''}`}>
                <Button className="bg-red-600 hover:bg-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  New Inspection
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Door Details */}
          <Card>
            <CardHeader>
              <CardTitle>Door Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">Door Number</div>
                <div className="font-semibold">{door.doorNumber}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Location</div>
                <div className="font-semibold">{door.location}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Fire Rating</div>
                <div className="font-semibold">{door.fireRating}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Door Type</div>
                <div className="font-semibold">{door.doorType.replace(/_/g, ' ')}</div>
              </div>
              {door.manufacturer && (
                <div>
                  <div className="text-sm text-slate-500">Manufacturer</div>
                  <div className="font-semibold">{door.manufacturer}</div>
                </div>
              )}
              {door.installationDate && (
                <div>
                  <div className="text-sm text-slate-500">Installation Date</div>
                  <div className="font-semibold">{new Date(door.installationDate).toLocaleDateString()}</div>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="text-sm text-slate-500 mb-2">Building</div>
                <Link href={`/buildings/${door.building.id}`}>
                  <Button variant="outline" className="w-full">
                    {door.building.name} →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <div className="lg:col-span-2">
            <DoorDetailTabs
              door={door}
              latestInspection={latestInspection}
              inspectionHistory={inspectionHistory}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
