import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing database connection...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')

  try {
    await prisma.$connect()
    console.log('✅ Successfully connected to database')

    const tenantCount = await prisma.tenant.count()
    console.log(`✅ Found ${tenantCount} tenant(s)`)

    await prisma.$disconnect()
    console.log('✅ Disconnected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

main()
