import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HelpTooltip, InfoBanner } from '@/components/ui/help-tooltip'
import { DashboardWrapper } from '@/components/dashboard-wrapper'
import { DashboardHeader } from '@/components/dashboard-header'

async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tenantId: true }
  })

  const buildings = await prisma.building.count({
    where: { managerId: userId }
  })

  const doors = await prisma.fireDoor.count({
    where: { building: { managerId: userId } }
  })

  // Count doors that need inspection (never inspected or overdue)
  const allDoors = await prisma.fireDoor.findMany({
    where: {
      building: { managerId: userId }
    },
    include: {
      inspections: {
        orderBy: { inspectionDate: 'desc' },
        take: 1
      }
    }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pendingInspections = allDoors.filter(door => {
    // Never inspected
    if (door.inspections.length === 0) return true

    // Has overdue inspection
    if (door.nextInspectionDate && new Date(door.nextInspectionDate) < today) return true

    return false
  }).length

  const overdueInspections = await prisma.fireDoor.findMany({
    where: {
      building: { managerId: userId },
      inspections: { some: {} }
    },
    include: {
      inspections: {
        orderBy: { inspectionDate: 'desc' },
        take: 1
      },
      building: true
    }
  })

  // Count doors where the MOST RECENT inspection requires action
  const doorsRequiringAction = await prisma.fireDoor.findMany({
    where: {
      building: { managerId: userId },
      inspections: { some: {} }
    },
    include: {
      inspections: {
        orderBy: { inspectionDate: 'desc' },
        take: 1
      }
    }
  })

  const requiresAction = doorsRequiringAction.filter(door => {
    const latestInspection = door.inspections[0]
    return latestInspection?.status === 'REQUIRES_ACTION' ||
           latestInspection?.overallResult === 'REQUIRES_ATTENTION'
  }).length

  // Count active defects for tenant
  const activeDefects = user?.tenantId ? await prisma.defect.count({
    where: {
      tenantId: user.tenantId,
      status: {
        notIn: ['CLOSED', 'CANCELLED', 'REINSPECTION_PASSED']
      }
    }
  }) : 0

  return {
    buildings,
    doors,
    pendingInspections,
    overdueCount: overdueInspections.length,
    requiresAction,
    activeDefects
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const data = await getDashboardData(session.user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        <DashboardWrapper>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, {session.user.name}</h2>
            <p className="text-slate-600">Here's an overview of your fire door inspection compliance</p>
          </div>

          <InfoBanner variant="info">
          <strong>Fire Safety (England) Regulations 2022:</strong> All fire doors must be inspected regularly. Flat entrance doors require yearly inspection. Buildings over 11m require 3-monthly checks for communal areas.
        </InfoBanner>

        {data.requiresAction > 0 && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">
              <strong>{data.requiresAction}</strong> door{data.requiresAction > 1 ? 's' : ''} require{data.requiresAction === 1 ? 's' : ''} attention - Non-critical defects identified
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Total Buildings</CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{data.buildings}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/buildings">
                <Button variant="link" className="p-0 h-auto">
                  View all buildings →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Fire Doors Registered</CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{data.doors}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/doors">
                <Button variant="link" className="p-0 h-auto">
                  Manage doors →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1 mb-1">
                <CardDescription className="text-purple-800">Pending</CardDescription>
                <HelpTooltip content="Doors that have never been inspected or have overdue inspections. Start inspecting to ensure compliance." />
              </div>
              <CardTitle className="text-3xl font-bold text-purple-900">{data.pendingInspections}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/doors?status=not-inspected">
                <Button variant="link" className="p-0 h-auto text-purple-700">
                  Start inspecting →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1 mb-1">
                <CardDescription className="text-amber-800">Requires Attention</CardDescription>
                <HelpTooltip content="Non-critical defects identified (smoke seals, letterbox, glazing). Fix required before next inspection cycle." />
              </div>
              <CardTitle className="text-3xl font-bold text-amber-900">{data.requiresAction}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/inspections?status=action">
                <Button variant="link" className="p-0 h-auto text-amber-700">
                  View issues →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/buildings/new">
                <Button className="w-full justify-start" variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Building
                </Button>
              </Link>
              <Link href="/doors/new">
                <Button className="w-full justify-start" variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Register Fire Door
                </Button>
              </Link>
              <Link href="/inspections/new">
                <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Start New Inspection
                </Button>
              </Link>
              <Link href="/qr-scan">
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Scan QR Code to Inspect
                </Button>
              </Link>
              <Link href="/qr-codes">
                <Button className="w-full justify-start" variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Generate QR Codes
                </Button>
              </Link>
              <Link href="/calendar">
                <Button className="w-full justify-start" variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Inspection Calendar
                </Button>
              </Link>
              <Link href="/defects">
                <Button className="w-full justify-start" variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Defect Management
                  {data.activeDefects > 0 && (
                    <Badge variant="destructive" className="ml-auto">{data.activeDefects}</Badge>
                  )}
                </Button>
              </Link>
              <Link href="/contractors">
                <Button className="w-full justify-start" variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Contractor Management
                </Button>
              </Link>
              <Link href="/reports">
                <Button className="w-full justify-start" variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Reports & Analytics
                </Button>
              </Link>
              <Link href="/csv">
                <Button className="w-full justify-start" variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  CSV Import/Export
                </Button>
              </Link>
              <Link href="/documentation">
                <Button className="w-full justify-start" variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  View Documentation
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Fire Safety (England) Regulations 2022</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Flat Entrance Doors</span>
                <Badge variant="outline">12-month cycle</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Communal Doors</span>
                <Badge variant="outline">3-month cycle</Badge>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-slate-500">
                  All inspections comply with Fire Safety (England) Regulations 2022 requirements
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        </DashboardWrapper>
      </div>
    </div>
  )
}
