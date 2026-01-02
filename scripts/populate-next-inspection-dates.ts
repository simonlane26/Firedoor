import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to populate next inspection dates...')

  // Get all inspections that don't have a next inspection date
  const inspections = await prisma.inspection.findMany({
    where: {
      nextInspectionDate: null
    },
    include: {
      fireDoor: {
        include: {
          building: true
        }
      }
    }
  })

  console.log(`Found ${inspections.length} inspections without next inspection dates`)

  let updated = 0

  for (const inspection of inspections) {
    const inspectionDate = new Date(inspection.inspectionDate)
    let monthsToAdd = 12 // Default to 12 months

    // Flat entrance doors: 12 months
    if (inspection.fireDoor.doorType === 'FLAT_ENTRANCE') {
      monthsToAdd = 12
    }
    // Buildings over 11m: 3 months
    else if (inspection.fireDoor.building && inspection.fireDoor.building.topStoreyHeight && inspection.fireDoor.building.topStoreyHeight > 11) {
      monthsToAdd = 3
    }

    const nextDate = new Date(inspectionDate)
    nextDate.setMonth(nextDate.getMonth() + monthsToAdd)

    // Update the inspection
    await prisma.inspection.update({
      where: { id: inspection.id },
      data: {
        nextInspectionDate: nextDate
      }
    })

    // Update the fire door's next inspection date
    await prisma.fireDoor.update({
      where: { id: inspection.fireDoorId },
      data: {
        nextInspectionDate: nextDate
      }
    })

    updated++
    console.log(`Updated inspection ${inspection.id}: next date = ${nextDate.toISOString().split('T')[0]} (${monthsToAdd} months)`)
  }

  console.log(`\nCompleted! Updated ${updated} inspections.`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
