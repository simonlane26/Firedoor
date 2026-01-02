import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { exportBuildingsToCSV, BuildingExportData } from '@/lib/csv-export'

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
    const buildings = await prisma.building.findMany({
      where: { tenantId: user.tenant.id },
      include: {
        fireDoors: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const exportData: BuildingExportData[] = buildings.map((building) => ({
      name: building.name,
      address: building.address,
      postcode: building.postcode,
      buildingType: building.buildingType,
      numberOfStoreys: building.numberOfStoreys,
      contactName: building.contactName,
      contactEmail: building.contactEmail,
      contactPhone: building.contactPhone,
      totalDoors: building.fireDoors.length,
      createdAt: building.createdAt.toISOString().split('T')[0],
    }))

    const csv = exportBuildingsToCSV(exportData)
    const filename = `buildings-export-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting buildings:', error)
    return NextResponse.json(
      { error: 'Failed to export buildings' },
      { status: 500 }
    )
  }
}
