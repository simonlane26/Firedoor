import ExcelJS from 'exceljs'

interface InspectionExportData {
  id: string
  inspectionDate: Date
  status: string
  overallResult: string | null
  doorNumber: string
  location: string
  fireRating: string
  doorType: string
  building: string
  buildingAddress: string
  inspector: string
  doorConstruction: string | null
  certificationProvided: boolean | null
  damageOrDefects: boolean
  doorClosesCompletely: boolean
  frameGapsAcceptable: boolean
  hingesSecure: boolean
  actionRequired: boolean
  actionDescription: string | null
}

/**
 * Generate Excel file with inspection data
 */
export async function generateInspectionsExcel(inspections: InspectionExportData[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Inspections')

  // Set column headers
  worksheet.columns = [
    { header: 'Inspection ID', key: 'id', width: 25 },
    { header: 'Inspection Date', key: 'inspectionDate', width: 15 },
    { header: 'Door Number', key: 'doorNumber', width: 12 },
    { header: 'Location', key: 'location', width: 25 },
    { header: 'Building', key: 'building', width: 25 },
    { header: 'Address', key: 'buildingAddress', width: 30 },
    { header: 'Fire Rating', key: 'fireRating', width: 12 },
    { header: 'Door Type', key: 'doorType', width: 20 },
    { header: 'Construction', key: 'doorConstruction', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Result', key: 'overallResult', width: 12 },
    { header: 'Inspector', key: 'inspector', width: 20 },
    { header: 'Certification', key: 'certificationProvided', width: 12 },
    { header: 'Damage', key: 'damageOrDefects', width: 10 },
    { header: 'Closes Completely', key: 'doorClosesCompletely', width: 15 },
    { header: 'Gaps OK', key: 'frameGapsAcceptable', width: 10 },
    { header: 'Hinges Secure', key: 'hingesSecure', width: 12 },
    { header: 'Action Required', key: 'actionRequired', width: 15 },
    { header: 'Action Description', key: 'actionDescription', width: 40 },
  ]

  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDC2626' },
  }
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

  // Add data rows
  inspections.forEach((inspection) => {
    const row = worksheet.addRow({
      id: inspection.id,
      inspectionDate: inspection.inspectionDate,
      doorNumber: inspection.doorNumber,
      location: inspection.location,
      building: inspection.building,
      buildingAddress: inspection.buildingAddress,
      fireRating: inspection.fireRating,
      doorType: inspection.doorType.replace(/_/g, ' '),
      doorConstruction: inspection.doorConstruction || 'N/A',
      status: inspection.status,
      overallResult: inspection.overallResult || 'PENDING',
      inspector: inspection.inspector,
      certificationProvided: inspection.certificationProvided === true ? 'YES' : inspection.certificationProvided === false ? 'NO' : 'N/A',
      damageOrDefects: inspection.damageOrDefects ? 'YES' : 'NO',
      doorClosesCompletely: inspection.doorClosesCompletely ? 'YES' : 'NO',
      frameGapsAcceptable: inspection.frameGapsAcceptable ? 'YES' : 'NO',
      hingesSecure: inspection.hingesSecure ? 'YES' : 'NO',
      actionRequired: inspection.actionRequired ? 'YES' : 'NO',
      actionDescription: inspection.actionDescription || '',
    })

    // Color code by result
    const resultCell = row.getCell('overallResult')
    if (inspection.overallResult === 'PASS') {
      resultCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF16A34A' },
      }
      resultCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    } else if (inspection.overallResult === 'FAIL') {
      resultCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC2626' },
      }
      resultCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    }

    // Highlight action required
    if (inspection.actionRequired) {
      row.getCell('actionRequired').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEF2F2' },
      }
    }
  })

  // Auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: `S1`,
  }

  // Freeze header row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

/**
 * Generate Excel summary report with stats
 */
export async function generateSummaryExcel(data: {
  doors: Array<{
    doorNumber: string
    location: string
    fireRating: string
    doorType: string
    building: string
    lastInspectionDate: Date | null
    lastInspectionResult: string | null
    nextInspectionDate: Date | null
    status: string
  }>
  stats: {
    totalDoors: number
    passCount: number
    failCount: number
    pendingCount: number
    overdueCount: number
    complianceRate: number
  }
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()

  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary')

  summarySheet.mergeCells('A1:B1')
  summarySheet.getCell('A1').value = 'Fire Door Compliance Summary'
  summarySheet.getCell('A1').font = { bold: true, size: 16 }
  summarySheet.getCell('A1').alignment = { horizontal: 'center' }

  summarySheet.addRow([])
  summarySheet.addRow(['Metric', 'Value'])
  summarySheet.getRow(3).font = { bold: true }
  summarySheet.getRow(3).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDC2626' },
  }
  summarySheet.getRow(3).font = { color: { argb: 'FFFFFFFF' }, bold: true }

  summarySheet.addRow(['Total Doors', data.stats.totalDoors])
  summarySheet.addRow(['Passed Inspections', data.stats.passCount])
  summarySheet.addRow(['Failed Inspections', data.stats.failCount])
  summarySheet.addRow(['Pending Inspections', data.stats.pendingCount])
  summarySheet.addRow(['Overdue Inspections', data.stats.overdueCount])
  summarySheet.addRow(['Compliance Rate', `${data.stats.complianceRate.toFixed(1)}%`])

  summarySheet.getColumn(1).width = 25
  summarySheet.getColumn(2).width = 15

  // Doors sheet
  const doorsSheet = workbook.addWorksheet('Doors')

  doorsSheet.columns = [
    { header: 'Door Number', key: 'doorNumber', width: 12 },
    { header: 'Location', key: 'location', width: 25 },
    { header: 'Building', key: 'building', width: 25 },
    { header: 'Fire Rating', key: 'fireRating', width: 12 },
    { header: 'Door Type', key: 'doorType', width: 20 },
    { header: 'Last Inspection', key: 'lastInspectionDate', width: 15 },
    { header: 'Last Result', key: 'lastInspectionResult', width: 12 },
    { header: 'Next Inspection', key: 'nextInspectionDate', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
  ]

  doorsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  doorsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDC2626' },
  }

  data.doors.forEach((door) => {
    const row = doorsSheet.addRow({
      doorNumber: door.doorNumber,
      location: door.location,
      building: door.building,
      fireRating: door.fireRating,
      doorType: door.doorType.replace(/_/g, ' '),
      lastInspectionDate: door.lastInspectionDate || 'Never',
      lastInspectionResult: door.lastInspectionResult || 'N/A',
      nextInspectionDate: door.nextInspectionDate || 'Not Set',
      status: door.status,
    })

    // Color code status
    const statusCell = row.getCell('status')
    if (door.status === 'Compliant') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF16A34A' },
      }
      statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    } else if (door.status === 'Overdue') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC2626' },
      }
      statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    }
  })

  doorsSheet.autoFilter = {
    from: 'A1',
    to: 'I1',
  }

  doorsSheet.views = [{ state: 'frozen', ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
