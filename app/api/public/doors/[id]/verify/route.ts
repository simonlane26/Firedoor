import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doorId } = await params

    // Fetch door with its building and latest inspection
    const door = await prisma.fireDoor.findUnique({
      where: { id: doorId },
      include: {
        building: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 5, // Show last 5 inspections
        },
      },
    })

    if (!door) {
      return NextResponse.json(
        { error: 'Door not found' },
        { status: 404 }
      )
    }

    // Get the latest inspection
    const latestInspection = door.inspections[0]

    // Prepare safe-to-share information
    const safeData = {
      door: {
        id: door.id,
        doorNumber: door.doorNumber,
        location: door.location,
        fireRating: door.fireRating,
        building: {
          name: door.building.name,
          address: door.building.address,
        },
      },
      latestInspection: latestInspection
        ? {
            id: latestInspection.id,
            inspectionDate: latestInspection.inspectionDate,
            status: latestInspection.status,
            actionRequired: latestInspection.actionRequired,
            actionDescription: latestInspection.actionDescription,
            nextInspectionDate: latestInspection.nextInspectionDate,
          }
        : null,
      inspectionHistory: door.inspections.map((inspection) => ({
        id: inspection.id,
        inspectionDate: inspection.inspectionDate,
        status: inspection.status,
        actionRequired: inspection.actionRequired,
      })),
      complianceStatus: latestInspection
        ? {
            isCompliant: latestInspection.overallResult === 'PASS',
            requiresAction: latestInspection.actionRequired,
            lastInspected: latestInspection.inspectionDate,
            nextInspectionDue: latestInspection.nextInspectionDate,
          }
        : {
            isCompliant: false,
            requiresAction: true,
            message: 'No inspections recorded',
          },
    }

    return NextResponse.json(safeData)
  } catch (error) {
    console.error('Error fetching door verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
