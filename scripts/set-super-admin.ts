import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setSuperAdmin() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx tsx scripts/set-super-admin.ts <email>')
    process.exit(1)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`User with email ${email} not found`)
      process.exit(1)
    }

    await prisma.user.update({
      where: { email },
      data: { isSuperAdmin: true }
    })

    console.log(`✅ User ${email} is now a super admin`)
    console.log(`User ID: ${user.id}`)
    console.log(`Name: ${user.name}`)
    console.log(`Role: ${user.role}`)
  } catch (error) {
    console.error('Error setting super admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setSuperAdmin()
