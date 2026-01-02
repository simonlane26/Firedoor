import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find Lakeside Apartments building
  const building = await prisma.building.findFirst({
    where: {
      name: {
        contains: 'Lakeside',
        mode: 'insensitive'
      }
    }
  })

  if (!building) {
    console.log('No building found matching "Lakeside"')
    return
  }

  console.log('Found building:', building.name, '(ID:', building.id, ')')

  // Get all doors for this building
  const doors = await prisma.fireDoor.findMany({
    where: {
      buildingId: building.id
    }
  })

  console.log(`\nFound ${doors.length} doors for this building:`)
  doors.forEach(door => {
    console.log(`  - ${door.doorNumber}: ${door.location} (${door.doorType})`)
  })

  if (doors.length === 0) {
    console.log('\nNo doors found. Checking for failed door creation attempts...')

    // Check all buildings to see what we have
    const allBuildings = await prisma.building.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            fireDoors: true
          }
        }
      }
    })

    console.log('\nAll buildings:')
    allBuildings.forEach(b => {
      console.log(`  - ${b.name} (${b.id}): ${b._count.fireDoors} doors`)
    })
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
