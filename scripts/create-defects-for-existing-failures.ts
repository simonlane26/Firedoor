import { PrismaClient } from '@prisma/client'
import { autoCreateDefectsFromInspection } from '../lib/auto-defect'

const prisma = new PrismaClient()

async function createDefectsForExistingFailures() {
  try {
    console.log('Finding failed inspections without defects...\n')

    // Get all doors with their most recent inspection that requires action
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
            inspectionDate: true,
            tenantId: true
          }
        }
      }
    })

    // Filter to doors where most recent inspection requires action
    const failedDoors = doors.filter(door => {
      const latest = door.inspections[0]
      return latest?.status === 'REQUIRES_ACTION' ||
             latest?.overallResult === 'FAIL' ||
             latest?.overallResult === 'REQUIRES_ATTENTION'
    })

    console.log(`Found ${failedDoors.length} doors with failed/requires-attention inspections\n`)

    let totalDefectsCreated = 0

    for (const door of failedDoors) {
      const inspection = door.inspections[0]
      console.log(`Processing: ${door.doorNumber} - ${door.location} (${door.building.name})`)
      console.log(`  Inspection: ${inspection.status} / ${inspection.overallResult}`)

      // Check if defects already exist
      const existingDefects = await prisma.defect.findMany({
        where: { inspectionId: inspection.id }
      })

      if (existingDefects.length > 0) {
        console.log(`  ⊘ Skipped - ${existingDefects.length} defects already exist`)
        console.log('')
        continue
      }

      // Auto-create defects
      try {
        const results = await autoCreateDefectsFromInspection(
          inspection.id,
          inspection.tenantId
        )

        const createdCount = results.filter(r => r.created).length

        if (createdCount > 0) {
          console.log(`  ✓ Created ${createdCount} defect(s):`)
          results.forEach(r => {
            if (r.created && r.ticketNumber) {
              console.log(`    - ${r.ticketNumber}`)
            }
          })
          totalDefectsCreated += createdCount
        } else {
          console.log(`  ⊘ No defects created`)
        }
      } catch (error) {
        console.log(`  ✗ Error creating defects: ${error}`)
      }

      console.log('')
    }

    console.log(`\n=== Summary ===`)
    console.log(`Doors processed: ${failedDoors.length}`)
    console.log(`Total defects created: ${totalDefectsCreated}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefectsForExistingFailures()
