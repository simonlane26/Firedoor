import Papa from 'papaparse'
import { prisma } from './prisma'

// Building CSV Import Types
export interface BuildingCSVRow {
  name: string
  address: string
  postcode: string
  buildingType: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE' | 'INDUSTRIAL' | 'PUBLIC'
  numberOfStoreys?: number
  contactName?: string
  contactEmail?: string
  contactPhone?: string
}

export interface BuildingImportResult {
  success: boolean
  imported: number
  failed: number
  errors: Array<{ row: number; error: string; data?: any }>
}

// Fire Door CSV Import Types
export interface FireDoorCSVRow {
  doorNumber: string
  location: string
  buildingName: string
  fireRating: 'FD30' | 'FD60' | 'FD90' | 'FD120'
  doorType: 'FLAT_ENTRANCE' | 'COMMUNAL_STAIRWAY' | 'COMMUNAL_CORRIDOR' | 'RISER_CUPBOARD' | 'METER_CUPBOARD' | 'OTHER'
  manufacturer?: string
  installationDate?: string
  notes?: string
}

export interface FireDoorImportResult {
  success: boolean
  imported: number
  failed: number
  errors: Array<{ row: number; error: string; data?: any }>
}

/**
 * Validates a building CSV row
 */
function validateBuildingRow(row: any, rowNumber: number): { valid: boolean; error?: string } {
  if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
    return { valid: false, error: 'Building name is required' }
  }

  if (!row.address || typeof row.address !== 'string' || row.address.trim() === '') {
    return { valid: false, error: 'Address is required' }
  }

  if (!row.postcode || typeof row.postcode !== 'string' || row.postcode.trim() === '') {
    return { valid: false, error: 'Postcode is required' }
  }

  const validBuildingTypes = ['RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'INDUSTRIAL', 'PUBLIC']
  if (!row.buildingType || !validBuildingTypes.includes(row.buildingType)) {
    return { valid: false, error: `Building type must be one of: ${validBuildingTypes.join(', ')}` }
  }

  if (row.numberOfStoreys && (isNaN(Number(row.numberOfStoreys)) || Number(row.numberOfStoreys) < 1)) {
    return { valid: false, error: 'Number of storeys must be a positive number' }
  }

  if (row.contactEmail && !isValidEmail(row.contactEmail)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

/**
 * Validates a fire door CSV row
 */
function validateFireDoorRow(row: any, rowNumber: number): { valid: boolean; error?: string } {
  if (!row.doorNumber || typeof row.doorNumber !== 'string' || row.doorNumber.trim() === '') {
    return { valid: false, error: 'Door number is required' }
  }

  if (!row.location || typeof row.location !== 'string' || row.location.trim() === '') {
    return { valid: false, error: 'Location is required' }
  }

  if (!row.buildingName || typeof row.buildingName !== 'string' || row.buildingName.trim() === '') {
    return { valid: false, error: 'Building name is required' }
  }

  const validFireRatings = ['FD30', 'FD60', 'FD90', 'FD120']
  if (!row.fireRating || !validFireRatings.includes(row.fireRating)) {
    return { valid: false, error: `Fire rating must be one of: ${validFireRatings.join(', ')}` }
  }

  const validDoorTypes = [
    'FLAT_ENTRANCE',
    'COMMUNAL_STAIRWAY',
    'COMMUNAL_CORRIDOR',
    'RISER_CUPBOARD',
    'METER_CUPBOARD',
    'OTHER',
  ]
  if (!row.doorType || !validDoorTypes.includes(row.doorType)) {
    return { valid: false, error: `Door type must be one of: ${validDoorTypes.join(', ')}` }
  }

  if (row.installationDate && !isValidDate(row.installationDate)) {
    return { valid: false, error: 'Installation date must be in format YYYY-MM-DD' }
  }

  return { valid: true }
}

/**
 * Helper function to validate email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Helper function to validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return false

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Import buildings from CSV data
 */
export async function importBuildingsFromCSV(
  csvData: string,
  tenantId: string,
  managerId: string
): Promise<BuildingImportResult> {
  const result: BuildingImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
  }

  return new Promise((resolve) => {
    Papa.parse<BuildingCSVRow>(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i]
          const rowNumber = i + 2 // +2 because of header row and 0-indexing

          try {
            // Validate row
            const validation = validateBuildingRow(row, rowNumber)
            if (!validation.valid) {
              result.failed++
              result.errors.push({
                row: rowNumber,
                error: validation.error || 'Validation failed',
                data: row,
              })
              continue
            }

            // Check for duplicate building name in this tenant
            const existing = await prisma.building.findFirst({
              where: {
                tenantId,
                name: row.name.trim(),
              },
            })

            if (existing) {
              result.failed++
              result.errors.push({
                row: rowNumber,
                error: `Building with name "${row.name}" already exists`,
                data: row,
              })
              continue
            }

            // Create building
            await prisma.building.create({
              data: {
                name: row.name.trim(),
                address: row.address.trim(),
                postcode: row.postcode.trim(),
                buildingType: row.buildingType,
                numberOfStoreys: row.numberOfStoreys ? Number(row.numberOfStoreys) : null,
                contactName: row.contactName?.trim() || null,
                contactEmail: row.contactEmail?.trim() || null,
                contactPhone: row.contactPhone?.trim() || null,
                tenantId,
                managerId,
              },
            })

            result.imported++
          } catch (error) {
            result.failed++
            result.errors.push({
              row: rowNumber,
              error: error instanceof Error ? error.message : 'Unknown error',
              data: row,
            })
          }
        }

        result.success = result.failed === 0
        resolve(result)
      },
      error: (error: Error) => {
        result.success = false
        result.errors.push({
          row: 0,
          error: `CSV parsing error: ${error.message}`,
        })
        resolve(result)
      },
    })
  })
}

