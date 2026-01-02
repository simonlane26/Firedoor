import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'

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

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    // Get all doors and inspections
    const doors = await prisma.fireDoor.findMany({
      where: { tenantId: user.tenant.id },
      include: {
        building: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1
        }
      }
    })

    const buildings = await prisma.building.findMany({
      where: { tenantId: user.tenant.id }
    })

    const allInspections = await prisma.inspection.findMany({
      where: { tenantId: user.tenant.id },
      orderBy: { inspectionDate: 'desc' }
    })

    // Calculate KPIs
    const totalDoors = doors.length
    const inspectedDoors = doors.filter(d => d.inspections.length > 0).length
    const passedDoors = doors.filter(d => d.inspections[0]?.overallResult === 'PASS').length
    const failedDoors = doors.filter(d => d.inspections[0]?.overallResult === 'FAIL').length
    const requiresAttention = doors.filter(d => d.inspections[0]?.overallResult === 'REQUIRES_ATTENTION').length
    const uninspectedDoors = totalDoors - inspectedDoors
    const complianceRate = totalDoors > 0 ? ((passedDoors / totalDoors) * 100).toFixed(1) : '0'

    const today = new Date()
    const overdueDoors = doors.filter(d =>
      d.nextInspectionDate && new Date(d.nextInspectionDate) < today
    ).length

    // Critical defects
    const criticalDefects = doors
      .filter(d => {
        const lastInspection = d.inspections[0]
        return lastInspection?.overallResult === 'FAIL' ||
               (lastInspection?.actionRequired && lastInspection.status !== 'COMPLETED')
      })
      .map(d => ({
        doorNumber: d.doorNumber,
        location: d.location,
        building: d.building.name,
        issue: d.inspections[0]?.actionDescription || 'Failed inspection',
        status: d.inspections[0]?.status || 'UNKNOWN'
      }))

    // Regulatory status
    const highRiseBuildings = buildings.filter(b => (b.topStoreyHeight || 0) >= 18)
    const highRiseDoors = doors.filter(d => highRiseBuildings.some(b => b.id === d.buildingId))
    const highRiseCompliance = highRiseDoors.length > 0
      ? ((highRiseDoors.filter(d => d.inspections[0]?.overallResult === 'PASS').length / highRiseDoors.length) * 100).toFixed(1)
      : 'N/A'

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))

    // Logo - use tenant logo if available, otherwise use DoorCompliance.co.uk logo
    try {
      const logoPath = user.tenant.logoUrl || 'public/ChatGPT Image Dec 30, 2025, 06_29_19 PM-Picsart-BackgroundRemover.png'
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
    doc.fontSize(28).fillColor('#dc2626').text('Executive Summary', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(14).fillColor('#666666').text('Fire Safety Compliance Status', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(12).fillColor('#666666').text(user.tenant.companyName, { align: 'center' })
    doc.fontSize(10).fillColor('#999999').text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, { align: 'center' })
    doc.moveDown(2)

    // Key Performance Indicators
    doc.fontSize(16).fillColor('#1f2937').text('Key Performance Indicators')
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#374151')

    // Left column
    doc.text(`Total Fire Doors: ${totalDoors}`)
    doc.text(`Compliance Rate: ${complianceRate}%`)
    doc.text(`Passed Inspections: ${passedDoors}`)
    doc.text(`Failed Inspections: ${failedDoors}`)
    doc.text(`Requires Attention: ${requiresAttention}`)
    doc.text(`Uninspected: ${uninspectedDoors}`)

    doc.moveDown(0.5)

    // Right column metrics
    doc.text(`Total Buildings: ${buildings.length}`)
    doc.text(`High-Rise Buildings: ${highRiseBuildings.length}`)
    doc.text(`High-Rise Compliance: ${highRiseCompliance}%`)
    doc.text(`Overdue Inspections: ${overdueDoors}`)
    doc.text(`Total Inspections: ${allInspections.length}`)

    doc.moveDown(1)

    // Critical Defects
    doc.fontSize(14).fillColor('#1f2937').text('Critical Defects Requiring Immediate Attention')
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#374151')

    if (criticalDefects.length > 0) {
      doc.fillColor('#dc2626').fontSize(12).text(`⚠ ${criticalDefects.length} Critical Defect${criticalDefects.length !== 1 ? 's' : ''} Identified`)
      doc.fillColor('#374151').fontSize(10)
      doc.moveDown(0.5)

      criticalDefects.slice(0, 10).forEach((defect, index) => {
        doc.text(`${index + 1}. Door ${defect.doorNumber} - ${defect.building}`, { indent: 20 })
        doc.text(`   Location: ${defect.location}`, { indent: 20 })
        doc.text(`   Issue: ${defect.issue}`, { indent: 20 })
        doc.text(`   Status: ${defect.status}`, { indent: 20 })
        doc.moveDown(0.3)
      })

      if (criticalDefects.length > 10) {
        doc.text(`... and ${criticalDefects.length - 10} more`, { indent: 20 })
      }
    } else {
      doc.fillColor('#16a34a').text('✓ No critical defects identified')
      doc.fillColor('#374151')
    }

    doc.moveDown(1.5)

    // Regulatory Compliance Status
    doc.addPage()
    doc.fontSize(14).fillColor('#1f2937').text('Regulatory Compliance Status')
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#374151')

    doc.text('Fire Safety (England) Regulations 2022 & Building Safety Act 2022', { underline: true })
    doc.moveDown(0.5)

    if (parseFloat(complianceRate) >= 90) {
      doc.fillColor('#16a34a').text('✓ Overall compliance status: SATISFACTORY')
    } else if (parseFloat(complianceRate) >= 75) {
      doc.fillColor('#f59e0b').text('⚠ Overall compliance status: REQUIRES IMPROVEMENT')
    } else {
      doc.fillColor('#dc2626').text('✗ Overall compliance status: NON-COMPLIANT')
    }
    doc.fillColor('#374151')
    doc.moveDown(0.5)

    if (highRiseBuildings.length > 0) {
      doc.text(`High-Rise Buildings (18m+): ${highRiseBuildings.length} building${highRiseBuildings.length !== 1 ? 's' : ''}`)
      doc.text(`High-Rise Compliance Rate: ${highRiseCompliance}%`)
      if (parseFloat(highRiseCompliance.toString()) < 100 && highRiseCompliance !== 'N/A') {
        doc.fillColor('#dc2626').text('⚠ Enhanced regulatory requirements apply - immediate action required', { indent: 20 })
        doc.fillColor('#374151')
      }
    }

    if (overdueDoors > 0) {
      doc.moveDown(0.5)
      doc.fillColor('#dc2626').text(`⚠ ${overdueDoors} door${overdueDoors !== 1 ? 's' : ''} overdue for inspection`)
      doc.fillColor('#374151')
    }

    doc.moveDown(1.5)

    // Action Plans
    doc.fontSize(14).fillColor('#1f2937').text('Recommended Action Plans')
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#374151')

    const actions: string[] = []

    if (overdueDoors > 0) {
      actions.push(`1. URGENT: Complete ${overdueDoors} overdue inspection${overdueDoors !== 1 ? 's' : ''} within 14 days`)
    }

    if (failedDoors > 0) {
      actions.push(`${actions.length + 1}. Address ${failedDoors} failed door${failedDoors !== 1 ? 's' : ''} - remedial work required`)
    }

    if (requiresAttention > 0) {
      actions.push(`${actions.length + 1}. Review ${requiresAttention} door${requiresAttention !== 1 ? 's' : ''} requiring attention`)
    }

    if (uninspectedDoors > 0) {
      actions.push(`${actions.length + 1}. Schedule inspections for ${uninspectedDoors} uninspected door${uninspectedDoors !== 1 ? 's' : ''}`)
    }

    if (parseFloat(complianceRate) < 90) {
      actions.push(`${actions.length + 1}. Implement compliance improvement program to achieve 90%+ compliance rate`)
    }

    if (highRiseBuildings.length > 0 && parseFloat(highRiseCompliance.toString()) < 100 && highRiseCompliance !== 'N/A') {
      actions.push(`${actions.length + 1}. PRIORITY: Ensure 100% high-rise building compliance due to enhanced regulatory requirements`)
    }

    if (actions.length > 0) {
      actions.forEach(action => {
        doc.text(action, { indent: 20 })
        doc.moveDown(0.3)
      })
    } else {
      doc.fillColor('#16a34a').text('✓ No immediate actions required - maintain current compliance standards')
      doc.fillColor('#374151')
    }

    doc.moveDown(1.5)

    // Risk Assessment
    doc.fontSize(14).fillColor('#1f2937').text('Risk Assessment')
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#374151')

    const riskLevel = failedDoors + overdueDoors + uninspectedDoors
    let riskRating = 'LOW'
    let riskColor = '#16a34a'

    if (riskLevel > totalDoors * 0.2) {
      riskRating = 'HIGH'
      riskColor = '#dc2626'
    } else if (riskLevel > totalDoors * 0.1) {
      riskRating = 'MEDIUM'
      riskColor = '#f59e0b'
    }

    doc.fillColor(riskColor).fontSize(12).text(`Overall Risk Rating: ${riskRating}`)
    doc.fillColor('#374151').fontSize(10)
    doc.moveDown(0.5)

    doc.text('This assessment considers failed inspections, overdue inspections, and uninspected doors.')
    doc.text('Regular monitoring and proactive maintenance are essential to maintain compliance.')

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

    // Wait for PDF generation to complete
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
    })

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="executive-summary-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating Executive Summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate Executive Summary' },
      { status: 500 }
    )
  }
}
