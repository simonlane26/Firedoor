import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

/**
 * Helper function to load image from URL or file path
 */
async function loadImage(path: string): Promise<Buffer | string> {
  // If it's a URL (starts with http:// or https://), fetch it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const response = await fetch(path)
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      console.error('Error fetching image from URL:', error)
      throw error
    }
  }
  // Otherwise, it's a local file path
  return path
}

interface InspectionData {
  id: string
  inspectionDate: Date
  status: string
  overallResult: string | null
  door: {
    doorNumber: string
    location: string
    fireRating: string
    doorType: string
    building: {
      name: string
      address: string
    }
  }
  inspector: {
    name: string
    email: string
  }
  tenantLogoUrl?: string | null
  tenantBranding?: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    textColor: string
  } | null
  doorConstruction: string | null
  certificationProvided: boolean | null
  damageOrDefects: boolean
  damageDescription: string | null
  doorLeafFrameOk: boolean
  doorClosesCompletely: boolean
  doorClosesFromAnyAngle: boolean
  doorOpensInDirectionOfTravel: boolean
  frameGapsAcceptable: boolean
  maxGapSize: number | null
  hingesSecure: boolean
  hingesCEMarked: boolean | null
  hingesGoodCondition: boolean | null
  screwsInPlaceAndSecure: boolean | null
  minimumHingesPresent: boolean | null
  intumescentStripsIntact: boolean | null
  smokeSealsIntact: boolean | null
  letterboxClosesProperly: boolean | null
  glazingIntact: boolean | null
  airTransferGrilleIntact: boolean | null
  actionRequired: boolean
  actionDescription: string | null
  inspectorNotes: string | null
}

interface BuildingReportData {
  building: {
    name: string
    address: string
    postcode: string
    buildingType: string
    numberOfStoreys: number
  }
  doors: Array<{
    doorNumber: string
    location: string
    fireRating: string
    doorType: string
    lastInspection: {
      inspectionDate: Date
      status: string
      overallResult: string | null
    } | null
    nextInspectionDate: Date | null
  }>
  stats: {
    totalDoors: number
    passCount: number
    failCount: number
    pendingCount: number
    overdueCount: number
  }
  tenantLogoUrl?: string | null
  tenantBranding?: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    textColor: string
  } | null
}

/**
 * Generate PDF for a single inspection certificate
 */
