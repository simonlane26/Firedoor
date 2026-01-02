import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')

    // Get all doors for this tenant
    const doors = await prisma.fireDoor.findMany({
      where: { tenantId: user.tenant.id },
      include: {
        building: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1,
        },
      },
    })

    // Get all inspections for this tenant
    const inspections = await prisma.inspection.findMany({
      where: { tenantId: user.tenant.id },
      include: {
        fireDoor: {
          include: {
            building: true,
          },
        },
        inspector: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { inspectionDate: 'desc' },
    })

    // Calculate statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const totalDoors = doors.length
    const passCount = inspections.filter((i) => i.overallResult === 'PASS').length
    const failCount = inspections.filter((i) => i.overallResult === 'FAIL').length
    const pendingCount = inspections.filter((i) => i.status === 'PENDING').length

    const overdueCount = doors.filter((door) => {
      if (!door.nextInspectionDate) return false
      return new Date(door.nextInspectionDate) < today
    }).length

    const complianceRate = totalDoors > 0 ? (passCount / totalDoors) * 100 : 0

    // Inspections by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentInspections = inspections.filter(
      (i) => new Date(i.inspectionDate) >= sixMonthsAgo
    )

    const inspectionsByMonth = new Map<string, { pass: number; fail: number }>()

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      inspectionsByMonth.set(key, { pass: 0, fail: 0 })
    }

    recentInspections.forEach((inspection) => {
      const date = new Date(inspection.inspectionDate)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (inspectionsByMonth.has(key)) {
        const stats = inspectionsByMonth.get(key)!
        if (inspection.overallResult === 'PASS') {
          stats.pass++
        } else if (inspection.overallResult === 'FAIL') {
          stats.fail++
        }
      }
    })

    const chartData = Array.from(inspectionsByMonth.entries()).map(([month, stats]) => ({
      month,
      pass: stats.pass,
      fail: stats.fail,
    }))

    // Doors by type
    const doorsByType = doors.reduce((acc, door) => {
      const type = door.doorType
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Doors by status
    const doorsByStatus = {
      compliant: doors.filter((door) => {
        const lastInspection = door.inspections[0]
        return lastInspection?.overallResult === 'PASS'
      }).length,
      failed: doors.filter((door) => {
        const lastInspection = door.inspections[0]
        return lastInspection?.overallResult === 'FAIL'
      }).length,
      pending: doors.filter((door) => {
        const lastInspection = door.inspections[0]
        return !lastInspection || lastInspection.status === 'PENDING'
      }).length,
      overdue: overdueCount,
    }

    // Calculate trend (comparing this month vs last month)
    const thisMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const lastMonthDate = new Date()
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

    const thisMonthData = inspectionsByMonth.get(thisMonthKey) || { pass: 0, fail: 0 }
    const lastMonthData = inspectionsByMonth.get(lastMonthKey) || { pass: 0, fail: 0 }

    const thisMonthTotal = thisMonthData.pass + thisMonthData.fail
    const lastMonthTotal = lastMonthData.pass + lastMonthData.fail
    const thisMonthPassRate = thisMonthTotal > 0 ? (thisMonthData.pass / thisMonthTotal) * 100 : 0
    const lastMonthPassRate = lastMonthTotal > 0 ? (lastMonthData.pass / lastMonthTotal) * 100 : 0

    const trend = thisMonthPassRate > lastMonthPassRate ? 'improving' :
                  thisMonthPassRate < lastMonthPassRate ? 'declining' : 'stable'
    const trendPercentage = Math.abs(thisMonthPassRate - lastMonthPassRate).toFixed(1)

    // Top 5 recurring faults
    const faultCounts: Record<string, number> = {}
    inspections.forEach((inspection) => {
      if (inspection.actionDescription) {
        const faults = inspection.actionDescription.split(',').map(f => f.trim())
        faults.forEach(fault => {
          if (fault) {
            faultCounts[fault] = (faultCounts[fault] || 0) + 1
          }
        })
      }
    })

    const topFaults = Object.entries(faultCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([fault, count]) => ({ fault, count }))

    // Worst performing building
    const buildingStats = new Map<string, { name: string; total: number; failed: number }>()
    doors.forEach((door) => {
      const buildingId = door.building.id
      if (!buildingStats.has(buildingId)) {
        buildingStats.set(buildingId, { name: door.building.name, total: 0, failed: 0 })
      }
      const stats = buildingStats.get(buildingId)!
      stats.total++
      const lastInspection = door.inspections[0]
      if (lastInspection?.overallResult === 'FAIL') {
        stats.failed++
      }
    })

    let worstBuilding = null
    let worstFailureRate = 0
    buildingStats.forEach((stats) => {
      if (stats.total > 0) {
        const failureRate = (stats.failed / stats.total) * 100
        if (failureRate > worstFailureRate) {
          worstFailureRate = failureRate
          worstBuilding = {
            name: stats.name,
            failureRate: parseFloat(failureRate.toFixed(1)),
            failedDoors: stats.failed,
            totalDoors: stats.total
          }
        }
      }
    })

    // Doors closest to failure threshold
    const criticalDoors = doors
      .map((door) => {
        const lastInspection = door.inspections[0]
        let riskScore = 0

        // Higher score = higher risk
        if (lastInspection?.overallResult === 'REQUIRES_ATTENTION') riskScore += 50
        if (lastInspection?.overallResult === 'FAIL') riskScore += 100
        if (!lastInspection) riskScore += 30

        // Check if overdue
        if (door.nextInspectionDate && new Date(door.nextInspectionDate) < today) {
          const daysOverdue = Math.floor((today.getTime() - new Date(door.nextInspectionDate).getTime()) / (1000 * 60 * 60 * 24))
          riskScore += Math.min(daysOverdue, 50) // Cap at 50 points for overdue
        }

        return {
          doorNumber: door.doorNumber,
          location: door.location,
          buildingName: door.building.name,
          status: lastInspection?.overallResult || 'NOT_INSPECTED',
          riskScore,
          nextInspectionDate: door.nextInspectionDate
        }
      })
      .filter((door) => door.riskScore > 0)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10)

    return NextResponse.json({
      stats: {
        totalDoors,
        passCount,
        failCount,
        pendingCount,
        overdueCount,
        complianceRate: parseFloat(complianceRate.toFixed(1)),
      },
      trend: {
        direction: trend,
        percentage: parseFloat(trendPercentage),
        thisMonthPassRate: parseFloat(thisMonthPassRate.toFixed(1)),
        lastMonthPassRate: parseFloat(lastMonthPassRate.toFixed(1))
      },
      topFaults,
      worstBuilding,
      criticalDoors,
      chartData,
      doorsByType,
      doorsByStatus,
      recentInspections: recentInspections.slice(0, 10).map((i) => ({
        id: i.id,
        date: i.inspectionDate,
        doorNumber: i.fireDoor.doorNumber,
        building: i.fireDoor.building.name,
        result: i.overallResult,
        inspector: i.inspector.name,
      })),
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
