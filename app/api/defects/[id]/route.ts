import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getContractorAssignmentTemplate } from '@/lib/email-templates'

// GET /api/defects/[id] - Get defect details
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
    const defect = await prisma.defect.findFirst({
      where: {
        id,
        tenantId: user.tenant.id
      },
      include: {
        door: {
          include: {
            building: true
          }
        },
        inspection: {
          include: {
            inspector: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        assignedContractor: true
      }
    })

    if (!defect) {
      return NextResponse.json(
        { error: 'Defect not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(defect)
  } catch (error) {
    console.error('Error fetching defect:', error)
    return NextResponse.json(
      { error: 'Failed to fetch defect' },
      { status: 500 }
    )
  }
}

// PATCH /api/defects/[id] - Update defect
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

  try {
    const { id } = await params
    // Verify defect belongs to tenant
    const existingDefect = await prisma.defect.findFirst({
      where: {
        id,
        tenantId: user.tenant.id
      }
    })

    if (!existingDefect) {
      return NextResponse.json(
        { error: 'Defect not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const updateData: any = {}

    // Allow updating specific fields
    if (body.status) updateData.status = body.status
    if (body.priority) updateData.priority = body.priority
    if (body.severity) updateData.severity = body.severity
    if (body.description) updateData.description = body.description
    if (body.category) updateData.category = body.category

    // Assignment fields
    if (body.assignedContractorId !== undefined) {
      updateData.assignedContractorId = body.assignedContractorId
      if (body.assignedContractorId && !existingDefect.assignedDate) {
        updateData.assignedDate = new Date()
        updateData.status = 'ASSIGNED'
      }
    }
    if (body.targetCompletionDate) {
      updateData.targetCompletionDate = new Date(body.targetCompletionDate)
    }

    // Repair completion fields
    if (body.repairCompletedDate) {
      updateData.repairCompletedDate = new Date(body.repairCompletedDate)
      updateData.status = 'REPAIR_COMPLETED'
    }
    if (body.proofOfFixUrls) {
      updateData.proofOfFixUrls = JSON.stringify(body.proofOfFixUrls)
    }
    if (body.repairNotes) updateData.repairNotes = body.repairNotes
    if (body.repairCost !== undefined) updateData.repairCost = body.repairCost

    // Re-inspection fields
    if (body.reinspectionRequired !== undefined) {
      updateData.reinspectionRequired = body.reinspectionRequired
    }
    if (body.reinspectionId) updateData.reinspectionId = body.reinspectionId
    if (body.reinspectedDate) {
      updateData.reinspectedDate = new Date(body.reinspectedDate)
    }

    // Closure fields
    if (body.closedDate) {
      updateData.closedDate = new Date(body.closedDate)
      updateData.closedById = user.id
      updateData.status = 'CLOSED'
    }
    if (body.closureNotes) updateData.closureNotes = body.closureNotes

    const updatedDefect = await prisma.defect.update({
      where: { id },
      data: updateData,
      include: {
        door: {
          include: {
            building: true
          }
        },
        inspection: {
          include: {
            inspector: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        assignedContractor: true,
        tenant: {
          select: {
            companyName: true
          }
        }
      }
    })

    // Send email notification to contractor when assigned
    if (body.assignedContractorId && !existingDefect.assignedContractorId) {
      const contractor = await prisma.contractor.findUnique({
        where: { id: body.assignedContractorId }
      })

      if (contractor && updatedDefect.door && updatedDefect.door.building) {
        try {
          const emailHtml = getContractorAssignmentTemplate({
            contractorName: contractor.contactName,
            contractorCompany: contractor.companyName,
            ticketNumber: updatedDefect.ticketNumber,
            defectDescription: updatedDefect.description,
            severity: updatedDefect.severity,
            priority: updatedDefect.priority,
            category: updatedDefect.category,
            doorNumber: updatedDefect.door.doorNumber,
            doorLocation: updatedDefect.door.location,
            buildingName: updatedDefect.door.building.name,
            buildingAddress: updatedDefect.door.building.address || 'Address not available',
            detectedDate: updatedDefect.detectedDate.toISOString(),
            targetCompletionDate: updatedDefect.targetCompletionDate?.toISOString(),
            tenantName: updatedDefect.tenant?.companyName || 'Property Manager'
          })

          await sendEmail({
            to: contractor.email,
            subject: `New Defect Assignment: ${updatedDefect.ticketNumber} - ${updatedDefect.severity} Severity`,
            html: emailHtml
          })

          console.log(`Sent assignment email to contractor ${contractor.companyName} for defect ${updatedDefect.ticketNumber}`)
        } catch (emailError) {
          console.error('Error sending contractor assignment email:', emailError)
          // Don't fail the whole request if email fails
        }
      }
    }

    // Update contractor performance if repair was completed
    if (body.repairCompletedDate && existingDefect.assignedContractorId) {
      const contractor = await prisma.contractor.findUnique({
        where: { id: existingDefect.assignedContractorId }
      })

      if (contractor) {
        const assignedDate = existingDefect.assignedDate || existingDefect.createdAt
        const completedDate = new Date(body.repairCompletedDate)
        const daysToComplete = Math.ceil(
          (completedDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        const newCompletedJobs = contractor.completedJobs + 1
        const currentAvg = contractor.averageCompletionDays || 0
        const newAvg = ((currentAvg * contractor.completedJobs) + daysToComplete) / newCompletedJobs

        await prisma.contractor.update({
          where: { id: existingDefect.assignedContractorId },
          data: {
            completedJobs: newCompletedJobs,
            averageCompletionDays: newAvg
          }
        })
      }
    }

    return NextResponse.json(updatedDefect)
  } catch (error) {
    console.error('Error updating defect:', error)
    return NextResponse.json(
      { error: 'Failed to update defect' },
      { status: 500 }
    )
  }
}

// DELETE /api/defects/[id] - Delete defect (admin only)
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

  const { id } = await params

  // Only allow admins to delete defects
  if (user.role !== 'ADMIN' && !user.isSuperAdmin) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  try {
    // Verify defect belongs to tenant
    const defect = await prisma.defect.findFirst({
      where: {
        id,
        tenantId: user.tenant.id
      }
    })

    if (!defect) {
      return NextResponse.json(
        { error: 'Defect not found' },
        { status: 404 }
      )
    }

    await prisma.defect.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting defect:', error)
    return NextResponse.json(
      { error: 'Failed to delete defect' },
      { status: 500 }
    )
  }
}
