import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTrialColumn() {
  console.log('Adding trialEndsAt column to tenants table...')

  try {
    // Check if column already exists
    const result = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'tenants'
      AND column_name = 'trialEndsAt'
    ` as any[]

    if (result.length > 0) {
      console.log('✓ Column trialEndsAt already exists')
      return
    }

    // Add the column
    await prisma.$executeRawUnsafe(
      `ALTER TABLE tenants ADD COLUMN "trialEndsAt" TIMESTAMP(3)`
    )

    console.log('✓ Successfully added trialEndsAt column')

    // Update existing trial accounts to have 14-day trial from now
    await prisma.$executeRaw`
      UPDATE tenants
      SET "trialEndsAt" = NOW() + INTERVAL '14 days'
      WHERE "subscriptionPlan" = 'trial'
      AND "trialEndsAt" IS NULL
    `

    console.log('✓ Set trial expiry dates for existing trial accounts')

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addTrialColumn()
  .then(() => {
    console.log('\n✓ Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error)
    process.exit(1)
  })
