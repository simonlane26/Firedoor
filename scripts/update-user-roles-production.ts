import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserRoles() {
  console.log('Updating UserRole enum in production...')

  try {
    // Check current enum values
    const currentValues = await prisma.$queryRaw`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = (
        SELECT oid
        FROM pg_type
        WHERE typname = 'UserRole'
      )
    ` as any[]

    console.log('Current enum values:', currentValues.map(v => v.enumlabel))

    // Add new enum values if they don't exist
    const newValues = ['MANAGER_RESPONSIBLE_PERSON', 'HOUSING_OFFICER', 'AUDITOR']

    for (const value of newValues) {
      const exists = currentValues.some(v => v.enumlabel === value)
      if (!exists) {
        console.log(`Adding enum value: ${value}`)
        await prisma.$executeRawUnsafe(
          `ALTER TYPE "UserRole" ADD VALUE '${value}'`
        )
      } else {
        console.log(`✓ Enum value ${value} already exists`)
      }
    }

    // Check if MANAGER exists and if there are any users with that role
    const hasManager = currentValues.some(v => v.enumlabel === 'MANAGER')

    if (hasManager) {
      const managerCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM users
        WHERE role = 'MANAGER'
      ` as any[]

      console.log(`Found ${managerCount[0].count} users with MANAGER role`)

      if (parseInt(managerCount[0].count) > 0) {
        // Update MANAGER to MANAGER_RESPONSIBLE_PERSON
        await prisma.$executeRaw`
          UPDATE users
          SET role = 'MANAGER_RESPONSIBLE_PERSON'
          WHERE role = 'MANAGER'
        `
        console.log('✓ Updated MANAGER roles to MANAGER_RESPONSIBLE_PERSON')
      }

      // Note: We cannot remove the MANAGER enum value without recreating the enum
      // This would require a more complex migration
      console.log('⚠ Note: MANAGER enum value still exists but is no longer used')
    }

    console.log('\n✓ Role migration completed successfully')

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateUserRoles()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error)
    process.exit(1)
  })
