'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchFilter } from '@/components/search-filter'
import Link from 'next/link'

interface Building {
  id: string
  name: string
  address: string
  postcode: string | null
  buildingType: string | null
  numberOfStoreys: number | null
  contactName: string | null
  stats: {
    totalDoors: number
    doorsWithInspections: number
    passedDoors: number
    failedDoors: number
    requiresActionDoors: number
  }
}

export default function BuildingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name-asc')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchBuildings()
    }
  }, [status, router])

  const fetchBuildings = async () => {
    try {
      const response = await fetch('/api/buildings')
      if (!response.ok) throw new Error('Failed to fetch buildings')

      const data = await response.json()

      // Fetch doors for each building to calculate stats
      const buildingsWithStats = await Promise.all(
        data.map(async (building: any) => {
          // Fetch doors for this building
          const doorsResponse = await fetch(`/api/doors?buildingId=${building.id}`)
          const doors = doorsResponse.ok ? await doorsResponse.json() : []

          const totalDoors = doors.length
          const doorsWithInspections = doors.filter((door: any) =>
            door.inspections && door.inspections.length > 0
          ).length
          const passedDoors = doors.filter((door: any) =>
            door.inspections && door.inspections.length > 0 && door.inspections[0]?.overallResult === 'PASS'
          ).length
          const failedDoors = doors.filter((door: any) =>
            door.inspections && door.inspections.length > 0 && door.inspections[0]?.overallResult === 'FAIL'
          ).length
          const requiresActionDoors = doors.filter((door: any) =>
            door.inspections && door.inspections.length > 0 &&
            (door.inspections[0]?.status === 'REQUIRES_ACTION' || door.inspections[0]?.overallResult === 'REQUIRES_ATTENTION')
          ).length

          return {
            ...building,
            stats: {
              totalDoors,
              doorsWithInspections,
              passedDoors,
              failedDoors,
              requiresActionDoors
            }
          }
        })
      )

      setBuildings(buildingsWithStats)
    } catch (error) {
      console.error('Error fetching buildings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort buildings
  const filteredBuildings = buildings
    .filter((building) => {
      // Search filter
      const matchesSearch =
        building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (building.postcode && building.postcode.toLowerCase().includes(searchQuery.toLowerCase()))

      // Type filter
      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'no-type' ? !building.buildingType : building.buildingType === typeFilter)

      // Status filter
      let matchesStatus = true
      if (statusFilter === 'has-doors') {
        matchesStatus = building.stats.totalDoors > 0
      } else if (statusFilter === 'no-doors') {
        matchesStatus = building.stats.totalDoors === 0
      } else if (statusFilter === 'has-issues') {
        matchesStatus = building.stats.failedDoors > 0 || building.stats.requiresActionDoors > 0
      } else if (statusFilter === 'all-passed') {
        matchesStatus = building.stats.totalDoors > 0 &&
                       building.stats.passedDoors === building.stats.totalDoors
      }

      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'doors-desc':
          return b.stats.totalDoors - a.stats.totalDoors
        case 'doors-asc':
          return a.stats.totalDoors - b.stats.totalDoors
        case 'issues-desc':
          return (b.stats.failedDoors + b.stats.requiresActionDoors) -
                 (a.stats.failedDoors + a.stats.requiresActionDoors)
        default:
          return 0
      }
    })

  // Get unique building types for filter
  const buildingTypes = Array.from(new Set(buildings.map(b => b.buildingType).filter(Boolean)))
  const typeFilterOptions = [
    { label: 'All Types', value: 'all', count: buildings.length },
    ...buildingTypes.map(type => ({
      label: type!,
      value: type!,
      count: buildings.filter(b => b.buildingType === type).length
    })),
    {
      label: 'No Type',
      value: 'no-type',
      count: buildings.filter(b => !b.buildingType).length
    }
  ]

  const statusFilterOptions = [
    { label: 'All', value: 'all', count: buildings.length },
    { label: 'Has Doors', value: 'has-doors', count: buildings.filter(b => b.stats.totalDoors > 0).length },
    { label: 'No Doors', value: 'no-doors', count: buildings.filter(b => b.stats.totalDoors === 0).length },
    { label: 'Has Issues', value: 'has-issues', count: buildings.filter(b => b.stats.failedDoors > 0 || b.stats.requiresActionDoors > 0).length },
    { label: 'All Passed', value: 'all-passed', count: buildings.filter(b => b.stats.totalDoors > 0 && b.stats.passedDoors === b.stats.totalDoors).length }
  ]

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Most Doors', value: 'doors-desc' },
    { label: 'Fewest Doors', value: 'doors-asc' },
    { label: 'Most Issues', value: 'issues-desc' }
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
            <h1 className="text-3xl font-bold text-slate-900">Buildings</h1>
            <p className="text-slate-600 mt-2">
              {filteredBuildings.length} {filteredBuildings.length === 1 ? 'building' : 'buildings'}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          <Link href="/buildings/new">
            <Button className="bg-red-600 hover:bg-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Building
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search buildings by name, address, or postcode..."
          filters={[
            {
              label: 'Type',
              options: typeFilterOptions,
              activeFilter: typeFilter,
              onFilterChange: setTypeFilter
            },
            {
              label: 'Status',
              options: statusFilterOptions,
              activeFilter: statusFilter,
              onFilterChange: setStatusFilter
            }
          ]}
          sortOptions={sortOptions}
          activeSort={sortBy}
          onSortChange={setSortBy}
        />

        {filteredBuildings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {buildings.length === 0 ? 'No buildings yet' : 'No buildings found'}
              </h3>
              <p className="text-slate-500 text-center mb-4">
                {buildings.length === 0
                  ? 'Get started by adding your first building'
                  : 'Try adjusting your search or filters'
                }
              </p>
              {buildings.length === 0 && (
                <Link href="/buildings/new">
                  <Button className="bg-red-600 hover:bg-red-700">Add Your First Building</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuildings.map((building) => (
              <Link key={building.id} href={`/buildings/${building.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{building.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {building.address}
                          {building.postcode && `, ${building.postcode}`}
                        </CardDescription>
                      </div>
                      {building.buildingType && (
                        <Badge variant="outline" className="ml-2">
                          {building.buildingType}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Door Statistics */}
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-slate-600">Total Fire Doors</span>
                        <span className="text-lg font-bold text-slate-900">{building.stats.totalDoors}</span>
                      </div>

                      {/* Inspection Status */}
                      {building.stats.totalDoors > 0 && (
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{building.stats.passedDoors}</div>
                            <div className="text-xs text-slate-500">Passed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600">{building.stats.requiresActionDoors}</div>
                            <div className="text-xs text-slate-500">Action</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{building.stats.failedDoors}</div>
                            <div className="text-xs text-slate-500">Failed</div>
                          </div>
                        </div>
                      )}

                      {/* Building Details */}
                      <div className="pt-2 space-y-1">
                        {building.numberOfStoreys && (
                          <div className="flex items-center text-sm text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {building.numberOfStoreys} {building.numberOfStoreys === 1 ? 'storey' : 'storeys'}
                          </div>
                        )}
                        {building.contactName && (
                          <div className="flex items-center text-sm text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {building.contactName}
                          </div>
                        )}
                      </div>

                      {/* View Details Button */}
                      <div className="pt-2">
                        <Button variant="outline" className="w-full">
                          View Details →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
