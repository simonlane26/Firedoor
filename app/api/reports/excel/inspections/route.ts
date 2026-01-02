import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { generateInspectionsExcel } from '@/lib/excel-reports'

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
            email: true,
          },
        },
      },
      orderBy: { inspectionDate: 'desc' },
    })

    const excelBuffer = await generateInspectionsExcel(
      inspections.map((inspection) => ({
        id: inspection.id,
        inspectionDate: inspection.inspectionDate,
        status: inspection.status,
        overallResult: inspection.overallResult,
        doorNumber: inspection.fireDoor.doorNumber,
        location: inspection.fireDoor.location,
        fireRating: inspection.fireDoor.fireRating,
        doorType: inspection.fireDoor.doorType,
        building: inspection.fireDoor.building.name,
        buildingAddress: inspection.fireDoor.building.address,
        inspector: inspection.inspector.name || 'Unknown',
        doorConstruction: inspection.doorConstruction,
        certificationProvided: inspection.certificationProvided,
        damageOrDefects: inspection.damageOrDefects,
        doorClosesCompletely: inspection.doorClosesCompletely,
        frameGapsAcceptable: inspection.frameGapsAcceptable,
        hingesSecure: inspection.hingesSecure,
        actionRequired: inspection.actionRequired,
        actionDescription: inspection.actionDescription,
      }))
    )

    const filename = `inspections-${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(excelBuffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating Excel:', error)
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    )
  }
}
