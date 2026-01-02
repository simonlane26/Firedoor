import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { exportInspectionsToCSV, InspectionExportData } from '@/lib/csv-export'

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
          },
        },
      },
      orderBy: { inspectionDate: 'desc' },
    })

    const exportData: InspectionExportData[] = inspections.map((inspection) => ({
      inspectionDate: inspection.inspectionDate.toISOString().split('T')[0],
      doorNumber: inspection.fireDoor.doorNumber,
      location: inspection.fireDoor.location,
      buildingName: inspection.fireDoor.building.name,
      fireRating: inspection.fireDoor.fireRating,
      inspector: inspection.inspector.name || 'Unknown',
      status: inspection.status,
      overallResult: inspection.overallResult,
      doorConstruction: inspection.doorConstruction,
      certificationProvided: inspection.certificationProvided ? 'YES' : 'NO',
      damageOrDefects: inspection.damageOrDefects ? 'YES' : 'NO',
      doorClosesCompletely: inspection.doorClosesCompletely ? 'YES' : 'NO',
      frameGapsAcceptable: inspection.frameGapsAcceptable ? 'YES' : 'NO',
      hingesSecure: inspection.hingesSecure ? 'YES' : 'NO',
      actionRequired: inspection.actionRequired ? 'YES' : 'NO',
      actionDescription: inspection.actionDescription,
    }))

    const csv = exportInspectionsToCSV(exportData)
    const filename = `inspections-export-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting inspections:', error)
    return NextResponse.json(
      { error: 'Failed to export inspections' },
      { status: 500 }
    )
  }
}
