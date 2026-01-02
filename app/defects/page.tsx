'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  Building2,
  DoorClosed,
  User,
  Calendar
} from 'lucide-react'

interface Defect {
  id: string
  ticketNumber: string
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR'
  status: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  description: string
  detectedDate: string
  targetCompletionDate?: string
  door: {
    doorNumber: string
    location: string
    building: {
      name: string
    }
  }
  inspection: {
    inspectionDate: string
    inspector: {
      name: string
    }
  }
  assignedContractor?: {
    id: string
    companyName: string
    contactName: string
  }
}

const severityColors = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  MAJOR: 'bg-orange-100 text-orange-800 border-orange-300',
  MINOR: 'bg-yellow-100 text-yellow-800 border-yellow-300'
}

const priorityColors = {
  URGENT: 'destructive',
  HIGH: 'destructive',
  MEDIUM: 'default',
  LOW: 'secondary'
}

const statusColors = {
  OPEN: 'bg-slate-100 text-slate-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  AWAITING_PARTS: 'bg-purple-100 text-purple-800',
  REPAIR_COMPLETED: 'bg-green-100 text-green-800',
  REINSPECTION_PASSED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default function DefectsPage() {
  const { data: session } = useSession()
  const [defects, setDefects] = useState<Defect[]>([])
  const [filteredDefects, setFilteredDefects] = useState<Defect[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('active')

  useEffect(() => {
    fetchDefects()
  }, [])

  useEffect(() => {
    filterDefects()
  }, [defects, searchQuery, selectedSeverity, selectedPriority, selectedStatus])

  const fetchDefects = async () => {
    try {
      const response = await fetch('/api/defects')
      if (response.ok) {
        const data = await response.json()
        setDefects(data)
      }
    } catch (error) {
      console.error('Error fetching defects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDefects = () => {
    let filtered = defects

    // Filter by status tab
    if (selectedStatus === 'active') {
      filtered = filtered.filter(d =>
        !['CLOSED', 'CANCELLED', 'REINSPECTION_PASSED'].includes(d.status)
      )
    } else if (selectedStatus === 'completed') {
      filtered = filtered.filter(d =>
        ['REPAIR_COMPLETED', 'REINSPECTION_PASSED', 'CLOSED'].includes(d.status)
      )
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(d => d.severity === selectedSeverity)
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(d => d.priority === selectedPriority)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(d =>
        d.ticketNumber.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.door.doorNumber.toLowerCase().includes(query) ||
        d.door.building.name.toLowerCase().includes(query) ||
        d.category.toLowerCase().includes(query)
      )
    }

    setFilteredDefects(filtered)
  }

  const getStats = () => {
    const active = defects.filter(d =>
      !['CLOSED', 'CANCELLED', 'REINSPECTION_PASSED'].includes(d.status)
    ).length
    const critical = defects.filter(d =>
      d.severity === 'CRITICAL' && !['CLOSED', 'CANCELLED'].includes(d.status)
    ).length
    const urgent = defects.filter(d =>
      d.priority === 'URGENT' && !['CLOSED', 'CANCELLED'].includes(d.status)
    ).length

    return { active, critical, urgent }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading defects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
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
            <div className="h-6 w-px bg-slate-300"></div>
            <h1 className="text-2xl font-bold text-slate-900">Defect Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session?.user.name}</span>
            <Badge variant="outline">{session?.user.role}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Defects</CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.active}</div>
              <p className="text-xs text-slate-500 mt-1">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Critical Defects</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
              <p className="text-xs text-slate-500 mt-1">High severity issues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Urgent Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.urgent}</div>
              <p className="text-xs text-slate-500 mt-1">Immediate action needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by ticket number, description, door, building..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="MAJOR">Major</SelectItem>
                  <SelectItem value="MINOR">Minor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Defects Tabs */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Defects ({defects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus}>
            {filteredDefects.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No defects found</p>
                  {searchQuery && (
                    <p className="text-sm text-slate-500 mt-2">Try adjusting your search or filters</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredDefects.map((defect) => (
                  <Link key={defect.id} href={`/defects/${defect.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className={`px-3 py-1 rounded-md text-sm font-medium ${severityColors[defect.severity]}`}>
                                {defect.severity}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-slate-900">
                                  {defect.ticketNumber}
                                </h3>
                                <p className="text-sm text-slate-600 mt-1">{defect.description}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Building2 className="h-4 w-4" />
                                <span>{defect.door.building.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <DoorClosed className="h-4 w-4" />
                                <span>Door {defect.door.doorNumber} - {defect.door.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <User className="h-4 w-4" />
                                <span>Detected by {defect.inspection.inspector.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(defect.detectedDate).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {defect.assignedContractor && (
                              <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="bg-blue-50">
                                  Assigned to: {defect.assignedContractor.companyName}
                                </Badge>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={priorityColors[defect.priority] as any}>
                              {defect.priority} Priority
                            </Badge>
                            <Badge className={statusColors[defect.status as keyof typeof statusColors]}>
                              {defect.status.replace(/_/g, ' ')}
                            </Badge>
                            {defect.targetCompletionDate && (
                              <p className="text-xs text-slate-500">
                                Due: {new Date(defect.targetCompletionDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
