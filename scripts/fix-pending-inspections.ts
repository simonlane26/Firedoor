import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPendingInspections() {
  try {
    console.log('Finding inspections with PENDING status that have been completed...\n')

    // Find all PENDING inspections - we'll check if they have data in the loop
    const pendingInspections = await prisma.inspection.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        fireDoor: {
          select: {
            doorNumber: true,
            location: true
          }
        }
      }
    })

    console.log(`Found ${pendingInspections.length} pending inspections with data\n`)

    let fixed = 0

    for (const inspection of pendingInspections) {
      // Skip inspections that haven't been filled out yet
      const hasData = inspection.doorConstruction !== null ||
                      inspection.doorLeafFrameOk !== null ||
                      inspection.doorClosesCompletely !== null ||
                      inspection.doorClosesFromAnyAngle !== null ||
                      inspection.frameGapsAcceptable !== null

      if (!hasData) {
        continue
      }

      console.log(`Checking inspection ${inspection.id} for door ${inspection.fireDoor.doorNumber}`)

      // Count critical failures (false counts as failure for critical checks)
      const criticalFailures = [
        !inspection.doorConstruction,
        inspection.doorLeafFrameOk === false,
        inspection.doorClosesCompletely === false,
        inspection.doorClosesFromAnyAngle === false,
        inspection.frameGapsAcceptable === false
      ].filter(Boolean).length

      // Count minor issues
      const minorIssues = [
        inspection.hingesSecure === false,
        inspection.intumescentStripsIntact === false,
        inspection.doorSignageCorrect === false,
        inspection.damageOrDefects === true
      ].filter(Boolean).length

      let newStatus: 'PENDING' | 'COMPLETED' | 'REQUIRES_ACTION' = 'PENDING'
      let newResult: 'PASS' | 'FAIL' | 'REQUIRES_ATTENTION' | null = null

      if (criticalFailures > 0) {
        newStatus = 'REQUIRES_ACTION'
        newResult = 'FAIL'
        console.log(`  -> Has ${criticalFailures} critical failures - setting to REQUIRES_ACTION/FAIL`)
      } else if (minorIssues > 0) {
        newStatus = 'COMPLETED'
        newResult = 'REQUIRES_ATTENTION'
        console.log(`  -> Has ${minorIssues} minor issues - setting to COMPLETED/REQUIRES_ATTENTION`)
      } else {
        newStatus = 'COMPLETED'
        newResult = 'PASS'
        console.log(`  -> All checks passed - setting to COMPLETED/PASS`)
      }

      // Update the inspection
      await prisma.inspection.update({
        where: { id: inspection.id },
        data: {
          status: newStatus,
          overallResult: newResult,
          completedAt: new Date()
        }
      })

      console.log(`  ✓ Updated successfully\n`)
      fixed++
    }

    console.log(`\nFixed ${fixed} inspections`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPendingInspections()
