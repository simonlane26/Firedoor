import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

// GET /api/contractors - List all contractors for current tenant
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const isActive = searchParams.get('isActive')

  try {
    const where: any = {
      tenantId: user.tenant.id
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const contractors = await prisma.contractor.findMany({
      where,
      include: {
        _count: {
          select: {
            defects: true
          }
        }
      },
      orderBy: {
        companyName: 'asc'
      }
    })

    return NextResponse.json(contractors)
  } catch (error) {
    console.error('Error fetching contractors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contractors' },
      { status: 500 }
    )
  }
}

// POST /api/contractors - Create a new contractor
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  // Only allow managers and admins to create contractors
  if (user.role === 'INSPECTOR') {
    return NextResponse.json(
      { error: 'Manager or admin access required' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const {
      companyName,
      contactName,
      email,
      phone,
      address,
      specialties
    } = body

    // Validate required fields
    if (!companyName || !contactName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const contractor = await prisma.contractor.create({
      data: {
        companyName,
        contactName,
        email,
        phone,
        address,
        specialties: specialties ? JSON.stringify(specialties) : null,
        tenantId: user.tenant.id
      }
    })

    return NextResponse.json(contractor, { status: 201 })
  } catch (error) {
    console.error('Error creating contractor:', error)
    return NextResponse.json(
      { error: 'Failed to create contractor' },
      { status: 500 }
    )
  }
}
