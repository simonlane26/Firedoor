'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DoorOpen,
  BarChart3,
  AlertOctagon,
  Building2,
  Shield,
  FileCheck,
  TrendingUpIcon
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface ReportStats {
  totalDoors: number
  passCount: number
  failCount: number
  pendingCount: number
  overdueCount: number
  complianceRate: number
}

interface ChartDataPoint {
  month: string
  pass: number
  fail: number
}

interface DoorTypeData {
  name: string
  value: number
  [key: string]: string | number
}

interface DoorStatusData {
  compliant: number
  failed: number
  pending: number
  overdue: number
}

interface RecentInspection {
  id: string
  date: Date
  doorNumber: string
  building: string
  result: string | null
  inspector: string
}

interface Trend {
  direction: 'improving' | 'declining' | 'stable'
  percentage: number
  thisMonthPassRate: number
  lastMonthPassRate: number
}

interface Fault {
  fault: string
  count: number
}

interface WorstBuilding {
  name: string
  failureRate: number
  failedDoors: number
  totalDoors: number
}

interface CriticalDoor {
  doorNumber: string
  location: string
  buildingName: string
  status: string
  riskScore: number
  nextInspectionDate: string | null
}

interface ReportData {
  stats: ReportStats
  trend: Trend
  topFaults: Fault[]
  worstBuilding: WorstBuilding | null
  criticalDoors: CriticalDoor[]
  chartData: ChartDataPoint[]
  doorsByType: Record<string, number>
  doorsByStatus: DoorStatusData
  recentInspections: RecentInspection[]
}

