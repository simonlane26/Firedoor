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
    // Get inspections for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const inspections = await prisma.inspection.findMany({
      where: {
        tenantId: user.tenant.id,
        inspectionDate: {
          gte: sixMonthsAgo
        }
      },
      include: {
        fireDoor: {
          include: {
            building: true
          }
        }
      },
      orderBy: { inspectionDate: 'asc' }
    })

    // Group inspections by month
    const monthlyData = new Map<string, { pass: number; fail: number; requiresAction: number; total: number }>()

    inspections.forEach((inspection) => {
      const monthKey = new Date(inspection.inspectionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { pass: 0, fail: 0, requiresAction: 0, total: 0 })
      }

      const data = monthlyData.get(monthKey)!
      data.total++

      if (inspection.overallResult === 'PASS') data.pass++
      else if (inspection.overallResult === 'FAIL') data.fail++
      else if (inspection.overallResult === 'REQUIRES_ATTENTION') data.requiresAction++
    })

    // Calculate failure patterns
    const failurePatterns: Record<string, number> = {}
    inspections.forEach((inspection) => {
      if (inspection.actionDescription && inspection.overallResult !== 'PASS') {
        const faults = inspection.actionDescription.split(',').map(f => f.trim())
        faults.forEach(fault => {
          if (fault) {
            failurePatterns[fault] = (failurePatterns[fault] || 0) + 1
          }
        })
      }
    })

    const topFailurePatterns = Object.entries(failurePatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([fault, count]) => ({ fault, count }))

    // Remedial action tracking
    const remedialActions = await prisma.inspection.findMany({
      where: {
        tenantId: user.tenant.id,
        actionRequired: true,
        inspectionDate: {
          gte: sixMonthsAgo
        }
      },
      include: {
        fireDoor: {
          include: {
            building: true
          }
        }
      },
      orderBy: { inspectionDate: 'desc' }
    })

    const completedRemedials = remedialActions.filter(a => a.status === 'COMPLETED').length
    const pendingRemedials = remedialActions.filter(a => a.status === 'PENDING' || a.status === 'REQUIRES_ACTION').length

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
    doc.fontSize(28).fillColor('#dc2626').text('Risk Trend Report', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(14).fillColor('#666666').text('6-Month Compliance Trend Analysis', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(12).fillColor('#666666').text(user.tenant.companyName, { align: 'center' })
    doc.fontSize(10).fillColor('#999999').text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, { align: 'center' })
    doc.moveDown(2)

    // Executive Overview
    doc.fontSize(16).fillColor('#1f2937').text('Executive Overview')
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#374151')

    const months = Array.from(monthlyData.keys())
    const firstMonthData = monthlyData.get(months[0]) || { pass: 0, fail: 0, total: 0 }
    const lastMonthData = monthlyData.get(months[months.length - 1]) || { pass: 0, fail: 0, total: 0 }

    const firstMonthRate = firstMonthData.total > 0 ? (firstMonthData.pass / firstMonthData.total) * 100 : 0
    const lastMonthRate = lastMonthData.total > 0 ? (lastMonthData.pass / lastMonthData.total) * 100 : 0
    const trendDirection = lastMonthRate > firstMonthRate ? 'Improving' : lastMonthRate < firstMonthRate ? 'Declining' : 'Stable'
    const trendChange = Math.abs(lastMonthRate - firstMonthRate).toFixed(1)

    doc.text(`Trend Direction: ${trendDirection} (${trendChange}% change over 6 months)`)
    doc.text(`First Month Compliance: ${firstMonthRate.toFixed(1)}%`)
    doc.text(`Latest Month Compliance: ${lastMonthRate.toFixed(1)}%`)
    doc.text(`Total Inspections: ${inspections.length}`)
    doc.moveDown(1.5)

    // Monthly Compliance Trends
    doc.fontSize(14).fillColor('#1f2937').text('Monthly Compliance Trends')
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#374151')

    const tableTop = doc.y
    const colWidths = [120, 80, 80, 80, 100]
    const headers = ['Month', 'Pass', 'Fail', 'Attention', 'Compliance %']

    // Table headers
    doc.font('Helvetica-Bold')
    headers.forEach((header, i) => {
      const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
      doc.text(header, x, tableTop)
    })

    doc.font('Helvetica')
    let currentY = tableTop + 20

    Array.from(monthlyData.entries()).forEach(([month, data]) => {
      const complianceRate = data.total > 0 ? ((data.pass / data.total) * 100).toFixed(1) : '0.0'
      const row = [month, data.pass.toString(), data.fail.toString(), data.requiresAction.toString(), `${complianceRate}%`]

      row.forEach((cell, i) => {
        const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
        doc.text(cell, x, currentY)
      })

      currentY += 20
    })

    doc.y = currentY + 20

    // Failure Patterns
    doc.addPage()
    doc.fontSize(14).fillColor('#1f2937').text('Top 10 Failure Patterns')
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#374151')

    if (topFailurePatterns.length > 0) {
      topFailurePatterns.forEach((pattern, index) => {
        doc.text(`${index + 1}. ${pattern.fault}`, { indent: 20 })
        doc.text(`   Occurrences: ${pattern.count}`, { indent: 20 })
        doc.moveDown(0.3)
      })
    } else {
      doc.text('No failure patterns identified in this period.')
    }

    doc.moveDown(1.5)

    // Remedial Action Tracking
    doc.fontSize(14).fillColor('#1f2937').text('Remedial Action Tracking')
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#374151')

    doc.text(`Total Remedial Actions Required: ${remedialActions.length}`)
    doc.text(`Completed: ${completedRemedials}`)
    doc.text(`Pending: ${pendingRemedials}`)
    doc.text(`Completion Rate: ${remedialActions.length > 0 ? ((completedRemedials / remedialActions.length) * 100).toFixed(1) : 0}%`)
    doc.moveDown(1.5)

    // Recommendations
    doc.fontSize(14).fillColor('#1f2937').text('Recommendations')
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#374151')

    if (trendDirection === 'Declining') {
      doc.text('• Immediate action required - compliance is deteriorating', { indent: 20 })
      doc.text('• Review inspection processes and remedial action procedures', { indent: 20 })
      doc.text('• Consider additional training for building managers', { indent: 20 })
    } else if (trendDirection === 'Improving') {
      doc.text('• Continue current practices - positive trend observed', { indent: 20 })
      doc.text('• Monitor top failure patterns to prevent recurrence', { indent: 20 })
    } else {
      doc.text('• Maintain current compliance levels', { indent: 20 })
      doc.text('• Focus on addressing recurring failure patterns', { indent: 20 })
    }

    if (pendingRemedials > 0) {
      doc.moveDown(0.5)
      doc.fillColor('#dc2626').text(`⚠ ${pendingRemedials} pending remedial actions require attention`, { indent: 20 })
    }

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
        'Content-Disposition': `attachment; filename="risk-trend-report-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating Risk Trend Report:', error)
    return NextResponse.json(
      { error: 'Failed to generate Risk Trend Report' },
      { status: 500 }
    )
  }
}
