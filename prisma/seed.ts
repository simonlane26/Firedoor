import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default tenant
  const defaultTenant = await prisma.tenant.create({
    data: {
      companyName: 'Default Company',
      subdomain: 'default',
      primaryColor: '#dc2626',
      secondaryColor: '#991b1b',
      contactEmail: 'contact@example.com',
      subscriptionPlan: 'trial',
      subscriptionStatus: 'active',
      maxDoors: 999,
      maxUsers: 999,
    },
  })

  console.log(`Created default tenant: ${defaultTenant.companyName}`)

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      tenantId: defaultTenant.id,
    },
  })

  console.log(`Created admin user: ${adminUser.email}`)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
