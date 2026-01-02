'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import Calendar from '@/components/Calendar'
import './calendar.css'

interface Inspection {
  id: string
  inspectionDate: string
  nextInspectionDate: string | null
  inspectionType: string
  status: string
  overallResult: string | null
  fireDoor: {
    id: string
    doorNumber: string
    location: string
    building: {
      id: string
      name: string
    }
  }
  inspector?: {
    name: string
    email: string
  }
}

export default function CalendarPage() {
  const router = useRouter()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all')
  const [selectedRiskState, setSelectedRiskState] = useState<string>('all')
  const [selectedInspector, setSelectedInspector] = useState<string>('all')
  const [autoScheduling, setAutoScheduling] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const [multiSelectMode, setMultiSelectMode] = useState(false)

  useEffect(() => {
    fetchInspections()
  }, [])

  const fetchInspections = async () => {
    try {
      const res = await fetch('/api/inspections')
      const data = await res.json()
      setInspections(data)
    } catch (error) {
      console.error('Failed to fetch inspections', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoSchedule = async () => {
    if (!confirm('This will automatically schedule inspections for all doors that are overdue or due within the next 30 days. Continue?')) {
      return
    }

    setAutoScheduling(true)
    try {
      const res = await fetch('/api/inspections/auto-schedule', {
        method: 'POST'
      })
      const data = await res.json()

      if (res.ok) {
        alert(`Successfully scheduled ${data.scheduled} inspection${data.scheduled !== 1 ? 's' : ''}!`)
        // Refresh the calendar
        fetchInspections()
      } else {
        alert(`Failed to auto-schedule: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to auto-schedule inspections', error)
      alert('Failed to auto-schedule inspections')
    } finally {
      setAutoScheduling(false)
    }
  }

  const toggleEventSelection = (eventId: string) => {
    const newSelected = new Set(selectedEvents)
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId)
    } else {
      newSelected.add(eventId)
    }
    setSelectedEvents(newSelected)
  }

  const handleBulkReschedule = async () => {
    if (selectedEvents.size === 0) {
      alert('Please select at least one inspection to reschedule')
      return
    }

    const newDate = prompt('Enter new date (YYYY-MM-DD):')
    if (!newDate) return

    try {
      const selectedInspectionIds = Array.from(selectedEvents)
        .filter(id => id.startsWith('inspection-'))
        .map(id => id.replace('inspection-', ''))

      for (const inspectionId of selectedInspectionIds) {
        await fetch('/api/inspections', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: inspectionId,
            inspectionDate: new Date(newDate).toISOString()
          })
        })
      }

      alert(`Successfully rescheduled ${selectedInspectionIds.length} inspection${selectedInspectionIds.length !== 1 ? 's' : ''}!`)
      setSelectedEvents(new Set())
      setMultiSelectMode(false)
      fetchInspections()
    } catch (error) {
      console.error('Failed to bulk reschedule', error)
      alert('Failed to reschedule inspections')
    }
  }

  // Filter inspections based on selected filters
  const filteredInspections = inspections.filter((inspection) => {
    if (selectedBuilding !== 'all' && inspection.fireDoor.building.id !== selectedBuilding) {
      return false
    }
    if (selectedRiskState !== 'all') {
      if (selectedRiskState === 'compliant' && inspection.overallResult !== 'PASS') return false
      if (selectedRiskState === 'requires-attention' && inspection.overallResult !== 'REQUIRES_ATTENTION') return false
      if (selectedRiskState === 'non-compliant' && inspection.overallResult !== 'FAIL') return false
      if (selectedRiskState === 'pending' && inspection.status !== 'PENDING') return false
    }
    if (selectedInspector !== 'all' && inspection.inspector?.email !== selectedInspector) {
      return false
    }
    return true
  })

  // Get unique buildings and inspectors for filter dropdowns
  const buildings = Array.from(new Set(inspections.map(i => JSON.stringify({ id: i.fireDoor.building.id, name: i.fireDoor.building.name }))))
    .map(str => JSON.parse(str))
  const inspectors = Array.from(new Set(inspections.filter(i => i.inspector).map(i => JSON.stringify({ email: i.inspector!.email, name: i.inspector!.name }))))
    .map(str => JSON.parse(str))

  const calendarEvents = filteredInspections.flatMap((inspection) => {
    const events = []

    // Add completed inspection date
    events.push({
      id: `inspection-${inspection.id}`,
      title: `${inspection.fireDoor.doorNumber} - ${inspection.status}`,
      start: new Date(inspection.inspectionDate),
      end: new Date(inspection.inspectionDate),
      resource: {
        inspectionId: inspection.id,
        doorId: inspection.fireDoor.id,
        doorNumber: inspection.fireDoor.doorNumber,
        location: inspection.fireDoor.location,
        buildingName: inspection.fireDoor.building.name,
        inspectionType: inspection.inspectionType,
        status: inspection.status,
        overallResult: inspection.overallResult ?? undefined,
      }
    })

    // Add next inspection date if available
    if (inspection.nextInspectionDate) {
      events.push({
        id: `next-${inspection.id}`,
        title: `${inspection.fireDoor.doorNumber} - Due`,
        start: new Date(inspection.nextInspectionDate),
        end: new Date(inspection.nextInspectionDate),
        resource: {
          inspectionId: inspection.id,
          doorId: inspection.fireDoor.id,
          doorNumber: inspection.fireDoor.doorNumber,
          location: inspection.fireDoor.location,
          buildingName: inspection.fireDoor.building.name,
          inspectionType: 'DUE',
          status: 'SCHEDULED',
          overallResult: undefined,
        }
      })
    }

    return events
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Loading calendar...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Inspection Calendar</CardTitle>
                <CardDescription>
                  View all inspection dates and upcoming inspections
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={multiSelectMode ? 'default' : 'outline'}
                  onClick={() => {
                    setMultiSelectMode(!multiSelectMode)
                    if (multiSelectMode) {
                      setSelectedEvents(new Set())
                    }
                  }}
                >
                  {multiSelectMode ? `Selected: ${selectedEvents.size}` : 'Multi-Select Mode'}
                </Button>
                {multiSelectMode && selectedEvents.size > 0 && (
                  <Button
                    variant="outline"
                    className="bg-green-50 hover:bg-green-100 text-green-700"
                    onClick={handleBulkReschedule}
                  >
                    Reschedule Selected
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                  onClick={handleAutoSchedule}
                  disabled={autoScheduling}
                >
                  {autoScheduling ? 'Scheduling...' : 'Auto-Schedule'}
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Building</Label>
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    {buildings.map(building => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Risk State</Label>
                <Select value={selectedRiskState} onValueChange={setSelectedRiskState}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="requires-attention">Requires Attention</SelectItem>
                    <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Inspector</Label>
                <Select value={selectedInspector} onValueChange={setSelectedInspector}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Inspectors</SelectItem>
                    {inspectors.map(inspector => (
                      <SelectItem key={inspector.email} value={inspector.email}>
                        {inspector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <Badge className="bg-green-600 text-white">✓ Compliant</Badge>
              <Badge className="bg-amber-600 text-white">⚠ Requires Attention</Badge>
              <Badge className="bg-red-600 text-white">✗ Non-Compliant</Badge>
              <Badge className="bg-purple-600 text-white">◷ Pending</Badge>
              <Badge className="bg-blue-600 text-white">! Overdue</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              events={calendarEvents}
              onSelectEvent={(event) => {
                if (multiSelectMode) {
                  toggleEventSelection(event.id)
                } else if (event.resource?.doorId) {
                  router.push(`/doors/${event.resource.doorId}`)
                }
              }}
              selectedEvents={selectedEvents}
              multiSelectMode={multiSelectMode}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
