import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const { id } = await params

    const door = await prisma.fireDoor.findFirst({
      where: {
        id,
        building: {
          tenantId: user.tenant.id
        }
      },
      include: {
        building: true
      }
    })

    if (!door) {
      return NextResponse.json({ error: 'Door not found' }, { status: 404 })
    }

    return NextResponse.json(door)
  } catch (error) {
    console.error('Error fetching door:', error)
    return NextResponse.json(
      { error: 'Failed to fetch door' },
      { status: 500 }
    )
  }
}