export async function generateInspectionCertificate(data: InspectionData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    // Use tenant branding colors or defaults
    const primaryColor = data.tenantBranding?.primaryColor || '#dc2626'
    const secondaryColor = data.tenantBranding?.secondaryColor || '#991b1b'
    const accentColor = data.tenantBranding?.accentColor || '#f59e0b'
    const textColor = data.tenantBranding?.textColor || '#1f2937'

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Logo - use tenant logo if available, otherwise use DoorCompliance.co.uk logo
    try {
      const logoPath = data.tenantLogoUrl || 'public/ChatGPT Image Dec 30, 2025, 06_29_19 PM-Picsart-BackgroundRemover.png'
      const imageData = await loadImage(logoPath)
      doc.image(imageData, {
        fit: [200, 80],
        align: 'center'
      })
      doc.moveDown(0.5)
    } catch (e) {
      // Logo not found, continue without it
      console.error('Failed to load logo:', e)
    }

    // Header
    doc.fontSize(20).fillColor(primaryColor).text('Fire Door Inspection Certificate', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#6b7280').text('Fire Safety (England) Regulations 2022', { align: 'center' })
    doc.moveDown(2)

    // Inspection Result Badge
    const resultColor = data.overallResult === 'PASS' ? '#16a34a' : primaryColor
    const resultText = data.overallResult || 'PENDING'
    doc.fontSize(16).fillColor(resultColor).text(`Result: ${resultText}`, { align: 'center' })
    doc.moveDown(2)

    // Door Information
    doc.fontSize(14).fillColor(textColor).text('Door Information', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor(textColor)
    doc.text(`Door Number: ${data.door.doorNumber}`)
    doc.text(`Location: ${data.door.location}`)
    doc.text(`Fire Rating: ${data.door.fireRating}`)
    doc.text(`Door Type: ${data.door.doorType.replace(/_/g, ' ')}`)
    if (data.doorConstruction) {
      doc.text(`Construction: ${data.doorConstruction}`)
    }
    doc.moveDown()

    // Building Information
    doc.fontSize(14).fillColor(textColor).text('Building Information', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor(textColor)
    doc.text(`Building: ${data.door.building.name}`)
    doc.text(`Address: ${data.door.building.address}`)
    doc.moveDown()

    // Inspection Details
    doc.fontSize(14).fillColor(textColor).text('Inspection Details', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor(textColor)
    doc.text(`Inspection Date: ${data.inspectionDate.toLocaleDateString('en-GB')}`)
    doc.text(`Inspector: ${data.inspector.name}`)
    doc.text(`Status: ${data.status}`)
    doc.moveDown()

    // Inspection Findings
    doc.fontSize(14).fillColor(textColor).text('Inspection Findings', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10)

    const findings = [
      { label: 'Door Leaf/Frame', value: data.doorLeafFrameOk ? 'PASS' : 'FAIL' },
      { label: 'Certification Provided', value: data.certificationProvided === true ? 'YES' : data.certificationProvided === false ? 'NO' : 'N/A' },
      { label: 'Damage or Defects', value: data.damageOrDefects ? 'YES' : 'NO' },
      { label: 'Door Closes Completely', value: data.doorClosesCompletely ? 'YES' : 'NO' },
      { label: 'Door Closes from Any Angle', value: data.doorClosesFromAnyAngle ? 'YES' : 'NO' },
      { label: 'Door Opens in Direction of Travel', value: data.doorOpensInDirectionOfTravel ? 'YES' : 'NO' },
      { label: 'Frame Gaps Acceptable', value: data.frameGapsAcceptable ? 'YES' : 'NO' },
      { label: 'Hinges Secure', value: data.hingesSecure ? 'YES' : 'NO' },
      { label: 'Hinges CE Marked', value: data.hingesCEMarked === true ? 'YES' : data.hingesCEMarked === false ? 'NO' : 'N/A' },
      { label: 'Hinges Good Condition', value: data.hingesGoodCondition === true ? 'YES' : data.hingesGoodCondition === false ? 'NO' : 'N/A' },
      { label: 'Screws in Place', value: data.screwsInPlaceAndSecure === true ? 'YES' : data.screwsInPlaceAndSecure === false ? 'NO' : 'N/A' },
      { label: 'Minimum Hinges Present', value: data.minimumHingesPresent === true ? 'YES' : data.minimumHingesPresent === false ? 'NO' : 'N/A' },
      { label: 'Intumescent Strips Intact', value: data.intumescentStripsIntact === true ? 'YES' : data.intumescentStripsIntact === false ? 'NO' : 'N/A' },
      { label: 'Smoke Seals Intact', value: data.smokeSealsIntact === true ? 'YES' : data.smokeSealsIntact === false ? 'NO' : 'N/A' },
    ]

    findings.forEach((finding) => {
      const color = finding.value === 'FAIL' || finding.value === 'NO' ? primaryColor : textColor
      doc.fillColor('#6b7280').text(finding.label + ': ', { continued: true })
      doc.fillColor(color).text(finding.value)
    })

    doc.moveDown()

    // Action Required
    if (data.actionRequired && data.actionDescription) {
      doc.fontSize(14).fillColor(primaryColor).text('Action Required', { underline: true })
      doc.moveDown(0.5)
      doc.fontSize(10).fillColor(textColor)
      doc.text(data.actionDescription)
      doc.moveDown()
    }

    // Inspector Notes
    if (data.inspectorNotes) {
      doc.fontSize(14).fillColor(textColor).text('Inspector Notes', { underline: true })
      doc.moveDown(0.5)
      doc.fontSize(10).fillColor(textColor)
      doc.text(data.inspectorNotes)
      doc.moveDown()
    }

    // Footer
    doc.moveDown(2)
    doc.fontSize(8).fillColor('#9ca3af')
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, { align: 'center' })
    doc.moveDown(1)

    // DoorCompliance.co.uk branding
    doc.fontSize(8).fillColor('#6b7280').text('System Reports from', { align: 'center' })
    doc.moveDown(0.3)
    try {
      const doorComplianceLogo = await loadImage('public/ChatGPT Image Dec 30, 2025, 06_29_19 PM-Picsart-BackgroundRemover.png')
      doc.image(doorComplianceLogo, {
        fit: [120, 48],
        align: 'center'
      })
    } catch (e) {
      doc.fontSize(8).fillColor('#9ca3af').text('DoorCompliance.co.uk', { align: 'center' })
    }

    doc.end()
  })
}

/**
 * Generate PDF for building compliance report
 */
export async function generateBuildingReport(data: BuildingReportData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    // Use tenant branding colors or defaults
    const primaryColor = data.tenantBranding?.primaryColor || '#dc2626'
    const secondaryColor = data.tenantBranding?.secondaryColor || '#991b1b'
    const accentColor = data.tenantBranding?.accentColor || '#f59e0b'
    const textColor = data.tenantBranding?.textColor || '#1f2937'

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Logo - use tenant logo if available, otherwise use DoorCompliance.co.uk logo
    try {
      const logoPath = data.tenantLogoUrl || 'public/ChatGPT Image Dec 30, 2025, 06_29_19 PM-Picsart-BackgroundRemover.png'
      const imageData = await loadImage(logoPath)
      doc.image(imageData, {
        fit: [200, 80],
        align: 'center'
      })
      doc.moveDown(0.5)
    } catch (e) {
      // Logo not found, continue without it
      console.error('Failed to load logo:', e)
    }

    // Header
    doc.fontSize(20).fillColor(primaryColor).text('Building Compliance Report', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#6b7280').text('Fire Door Inspection Summary', { align: 'center' })
    doc.moveDown(2)

    // Building Information
    doc.fontSize(14).fillColor(textColor).text('Building Information', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor(textColor)
    doc.text(`Building Name: ${data.building.name}`)
    doc.text(`Address: ${data.building.address}`)
    doc.text(`Postcode: ${data.building.postcode}`)
    doc.text(`Building Type: ${data.building.buildingType.replace(/_/g, ' ')}`)
    doc.text(`Number of Storeys: ${data.building.numberOfStoreys}`)
    doc.moveDown(2)

    // Compliance Summary
    doc.fontSize(14).fillColor(textColor).text('Compliance Summary', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10)

    const complianceRate = data.stats.totalDoors > 0
      ? ((data.stats.passCount / data.stats.totalDoors) * 100).toFixed(1)
      : '0'

    doc.fillColor('#6b7280').text('Total Doors: ', { continued: true })
    doc.fillColor(textColor).text(data.stats.totalDoors.toString())

    doc.fillColor('#6b7280').text('Passed Inspections: ', { continued: true })
    doc.fillColor('#16a34a').text(data.stats.passCount.toString())

    doc.fillColor('#6b7280').text('Failed Inspections: ', { continued: true })
    doc.fillColor(primaryColor).text(data.stats.failCount.toString())

    doc.fillColor('#6b7280').text('Pending Inspections: ', { continued: true })
    doc.fillColor(accentColor).text(data.stats.pendingCount.toString())

    doc.fillColor('#6b7280').text('Overdue Inspections: ', { continued: true })
    doc.fillColor(primaryColor).text(data.stats.overdueCount.toString())

    doc.fillColor('#6b7280').text('Compliance Rate: ', { continued: true })
    doc.fillColor(parseFloat(complianceRate) >= 90 ? '#16a34a' : primaryColor).text(`${complianceRate}%`)

    doc.moveDown(2)

    // Door List
    doc.fontSize(14).fillColor(textColor).text('Fire Door Status', { underline: true })
    doc.moveDown(0.5)

    // Table headers
    doc.fontSize(9).fillColor('#6b7280')
    doc.text('Door', 50, doc.y, { width: 60, continued: true })
    doc.text('Location', 110, doc.y, { width: 120, continued: true })
    doc.text('Rating', 230, doc.y, { width: 60, continued: true })
    doc.text('Last Inspection', 290, doc.y, { width: 100, continued: true })
    doc.text('Status', 390, doc.y, { width: 100 })

    doc.moveDown(0.3)
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown(0.5)

    // Table rows
    data.doors.forEach((door) => {
      const y = doc.y
      doc.fontSize(8).fillColor('#374151')

      doc.text(door.doorNumber, 50, y, { width: 60 })
      doc.text(door.location, 110, y, { width: 120 })
      doc.text(door.fireRating, 230, y, { width: 60 })

      if (door.lastInspection) {
        doc.text(door.lastInspection.inspectionDate.toLocaleDateString('en-GB'), 290, y, { width: 100 })

        const status = door.lastInspection.overallResult || 'PENDING'
        const statusColor = status === 'PASS' ? '#16a34a' : status === 'FAIL' ? '#dc2626' : '#f59e0b'
        doc.fillColor(statusColor).text(status, 390, y, { width: 100 })
      } else {
        doc.fillColor('#9ca3af').text('Not Inspected', 290, y, { width: 210 })
      }

      doc.moveDown(0.5)
    })

    // Footer
    doc.moveDown(2)
    doc.fontSize(8).fillColor('#9ca3af')
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, { align: 'center' })
    doc.moveDown(1)

    // DoorCompliance.co.uk branding
    doc.fontSize(8).fillColor('#6b7280').text('System Reports from', { align: 'center' })
    doc.moveDown(0.3)
    try {
      const doorComplianceLogo = await loadImage('public/ChatGPT Image Dec 30, 2025, 06_29_19 PM-Picsart-BackgroundRemover.png')
      doc.image(doorComplianceLogo, {
        fit: [120, 48],
        align: 'center'
      })
    } catch (e) {
      doc.fontSize(8).fillColor('#9ca3af').text('DoorCompliance.co.uk', { align: 'center' })
    }

    doc.end()
  })
}
