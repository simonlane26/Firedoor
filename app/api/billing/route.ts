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

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    // Get current usage metrics
    const doorCount = await prisma.fireDoor.count({
      where: { tenantId: user.tenant.id }
    })

    const buildingCount = await prisma.building.count({
      where: { tenantId: user.tenant.id }
    })

    const inspectorCount = await prisma.user.count({
      where: {
        tenantId: user.tenant.id,
        role: 'INSPECTOR'
      }
    })

    // Get current month's inspection count
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const inspectionCount = await prisma.inspection.count({
      where: {
        tenantId: user.tenant.id,
        inspectionDate: {
          gte: startOfMonth
        }
      }
    })

    // Calculate estimated cost based on billing model
    let estimatedMonthlyCost = 0
    let estimatedAnnualCost = 0

    const { billingModel, clientType, pricePerDoor, pricePerInspector, pricePerBuilding, billingCycle } = user.tenant

    if (clientType === 'HOUSING_ASSOCIATION') {
      if (billingModel === 'PER_DOOR') {
        estimatedAnnualCost = doorCount * pricePerDoor
        estimatedMonthlyCost = estimatedAnnualCost / 12
      } else if (billingModel === 'PER_BUILDING') {
        estimatedAnnualCost = buildingCount * pricePerBuilding
        estimatedMonthlyCost = estimatedAnnualCost / 12
      }
    } else if (clientType === 'CONTRACTOR') {
      // For contractors: per-inspector monthly + per-door charge
      const inspectorMonthlyCost = inspectorCount * pricePerInspector
      const doorMonthlyCost = (doorCount * pricePerDoor) / 12
      estimatedMonthlyCost = inspectorMonthlyCost + doorMonthlyCost
      estimatedAnnualCost = estimatedMonthlyCost * 12
    }

    // Get recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: { tenantId: user.tenant.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get current usage record for this month
    const currentUsageRecord = await prisma.usageRecord.findUnique({
      where: {
        tenantId_period: {
          tenantId: user.tenant.id,
          period: startOfMonth
        }
      }
    })

    return NextResponse.json({
      billing: {
        billingModel,
        clientType,
        billingCycle,
        pricePerDoor,
        pricePerInspector,
        pricePerBuilding,
        nextBillingDate: user.tenant.nextBillingDate,
        stripeCustomerId: user.tenant.stripeCustomerId,
        stripeSubscriptionId: user.tenant.stripeSubscriptionId
      },
      usage: {
        doorCount,
        buildingCount,
        inspectorCount,
        inspectionCount
      },
      costs: {
        estimatedMonthlyCost: parseFloat(estimatedMonthlyCost.toFixed(2)),
        estimatedAnnualCost: parseFloat(estimatedAnnualCost.toFixed(2))
      },
      recentInvoices,
      currentUsageRecord
    })
  } catch (error) {
    console.error('Error fetching billing data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  if (!user.isSuperAdmin) {
    return NextResponse.json({ error: 'Only super admins can update billing settings' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const updatedTenant = await prisma.tenant.update({
      where: { id: user.tenant.id },
      data: {
        billingModel: body.billingModel,
        clientType: body.clientType,
        pricePerDoor: parseFloat(body.pricePerDoor),
        pricePerInspector: parseFloat(body.pricePerInspector),
        pricePerBuilding: parseFloat(body.pricePerBuilding),
        billingCycle: body.billingCycle
      }
    })

    return NextResponse.json(updatedTenant)
  } catch (error) {
    console.error('Error updating billing settings:', error)
    return NextResponse.json(
      { error: 'Failed to update billing settings' },
      { status: 500 }
    )
  }
}
