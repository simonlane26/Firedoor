import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkInspections() {
  try {
    // Get doors with their most recent inspection
    const doors = await prisma.fireDoor.findMany({
      include: {
        building: {
          select: {
            name: true
          }
        },
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            overallResult: true,
            inspectionDate: true
          }
        }
      },
      orderBy: {
        doorNumber: 'asc'
      }
    })

    console.log('\n=== Doors with Most Recent Inspection ===\n')
    doors.forEach((door) => {
      const latest = door.inspections[0]
      console.log(`Door: ${door.doorNumber} (${door.location})`)
      console.log(`  Building: ${door.building.name}`)
      if (latest) {
        console.log(`  Latest Inspection:`)
        console.log(`    Status: ${latest.status}`)
        console.log(`    Overall Result: ${latest.overallResult || 'NOT SET'}`)
        console.log(`    Date: ${new Date(latest.inspectionDate).toLocaleDateString()}`)
      } else {
        console.log(`  No inspections`)
      }
      console.log('---')
    })

    // Count doors where most recent inspection requires action
    const doorsRequiringAction = doors.filter(door => {
      const latest = door.inspections[0]
      return latest?.status === 'REQUIRES_ACTION' || latest?.overallResult === 'REQUIRES_ATTENTION'
    })

    console.log(`\n=== Summary ===\n`)
    console.log(`Total doors: ${doors.length}`)
    console.log(`Doors requiring action (most recent): ${doorsRequiringAction.length}`)

    if (doorsRequiringAction.length > 0) {
      console.log(`\nDoors requiring action:`)
      doorsRequiringAction.forEach(door => {
        const latest = door.inspections[0]
        console.log(`  - ${door.doorNumber}: status=${latest.status}, result=${latest.overallResult}`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkInspections()
