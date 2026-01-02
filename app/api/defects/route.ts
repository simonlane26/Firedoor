import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

// GET /api/defects - List all defects for current tenant
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
  const status = searchParams.get('status')
  const severity = searchParams.get('severity')
  const priority = searchParams.get('priority')
  const buildingId = searchParams.get('buildingId')
  const doorId = searchParams.get('doorId')
  const contractorId = searchParams.get('contractorId')

  try {
    const where: any = {
      tenantId: user.tenant.id
    }

    if (status) {
      where.status = status
    }
    if (severity) {
      where.severity = severity
    }
    if (priority) {
      where.priority = priority
    }
    if (doorId) {
      where.doorId = doorId
    }
    if (contractorId) {
      where.assignedContractorId = contractorId
    }
    if (buildingId) {
      where.door = {
        buildingId
      }
    }

    const defects = await prisma.defect.findMany({
      where,
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
        },
        inspection: {
          select: {
            inspectionDate: true,
            inspector: {
              select: {
                name: true
              }
            }
          }
        },
        assignedContractor: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { detectedDate: 'desc' }
      ]
    })

    return NextResponse.json(defects)
  } catch (error) {
    console.error('Error fetching defects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch defects' },
      { status: 500 }
    )
  }
}

// POST /api/defects - Create a new defect
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const {
      inspectionId,
      doorId,
      severity,
      category,
      description,
      priority
    } = body

    // Validate required fields
    if (!inspectionId || !doorId || !severity || !category || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify door belongs to tenant
    const door = await prisma.fireDoor.findFirst({
      where: {
        id: doorId,
        tenantId: user.tenant.id
      }
    })

    if (!door) {
      return NextResponse.json(
        { error: 'Door not found' },
        { status: 404 }
      )
    }

    // Verify inspection belongs to tenant
    const inspection = await prisma.inspection.findFirst({
      where: {
        id: inspectionId,
        tenantId: user.tenant.id
      }
    })

    if (!inspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      )
    }

    // Generate ticket number (format: DEF-YYYYMMDD-XXXX)
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

    // Find the last ticket number for today
    const lastDefect = await prisma.defect.findFirst({
      where: {
        ticketNumber: {
          startsWith: `DEF-${dateStr}-`
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    let ticketNumber: string
    if (lastDefect) {
      const lastNumber = parseInt(lastDefect.ticketNumber.split('-')[2])
      const nextNumber = (lastNumber + 1).toString().padStart(4, '0')
      ticketNumber = `DEF-${dateStr}-${nextNumber}`
    } else {
      ticketNumber = `DEF-${dateStr}-0001`
    }

    // Create defect
    const defect = await prisma.defect.create({
      data: {
        ticketNumber,
        inspectionId,
        doorId,
        severity,
        category,
        description,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        tenantId: user.tenant.id
      },
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
        },
        inspection: {
          select: {
            inspectionDate: true,
            inspector: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(defect, { status: 201 })
  } catch (error) {
    console.error('Error creating defect:', error)
    return NextResponse.json(
      { error: 'Failed to create defect' },
      { status: 500 }
    )
  }
}
