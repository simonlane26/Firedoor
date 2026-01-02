import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting migration to multi-tenancy...')

  try {
    // Create a default tenant
    console.log('Creating default tenant...')
    const defaultTenant = await prisma.tenant.create({
      data: {
        companyName: 'Default Company',
        subdomain: 'default',
        primaryColor: '#dc2626',
        secondaryColor: '#991b1b',
        subscriptionPlan: 'trial',
        subscriptionStatus: 'active',
        maxDoors: 999,
        maxUsers: 999,
      },
    })

    console.log(`Default tenant created with ID: ${defaultTenant.id}`)

    // Update all existing users to belong to the default tenant
    const userCount = await prisma.$executeRaw`
      UPDATE users SET tenantId = ${defaultTenant.id}
    `
    console.log(`Updated ${userCount} users`)

    // Update all existing buildings to belong to the default tenant
    const buildingCount = await prisma.$executeRaw`
      UPDATE buildings SET tenantId = ${defaultTenant.id}
    `
    console.log(`Updated ${buildingCount} buildings`)

    // Update all existing fire doors to belong to the default tenant
    const doorCount = await prisma.$executeRaw`
      UPDATE fire_doors SET tenantId = ${defaultTenant.id}
    `
    console.log(`Updated ${doorCount} fire doors`)

    // Update all existing inspections to belong to the default tenant
    const inspectionCount = await prisma.$executeRaw`
      UPDATE inspections SET tenantId = ${defaultTenant.id}
    `
    console.log(`Updated ${inspectionCount} inspections`)

    console.log('\nMigration completed successfully!')
    console.log(`\nDefault tenant details:`)
    console.log(`  Company Name: ${defaultTenant.companyName}`)
    console.log(`  Subdomain: ${defaultTenant.subdomain}`)
    console.log(`  ID: ${defaultTenant.id}`)
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
