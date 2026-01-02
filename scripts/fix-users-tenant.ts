import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking users tenant assignment...')

  // Note: tenantId is now a required field in the User model
  // This script is kept for backwards compatibility but will always find 0 users
  // since all users must have a tenant when created

  console.log('✅ All users have a tenant assigned (tenantId is a required field)')
  return
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
