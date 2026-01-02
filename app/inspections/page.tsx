'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchFilter } from '@/components/search-filter'
import Link from 'next/link'

interface Inspection {
  id: string
  inspectionDate: string
  status: string
  overallResult: string | null
  nextInspectionDate: string | null
  fireDoor: {
    id: string
    doorNumber: string
    location: string
    fireRating: string
    doorType: string
    building: {
      id: string
      name: string
    }
  }
  inspector: {
    name: string
    email: string
  }
}

function InspectionsPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [inspectorFilter, setInspectorFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchInspections()
    }
  }, [status, router])

  const fetchInspections = async () => {
    try {
      const response = await fetch('/api/inspections')
      if (!response.ok) throw new Error('Failed to fetch inspections')
      const data = await response.json()
      setInspections(data)
    } catch (error) {
      console.error('Error fetching inspections:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (inspection: any) => {
    const result = inspection.overallResult
    const status = inspection.status

    if (result === 'PASS') {
      return <Badge className="bg-green-600">Pass</Badge>
    }
    if (result === 'FAIL') {
      return <Badge className="bg-red-600">Fail</Badge>
    }
    if (result === 'REQUIRES_ATTENTION') {
      return <Badge className="bg-amber-600">Requires Attention</Badge>
    }
    if (status === 'REQUIRES_ACTION') {
      return <Badge className="bg-amber-600">Requires Action</Badge>
    }
    if (result === 'PENDING' || status === 'PENDING') {
      return <Badge className="bg-blue-600">Pending</Badge>
    }
    return <Badge className="bg-gray-600">Unknown</Badge>
  }

  // Filter and sort inspections
  const filteredInspections = inspections
    .filter((inspection) => {
      // Search filter
      const matchesSearch =
        inspection.fireDoor.doorNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.fireDoor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.fireDoor.building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.inspector.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Building filter
      const matchesBuilding =
        buildingFilter === 'all' || inspection.fireDoor.building.id === buildingFilter

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'passed' && inspection.overallResult === 'PASS') ||
        (statusFilter === 'failed' && inspection.overallResult === 'FAIL') ||
        (statusFilter === 'action' && (inspection.status === 'REQUIRES_ACTION' || inspection.overallResult === 'REQUIRES_ATTENTION')) ||
        (statusFilter === 'pending' && inspection.status === 'PENDING') ||
        (statusFilter === 'overdue' && inspection.nextInspectionDate &&
          new Date(inspection.nextInspectionDate) < new Date())

      // Inspector filter
      const matchesInspector =
        inspectorFilter === 'all' || inspection.inspector.email === inspectorFilter

      // Date filter
      let matchesDate = true
      const inspectionDate = new Date(inspection.inspectionDate)
      const now = new Date()
      if (dateFilter === 'today') {
        matchesDate = inspectionDate.toDateString() === now.toDateString()
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        matchesDate = inspectionDate >= weekAgo
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        matchesDate = inspectionDate >= monthAgo
      } else if (dateFilter === '3months') {
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        matchesDate = inspectionDate >= threeMonthsAgo
      }

      return matchesSearch && matchesBuilding && matchesStatus && matchesInspector && matchesDate
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
        case 'date-asc':
          return new Date(a.inspectionDate).getTime() - new Date(b.inspectionDate).getTime()
        case 'building-asc':
          return a.fireDoor.building.name.localeCompare(b.fireDoor.building.name) ||
                 a.fireDoor.doorNumber.localeCompare(b.fireDoor.doorNumber)
        case 'building-desc':
          return b.fireDoor.building.name.localeCompare(a.fireDoor.building.name) ||
                 b.fireDoor.doorNumber.localeCompare(a.fireDoor.doorNumber)
        case 'door-asc':
          return a.fireDoor.doorNumber.localeCompare(b.fireDoor.doorNumber)
        case 'door-desc':
          return b.fireDoor.doorNumber.localeCompare(a.fireDoor.doorNumber)
        case 'inspector-asc':
          return a.inspector.name.localeCompare(b.inspector.name)
        case 'inspector-desc':
          return b.inspector.name.localeCompare(a.inspector.name)
        default:
          return 0
      }
    })

  // Get unique values for filters
  const buildings = Array.from(
    new Set(inspections.map(i => JSON.stringify({ id: i.fireDoor.building.id, name: i.fireDoor.building.name })))
  ).map(str => JSON.parse(str))

  const buildingFilterOptions = [
    { label: 'All Buildings', value: 'all', count: inspections.length },
    ...buildings.map(building => ({
      label: building.name,
      value: building.id,
      count: inspections.filter(i => i.fireDoor.building.id === building.id).length
    }))
  ]

  const inspectors = Array.from(
    new Set(inspections.map(i => JSON.stringify({ name: i.inspector.name, email: i.inspector.email })))
  ).map(str => JSON.parse(str))

  const inspectorFilterOptions = [
    { label: 'All Inspectors', value: 'all', count: inspections.length },
    ...inspectors.map(inspector => ({
      label: inspector.name,
      value: inspector.email,
      count: inspections.filter(i => i.inspector.email === inspector.email).length
    }))
  ]

  const statusFilterOptions = [
    { label: 'All', value: 'all', count: inspections.length },
    { label: 'Passed', value: 'passed', count: inspections.filter(i => i.overallResult === 'PASS').length },
    { label: 'Requires Action', value: 'action', count: inspections.filter(i => i.status === 'REQUIRES_ACTION' || i.overallResult === 'REQUIRES_ATTENTION').length },
    { label: 'Failed', value: 'failed', count: inspections.filter(i => i.overallResult === 'FAIL').length },
    { label: 'Pending', value: 'pending', count: inspections.filter(i => i.status === 'PENDING').length },
    { label: 'Overdue', value: 'overdue', count: inspections.filter(i => i.nextInspectionDate && new Date(i.nextInspectionDate) < new Date()).length }
  ]

  const dateFilterOptions = [
    { label: 'All Time', value: 'all', count: inspections.length },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Last 30 Days', value: 'month' },
    { label: 'Last 3 Months', value: '3months' }
  ]

  const sortOptions = [
    { label: 'Latest First', value: 'date-desc' },
    { label: 'Oldest First', value: 'date-asc' },
    { label: 'Building (A-Z)', value: 'building-asc' },
    { label: 'Building (Z-A)', value: 'building-desc' },
    { label: 'Door Number (A-Z)', value: 'door-asc' },
    { label: 'Door Number (Z-A)', value: 'door-desc' },
    { label: 'Inspector (A-Z)', value: 'inspector-asc' },
    { label: 'Inspector (Z-A)', value: 'inspector-desc' }
  ]

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inspections</h1>
            <p className="text-slate-600 mt-2">
              {filteredInspections.length} {filteredInspections.length === 1 ? 'inspection' : 'inspections'}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          <Link href="/inspections/new">
            <Button className="bg-red-600 hover:bg-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              New Inspection
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by door, location, building, or inspector..."
          filters={[
            {
              label: 'Building',
              options: buildingFilterOptions,
              activeFilter: buildingFilter,
              onFilterChange: setBuildingFilter
            },
            {
              label: 'Status',
              options: statusFilterOptions,
              activeFilter: statusFilter,
              onFilterChange: setStatusFilter
            },
            {
              label: 'Inspector',
              options: inspectorFilterOptions,
              activeFilter: inspectorFilter,
              onFilterChange: setInspectorFilter
            },
            {
              label: 'Date',
              options: dateFilterOptions,
              activeFilter: dateFilter,
              onFilterChange: setDateFilter
            }
          ]}
          sortOptions={sortOptions}
          activeSort={sortBy}
          onSortChange={setSortBy}
        />

        {filteredInspections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {inspections.length === 0 ? 'No inspections recorded' : 'No inspections found'}
              </h3>
              <p className="text-slate-500 text-center mb-4">
                {inspections.length === 0
                  ? 'Start by performing your first inspection'
                  : 'Try adjusting your search or filters'
                }
              </p>
              {inspections.length === 0 && (
                <Link href="/inspections/new">
                  <Button className="bg-red-600 hover:bg-red-700">Start First Inspection</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {filteredInspections.length} {filteredInspections.length === 1 ? 'Inspection' : 'Inspections'}
              </CardTitle>
              <CardDescription>
                {searchQuery || buildingFilter !== 'all' || statusFilter !== 'all' || inspectorFilter !== 'all' || dateFilter !== 'all'
                  ? 'Filtered results'
                  : 'Complete inspection history'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredInspections.map((inspection) => (
                  <Link key={inspection.id} href={`/inspections/${inspection.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center min-w-[60px]">
                          <div className="text-2xl font-bold text-slate-900">
                            {new Date(inspection.inspectionDate).getDate()}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(inspection.inspectionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">
                              Door {inspection.fireDoor.doorNumber} - {inspection.fireDoor.location}
                            </span>
                          </div>
                          <div className="text-sm text-slate-500">
                            {inspection.fireDoor.building.name}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Inspector: {inspection.inspector.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-2">
                          {getStatusBadge(inspection)}
                          {inspection.nextInspectionDate && (
                            <div className={`text-xs mt-1 ${
                              new Date(inspection.nextInspectionDate) < new Date()
                                ? 'text-red-600 font-semibold'
                                : 'text-slate-500'
                            }`}>
                              Next: {new Date(inspection.nextInspectionDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
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
    </div>
  )
}

export default function InspectionsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">Loading...</div>}>
      <InspectionsPageContent />
    </Suspense>
  )
}
