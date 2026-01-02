import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserWithTenant } from '@/lib/tenant'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    // Get all fire doors for this tenant
    const fireDoors = await prisma.fireDoor.findMany({
      where: {
        building: {
          tenantId: user.tenant.id,
          managerId: session.user.id
        }
      },
      include: {
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1
        },
        building: true
      }
    })

    const today = new Date()
    const scheduledInspections = []

    for (const door of fireDoors) {
      const latestInspection = door.inspections[0]

      // Skip if door has never been inspected
      if (!latestInspection) {
        continue
      }

      // Calculate when next inspection should be
      let monthsToAdd = 12
      if (door.doorType === 'FLAT_ENTRANCE') {
        monthsToAdd = 12
      } else if (door.building.topStoreyHeight && door.building.topStoreyHeight > 11) {
        monthsToAdd = 3
      }

      const nextDueDate = new Date(latestInspection.inspectionDate)
      nextDueDate.setMonth(nextDueDate.getMonth() + monthsToAdd)

      // If inspection is overdue or due soon (within next 30 days) and not already scheduled
      const thirtyDaysFromNow = new Date(today)
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      if (nextDueDate <= thirtyDaysFromNow) {
        // Check if there's already a pending inspection
        const existingPending = await prisma.inspection.findFirst({
          where: {
            fireDoorId: door.id,
            status: 'PENDING',
            inspectionDate: {
              gte: today
            }
          }
        })

        if (!existingPending) {
          // Create a pending inspection scheduled for the next due date
          const scheduledDate = nextDueDate > today ? nextDueDate : today

          const inspection = await prisma.inspection.create({
            data: {
              fireDoorId: door.id,
              inspectorId: session.user.id,
              tenantId: user.tenant.id,
              inspectionDate: scheduledDate,
              inspectionType: door.doorType === 'FLAT_ENTRANCE' ? 'TWELVE_MONTH' :
                            (door.building.topStoreyHeight && door.building.topStoreyHeight > 11 ? 'THREE_MONTH' : 'TWELVE_MONTH'),
              status: 'PENDING',
              damageOrDefects: false,
              doorClosesCompletely: false,
              doorClosesFromAnyAngle: false,
              frameGapsAcceptable: false,
              hingesSecure: false,
              minimumHingesPresent: false
            }
          })

          scheduledInspections.push({
            doorNumber: door.doorNumber,
            location: door.location,
            buildingName: door.building.name,
            scheduledDate: scheduledDate,
            inspectionId: inspection.id
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      scheduled: scheduledInspections.length,
      inspections: scheduledInspections
    })
  } catch (error) {
    console.error('Failed to auto-schedule inspections:', error)
    return NextResponse.json(
      { error: 'Failed to auto-schedule inspections' },
      { status: 500 }
    )
  }
}
