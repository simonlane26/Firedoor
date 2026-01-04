import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateManagerRole() {
  console.log('Starting migration of MANAGER role to MANAGER_RESPONSIBLE_PERSON...')

  try {
    // Update all users with MANAGER role to MANAGER_RESPONSIBLE_PERSON
    const result = await prisma.$executeRaw`
      UPDATE users
      SET role = 'MANAGER_RESPONSIBLE_PERSON'
      WHERE role = 'MANAGER'
    `

    console.log(`✓ Successfully updated ${result} users from MANAGER to MANAGER_RESPONSIBLE_PERSON`)

    // Verify the migration
    const remainingManagers = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'MANAGER'
    `

    console.log(`Remaining MANAGER roles: ${(remainingManagers as any)[0].count}`)

    // Show distribution of roles
    const roleDistribution = await prisma.$queryRaw`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `

    console.log('\nCurrent role distribution:')
    console.table(roleDistribution)

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateManagerRole()
  .then(() => {
    console.log('\n✓ Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error)
    process.exit(1)
  })
