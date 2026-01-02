import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n=== TENANTS ===')
  const tenants = await prisma.tenant.findMany()
  console.log(`Found ${tenants.length} tenant(s):`)
  tenants.forEach(t => {
    console.log(`  - ${t.companyName} (subdomain: ${t.subdomain}, id: ${t.id})`)
  })

  console.log('\n=== USERS ===')
  const users = await prisma.user.findMany({
    include: { tenant: true }
  })
  console.log(`Found ${users.length} user(s):`)
  users.forEach(u => {
    console.log(`  - ${u.email} (${u.role}) -> Tenant: ${u.tenant.companyName}`)
  })

  console.log('\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
