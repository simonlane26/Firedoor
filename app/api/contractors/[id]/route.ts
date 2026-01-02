import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

// GET /api/contractors/[id] - Get contractor details
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
    const contractor = await prisma.contractor.findFirst({
      where: {
        id,
        tenantId: user.tenant.id
      },
      include: {
        defects: {
          orderBy: {
            detectedDate: 'desc'
          },
          take: 10,
          include: {
            door: {
              select: {
                doorNumber: true,
                location: true,
                building: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            defects: true
          }
        }
      }
    })

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(contractor)
  } catch (error) {
    console.error('Error fetching contractor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contractor' },
      { status: 500 }
    )
  }
}

// PATCH /api/contractors/[id] - Update contractor
export async function PATCH(
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

  // Only allow managers and admins to update contractors
  if (user.role === 'INSPECTOR') {
    return NextResponse.json(
      { error: 'Manager or admin access required' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    // Verify contractor belongs to tenant
    const existingContractor = await prisma.contractor.findFirst({
      where: {
        id,
        tenantId: user.tenant.id
      }
    })

    if (!existingContractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const updateData: any = {}

    if (body.companyName) updateData.companyName = body.companyName
    if (body.contactName) updateData.contactName = body.contactName
    if (body.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
      updateData.email = body.email
    }
    if (body.phone) updateData.phone = body.phone
    if (body.address !== undefined) updateData.address = body.address
    if (body.specialties) {
      updateData.specialties = JSON.stringify(body.specialties)
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.rating !== undefined) updateData.rating = body.rating

    const updatedContractor = await prisma.contractor.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            defects: true
          }
        }
      }
    })

    return NextResponse.json(updatedContractor)
  } catch (error) {
    console.error('Error updating contractor:', error)
    return NextResponse.json(
      { error: 'Failed to update contractor' },
      { status: 500 }
    )
  }
}

// DELETE /api/contractors/[id] - Delete contractor (admin only)
export async function DELETE(
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

  // Only allow admins to delete contractors
  if (user.role !== 'ADMIN' && !user.isSuperAdmin) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    // Verify contractor belongs to tenant
    const contractor = await prisma.contractor.findFirst({
      where: {
        id,
        tenantId: user.tenant.id
      },
      include: {
        _count: {
          select: {
            defects: true
          }
        }
      }
    })

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      )
    }

    // Check if contractor has assigned defects
    if (contractor._count.defects > 0) {
      return NextResponse.json(
        { error: 'Cannot delete contractor with assigned defects. Please reassign or close all defects first.' },
        { status: 400 }
      )
    }

    await prisma.contractor.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contractor:', error)
    return NextResponse.json(
      { error: 'Failed to delete contractor' },
      { status: 500 }
    )
  }
}