const COLORS = {
  pass: '#16a34a',
  fail: '#dc2626',
  pending: '#f59e0b',
  overdue: '#dc2626',
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ReportsPage() {
  const { data: session } = useSession()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/reports')
      if (!response.ok) throw new Error('Failed to fetch report data')
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadExcel = async (type: 'inspections' | 'summary') => {
    try {
      setDownloading(type)
      const response = await fetch(`/api/reports/excel/${type}`)

      if (!response.ok) throw new Error('Failed to download Excel')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading Excel:', error)
      alert('Failed to download Excel file')
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setDownloading('pdf')
      const response = await fetch('/api/reports/pdf')

      if (!response.ok) throw new Error('Failed to download PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fire-door-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF report')
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadRiskTrendReport = async () => {
    try {
      setDownloading('risk-trend')
      const response = await fetch('/api/reports/risk-trend')

      if (!response.ok) throw new Error('Failed to download Risk Trend Report')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `risk-trend-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading Risk Trend Report:', error)
      alert('Failed to download Risk Trend Report')
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadExecutiveSummary = async () => {
    try {
      setDownloading('executive')
      const response = await fetch('/api/reports/executive-summary')

      if (!response.ok) throw new Error('Failed to download Executive Summary')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `executive-summary-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading Executive Summary:', error)
      alert('Failed to download Executive Summary')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading reports...</div>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Failed to load report data</div>
        </div>
      </div>
    )
  }

  const doorTypeData: DoorTypeData[] = Object.entries(reportData.doorsByType).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }))

  const statusData = [
    { name: 'Compliant', value: reportData.doorsByStatus.compliant, color: COLORS.pass },
    { name: 'Failed', value: reportData.doorsByStatus.failed, color: COLORS.fail },
    { name: 'Pending', value: reportData.doorsByStatus.pending, color: COLORS.pending },
    { name: 'Overdue', value: reportData.doorsByStatus.overdue, color: COLORS.overdue },
  ]

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
            <span className="text-sm text-slate-600">{session?.user.name}</span>
            <Badge variant="outline">{session?.user.role}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
            <p className="text-slate-600 mt-2">Fire door inspection compliance reports</p>
          </div>
        <div className="flex gap-3">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading === 'pdf'}
            className="bg-red-600 hover:bg-red-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            {downloading === 'pdf' ? 'Generating...' : 'Export PDF Report'}
          </Button>
          <Button
            onClick={() => handleDownloadExcel('inspections')}
            disabled={downloading === 'inspections'}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading === 'inspections' ? 'Downloading...' : 'Export Inspections'}
          </Button>
          <Button
            onClick={() => handleDownloadExcel('summary')}
            disabled={downloading === 'summary'}
            variant="outline"
          >
            <FileText className="mr-2 h-4 w-4" />
            {downloading === 'summary' ? 'Downloading...' : 'Export Summary'}
          </Button>
        </div>
      </div>

      {/* Safety Case Support Reports Section */}
      <div className="mb-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <Shield className="h-6 w-6" />
                  Safety Case Support Reports
                </CardTitle>
                <CardDescription className="text-red-800 mt-2">
                  Regulatory compliance documentation aligned with Fire Safety (England) Regulations 2022
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Risk Trend Report */}
              <Card className="border-red-300 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-red-700" />
                    Risk Trend Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 mb-4">
                    6-month compliance trend analysis showing improvement or deterioration in fire door safety across your portfolio.
                  </p>
                  <Button
                    onClick={handleDownloadRiskTrendReport}
                    variant="outline"
                    size="sm"
                    className="w-full border-red-600 text-red-700 hover:bg-red-100"
                    disabled={downloading === 'risk-trend'}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {downloading === 'risk-trend' ? 'Generating...' : 'Generate Report'}
                  </Button>
                  <div className="mt-3 pt-3 border-t text-xs text-slate-600">
                    <strong>Includes:</strong> Compliance trends, failure patterns, remedial action tracking
                  </div>
                </CardContent>
              </Card>

              {/* Asset Assurance Pack */}
              <Card className="border-red-300 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-red-700" />
                    Asset Assurance Pack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 mb-4">
                    Complete asset register with inspection history, evidence records, and certification documents for all fire doors.
                  </p>
                  <Button
                    onClick={() => handleDownloadExcel('summary')}
                    variant="outline"
                    size="sm"
                    className="w-full border-red-600 text-red-700 hover:bg-red-100"
                    disabled={downloading === 'summary'}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloading === 'summary' ? 'Downloading...' : 'Export Pack'}
                  </Button>
                  <div className="mt-3 pt-3 border-t text-xs text-slate-600">
                    <strong>Includes:</strong> Asset register, inspection records, evidence log, QR codes
                  </div>
                </CardContent>
              </Card>

              {/* Executive Compliance Summary */}
              <Card className="border-red-300 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-red-700" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 mb-4">
                    High-level overview of fire safety compliance status, key risks, and recommendations for stakeholders and regulators.
                  </p>
                  <Button
                    onClick={handleDownloadExecutiveSummary}
                    variant="outline"
                    size="sm"
                    className="w-full border-red-600 text-red-700 hover:bg-red-100"
                    disabled={downloading === 'executive'}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {downloading === 'executive' ? 'Generating...' : 'Generate Summary'}
                  </Button>
                  <div className="mt-3 pt-3 border-t text-xs text-slate-600">
                    <strong>Includes:</strong> KPIs, critical defects, regulatory status, action plans
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-red-700 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 text-sm">Regulatory Compliance Notice</h4>
                  <p className="text-xs text-slate-700 mt-1">
                    These reports are designed to support compliance with Fire Safety (England) Regulations 2022 and the Building Safety Act 2022.
                    All data is immutable and audit-trailed to provide evidence of ongoing control and due diligence.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Doors</CardTitle>
            <DoorOpen className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportData.stats.totalDoors}</div>
            <p className="text-xs text-gray-500 mt-1">Fire doors registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Compliance Rate</CardTitle>
            {reportData.trend.direction === 'improving' && <TrendingUp className="h-5 w-5 text-green-600" />}
            {reportData.trend.direction === 'declining' && <TrendingDown className="h-5 w-5 text-red-600" />}
            {reportData.trend.direction === 'stable' && <Minus className="h-5 w-5 text-gray-600" />}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {reportData.stats.complianceRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {reportData.trend.direction === 'improving' && `↑ ${reportData.trend.percentage}% vs last month`}
              {reportData.trend.direction === 'declining' && `↓ ${reportData.trend.percentage}% vs last month`}
              {reportData.trend.direction === 'stable' && 'No change vs last month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Passed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{reportData.stats.passCount}</div>
            <p className="text-xs text-gray-500 mt-1">Compliant doors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{reportData.stats.overdueCount}</div>
            <p className="text-xs text-gray-500 mt-1">Require immediate action</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Inspections by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Inspections by Month
            </CardTitle>
            <CardDescription>Last 6 months inspection results</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pass" fill={COLORS.pass} name="Passed" />
                <Bar dataKey="fail" fill={COLORS.fail} name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Doors by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />
              Doors by Type
            </CardTitle>
            <CardDescription>Distribution of door types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={doorTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {doorTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Door Status Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Door Status Overview</CardTitle>
          <CardDescription>Current status of all fire doors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusData.map((status) => (
              <div
                key={status.name}
                className="flex flex-col items-center p-4 border rounded-lg"
                style={{ borderColor: status.color }}
              >
                <div className="text-2xl font-bold" style={{ color: status.color }}>
                  {status.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{status.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Row - Top Faults and Worst Building */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top 5 Recurring Faults */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Top 5 Recurring Faults
            </CardTitle>
            <CardDescription>Most common issues found during inspections</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData.topFaults.length > 0 ? (
              <div className="space-y-3">
                {reportData.topFaults.map((fault, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700">{fault.fault}</span>
                    </div>
                    <Badge variant="secondary">{fault.count} occurrence{fault.count !== 1 ? 's' : ''}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No fault data available</p>
            )}
          </CardContent>
        </Card>

        {/* Worst Performing Building */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-red-600" />
              Worst Performing Building
            </CardTitle>
            <CardDescription>Building requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData.worstBuilding ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{reportData.worstBuilding.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="text-3xl font-bold text-red-600">
                      {reportData.worstBuilding.failureRate}%
                    </div>
                    <span className="text-sm text-gray-500">failure rate</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Failed Doors</p>
                    <p className="text-2xl font-semibold text-red-600">{reportData.worstBuilding.failedDoors}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Doors</p>
                    <p className="text-2xl font-semibold text-gray-700">{reportData.worstBuilding.totalDoors}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No failure data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Critical Doors */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-600" />
            Doors Closest to Failure Threshold
          </CardTitle>
          <CardDescription>High-risk doors requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {reportData.criticalDoors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Door</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Building</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Risk Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Next Inspection</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.criticalDoors.map((door, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{door.doorNumber}</td>
                      <td className="py-3 px-4 text-sm">{door.location}</td>
                      <td className="py-3 px-4 text-sm">{door.buildingName}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            door.status === 'FAIL' ? 'destructive' :
                            door.status === 'REQUIRES_ATTENTION' ? 'secondary' :
                            'outline'
                          }
                          className="text-xs"
                        >
                          {door.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden"
                          >
                            <div
                              className="h-full bg-red-600"
                              style={{ width: `${Math.min(door.riskScore, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-red-600">{door.riskScore}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {door.nextInspectionDate
                          ? new Date(door.nextInspectionDate).toLocaleDateString('en-GB')
                          : 'Not scheduled'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No critical doors identified</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Inspections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Inspections
          </CardTitle>
          <CardDescription>Latest 10 inspection records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Door</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Building</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Inspector</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Result</th>
                </tr>
              </thead>
              <tbody>
                {reportData.recentInspections.map((inspection) => (
                  <tr key={inspection.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">
                      {new Date(inspection.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{inspection.doorNumber}</td>
                    <td className="py-3 px-4 text-sm">{inspection.building}</td>
                    <td className="py-3 px-4 text-sm">{inspection.inspector}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inspection.result === 'PASS'
                            ? 'bg-green-100 text-green-800'
                            : inspection.result === 'FAIL'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {inspection.result || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
