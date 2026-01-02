import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { generateSummaryExcel } from '@/lib/excel-reports'

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
    // Get all doors with their latest inspection
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

    // Get all inspections for statistics
    const inspections = await prisma.inspection.findMany({
      where: { tenantId: user.tenant.id },
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

    // Prepare door data with status
    const doorData = doors.map((door) => {
      const lastInspection = door.inspections[0]
      let status = 'Pending'

      if (door.nextInspectionDate && new Date(door.nextInspectionDate) < today) {
        status = 'Overdue'
      } else if (lastInspection?.overallResult === 'PASS') {
        status = 'Compliant'
      } else if (lastInspection?.overallResult === 'FAIL') {
        status = 'Failed'
      }

      return {
        doorNumber: door.doorNumber,
        location: door.location,
        fireRating: door.fireRating,
        doorType: door.doorType,
        building: door.building.name,
        lastInspectionDate: lastInspection?.inspectionDate || null,
        lastInspectionResult: lastInspection?.overallResult || null,
        nextInspectionDate: door.nextInspectionDate,
        status,
      }
    })

    const excelBuffer = await generateSummaryExcel({
      doors: doorData,
      stats: {
        totalDoors,
        passCount,
        failCount,
        pendingCount,
        overdueCount,
        complianceRate: parseFloat(complianceRate.toFixed(1)),
      },
    })

    const filename = `summary-report-${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(excelBuffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating summary Excel:', error)
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    )
  }
}
