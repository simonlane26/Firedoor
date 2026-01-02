import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4] || 'Admin User'
  const companyName = process.argv[5] || 'Admin Company'

  if (!email || !password) {
    console.error('Usage: ts-node scripts/create-admin.ts <email> <password> [name] [companyName]')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)

  // Generate subdomain from company name
  const subdomain = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 63)

  // Create tenant and admin user together
  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        companyName,
        subdomain,
      }
    })

    const user = await tx.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'ADMIN',
        tenantId: tenant.id,
        isSuperAdmin: false
      }
    })

    return { tenant, user }
  })

  console.log('Admin user and tenant created successfully:')
  console.log(`Tenant: ${result.tenant.companyName} (${result.tenant.subdomain})`)
  console.log(`Email: ${result.user.email}`)
  console.log(`Name: ${result.user.name}`)
  console.log(`Role: ${result.user.role}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
