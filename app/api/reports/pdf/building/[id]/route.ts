import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { generateBuildingReport } from '@/lib/pdf-reports'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const { id } = await params

    const building = await prisma.building.findUnique({
      where: { id },
      include: {
        fireDoors: {
          include: {
            inspections: {
              orderBy: { inspectionDate: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 })
    }

    // Verify tenant access
    if (building.tenantId !== user.tenant.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Calculate statistics
    const totalDoors = building.fireDoors.length
    const passCount = building.fireDoors.filter(
      (door) => door.inspections[0]?.overallResult === 'PASS'
    ).length
    const failCount = building.fireDoors.filter(
      (door) => door.inspections[0]?.overallResult === 'FAIL'
    ).length
    const pendingCount = building.fireDoors.filter(
      (door) => !door.inspections[0] || door.inspections[0].status === 'PENDING'
    ).length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdueCount = building.fireDoors.filter((door) => {
      if (!door.nextInspectionDate) return false
      return new Date(door.nextInspectionDate) < today
    }).length

    const pdfBuffer = await generateBuildingReport({
      building: {
        name: building.name,
        address: building.address,
        postcode: building.postcode,
        buildingType: building.buildingType,
        numberOfStoreys: building.numberOfStoreys || 0,
      },
      doors: building.fireDoors.map((door) => ({
        doorNumber: door.doorNumber,
        location: door.location,
        fireRating: door.fireRating,
        doorType: door.doorType,
        lastInspection: door.inspections[0]
          ? {
              inspectionDate: door.inspections[0].inspectionDate,
              status: door.inspections[0].status,
              overallResult: door.inspections[0].overallResult,
            }
          : null,
        nextInspectionDate: door.nextInspectionDate,
      })),
      stats: {
        totalDoors,
        passCount,
        failCount,
        pendingCount,
        overdueCount,
      },
      tenantLogoUrl: user.tenant.logoUrl,
      tenantBranding: {
        primaryColor: user.tenant.primaryColor,
        secondaryColor: user.tenant.secondaryColor,
        accentColor: user.tenant.accentColor,
        textColor: user.tenant.textColor,
      },
    })

    const filename = `building-report-${building.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating building PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
