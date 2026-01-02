import { prisma } from './prisma'

interface CreateUsageRecordParams {
  tenantId: string
  period: Date
}

export async function createOrUpdateUsageRecord({ tenantId, period }: CreateUsageRecordParams) {
  try {
    // Normalize period to start of month
    const startOfMonth = new Date(period)
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Get tenant billing info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) {
      throw new Error('Tenant not found')
    }

    // Get usage metrics for the period
    const doorCount = await prisma.fireDoor.count({
      where: {
        tenantId,
        createdAt: { lte: new Date() }
      }
    })

    const buildingCount = await prisma.building.count({
      where: {
        tenantId,
        createdAt: { lte: new Date() }
      }
    })

    const inspectorCount = await prisma.user.count({
      where: {
        tenantId,
        role: 'INSPECTOR',
        createdAt: { lte: new Date() }
      }
    })

    // Get inspection count for the period
    const endOfMonth = new Date(startOfMonth)
    endOfMonth.setMonth(endOfMonth.getMonth() + 1)

    const inspectionCount = await prisma.inspection.count({
      where: {
        tenantId,
        inspectionDate: {
          gte: startOfMonth,
          lt: endOfMonth
        }
      }
    })

    // Calculate cost based on billing model
    let calculatedAmount = 0

    if (tenant.clientType === 'HOUSING_ASSOCIATION') {
      if (tenant.billingModel === 'PER_DOOR') {
        // Annual price divided by 12 for monthly tracking
        calculatedAmount = (doorCount * tenant.pricePerDoor) / 12
      } else if (tenant.billingModel === 'PER_BUILDING') {
        // Annual price divided by 12 for monthly tracking
        calculatedAmount = (buildingCount * tenant.pricePerBuilding) / 12
      }
    } else if (tenant.clientType === 'CONTRACTOR') {
      // Per-inspector monthly + per-door monthly
      const inspectorMonthlyCost = inspectorCount * tenant.pricePerInspector
      const doorMonthlyCost = (doorCount * tenant.pricePerDoor) / 12
      calculatedAmount = inspectorMonthlyCost + doorMonthlyCost
    }

    // Create usage details
    const usageDetails = {
      doors: doorCount,
      buildings: buildingCount,
      inspectors: inspectorCount,
      inspections: inspectionCount,
      billingModel: tenant.billingModel,
      clientType: tenant.clientType,
      breakdown: {
        doorCost: tenant.clientType === 'HOUSING_ASSOCIATION' && tenant.billingModel === 'PER_DOOR'
          ? (doorCount * tenant.pricePerDoor) / 12
          : tenant.clientType === 'CONTRACTOR'
          ? (doorCount * tenant.pricePerDoor) / 12
          : 0,
        buildingCost: tenant.billingModel === 'PER_BUILDING'
          ? (buildingCount * tenant.pricePerBuilding) / 12
          : 0,
        inspectorCost: tenant.clientType === 'CONTRACTOR'
          ? inspectorCount * tenant.pricePerInspector
          : 0
      }
    }

    // Create or update usage record
    const usageRecord = await prisma.usageRecord.upsert({
      where: {
        tenantId_period: {
          tenantId,
          period: startOfMonth
        }
      },
      update: {
        doorCount,
        buildingCount,
        inspectorCount,
        inspectionCount,
        calculatedAmount,
        usageDetails: JSON.stringify(usageDetails)
      },
      create: {
        tenantId,
        period: startOfMonth,
        doorCount,
        buildingCount,
        inspectorCount,
        inspectionCount,
        calculatedAmount,
        usageDetails: JSON.stringify(usageDetails),
        invoiced: false
      }
    })

    return usageRecord
  } catch (error) {
    console.error('Error creating usage record:', error)
    throw error
  }
}

export async function getUnbilledUsageRecords(tenantId: string) {
  return await prisma.usageRecord.findMany({
    where: {
      tenantId,
      invoiced: false
    },
    orderBy: { period: 'asc' }
  })
}

export async function markUsageRecordsAsInvoiced(usageRecordIds: string[], invoiceId: string) {
  return await prisma.usageRecord.updateMany({
    where: {
      id: { in: usageRecordIds }
    },
    data: {
      invoiced: true,
      invoiceId
    }
  })
}

// Function to be called periodically (e.g., via cron job) to track monthly usage
export async function trackMonthlyUsageForAllTenants() {
  const tenants = await prisma.tenant.findMany({
    select: { id: true }
  })

  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)

  const results = []

  for (const tenant of tenants) {
    try {
      const usageRecord = await createOrUpdateUsageRecord({
        tenantId: tenant.id,
        period: currentMonth
      })
      results.push({ tenantId: tenant.id, success: true, usageRecord })
    } catch (error) {
      console.error(`Failed to track usage for tenant ${tenant.id}:`, error)
      results.push({ tenantId: tenant.id, success: false, error })
    }
  }

  return results
}
