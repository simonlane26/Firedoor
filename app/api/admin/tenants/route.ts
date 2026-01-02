import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.isSuperAdmin) {
    return NextResponse.json({ error: 'Super admin access required' }, { status: 403 })
  }

  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            buildings: true,
            fireDoors: true
          }
        }
      },
      orderBy: { companyName: 'asc' }
    })

    const tenantsWithUsage = await Promise.all(
      tenants.map(async (tenant) => {
        const inspectorCount = await prisma.user.count({
          where: {
            tenantId: tenant.id,
            role: 'INSPECTOR'
          }
        })

        // Calculate estimated costs
        let estimatedMonthlyCost = 0
        let estimatedAnnualCost = 0

        if (tenant.clientType === 'HOUSING_ASSOCIATION') {
          if (tenant.billingModel === 'PER_DOOR') {
            estimatedAnnualCost = tenant._count.fireDoors * tenant.pricePerDoor
            estimatedMonthlyCost = estimatedAnnualCost / 12
          } else if (tenant.billingModel === 'PER_BUILDING') {
            estimatedAnnualCost = tenant._count.buildings * tenant.pricePerBuilding
            estimatedMonthlyCost = estimatedAnnualCost / 12
          }
        } else if (tenant.clientType === 'CONTRACTOR') {
          const inspectorMonthlyCost = inspectorCount * tenant.pricePerInspector
          const doorMonthlyCost = (tenant._count.fireDoors * tenant.pricePerDoor) / 12
          estimatedMonthlyCost = inspectorMonthlyCost + doorMonthlyCost
          estimatedAnnualCost = estimatedMonthlyCost * 12
        }

        return {
          id: tenant.id,
          companyName: tenant.companyName,
          subdomain: tenant.subdomain,
          clientType: tenant.clientType,
          billingModel: tenant.billingModel,
          billingCycle: tenant.billingCycle,
          pricePerDoor: tenant.pricePerDoor,
          pricePerInspector: tenant.pricePerInspector,
          pricePerBuilding: tenant.pricePerBuilding,
          nextBillingDate: tenant.nextBillingDate,
          subscriptionStatus: tenant.subscriptionStatus,
          userCount: tenant._count.users,
          buildingCount: tenant._count.buildings,
          doorCount: tenant._count.fireDoors,
          inspectorCount,
          estimatedMonthlyCost: parseFloat(estimatedMonthlyCost.toFixed(2)),
          estimatedAnnualCost: parseFloat(estimatedAnnualCost.toFixed(2)),
          maxDoors: tenant.maxDoors,
          maxBuildings: tenant.maxBuildings,
          maxUsers: tenant.maxUsers,
          maxInspectors: tenant.maxInspectors
        }
      })
    )

    return NextResponse.json(tenantsWithUsage)
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    )
  }
}
