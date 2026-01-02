import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BuildingDetailTabs } from '@/components/building-detail-tabs'

async function getBuildingDetails(buildingId: string, userId: string) {
  const building = await prisma.building.findFirst({
    where: {
      id: buildingId,
      managerId: userId
    },
    include: {
      fireDoors: {
        include: {
          inspections: {
            orderBy: { inspectionDate: 'desc' },
            take: 1
          }
        },
        orderBy: { doorNumber: 'asc' }
      }
    }
  })

  if (!building) {
    return null
  }

  return building
}

export default async function BuildingDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const building = await getBuildingDetails(id, session.user.id)

  if (!building) {
    notFound()
  }

  const totalDoors = building.fireDoors.length
  const passedDoors = building.fireDoors.filter(door =>
    door.inspections[0]?.overallResult === 'PASS'
  ).length
  const failedDoors = building.fireDoors.filter(door =>
    door.inspections[0]?.overallResult === 'FAIL'
  ).length
  const requiresActionDoors = building.fireDoors.filter(door =>
    door.inspections[0]?.overallResult === 'REQUIRES_ATTENTION'
  ).length
  const uninspectedDoors = building.fireDoors.filter(door =>
    door.inspections.length === 0
  ).length
  const complianceRate = totalDoors > 0 ? ((passedDoors / totalDoors) * 100).toFixed(1) : '0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/buildings">
              <Button variant="ghost" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Buildings
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
        {/* Building Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{building.name}</h1>
              <p className="text-slate-600 mt-2">
                {building.address}
                {building.postcode && `, ${building.postcode}`}
              </p>
              {building.buildingType && (
                <Badge variant="outline" className="mt-2">{building.buildingType}</Badge>
              )}
            </div>
            <Link href={`/doors/new?buildingId=${building.id}`}>
              <Button className="bg-red-600 hover:bg-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Fire Door
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="text-sm text-slate-600">Total Doors</div>
              <CardTitle className="text-3xl">{totalDoors}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <div className="text-sm text-green-800">Passed</div>
              <CardTitle className="text-3xl text-green-900">{passedDoors}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <div className="text-sm text-amber-800">Requires Action</div>
              <CardTitle className="text-3xl text-amber-900">{requiresActionDoors}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <div className="text-sm text-red-800">Failed</div>
              <CardTitle className="text-3xl text-red-900">{failedDoors}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200 bg-slate-50">
            <CardHeader className="pb-3">
              <div className="text-sm text-slate-800">Not Inspected</div>
              <CardTitle className="text-3xl text-slate-900">{uninspectedDoors}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <BuildingDetailTabs
          building={building}
          totalDoors={totalDoors}
          passedDoors={passedDoors}
          failedDoors={failedDoors}
          requiresActionDoors={requiresActionDoors}
          uninspectedDoors={uninspectedDoors}
          complianceRate={complianceRate}
        />
      </div>
    </div>
  )
}
