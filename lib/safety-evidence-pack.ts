import PDFDocument from 'pdfkit'
import { prisma } from '@/lib/prisma'

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

interface BuildingData {
  id: string
  name: string
  address: string
  postcode: string
  buildingType: string
  numberOfStoreys: number | null
  topStoreyHeight: number | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  fireDoors: Array<{
    id: string
    doorNumber: string
    location: string
    fireRating: string
    doorType: string
    manufacturer: string | null
    qrCodeUrl: string | null
    certificationUrl: string | null
    inspections: Array<{
      id: string
      inspectionDate: Date
      nextInspectionDate: Date | null
      overallResult: string | null
      status: string
      inspector: {
        name: string
      }
      actionDescription: string | null
    }>
  }>
  safetyProfile?: {
    riskSummary: string | null
    inspectionPolicy: string | null
    complianceTrend: string | null
    regulatorStatus: string | null
    lastReviewDate: Date | null
    nextReviewDate: Date | null
  } | null
}

export async function generateBuildingSafetyEvidencePack(
  buildingId: string,
  tenantId: string,
  tenantName: string,
  tenantLogoUrl?: string | null
): Promise<Buffer> {
  // Fetch comprehensive building data
  const building = await prisma.building.findFirst({
    where: {
      id: buildingId,
      tenantId: tenantId
    },
    include: {
      fireDoors: {
        include: {
          inspections: {
            orderBy: { inspectionDate: 'desc' },
            take: 1,
            include: {
              inspector: {
                select: { name: true }
              }
            }
          }
        }
      },
      safetyProfile: true
    }
  })

  if (!building) {
    throw new Error('Building not found')
  }

  // Fetch all inspections for analytics
  const allInspections = await prisma.inspection.findMany({
    where: {
      fireDoor: {
        buildingId: buildingId
      },
      status: 'COMPLETED'
    },
    include: {
      fireDoor: {
        select: {
          doorNumber: true,
          location: true
        }
      },
      inspector: {
        select: {
          name: true
        }
      }
    },
    orderBy: { inspectionDate: 'desc' }
  })

  // Fetch evidence records
  const evidenceRecords = await prisma.evidenceRecord.findMany({
    where: {
      OR: [
        { entityType: 'BUILDING', entityId: buildingId },
        {
          entityType: 'DOOR',
          entityId: { in: building.fireDoors.map(d => d.id) }
        }
      ],
      tenantId: tenantId
    },
    include: {
      uploadedByUser: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch audit trail
  const auditTrail = await prisma.auditTrail.findMany({
    where: {
      OR: [
        { entityType: 'BUILDING', entityId: buildingId },
        {
          entityType: 'DOOR',
          entityId: { in: building.fireDoors.map(d => d.id) }
        },
        {
          entityType: 'INSPECTION',
          entityId: { in: allInspections.map(i => i.id) }
        }
      ],
      tenantId: tenantId
    },
    include: {
      user: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  // Calculate statistics
  const totalDoors = building.fireDoors.length
  const doorsWithInspections = building.fireDoors.filter(d => d.inspections.length > 0).length
  const passedDoors = building.fireDoors.filter(
    d => d.inspections.length > 0 && d.inspections[0].overallResult === 'PASS'
  ).length
  const failedDoors = building.fireDoors.filter(
    d => d.inspections.length > 0 && d.inspections[0].overallResult === 'FAIL'
  ).length
  const attentionRequired = building.fireDoors.filter(
    d => d.inspections.length > 0 && d.inspections[0].overallResult === 'REQUIRES_ATTENTION'
  ).length
  const complianceRate = totalDoors > 0 ? ((passedDoors / totalDoors) * 100).toFixed(1) : '0'

  // Find defects and repairs
  const unresolvedDefects = building.fireDoors
    .filter(d => {
      const latest = d.inspections[0]
      return latest && (latest.overallResult === 'FAIL' || latest.overallResult === 'REQUIRES_ATTENTION')
    })
    .map(d => ({
      doorNumber: d.doorNumber,
      location: d.location,
      issue: d.inspections[0].actionDescription || 'Unspecified issue',
      priority: d.inspections[0].overallResult === 'FAIL' ? 'HIGH' : 'MEDIUM',
      inspectionDate: d.inspections[0].inspectionDate
    }))

  const resolvedDefects = allInspections
    .filter(i => i.actionDescription && i.overallResult === 'PASS')
    .map(i => ({
      doorNumber: i.fireDoor.doorNumber,
      location: i.fireDoor.location,
      issue: i.actionDescription,
      resolvedDate: i.inspectionDate,
      inspector: i.inspector.name
    }))
    .slice(0, 10)

  // Determine inspection regime
  const inspectionRegime =
    building.topStoreyHeight && building.topStoreyHeight > 11
      ? '3-monthly inspections for communal doors (Building >11m), Annual for flat entrance doors'
      : '12-monthly inspections for all fire doors'

  // Generate PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true })
  const chunks: Buffer[] = []

  doc.on('data', (chunk) => chunks.push(chunk))

  // Logo - use tenant logo if available, otherwise use DoorCompliance.co.uk logo
  try {
    const logoPath = tenantLogoUrl || 'public/ChatGPT Image Dec 30, 2025, 06_29_19 PM-Picsart-BackgroundRemover.png'
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

  // Title Page
  doc.fontSize(28).fillColor('#dc2626').text('Building Safety Evidence Pack', { align: 'center' })
  doc.moveDown(0.5)
  doc.fontSize(16).fillColor('#666').text(building.name, { align: 'center' })
  doc.moveDown(0.3)
  doc.fontSize(12).fillColor('#999').text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, { align: 'center' })
  doc.moveDown(0.3)
  doc.fontSize(10).fillColor('#aaa').text(tenantName, { align: 'center' })

  doc.moveDown(3)

  // Compliance statement box
  doc.fillColor('#10b981').rect(50, doc.y, 495, 80).fill()
  doc.fillColor('#fff').fontSize(14).text('Fire Safety Compliance Documentation', 60, doc.y - 65)
  doc.fontSize(10).text(
    'This evidence pack demonstrates compliance with Fire Safety (England) Regulations 2022',
    60,
    doc.y + 5,
    { width: 475 }
  )
  doc.fontSize(9).fillColor('#e0f2fe').text(`Compliance Rate: ${complianceRate}%`, 60, doc.y + 5)

  doc.addPage()

  // Section 1: Building Overview
  doc.fillColor('#dc2626').fontSize(18).text('1. Building Overview', { underline: true })
  doc.moveDown(0.5)

  doc.fillColor('#333').fontSize(11)
  doc.text(`Building Name: ${building.name}`)
  doc.text(`Address: ${building.address}`)
  doc.text(`Postcode: ${building.postcode}`)
  doc.text(`Building Type: ${building.buildingType}`)
  doc.text(`Number of Storeys: ${building.numberOfStoreys || 'N/A'}`)
  doc.text(`Top Storey Height: ${building.topStoreyHeight ? building.topStoreyHeight + 'm' : 'N/A'}`)

  if (building.topStoreyHeight && building.topStoreyHeight > 11) {
    doc.fillColor('#dc2626').fontSize(10).text('⚠ High-Rise Building: Enhanced inspection regime required', { oblique: true })
  }

  doc.moveDown(0.5)
  doc.fillColor('#333').fontSize(11)
  doc.text(`Responsible Person: ${building.contactName || 'Not specified'}`)
  if (building.contactEmail) doc.text(`Contact Email: ${building.contactEmail}`)
  if (building.contactPhone) doc.text(`Contact Phone: ${building.contactPhone}`)

  doc.moveDown(0.5)
  doc.text(`Inspection Regime: ${inspectionRegime}`)

  if (building.safetyProfile) {
    doc.moveDown(1)
    doc.fillColor('#dc2626').fontSize(14).text('Safety Profile', { underline: true })
    doc.moveDown(0.3)
    doc.fillColor('#333').fontSize(10)
    if (building.safetyProfile.riskSummary) doc.text(`Risk Summary: ${building.safetyProfile.riskSummary}`)
    if (building.safetyProfile.complianceTrend) doc.text(`Compliance Trend: ${building.safetyProfile.complianceTrend}`)
    if (building.safetyProfile.regulatorStatus) doc.text(`Regulator Status: ${building.safetyProfile.regulatorStatus}`)
    if (building.safetyProfile.lastReviewDate)
      doc.text(`Last Review: ${new Date(building.safetyProfile.lastReviewDate).toLocaleDateString('en-GB')}`)
  }

  doc.addPage()

  // Section 2: Asset Register
  doc.fillColor('#dc2626').fontSize(18).text('2. Asset Register', { underline: true })
  doc.moveDown(0.5)
  doc.fillColor('#333').fontSize(10).text(`Total Fire Doors: ${totalDoors}`)
  doc.moveDown(1)

  // Table header
  const tableTop = doc.y
  const col1 = 50
  const col2 = 100
  const col3 = 250
  const col4 = 380
  const col5 = 480

  doc.fillColor('#f3f4f6').rect(50, tableTop, 495, 25).fill()
  doc.fillColor('#333').fontSize(9).font('Helvetica-Bold')
  doc.text('Door', col1 + 5, tableTop + 8)
  doc.text('Location', col2 + 5, tableTop + 8)
  doc.text('Rating', col3 + 5, tableTop + 8)
  doc.text('QR Code', col4 + 5, tableTop + 8)
  doc.text('Cert', col5 + 5, tableTop + 8)

  let yPos = tableTop + 30
  doc.font('Helvetica')

  building.fireDoors.forEach((door, index) => {
    if (yPos > 700) {
      doc.addPage()
      yPos = 50
    }

    doc.fillColor(index % 2 === 0 ? '#fff' : '#f9fafb').rect(50, yPos - 5, 495, 20).fill()
    doc.fillColor('#333').fontSize(8)
    doc.text(door.doorNumber, col1 + 5, yPos)
    doc.text(door.location.substring(0, 25), col2 + 5, yPos)
    doc.text(door.fireRating, col3 + 5, yPos)
    doc.text(door.qrCodeUrl ? '✓' : '✗', col4 + 5, yPos)
    doc.text(door.certificationUrl ? '✓' : '✗', col5 + 5, yPos)

    yPos += 20
  })

  doc.addPage()

  // Section 3: Inspection Performance
  doc.fillColor('#dc2626').fontSize(18).text('3. Inspection Performance', { underline: true })
  doc.moveDown(0.5)

  doc.fillColor('#333').fontSize(11)
  doc.text(`Compliance Percentage: ${complianceRate}%`)
  doc.text(`Total Doors: ${totalDoors}`)
  doc.text(`Inspected: ${doorsWithInspections}`)
  doc.text(`Passed: ${passedDoors}`)
  doc.text(`Failed: ${failedDoors}`)
  doc.text(`Requires Attention: ${attentionRequired}`)

  doc.moveDown(1)
  doc.fontSize(14).text('Inspection History', { underline: true })
  doc.moveDown(0.5)

  // Last 10 inspections
  const recentInspections = allInspections.slice(0, 10)
  recentInspections.forEach(inspection => {
    doc.fontSize(9)
    doc.text(
      `${new Date(inspection.inspectionDate).toLocaleDateString('en-GB')} - Door ${inspection.fireDoor.doorNumber} (${
        inspection.fireDoor.location
      }) - ${inspection.overallResult || 'Pending'} - Inspector: ${inspection.inspector.name}`,
      { width: 500 }
    )
    doc.moveDown(0.3)
  })

  doc.addPage()

  // Section 4: Defects & Repairs Register
  doc.fillColor('#dc2626').fontSize(18).text('4. Defects & Repairs Register', { underline: true })
  doc.moveDown(0.5)

  doc.fontSize(14).fillColor('#ef4444').text('Unresolved Defects', { underline: true })
  doc.moveDown(0.5)
  doc.fillColor('#333').fontSize(10)

  if (unresolvedDefects.length === 0) {
    doc.fillColor('#10b981').text('✓ No unresolved defects - all doors compliant')
  } else {
    unresolvedDefects.forEach((defect, idx) => {
      doc.fillColor(defect.priority === 'HIGH' ? '#dc2626' : '#f59e0b')
      doc.text(
        `${idx + 1}. Door ${defect.doorNumber} (${defect.location}) - Priority: ${defect.priority}`,
        { continued: false }
      )
      doc.fillColor('#666').fontSize(9).text(`   Issue: ${defect.issue}`)
      doc.text(`   Identified: ${new Date(defect.inspectionDate).toLocaleDateString('en-GB')}`)
      doc.moveDown(0.5)
      doc.fontSize(10)
    })
  }

  doc.moveDown(1)
  doc.fontSize(14).fillColor('#10b981').text('Completed Repairs', { underline: true })
  doc.moveDown(0.5)
  doc.fillColor('#333').fontSize(10)

  resolvedDefects.slice(0, 10).forEach((repair, idx) => {
    doc.text(`${idx + 1}. Door ${repair.doorNumber} (${repair.location})`)
    doc.fontSize(9).fillColor('#666').text(`   Issue: ${repair.issue}`)
    doc.text(`   Resolved: ${new Date(repair.resolvedDate).toLocaleDateString('en-GB')} by ${repair.inspector}`)
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#333')
  })

  doc.addPage()

  // Section 5: Evidence Media
  doc.fillColor('#dc2626').fontSize(18).text('5. Evidence Media', { underline: true })
  doc.moveDown(0.5)

  doc.fillColor('#333').fontSize(10)
  doc.text(`Total Evidence Records: ${evidenceRecords.length}`)
  doc.moveDown(0.5)

  const evidenceByType = evidenceRecords.reduce(
    (acc, record) => {
      acc[record.recordType] = (acc[record.recordType] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  Object.entries(evidenceByType).forEach(([type, count]) => {
    doc.text(`${type.replace(/_/g, ' ')}: ${count}`)
  })

  doc.moveDown(1)
  doc.fontSize(12).text('Evidence Log', { underline: true })
  doc.moveDown(0.5)
  doc.fontSize(8)

  evidenceRecords.slice(0, 20).forEach(record => {
    doc.text(
      `${new Date(record.createdAt).toLocaleDateString('en-GB')} - ${record.recordType.replace(/_/g, ' ')} - ${
        record.fileName
      } - Uploaded by ${record.uploadedByUser.name}`,
      { width: 500 }
    )
    if (record.description) {
      doc.fillColor('#666').text(`   ${record.description}`, { width: 490 })
      doc.fillColor('#333')
    }
    doc.moveDown(0.3)
  })

  doc.addPage()

  // Section 6: Audit Trail
  doc.fillColor('#dc2626').fontSize(18).text('6. Audit Trail', { underline: true })
  doc.moveDown(0.5)

  doc.fillColor('#333').fontSize(10).text('Recent System Activity (Last 50 actions)')
  doc.moveDown(0.5)
  doc.fontSize(8)

  auditTrail.forEach(entry => {
    doc.text(
      `${new Date(entry.createdAt).toLocaleString('en-GB')} - ${entry.action} on ${entry.entityType} by ${
        entry.user.name
      } (${entry.user.email})`,
      { width: 500 }
    )
    doc.moveDown(0.2)
  })

  doc.addPage()

  // Section 7: Statement of Ongoing Control
  doc.fillColor('#dc2626').fontSize(18).text('7. Statement of Ongoing Control', { underline: true })
  doc.moveDown(1)

  const statement = `This building maintains a structured fire door inspection regime aligned to Fire Safety (England) Regulations 2022.

All communal fire doors are inspected ${
    building.topStoreyHeight && building.topStoreyHeight > 11 ? 'every 3 months' : 'every 12 months'
  }. Flat entrance doors are inspected annually.

All defects are logged within the system and tracked to closure. Each inspection is carried out by qualified personnel and documented with photographic evidence where applicable.

The asset register is maintained and updated following each inspection cycle. All fire doors are uniquely identified and tracked throughout their lifecycle.

Evidence of compliance, including inspection certificates, photographs, and manufacturer documentation, is stored securely and made available for regulatory review upon request.

This evidence pack demonstrates the Responsible Person's commitment to maintaining fire safety standards and fulfilling their legal obligations under current fire safety legislation.`

  doc.fillColor('#333').fontSize(11).text(statement, { align: 'justify', lineGap: 3 })

  doc.moveDown(2)

  doc.fontSize(10).fillColor('#666')
  doc.text(`Document Generated: ${new Date().toLocaleString('en-GB')}`)
  doc.text(`Generated By: ${tenantName}`)
  doc.text(`Building: ${building.name}`)
  doc.text(`Total Pages: ${doc.bufferedPageRange().count}`)

  // Footer on all pages
  const range = doc.bufferedPageRange()
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i)

    // Page footer with tenant name
    doc.fontSize(8).fillColor('#999')
    doc.text(
      `${tenantName} | Building Safety Evidence Pack | Page ${i + 1} of ${range.count}`,
      50,
      doc.page.height - 80,
      { align: 'center' }
    )

    // DoorCompliance.co.uk branding on last page only
    if (i === range.count - 1) {
      doc.fontSize(8).fillColor('#6b7280').text('System Reports from', 50, doc.page.height - 60, { align: 'center' })
      try {
        const doorComplianceLogo = await loadImage('public/ChatGPT Image Dec 30, 2025, 06_29_19 PM-Picsart-BackgroundRemover.png')
        doc.image(doorComplianceLogo, doc.page.width / 2 - 60, doc.page.height - 50, {
          fit: [120, 48]
        })
      } catch (e) {
        doc.fontSize(8).fillColor('#9ca3af').text('DoorCompliance.co.uk', 50, doc.page.height - 45, { align: 'center' })
      }
    }
  }

  doc.end()

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks)
      resolve(pdfBuffer)
    })
    doc.on('error', reject)
  })
}
