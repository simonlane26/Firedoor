import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserWithTenant } from '@/lib/tenant'
import { createAuditLog, getDoorSnapshot } from '@/lib/audit-trail'
import { checkDoorLimit, LimitExceededError } from '@/lib/limits'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const buildingId = searchParams.get('buildingId')

  const where = buildingId
    ? {
        buildingId,
        tenantId: user.tenant.id,
        building: { managerId: session.user.id }
      }
    : {
        tenantId: user.tenant.id,
        building: { managerId: session.user.id }
      }

  const doors = await prisma.fireDoor.findMany({
    where,
    include: {
      building: true,
      inspections: {
        orderBy: { inspectionDate: 'desc' },
        take: 1,
        include: {
          inspector: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(doors)
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

  // Check door limit before creating
  try {
    await checkDoorLimit(user.tenant.id)
  } catch (error) {
    if (error instanceof LimitExceededError) {
      return NextResponse.json(
        {
          error: 'Door limit reached',
          message: `You have reached your door limit of ${error.limit}. Please contact support to upgrade your plan.`,
          current: error.current,
          limit: error.limit
        },
        { status: 403 }
      )
    }
    throw error
  }

  const door = await prisma.fireDoor.create({
    data: {
      doorNumber: body.doorNumber,
      location: body.location,
      doorType: body.doorType,
      fireRating: body.fireRating,
      buildingId: body.buildingId,
      tenantId: user.tenant.id,
      hasIntumescentStrips: body.hasIntumescentStrips ?? true,
      hasSmokeSeal: body.hasSmokeSeal ?? false,
      hasLetterbox: body.hasLetterbox ?? false,
      hasAirTransferGrille: body.hasAirTransferGrille ?? false,
      hasGlazing: body.hasGlazing ?? false,
      installationDate: body.installationDate ? new Date(body.installationDate) : null,
      certificationUrl: body.certificationUrl ?? null,
      notes: body.notes
    }
  })

  // Create audit log
  await createAuditLog({
    entityType: 'DOOR',
    entityId: door.id,
    action: 'CREATE',
    userId: session.user.id,
    tenantId: user.tenant.id,
    afterSnapshot: getDoorSnapshot(door)
  })

  return NextResponse.json(door)
}
