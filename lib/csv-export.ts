import Papa from 'papaparse'
import { Building, FireDoor, Inspection } from '@prisma/client'

// Building export type
export interface BuildingExportData {
  name: string
  address: string
  postcode: string
  buildingType: string
  numberOfStoreys: number | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  totalDoors: number
  createdAt: string
}

// Fire Door export type
export interface FireDoorExportData {
  doorNumber: string
  location: string
  buildingName: string
  fireRating: string
  doorType: string
  manufacturer: string | null
  installationDate: string | null
  lastInspectionDate: string | null
  lastInspectionResult: string | null
  nextInspectionDate: string | null
  status: string
  notes: string | null
}

// Inspection export type
export interface InspectionExportData {
  inspectionDate: string
  doorNumber: string
  location: string
  buildingName: string
  fireRating: string
  inspector: string
  status: string
  overallResult: string | null
  doorConstruction: string | null
  certificationProvided: string
  damageOrDefects: string
  doorClosesCompletely: string
  frameGapsAcceptable: string
  hingesSecure: string
  actionRequired: string
  actionDescription: string | null
}

/**
 * Export buildings to CSV
 */
export function exportBuildingsToCSV(buildings: BuildingExportData[]): string {
  const csv = Papa.unparse(buildings, {
    header: true,
    columns: [
      'name',
      'address',
      'postcode',
      'buildingType',
      'numberOfStoreys',
      'contactName',
      'contactEmail',
      'contactPhone',
      'totalDoors',
      'createdAt',
    ],
  })

  return csv
}

/**
 * Export fire doors to CSV
 */
export function exportFireDoorsToCSV(doors: FireDoorExportData[]): string {
  const csv = Papa.unparse(doors, {
    header: true,
    columns: [
      'doorNumber',
      'location',
      'buildingName',
      'fireRating',
      'doorType',
      'manufacturer',
      'installationDate',
      'lastInspectionDate',
      'lastInspectionResult',
      'nextInspectionDate',
      'status',
      'notes',
    ],
  })

  return csv
}

/**
 * Export inspections to CSV
 */
export function exportInspectionsToCSV(inspections: InspectionExportData[]): string {
  const csv = Papa.unparse(inspections, {
    header: true,
    columns: [
      'inspectionDate',
      'doorNumber',
      'location',
      'buildingName',
      'fireRating',
      'inspector',
      'status',
      'overallResult',
      'doorConstruction',
      'certificationProvided',
      'damageOrDefects',
      'doorClosesCompletely',
      'frameGapsAcceptable',
      'hingesSecure',
      'actionRequired',
      'actionDescription',
    ],
  })

  return csv
}

/**
 * Generate CSV template for building import
 */
export function generateBuildingTemplate(): string {
  const template = [
    {
      name: 'Example Building A',
      address: '123 High Street',
      postcode: 'SW1A 1AA',
      buildingType: 'RESIDENTIAL',
      numberOfStoreys: '12',
      contactName: 'John Smith',
      contactEmail: 'john.smith@example.com',
      contactPhone: '020 1234 5678',
    },
    {
      name: 'Example Building B',
      address: '456 Main Road',
      postcode: 'EC1A 1BB',
      buildingType: 'COMMERCIAL',
      numberOfStoreys: '8',
      contactName: 'Jane Doe',
      contactEmail: 'jane.doe@example.com',
      contactPhone: '020 9876 5432',
    },
  ]

  const csv = Papa.unparse(template, {
    header: true,
    columns: [
      'name',
      'address',
      'postcode',
      'buildingType',
      'numberOfStoreys',
      'contactName',
      'contactEmail',
      'contactPhone',
    ],
  })

  return csv
}

/**
 * Generate CSV template for fire door import
 */
export function generateFireDoorTemplate(): string {
  const template = [
    {
      doorNumber: 'FD-001',
      location: 'Ground Floor, Flat 1',
      buildingName: 'Example Building A',
      fireRating: 'FD30',
      doorType: 'FLAT_ENTRANCE',
      manufacturer: 'Fire Door Co',
      installationDate: '2023-01-15',
      notes: 'New installation',
    },
    {
      doorNumber: 'FD-002',
      location: 'Ground Floor, Stairwell',
      buildingName: 'Example Building A',
      fireRating: 'FD60',
      doorType: 'COMMUNAL_STAIRWAY',
      manufacturer: 'Safety Doors Ltd',
      installationDate: '2023-01-15',
      notes: '',
    },
  ]

  const csv = Papa.unparse(template, {
    header: true,
    columns: [
      'doorNumber',
      'location',
      'buildingName',
      'fireRating',
      'doorType',
      'manufacturer',
      'installationDate',
      'notes',
    ],
  })

  return csv
}

/**
 * Generate a comprehensive guide CSV with all valid values
 */
export function generateImportGuide(): string {
  const guide = [
    {
      field: 'Building Type',
      validValues: 'RESIDENTIAL, COMMERCIAL, MIXED_USE, INDUSTRIAL, PUBLIC',
      required: 'Yes',
      example: 'RESIDENTIAL',
    },
    {
      field: 'Fire Rating',
      validValues: 'FD30, FD60, FD90, FD120',
      required: 'Yes',
      example: 'FD30',
    },
    {
      field: 'Door Type',
      validValues: 'FLAT_ENTRANCE, COMMUNAL_STAIRWAY, COMMUNAL_CORRIDOR, RISER_CUPBOARD, METER_CUPBOARD, OTHER',
      required: 'Yes',
      example: 'FLAT_ENTRANCE',
    },
    {
      field: 'Installation Date',
      validValues: 'YYYY-MM-DD format',
      required: 'No',
      example: '2023-01-15',
    },
    {
      field: 'Number of Storeys',
      validValues: 'Positive integer',
      required: 'No',
      example: '12',
    },
  ]

  const csv = Papa.unparse(guide, {
    header: true,
    columns: ['field', 'validValues', 'required', 'example'],
  })

  return csv
}
