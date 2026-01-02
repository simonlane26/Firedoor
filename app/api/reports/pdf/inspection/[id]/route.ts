import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { generateInspectionCertificate } from '@/lib/pdf-reports'

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
    const inspection = await prisma.inspection.findUnique({
      where: { id },
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
    })

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    // Verify tenant access
    if (inspection.tenantId !== user.tenant.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const pdfBuffer = await generateInspectionCertificate({
      id: inspection.id,
      inspectionDate: inspection.inspectionDate,
      status: inspection.status,
      overallResult: inspection.overallResult,
      door: {
        doorNumber: inspection.fireDoor.doorNumber,
        location: inspection.fireDoor.location,
        fireRating: inspection.fireDoor.fireRating,
        doorType: inspection.fireDoor.doorType,
        building: {
          name: inspection.fireDoor.building.name,
          address: inspection.fireDoor.building.address,
        },
      },
      inspector: {
        name: inspection.inspector.name || 'Unknown',
        email: inspection.inspector.email || '',
      },
      tenantLogoUrl: user.tenant.logoUrl,
      tenantBranding: {
        primaryColor: user.tenant.primaryColor,
        secondaryColor: user.tenant.secondaryColor,
        accentColor: user.tenant.accentColor,
        textColor: user.tenant.textColor,
      },
      doorConstruction: inspection.doorConstruction,
      certificationProvided: inspection.certificationProvided,
      damageOrDefects: inspection.damageOrDefects,
      damageDescription: inspection.damageDescription,
      doorLeafFrameOk: inspection.doorLeafFrameOk,
      doorClosesCompletely: inspection.doorClosesCompletely,
      doorClosesFromAnyAngle: inspection.doorClosesFromAnyAngle,
      doorOpensInDirectionOfTravel: inspection.doorOpensInDirectionOfTravel,
      frameGapsAcceptable: inspection.frameGapsAcceptable,
      maxGapSize: inspection.maxGapSize,
      hingesSecure: inspection.hingesSecure,
      hingesCEMarked: inspection.hingesCEMarked,
      hingesGoodCondition: inspection.hingesGoodCondition,
      screwsInPlaceAndSecure: inspection.screwsInPlaceAndSecure,
      minimumHingesPresent: inspection.minimumHingesPresent,
      intumescentStripsIntact: inspection.intumescentStripsIntact,
      smokeSealsIntact: inspection.smokeSealsIntact,
      letterboxClosesProperly: inspection.letterboxClosesProperly,
      glazingIntact: inspection.glazingIntact,
      airTransferGrilleIntact: inspection.airTransferGrilleIntact,
      actionRequired: inspection.actionRequired,
      actionDescription: inspection.actionDescription,
      inspectorNotes: inspection.inspectorNotes,
    })

    const filename = `inspection-${inspection.fireDoor.doorNumber}-${inspection.inspectionDate.toISOString().split('T')[0]}.pdf`

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