/**
 * Import fire doors from CSV data
 */
export async function importFireDoorsFromCSV(
  csvData: string,
  tenantId: string
): Promise<FireDoorImportResult> {
  const result: FireDoorImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
  }

  return new Promise((resolve) => {
    Papa.parse<FireDoorCSVRow>(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i]
          const rowNumber = i + 2 // +2 because of header row and 0-indexing

          try {
            // Validate row
            const validation = validateFireDoorRow(row, rowNumber)
            if (!validation.valid) {
              result.failed++
              result.errors.push({
                row: rowNumber,
                error: validation.error || 'Validation failed',
                data: row,
              })
              continue
            }

            // Find building by name
            const building = await prisma.building.findFirst({
              where: {
                tenantId,
                name: row.buildingName.trim(),
              },
            })

            if (!building) {
              result.failed++
              result.errors.push({
                row: rowNumber,
                error: `Building "${row.buildingName}" not found. Please create the building first.`,
                data: row,
              })
              continue
            }

            // Check for duplicate door number in this building
            const existing = await prisma.fireDoor.findFirst({
              where: {
                tenantId,
                buildingId: building.id,
                doorNumber: row.doorNumber.trim(),
              },
            })

            if (existing) {
              result.failed++
              result.errors.push({
                row: rowNumber,
                error: `Door "${row.doorNumber}" already exists in building "${row.buildingName}"`,
                data: row,
              })
              continue
            }

            // Create fire door
            await prisma.fireDoor.create({
              data: {
                doorNumber: row.doorNumber.trim(),
                location: row.location.trim(),
                fireRating: row.fireRating,
                doorType: row.doorType,
                manufacturer: row.manufacturer?.trim() || null,
                installationDate: row.installationDate ? new Date(row.installationDate) : null,
                notes: row.notes?.trim() || null,
                buildingId: building.id,
                tenantId,
              },
            })

            result.imported++
          } catch (error) {
            result.failed++
            result.errors.push({
              row: rowNumber,
              error: error instanceof Error ? error.message : 'Unknown error',
              data: row,
            })
          }
        }

        result.success = result.failed === 0
        resolve(result)
      },
      error: (error: Error) => {
        result.success = false
        result.errors.push({
          row: 0,
          error: `CSV parsing error: ${error.message}`,
        })
        resolve(result)
      },
    })
  })
}
