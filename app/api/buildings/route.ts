import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserWithTenant } from '@/lib/tenant'
import { createAuditLog, getBuildingSnapshot } from '@/lib/audit-trail'
import { checkBuildingLimit, LimitExceededError } from '@/lib/limits'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  const buildings = await prisma.building.findMany({
    where: {
      tenantId: user.tenant.id,
      managerId: session.user.id
    },
    include: {
      _count: {
        select: { fireDoors: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(buildings)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  const body = await request.json()

  // Check building limit before creating
  try {
    await checkBuildingLimit(user.tenant.id)
  } catch (error) {
    if (error instanceof LimitExceededError) {
      return NextResponse.json(
        {
          error: 'Building limit reached',
          message: `You have reached your building limit of ${error.limit}. Please contact support to upgrade your plan.`,
          current: error.current,
          limit: error.limit
        },
        { status: 403 }
      )
    }
    throw error
  }

  const building = await prisma.building.create({
    data: {
      name: body.name,
      address: body.address,
      postcode: body.postcode,
      buildingType: body.buildingType,
      numberOfStoreys: parseInt(body.numberOfStoreys),
      topStoreyHeight: parseFloat(body.topStoreyHeight),
      contactName: body.contactName || null,
      tenantId: user.tenant.id,
      managerId: session.user.id
    }
  })

  // Create audit log
  await createAuditLog({
    entityType: 'BUILDING',
    entityId: building.id,
    action: 'CREATE',
    userId: session.user.id,
    tenantId: user.tenant.id,
    afterSnapshot: getBuildingSnapshot(building)
  })

  return NextResponse.json(building)
}
