import { prisma } from './prisma'

export class LimitExceededError extends Error {
  constructor(
    public resourceType: string,
    public current: number,
    public limit: number
  ) {
    super(`${resourceType} limit exceeded: ${current}/${limit}`)
    this.name = 'LimitExceededError'
  }
}

export async function checkDoorLimit(tenantId: string): Promise<void> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { maxDoors: true }
  })

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  const currentCount = await prisma.fireDoor.count({
    where: { tenantId }
  })

  if (currentCount >= tenant.maxDoors) {
    throw new LimitExceededError('Fire doors', currentCount, tenant.maxDoors)
  }
}

export async function checkBuildingLimit(tenantId: string): Promise<void> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { maxBuildings: true }
  })

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  const currentCount = await prisma.building.count({
    where: { tenantId }
  })

  if (currentCount >= tenant.maxBuildings) {
    throw new LimitExceededError('Buildings', currentCount, tenant.maxBuildings)
  }
}

export async function checkUserLimit(tenantId: string): Promise<void> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { maxUsers: true }
  })

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  const currentCount = await prisma.user.count({
    where: { tenantId }
  })

  if (currentCount >= tenant.maxUsers) {
    throw new LimitExceededError('Users', currentCount, tenant.maxUsers)
  }
}

export async function checkInspectorLimit(tenantId: string): Promise<void> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { maxInspectors: true }
  })

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  const currentCount = await prisma.user.count({
    where: {
      tenantId,
      role: 'INSPECTOR'
    }
  })

  if (currentCount >= tenant.maxInspectors) {
    throw new LimitExceededError('Inspectors', currentCount, tenant.maxInspectors)
  }
}

export async function getTenantLimits(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      maxDoors: true,
      maxBuildings: true,
      maxUsers: true,
      maxInspectors: true
    }
  })

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  const [doorCount, buildingCount, userCount, inspectorCount] = await Promise.all([
    prisma.fireDoor.count({ where: { tenantId } }),
    prisma.building.count({ where: { tenantId } }),
    prisma.user.count({ where: { tenantId } }),
    prisma.user.count({ where: { tenantId, role: 'INSPECTOR' } })
  ])

  return {
    doors: {
      current: doorCount,
      limit: tenant.maxDoors,
      percentage: (doorCount / tenant.maxDoors) * 100,
      remaining: tenant.maxDoors - doorCount,
      isNearLimit: doorCount >= tenant.maxDoors * 0.8, // 80% threshold
      isAtLimit: doorCount >= tenant.maxDoors
    },
    buildings: {
      current: buildingCount,
      limit: tenant.maxBuildings,
      percentage: (buildingCount / tenant.maxBuildings) * 100,
      remaining: tenant.maxBuildings - buildingCount,
      isNearLimit: buildingCount >= tenant.maxBuildings * 0.8,
      isAtLimit: buildingCount >= tenant.maxBuildings
    },
    users: {
      current: userCount,
      limit: tenant.maxUsers,
      percentage: (userCount / tenant.maxUsers) * 100,
      remaining: tenant.maxUsers - userCount,
      isNearLimit: userCount >= tenant.maxUsers * 0.8,
      isAtLimit: userCount >= tenant.maxUsers
    },
    inspectors: {
      current: inspectorCount,
      limit: tenant.maxInspectors,
      percentage: (inspectorCount / tenant.maxInspectors) * 100,
      remaining: tenant.maxInspectors - inspectorCount,
      isNearLimit: inspectorCount >= tenant.maxInspectors * 0.8,
      isAtLimit: inspectorCount >= tenant.maxInspectors
    }
  }
}
