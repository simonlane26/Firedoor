import { prisma } from '@/lib/prisma'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'INSPECT'
  | 'APPROVE'
  | 'REJECT'
  | 'UPLOAD_EVIDENCE'
  | 'DELETE_EVIDENCE'
  | 'GENERATE_REPORT'

export type AuditEntityType = 'DOOR' | 'BUILDING' | 'INSPECTION' | 'USER' | 'EVIDENCE'

interface CreateAuditLogParams {
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  userId: string
  tenantId: string
  beforeSnapshot?: Record<string, any>
  afterSnapshot?: Record<string, any>
}

/**
 * Creates an audit trail entry for any action in the system
 */
export async function createAuditLog({
  entityType,
  entityId,
  action,
  userId,
  tenantId,
  beforeSnapshot,
  afterSnapshot
}: CreateAuditLogParams) {
  try {
    await prisma.auditTrail.create({
      data: {
        entityType,
        entityId,
        action,
        userId,
        tenantId,
        beforeSnapshot: beforeSnapshot ? JSON.stringify(beforeSnapshot) : null,
        afterSnapshot: afterSnapshot ? JSON.stringify(afterSnapshot) : null
      }
    })
  } catch (error) {
    // Log error but don't throw - audit failures shouldn't break the app
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Helper to capture snapshot of a door for audit trail
 */
export function getDoorSnapshot(door: any) {
  return {
    doorNumber: door.doorNumber,
    location: door.location,
    fireRating: door.fireRating,
    doorType: door.doorType,
    manufacturer: door.manufacturer,
    installationDate: door.installationDate,
    buildingId: door.buildingId
  }
}

/**
 * Helper to capture snapshot of a building for audit trail
 */
export function getBuildingSnapshot(building: any) {
  return {
    name: building.name,
    address: building.address,
    postcode: building.postcode,
    buildingType: building.buildingType,
    numberOfStoreys: building.numberOfStoreys,
    topStoreyHeight: building.topStoreyHeight,
    contactName: building.contactName,
    contactEmail: building.contactEmail,
    contactPhone: building.contactPhone
  }
}

/**
 * Helper to capture snapshot of an inspection for audit trail
 */
export function getInspectionSnapshot(inspection: any) {
  return {
    doorId: inspection.doorId,
    inspectionDate: inspection.inspectionDate,
    overallResult: inspection.overallResult,
    frameCondition: inspection.frameCondition,
    doorLeafCondition: inspection.doorLeafCondition,
    sealsIntumescentStrips: inspection.sealsIntumescentStrips,
    closerOperation: inspection.closerOperation,
    hingesCondition: inspection.hingesCondition,
    lockLatchOperation: inspection.lockLatchOperation,
    gapsAroundDoor: inspection.gapsAroundDoor,
    glazingCondition: inspection.glazingCondition,
    signagePresent: inspection.signagePresent,
    actionRequired: inspection.actionRequired,
    actionDescription: inspection.actionDescription,
    inspectorNotes: inspection.inspectorNotes,
    nextInspectionDate: inspection.nextInspectionDate
  }
}

/**
 * Get audit trail for a specific entity
 */
export async function getAuditTrail(entityType: AuditEntityType, entityId: string, tenantId: string) {
  return await prisma.auditTrail.findMany({
    where: {
      entityType,
      entityId,
      tenantId
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

/**
 * Get recent audit trail entries for a tenant
 */
export async function getRecentAuditTrail(tenantId: string, limit: number = 50) {
  return await prisma.auditTrail.findMany({
    where: {
      tenantId
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}
