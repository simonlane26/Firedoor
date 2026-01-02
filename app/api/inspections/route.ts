import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserWithTenant } from '@/lib/tenant'
import { createAuditLog, getInspectionSnapshot } from '@/lib/audit-trail'
import { autoCreateDefectsFromInspection } from '@/lib/auto-defect'

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
  const statusParam = searchParams.get('status')

  // Get all doors with their most recent inspection
  const doors = await prisma.fireDoor.findMany({
    where: {
      tenantId: user.tenant.id,
      building: { managerId: session.user.id }
    },
    include: {
      building: true,
      inspections: {
        orderBy: { inspectionDate: 'desc' },
        take: 1,
        include: {
          inspector: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  })

  // Extract the most recent inspection from each door and flatten
  let inspections = doors
    .filter(door => door.inspections.length > 0)
    .map(door => ({
      ...door.inspections[0],
      fireDoor: {
        id: door.id,
        doorNumber: door.doorNumber,
        location: door.location,
        fireRating: door.fireRating,
        doorType: door.doorType,
        building: door.building
      }
    }))

  // Apply status filter if provided
  if (statusParam === 'pending') {
    inspections = inspections.filter(i => i.status === 'PENDING')
  } else if (statusParam === 'action') {
    inspections = inspections.filter(i =>
      i.status === 'REQUIRES_ACTION' || i.overallResult === 'REQUIRES_ATTENTION'
    )
  } else if (statusParam === 'passed') {
    inspections = inspections.filter(i => i.overallResult === 'PASS')
  } else if (statusParam === 'failed') {
    inspections = inspections.filter(i => i.overallResult === 'FAIL')
  }

  // Sort by inspection date descending
  inspections.sort((a, b) =>
    new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
  )

  return NextResponse.json(inspections)
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

  const inspection = await prisma.inspection.create({
    data: {
      fireDoorId: body.fireDoorId,
      inspectorId: session.user.id,
      tenantId: user.tenant.id,
      inspectionType: body.inspectionType,
      status: 'PENDING',
      damageOrDefects: false,
      doorClosesCompletely: false,
      doorClosesFromAnyAngle: false,
      frameGapsAcceptable: false,
      hingesSecure: false
    }
  })

  // Create audit log
  await createAuditLog({
    entityType: 'INSPECTION',
    entityId: inspection.id,
    action: 'CREATE',
    userId: session.user.id,
    tenantId: user.tenant.id,
    afterSnapshot: getInspectionSnapshot(inspection)
  })

  return NextResponse.json(inspection)
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  const body = await request.json()
  const {
    id,
    fireDoorId,
    inspectorId,
    tenantId,
    // Remove fields that don't exist in schema (form uses different naming)
    visualInspectionOk,
    visualInspectionComments,
    doorLeafFrameSameRating,
    doorLeafFrameRatingComments,
    excessiveGapsOrDamage,
    excessiveGapsOrDamageComments,
    doorClosesCompletelyOk,
    doorClosesCompletelyComments,
    doorClosesFromAnyAngleOk,
    doorClosesFromAnyAngleComments,
    frameGapsAcceptableOk,
    frameGapsAcceptableComments,
    photoPaths, // Managed separately
    ...data
  } = body

  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: { fireDoor: { include: { building: true } } }
  })

  if (
    !inspection ||
    inspection.tenantId !== user.tenant.id ||
    inspection.fireDoor.building.managerId !== session.user.id
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Capture before state
  const beforeSnapshot = getInspectionSnapshot(inspection)

  // Auto-calculate status and overallResult based on inspection checks
  // Merge current inspection data with updates
  const mergedData = { ...inspection, ...data }

  // Determine if there are any failures
  const criticalFailures = [
    !mergedData.doorConstruction,
    !mergedData.doorLeafFrameOk,
    !mergedData.doorClosesCompletely,
    !mergedData.doorClosesFromAnyAngle,
    !mergedData.frameGapsAcceptable
  ].filter(Boolean).length

  const minorIssues = [
    !mergedData.hingesSecure,
    !mergedData.intumescentStripsIntact,
    !mergedData.doorSignageCorrect,
    mergedData.damageOrDefects
  ].filter(Boolean).length

  // Auto-set status and overallResult if not explicitly provided
  if (!data.status || !data.overallResult) {
    let autoStatus = 'PENDING'
    let autoResult = null

    // If inspection has been filled out (has some check data)
    if (data.doorConstruction !== undefined || mergedData.doorConstruction !== undefined) {
      if (criticalFailures > 0) {
        autoStatus = 'REQUIRES_ACTION'
        autoResult = 'FAIL'
      } else if (minorIssues > 0) {
        autoStatus = 'COMPLETED'
        autoResult = 'REQUIRES_ATTENTION'
      } else {
        autoStatus = 'COMPLETED'
        autoResult = 'PASS'
      }
    }

    // Override with provided values if they exist
    data.status = data.status || autoStatus
    data.overallResult = data.overallResult || autoResult
  }

  const updated = await prisma.inspection.update({
    where: { id },
    data: {
      ...data,
      completedAt: data.status === 'COMPLETED' || data.status === 'REQUIRES_ACTION' ? new Date() : null
    }
  })

  // Update the fire door's nextInspectionDate if this inspection has one
  if (data.nextInspectionDate) {
    await prisma.fireDoor.update({
      where: { id: inspection.fireDoorId },
      data: {
        nextInspectionDate: new Date(data.nextInspectionDate)
      }
    })
  }

  // Create audit log with before/after snapshots
  const action = data.status === 'COMPLETED' ? 'INSPECT' : 'UPDATE'
  await createAuditLog({
    entityType: 'INSPECTION',
    entityId: inspection.id,
    action,
    userId: session.user.id,
    tenantId: user.tenant.id,
    beforeSnapshot,
    afterSnapshot: getInspectionSnapshot(updated)
  })

  // Auto-create defects if inspection failed or requires attention
  if (
    updated.status === 'REQUIRES_ACTION' ||
    updated.overallResult === 'FAIL' ||
    updated.overallResult === 'REQUIRES_ATTENTION'
  ) {
    try {
      const defectResults = await autoCreateDefectsFromInspection(updated.id, user.tenant.id)
      console.log(`Auto-created ${defectResults.filter(r => r.created).length} defects for inspection ${updated.id}`)
    } catch (error) {
      console.error('Error auto-creating defects:', error)
      // Don't fail the inspection update if defect creation fails
    }
  }

  return NextResponse.json(updated)
}
