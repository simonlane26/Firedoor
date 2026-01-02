import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.isSuperAdmin) {
    return NextResponse.json({ error: 'Super admin access required' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        billingModel: body.billingModel,
        clientType: body.clientType,
        pricePerDoor: parseFloat(body.pricePerDoor),
        pricePerInspector: parseFloat(body.pricePerInspector),
        pricePerBuilding: parseFloat(body.pricePerBuilding),
        billingCycle: body.billingCycle,
        subscriptionStatus: body.subscriptionStatus,
        maxDoors: parseInt(body.maxDoors),
        maxBuildings: parseInt(body.maxBuildings),
        maxUsers: parseInt(body.maxUsers),
        maxInspectors: parseInt(body.maxInspectors)
      }
    })

    return NextResponse.json(updatedTenant)
  } catch (error) {
    console.error('Error updating tenant billing:', error)
    return NextResponse.json(
      { error: 'Failed to update tenant billing' },
      { status: 500 }
    )
  }
}
