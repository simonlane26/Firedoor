import { prisma } from './prisma'

interface DefectCreationResult {
  created: boolean
  defectId?: string
  ticketNumber?: string
  error?: string
}

/**
 * Automatically creates defects from a failed or requires-attention inspection
 * Only creates defects if they don't already exist for this inspection
 */
export async function autoCreateDefectsFromInspection(
  inspectionId: string,
  tenantId: string
): Promise<DefectCreationResult[]> {
  try {
    // Get the full inspection with all check details
    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: {
        fireDoor: true
      }
    })

    if (!inspection) {
      return [{ created: false, error: 'Inspection not found' }]
    }

    // Only create defects for failed or requires-attention inspections
    if (
      inspection.status !== 'REQUIRES_ACTION' &&
      inspection.overallResult !== 'FAIL' &&
      inspection.overallResult !== 'REQUIRES_ATTENTION'
    ) {
      return [{ created: false, error: 'Inspection does not require defects' }]
    }

    // Check if defects already exist for this inspection
    const existingDefects = await prisma.defect.findMany({
      where: { inspectionId }
    })

    if (existingDefects.length > 0) {
      return [{ created: false, error: 'Defects already exist for this inspection' }]
    }

    const results: DefectCreationResult[] = []
    const defectsToCreate: Array<{
      category: string
      description: string
      severity: 'CRITICAL' | 'MAJOR' | 'MINOR'
    }> = []

    // Analyze inspection failures and create defect descriptions

    // CRITICAL FAILURES
    if (!inspection.doorConstruction) {
      defectsToCreate.push({
        category: 'Door Construction',
        description: 'Door construction type not specified or incorrect. Fire door must have proper construction certification.',
        severity: 'CRITICAL'
      })
    }

    if (inspection.doorLeafFrameOk === false) {
      defectsToCreate.push({
        category: 'Door & Frame Rating',
        description: 'Door leaf and frame do not have the same fire rating. This is a critical safety violation.',
        severity: 'CRITICAL'
      })
    }

    if (inspection.doorClosesCompletely === false) {
      defectsToCreate.push({
        category: 'Door Operation',
        description: 'Door does not close completely. Fire door must close fully to provide fire resistance.',
        severity: 'CRITICAL'
      })
    }

    if (inspection.doorClosesFromAnyAngle === false) {
      defectsToCreate.push({
        category: 'Door Operation',
        description: 'Door does not close from any angle. Self-closing mechanism is faulty or missing.',
        severity: 'CRITICAL'
      })
    }

    if (inspection.frameGapsAcceptable === false) {
      const gapSize = inspection.maxGapSize || 'unknown'
      defectsToCreate.push({
        category: 'Frame Gaps',
        description: `Frame gaps exceed 4mm (measured: ${gapSize}mm). Excessive gaps compromise fire resistance.`,
        severity: 'CRITICAL'
      })
    }

    // MAJOR ISSUES
    if (inspection.hingesSecure === false) {
      defectsToCreate.push({
        category: 'Hinges',
        description: 'Hinges are not secure or properly fixed. This affects door closure and fire resistance.',
        severity: 'MAJOR'
      })
    }

    if (inspection.intumescentStripsIntact === false && inspection.fireDoor.hasIntumescentStrips) {
      defectsToCreate.push({
        category: 'Intumescent Strips',
        description: 'Intumescent strips are damaged, missing, or not intact. These are essential for fire resistance.',
        severity: 'MAJOR'
      })
    }

    if (inspection.smokeSealsIntact === false && inspection.fireDoor.hasSmokeSeal) {
      defectsToCreate.push({
        category: 'Smoke Seals',
        description: 'Smoke seals are damaged or missing. Smoke seals prevent smoke spread during a fire.',
        severity: 'MAJOR'
      })
    }

    // MINOR ISSUES
    if (inspection.doorSignageCorrect === false) {
      defectsToCreate.push({
        category: 'Signage',
        description: 'Fire door signage is missing, damaged, or incorrect. Proper signage is required by regulations.',
        severity: 'MINOR'
      })
    }

    if (inspection.damageOrDefects === true && inspection.damageDescription) {
      defectsToCreate.push({
        category: 'Damage/Defects',
        description: `Physical damage detected: ${inspection.damageDescription}`,
        severity: 'MAJOR'
      })
    }

    if (inspection.letterboxClosesProperly === false && inspection.fireDoor.hasLetterbox) {
      defectsToCreate.push({
        category: 'Letterbox',
        description: 'Letterbox does not close properly. Letterbox must be fire-rated and self-closing.',
        severity: 'MAJOR'
      })
    }

    if (inspection.glazingIntact === false && inspection.fireDoor.hasGlazing) {
      defectsToCreate.push({
        category: 'Glazing',
        description: 'Fire-rated glazing is damaged or not intact. Glazing must maintain fire resistance rating.',
        severity: 'CRITICAL'
      })
    }

    if (inspection.airTransferGrilleIntact === false && inspection.fireDoor.hasAirTransferGrille) {
      defectsToCreate.push({
        category: 'Air Transfer Grille',
        description: 'Air transfer grille is damaged or not properly fitted. Must be fire-rated and secure.',
        severity: 'MAJOR'
      })
    }

    // Create each defect
    for (const defectData of defectsToCreate) {
      try {
        // Generate ticket number
        const today = new Date()
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

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

        // Determine priority based on severity
        const priority = defectData.severity === 'CRITICAL' ? 'URGENT' :
                        defectData.severity === 'MAJOR' ? 'HIGH' : 'MEDIUM'

        const defect = await prisma.defect.create({
          data: {
            ticketNumber,
            inspectionId: inspection.id,
            doorId: inspection.fireDoorId,
            severity: defectData.severity,
            category: defectData.category,
            description: defectData.description,
            priority,
            status: 'OPEN',
            tenantId,
            detectedDate: inspection.inspectionDate || new Date()
          }
        })

        results.push({
          created: true,
          defectId: defect.id,
          ticketNumber: defect.ticketNumber
        })
      } catch (error) {
        console.error('Error creating defect:', error)
        results.push({
          created: false,
          error: `Failed to create defect for ${defectData.category}`
        })
      }
    }

    return results
  } catch (error) {
    console.error('Error in autoCreateDefectsFromInspection:', error)
    return [{ created: false, error: 'Failed to process inspection for defects' }]
  }
}
