'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchFilter } from '@/components/search-filter'
import { StatusBadge } from '@/components/ui/status-badge'
import { ConfidenceIndicator } from '@/components/ui/confidence-indicator'
import Link from 'next/link'

interface Door {
  id: string
  doorNumber: string
  location: string
  fireRating: string
  doorType: string
  manufacturer: string | null
  certificationUrl: string | null
  building: {
    id: string
    name: string
    topStoreyHeight: number
  }
  inspections: Array<{
    id: string
    overallResult: string
    inspectionDate: string
    nextInspectionDate: string | null
    inspector: {
      name: string
    }
    actionDescription: string | null
  }>
}

export default function DoorsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [doors, setDoors] = useState<Door[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('building-asc')
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedDoors, setSelectedDoors] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchDoors()
    }
  }, [status, router])

  const fetchDoors = async () => {
    try {
      const response = await fetch('/api/doors')
      if (!response.ok) throw new Error('Failed to fetch doors')
      const data = await response.json()
      setDoors(data)
    } catch (error) {
      console.error('Error fetching doors:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDoorSelection = (doorId: string) => {
    const newSelected = new Set(selectedDoors)
    if (newSelected.has(doorId)) {
      newSelected.delete(doorId)
    } else {
      newSelected.add(doorId)
    }
    setSelectedDoors(newSelected)
  }

  const handleBulkSchedule = async () => {
    if (selectedDoors.size === 0) {
      alert('Please select at least one door')
      return
    }

    const date = prompt('Enter inspection date (YYYY-MM-DD):')
    if (!date) return

    const inspector = prompt('Enter inspector ID (or leave blank to use your ID):')

    try {
      for (const doorId of Array.from(selectedDoors)) {
        await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fireDoorId: doorId,
            inspectionDate: new Date(date).toISOString(),
            inspectorId: inspector || session?.user.id,
            status: 'PENDING'
          })
        })
      }

      alert(`Successfully scheduled inspections for ${selectedDoors.size} door${selectedDoors.size !== 1 ? 's' : ''}!`)
      setSelectedDoors(new Set())
      setSelectionMode(false)
      fetchDoors()
    } catch (error) {
      console.error('Failed to bulk schedule', error)
      alert('Failed to schedule inspections')
    }
  }

  const handleBulkEdit = async () => {
    if (selectedDoors.size === 0) {
      alert('Please select at least one door')
      return
    }

    const field = prompt('What field would you like to update? (manufacturer, fireRating, doorType)')
    if (!field) return

    const value = prompt(`Enter new value for ${field}:`)
    if (!value) return

    try {
      for (const doorId of Array.from(selectedDoors)) {
        await fetch('/api/doors', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: doorId,
            [field]: value
          })
        })
      }

      alert(`Successfully updated ${selectedDoors.size} door${selectedDoors.size !== 1 ? 's' : ''}!`)
      setSelectedDoors(new Set())
      setSelectionMode(false)
      fetchDoors()
    } catch (error) {
      console.error('Failed to bulk edit', error)
      alert('Failed to update doors')
    }
  }

  const getStatusBadge = (door: Door) => {
    if (door.inspections.length === 0) {
      return <Badge variant="outline" className="bg-slate-100">Not Inspected</Badge>
    }
    const result = door.inspections[0].overallResult
    return <StatusBadge status={result} />
  }

  const getTimeSinceLastInspection = (door: Door) => {
    if (door.inspections.length === 0) return 'Never inspected'

    const lastDate = new Date(door.inspections[0].inspectionDate)
    const now = new Date()
    const diffMs = now.getTime() - lastDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Inspected today'
    if (diffDays === 1) return 'Inspected yesterday'
    if (diffDays < 7) return `Inspected ${diffDays} days ago`
    if (diffDays < 30) return `Inspected ${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `Inspected ${Math.floor(diffDays / 30)} months ago`
    return `Inspected ${Math.floor(diffDays / 365)} years ago`
  }

  const getRiskLevel = (door: Door) => {
    if (door.inspections.length === 0) return { level: 'unknown', label: 'Not Assessed', color: 'bg-slate-100 text-slate-700' }

    const lastInspection = door.inspections[0]
    const result = lastInspection.overallResult
    const nextDate = lastInspection.nextInspectionDate

    // Critical: Failed or overdue
    if (result === 'FAIL') {
      return { level: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700 border-red-300' }
    }

    if (nextDate && new Date(nextDate) < new Date()) {
      return { level: 'critical', label: 'Overdue', color: 'bg-red-100 text-red-700 border-red-300' }
    }

    // Minor: Requires attention
    if (result === 'REQUIRES_ATTENTION') {
      return { level: 'minor', label: 'Minor Issues', color: 'bg-amber-100 text-amber-700 border-amber-300' }
    }

    // OK: Passed
    if (result === 'PASS') {
      return { level: 'ok', label: 'Compliant', color: 'bg-green-100 text-green-700 border-green-300' }
    }

    return { level: 'unknown', label: 'Pending', color: 'bg-slate-100 text-slate-700' }
  }

  const getInspectionCycle = (door: Door) => {
    if (door.doorType === 'FLAT_ENTRANCE') {
      return '12-month cycle'
    }
    if (door.building.topStoreyHeight > 11) {
      return '3-month cycle'
    }
    return '12-month cycle'
  }

  const getConfidenceLevel = (door: Door): { level: 'high' | 'medium' | 'low', score: number, reason: string, breakdown: string[] } => {
    if (door.inspections.length === 0) {
      return {
        level: 'low',
        score: 0,
        reason: 'No inspection records',
        breakdown: ['No inspection history available']
      }
    }

    let totalScore = 0
    const breakdown: string[] = []

    // 1️⃣ RECENCY OF INSPECTION (30 points max)
    const lastInspection = door.inspections[0]
    const daysSinceInspection = Math.floor(
      (new Date().getTime() - new Date(lastInspection.inspectionDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    let recencyScore = 0
    if (daysSinceInspection < 60) {
      recencyScore = 30
      breakdown.push('✓ Recently inspected (< 60 days)')
    } else if (daysSinceInspection < 180) {
      recencyScore = 20
      breakdown.push('○ Inspected within cycle (< 6 months)')
    } else if (daysSinceInspection < 365) {
      recencyScore = 10
      breakdown.push('○ Inspection aging (6-12 months)')
    } else {
      recencyScore = 0
      breakdown.push('✗ Inspection overdue (> 12 months)')
    }
    totalScore += recencyScore

    // 2️⃣ HISTORICAL RELIABILITY (25 points max)
    const recentInspections = door.inspections.slice(0, 5) // Last 5 inspections
    const passCount = recentInspections.filter(i => i.overallResult === 'PASS').length
    const failCount = recentInspections.filter(i => i.overallResult === 'FAIL').length
    const totalInspections = recentInspections.length

    let reliabilityScore = 0
    if (totalInspections >= 3 && passCount >= 3 && failCount === 0) {
      reliabilityScore = 25
      breakdown.push('✓ Consistent pass history (3+ consecutive)')
    } else if (passCount > failCount) {
      reliabilityScore = 15
      breakdown.push('○ Mostly passes with minor issues')
    } else if (failCount > passCount) {
      reliabilityScore = 5
      breakdown.push('○ History of failures')
    } else {
      reliabilityScore = 10
      breakdown.push('○ Mixed inspection history')
    }
    totalScore += reliabilityScore

    // 3️⃣ ISSUE SEVERITY PATTERN (20 points max)
    const hasCriticalFails = door.inspections.some(i =>
      i.overallResult === 'FAIL' && i.actionDescription &&
      (i.actionDescription.toLowerCase().includes('critical') ||
       i.actionDescription.toLowerCase().includes('urgent') ||
       i.actionDescription.toLowerCase().includes('dangerous'))
    )
    const hasOnlyMinorIssues = door.inspections.every(i =>
      i.overallResult === 'PASS' ||
      (i.overallResult === 'REQUIRES_ACTION' && !hasCriticalFails)
    )

    let severityScore = 0
    if (!hasCriticalFails && hasOnlyMinorIssues) {
      severityScore = 20
      breakdown.push('✓ No critical defects in history')
    } else if (!hasCriticalFails && lastInspection.overallResult === 'PASS') {
      severityScore = 15
      breakdown.push('○ Only minor faults historically')
    } else if (hasCriticalFails && lastInspection.overallResult === 'PASS') {
      severityScore = 10
      breakdown.push('○ Past critical issues now resolved')
    } else {
      severityScore = 0
      breakdown.push('✗ Unresolved critical issues')
    }
    totalScore += severityScore

    // 4️⃣ EVIDENCE QUALITY (15 points max)
    // Check for photos in inspections (stored in photoPaths)
    const hasPhotos = door.inspections.some(i => i.actionDescription?.includes('photo') || door.certificationUrl)
    const hasCertification = door.certificationUrl !== null
    const hasNotes = door.inspections.some(i => i.actionDescription !== null)

    let evidenceScore = 0
    if (hasCertification && hasPhotos && hasNotes) {
      evidenceScore = 15
      breakdown.push('✓ Complete evidence (photos + certification + notes)')
    } else if (hasPhotos && hasNotes) {
      evidenceScore = 10
      breakdown.push('○ Good evidence (photos + notes)')
    } else if (hasNotes) {
      evidenceScore = 5
      breakdown.push('○ Basic evidence (notes only)')
    } else {
      evidenceScore = 0
      breakdown.push('✗ Limited evidence')
    }
    totalScore += evidenceScore

    // 5️⃣ ENVIRONMENT / BUILDING RISK FACTOR (10 points max)
    const buildingHeight = door.building.topStoreyHeight
    const isHighRisk = buildingHeight > 18 // Tower blocks
    const isMediumRisk = buildingHeight > 11 && buildingHeight <= 18
    const isLowRisk = buildingHeight <= 11

    // Check door type for additional risk
    const isStairDoor = door.doorType.includes('STAIR') || door.location.toLowerCase().includes('stair')
    const isRiserDoor = door.location.toLowerCase().includes('riser') || door.location.toLowerCase().includes('electric')

    let riskScore = 0
    if (isLowRisk && !isStairDoor && !isRiserDoor) {
      riskScore = 10
      breakdown.push('✓ Low-risk environment (standard residential)')
    } else if (isMediumRisk || isStairDoor || isRiserDoor) {
      riskScore = 7
      breakdown.push('○ Medium-risk environment (elevated building/critical location)')
    } else if (isHighRisk) {
      riskScore = 3
      breakdown.push('○ High-risk environment (tower block/critical infrastructure)')
    }
    totalScore += riskScore

    // Calculate final confidence level based on score (0-100)
    let level: 'high' | 'medium' | 'low'
    let reason: string

    if (totalScore >= 80) {
      level = 'high'
      reason = 'High confidence: Recently inspected, strong reliability, excellent evidence'
    } else if (totalScore >= 60) {
      level = 'medium'
      reason = 'Medium confidence: Good inspection record with some gaps'
    } else {
      level = 'low'
      reason = 'Low confidence: Limited recent data or concerning history'
    }

    return { level, score: totalScore, reason, breakdown }
  }

  const getNextInspectionDate = (door: Door) => {
    if (door.inspections.length === 0) return { text: 'Never inspected', isOverdue: false }
    const nextDate = door.inspections[0].nextInspectionDate
    if (!nextDate) return { text: 'Not scheduled', isOverdue: false }

    const date = new Date(nextDate)
    const now = new Date()
    const isOverdue = date < now

    return {
      text: date.toLocaleDateString(),
      isOverdue
    }
  }

  // Filter and sort doors
  const filteredDoors = doors
    .filter((door) => {
      // Enhanced search filter: door number, location, building, manufacturer, inspector, issues
      const matchesSearch =
        door.doorNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        door.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        door.building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (door.manufacturer && door.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (door.inspections.length > 0 && door.inspections[0].inspector && door.inspections[0].inspector.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (door.inspections.length > 0 && door.inspections[0].actionDescription && door.inspections[0].actionDescription.toLowerCase().includes(searchQuery.toLowerCase()))

      // Building filter
      const matchesBuilding =
        buildingFilter === 'all' || door.building.id === buildingFilter

      // Rating filter
      const matchesRating =
        ratingFilter === 'all' || door.fireRating === ratingFilter

      // Type filter
      const matchesType =
        typeFilter === 'all' || door.doorType === typeFilter

      // Status filter
      let matchesStatus = true
      if (statusFilter === 'not-inspected') {
        // Doors that need inspection: never inspected OR overdue
        const neverInspected = door.inspections.length === 0
        const isOverdue = !!(door.inspections.length > 0 &&
                         door.inspections[0].nextInspectionDate &&
                         new Date(door.inspections[0].nextInspectionDate) < new Date())
        matchesStatus = neverInspected || isOverdue
      } else if (statusFilter === 'passed') {
        matchesStatus = door.inspections.length > 0 && door.inspections[0].overallResult === 'PASS'
      } else if (statusFilter === 'failed') {
        matchesStatus = door.inspections.length > 0 && door.inspections[0].overallResult === 'FAIL'
      } else if (statusFilter === 'requires-action') {
        matchesStatus = door.inspections.length > 0 && door.inspections[0].overallResult === 'REQUIRES_ATTENTION'
      } else if (statusFilter === 'overdue') {
        matchesStatus = !!(door.inspections.length > 0 &&
                       door.inspections[0].nextInspectionDate &&
                       new Date(door.inspections[0].nextInspectionDate) < new Date())
      }

      return matchesSearch && matchesBuilding && matchesRating && matchesType && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'building-asc':
          return a.building.name.localeCompare(b.building.name) ||
                 a.doorNumber.localeCompare(b.doorNumber)
        case 'building-desc':
          return b.building.name.localeCompare(a.building.name) ||
                 b.doorNumber.localeCompare(a.doorNumber)
        case 'door-asc':
          return a.doorNumber.localeCompare(b.doorNumber)
        case 'door-desc':
          return b.doorNumber.localeCompare(a.doorNumber)
        case 'location-asc':
          return a.location.localeCompare(b.location)
        case 'location-desc':
          return b.location.localeCompare(a.location)
        case 'recent-inspection':
          if (a.inspections.length === 0) return 1
          if (b.inspections.length === 0) return -1
          return new Date(b.inspections[0].inspectionDate).getTime() -
                 new Date(a.inspections[0].inspectionDate).getTime()
        default:
          return 0
      }
    })

  // Get unique values for filters
  const buildings = Array.from(new Set(doors.map(d => d.building)))
  const buildingFilterOptions = [
    { label: 'All Buildings', value: 'all', count: doors.length },
    ...buildings.map(building => ({
      label: building.name,
      value: building.id,
      count: doors.filter(d => d.building.id === building.id).length
    }))
  ]

  const ratings = Array.from(new Set(doors.map(d => d.fireRating)))
  const ratingFilterOptions = [
    { label: 'All Ratings', value: 'all', count: doors.length },
    ...ratings.map(rating => ({
      label: rating,
      value: rating,
      count: doors.filter(d => d.fireRating === rating).length
    }))
  ]

  const types = Array.from(new Set(doors.map(d => d.doorType)))
  const typeFilterOptions = [
    { label: 'All Types', value: 'all', count: doors.length },
    ...types.map(type => ({
      label: type.replace(/_/g, ' '),
      value: type,
      count: doors.filter(d => d.doorType === type).length
    }))
  ]

  const statusFilterOptions = [
    { label: 'All', value: 'all', count: doors.length },
    { label: 'Not Inspected', value: 'not-inspected', count: doors.filter(d => d.inspections.length === 0).length },
    { label: 'Compliant', value: 'passed', count: doors.filter(d => d.inspections.length > 0 && d.inspections[0].overallResult === 'PASS').length },
    { label: 'Requires Attention', value: 'requires-action', count: doors.filter(d => d.inspections.length > 0 && d.inspections[0].overallResult === 'REQUIRES_ATTENTION').length },
    { label: 'Non-Compliant', value: 'failed', count: doors.filter(d => d.inspections.length > 0 && d.inspections[0].overallResult === 'FAIL').length },
    { label: 'Overdue', value: 'overdue', count: doors.filter(d => d.inspections.length > 0 && d.inspections[0].nextInspectionDate && new Date(d.inspections[0].nextInspectionDate) < new Date()).length }
  ]

  const sortOptions = [
    { label: 'Building (A-Z)', value: 'building-asc' },
    { label: 'Building (Z-A)', value: 'building-desc' },
    { label: 'Door Number (A-Z)', value: 'door-asc' },
    { label: 'Door Number (Z-A)', value: 'door-desc' },
    { label: 'Location (A-Z)', value: 'location-asc' },
    { label: 'Location (Z-A)', value: 'location-desc' },
    { label: 'Recent Inspection', value: 'recent-inspection' }
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
            <h1 className="text-3xl font-bold text-slate-900">Fire Doors</h1>
            <p className="text-slate-600 mt-2">
              {filteredDoors.length} {filteredDoors.length === 1 ? 'door' : 'doors'}
              {searchQuery && ` matching "${searchQuery}"`}
              {selectionMode && ` • ${selectedDoors.size} selected`}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={selectionMode ? 'default' : 'outline'}
              onClick={() => {
                setSelectionMode(!selectionMode)
                if (selectionMode) {
                  setSelectedDoors(new Set())
                }
              }}
            >
              {selectionMode ? `Selection Mode (${selectedDoors.size})` : 'Select Multiple'}
            </Button>
            {selectionMode && selectedDoors.size > 0 && (
              <>
                <Button
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                  onClick={handleBulkSchedule}
                >
                  Schedule Inspection
                </Button>
                <Button
                  variant="outline"
                  className="bg-amber-50 hover:bg-amber-100 text-amber-700"
                  onClick={handleBulkEdit}
                >
                  Bulk Edit
                </Button>
              </>
            )}
            <Link href="/doors/new">
              <Button className="bg-red-600 hover:bg-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Register Fire Door
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by door, location, building, manufacturer, inspector, or issue..."
          filters={[
            {
              label: 'Building',
              options: buildingFilterOptions,
              activeFilter: buildingFilter,
              onFilterChange: setBuildingFilter
            },
            {
              label: 'Rating',
              options: ratingFilterOptions,
              activeFilter: ratingFilter,
              onFilterChange: setRatingFilter
            },
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

        {filteredDoors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {doors.length === 0 ? 'No fire doors registered' : 'No doors found'}
              </h3>
              <p className="text-slate-500 text-center mb-4">
                {doors.length === 0
                  ? 'Start by registering your first fire door'
                  : 'Try adjusting your search or filters'
                }
              </p>
              {doors.length === 0 && (
                <Link href="/doors/new">
                  <Button className="bg-red-600 hover:bg-red-700">Register Your First Door</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Fire Doors ({filteredDoors.length})</CardTitle>
              <CardDescription>
                {searchQuery || buildingFilter !== 'all' || ratingFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Filtered results'
                  : 'Complete list of registered fire doors'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredDoors.map((door) => {
                  const nextInspection = getNextInspectionDate(door)
                  const timeSince = getTimeSinceLastInspection(door)
                  const riskLevel = getRiskLevel(door)
                  const inspectionCycle = getInspectionCycle(door)
                  const confidence = getConfidenceLevel(door)
                  const isSelected = selectedDoors.has(door.id)

                  const cardContent = (
                      <div className={`flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : ''}`}>
                        <div className="flex items-center gap-4 flex-1">
                          {selectionMode && (
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  toggleDoorSelection(door.id)
                                }}
                                aria-label={`Select door ${door.doorNumber}`}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </div>
                          )}
                          <div className="h-14 w-14 rounded-lg bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm relative">
                            {door.doorNumber}
                            {door.certificationUrl && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center" title="Evidence uploaded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900">{door.location}</span>
                              <Badge variant="outline" className="text-xs">{door.building.name}</Badge>
                              <Badge variant="outline" className={`text-xs border ${riskLevel.color}`}>
                                {riskLevel.label}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                              {door.fireRating} • {door.doorType.replace(/_/g, ' ')} • {inspectionCycle}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs">
                              <span className="text-slate-600">
                                {timeSince}
                              </span>
                              {door.inspections.length > 0 && door.inspections[0].inspector && (
                                <span className="text-slate-400">
                                  by {door.inspections[0].inspector.name}
                                </span>
                              )}
                            </div>
                            <div className={`text-xs mt-1 ${nextInspection.isOverdue ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
                              Next inspection: {nextInspection.text}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end gap-2 text-right mr-2">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(door)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${
                                confidence.level === 'high' ? 'text-green-600' :
                                confidence.level === 'medium' ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                {confidence.level === 'high' ? 'High' : confidence.level === 'medium' ? 'Medium' : 'Low'} confidence
                              </span>
                              <ConfidenceIndicator
                                level={confidence.level}
                                score={confidence.score}
                                reason={confidence.reason}
                                breakdown={confidence.breakdown}
                              />
                            </div>
                          </div>
                          {!selectionMode && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                  )

                  return selectionMode ? (
                    <div key={door.id} onClick={() => toggleDoorSelection(door.id)}>
                      {cardContent}
                    </div>
                  ) : (
                    <Link key={door.id} href={`/doors/${door.id}`}>
                      {cardContent}
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
