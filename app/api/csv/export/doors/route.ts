import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { exportFireDoorsToCSV, FireDoorExportData } from '@/lib/csv-export'

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
    const doors = await prisma.fireDoor.findMany({
      where: { tenantId: user.tenant.id },
      include: {
        building: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const exportData: FireDoorExportData[] = doors.map((door) => {
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
        buildingName: door.building.name,
        fireRating: door.fireRating,
        doorType: door.doorType,
        manufacturer: door.manufacturer,
        installationDate: door.installationDate ? door.installationDate.toISOString().split('T')[0] : null,
        lastInspectionDate: lastInspection ? lastInspection.inspectionDate.toISOString().split('T')[0] : null,
        lastInspectionResult: lastInspection?.overallResult || null,
        nextInspectionDate: door.nextInspectionDate ? door.nextInspectionDate.toISOString().split('T')[0] : null,
        status,
        notes: door.notes,
      }
    })

    const csv = exportFireDoorsToCSV(exportData)
    const filename = `fire-doors-export-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting fire doors:', error)
    return NextResponse.json(
      { error: 'Failed to export fire doors' },
      { status: 500 }
    )
  }
}
