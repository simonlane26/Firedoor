import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'

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
    // Get all doors for this tenant
    const doors = await prisma.fireDoor.findMany({
      where: { tenantId: user.tenant.id },
      include: {
        building: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1,
        },
      },
    })

    // Get all inspections for this tenant
    const inspections = await prisma.inspection.findMany({
      where: { tenantId: user.tenant.id },
      include: {
        fireDoor: {
          include: {
            building: true,
          },
        },
        inspector: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { inspectionDate: 'desc' },
    })

    // Calculate statistics (same as in reports route)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const totalDoors = doors.length
    const passCount = inspections.filter((i) => i.overallResult === 'PASS').length
    const failCount = inspections.filter((i) => i.overallResult === 'FAIL').length
    const pendingCount = inspections.filter((i) => i.status === 'PENDING').length

    const overdueCount = doors.filter((door) => {
      if (!door.nextInspectionDate) return false
      return new Date(door.nextInspectionDate) < today
    }).length

    const complianceRate = totalDoors > 0 ? ((passCount / totalDoors) * 100).toFixed(1) : '0'

    // Calculate trend
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentInspections = inspections.filter(
      (i) => new Date(i.inspectionDate) >= sixMonthsAgo
    )

    const inspectionsByMonth = new Map<string, { pass: number; fail: number }>()

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      inspectionsByMonth.set(key, { pass: 0, fail: 0 })
    }

    recentInspections.forEach((inspection) => {
      const date = new Date(inspection.inspectionDate)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (inspectionsByMonth.has(key)) {
        const stats = inspectionsByMonth.get(key)!
        if (inspection.overallResult === 'PASS') {
          stats.pass++
        } else if (inspection.overallResult === 'FAIL') {
          stats.fail++
        }
      }
    })

    const thisMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const lastMonthDate = new Date()
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

    const thisMonthData = inspectionsByMonth.get(thisMonthKey) || { pass: 0, fail: 0 }
    const lastMonthData = inspectionsByMonth.get(lastMonthKey) || { pass: 0, fail: 0 }

    const thisMonthTotal = thisMonthData.pass + thisMonthData.fail
    const lastMonthTotal = lastMonthData.pass + lastMonthData.fail
    const thisMonthPassRate = thisMonthTotal > 0 ? (thisMonthData.pass / thisMonthTotal) * 100 : 0
    const lastMonthPassRate = lastMonthTotal > 0 ? (lastMonthData.pass / lastMonthTotal) * 100 : 0

    const trend = thisMonthPassRate > lastMonthPassRate ? 'Improving' :
                  thisMonthPassRate < lastMonthPassRate ? 'Declining' : 'Stable'
    const trendPercentage = Math.abs(thisMonthPassRate - lastMonthPassRate).toFixed(1)

    // Top 5 recurring faults
    const faultCounts: Record<string, number> = {}
    inspections.forEach((inspection) => {
      if (inspection.actionDescription) {
        const faults = inspection.actionDescription.split(',').map(f => f.trim())
        faults.forEach(fault => {
          if (fault) {
            faultCounts[fault] = (faultCounts[fault] || 0) + 1
          }
        })
      }
    })

    const topFaults = Object.entries(faultCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([fault, count]) => ({ fault, count }))

    // Worst performing building
    const buildingStats = new Map<string, { name: string; total: number; failed: number }>()
    doors.forEach((door) => {
      const buildingId = door.building.id
      if (!buildingStats.has(buildingId)) {
        buildingStats.set(buildingId, { name: door.building.name, total: 0, failed: 0 })
      }
      const stats = buildingStats.get(buildingId)!
      stats.total++
      const lastInspection = door.inspections[0]
      if (lastInspection?.overallResult === 'FAIL') {
        stats.failed++
      }
    })

    let worstBuilding: { name: string; failureRate: number; failedDoors: number; totalDoors: number } | null = null
    let worstFailureRate = 0
    buildingStats.forEach((stats) => {
      if (stats.total > 0) {
        const failureRate = (stats.failed / stats.total) * 100
        if (failureRate > worstFailureRate) {
          worstFailureRate = failureRate
          worstBuilding = {
            name: stats.name,
            failureRate: parseFloat(failureRate.toFixed(1)),
            failedDoors: stats.failed,
            totalDoors: stats.total
          }
        }
      }
    })

    // Critical doors
    const criticalDoors = doors
      .map((door) => {
        const lastInspection = door.inspections[0]
        let riskScore = 0

        if (lastInspection?.overallResult === 'REQUIRES_ATTENTION') riskScore += 50
        if (lastInspection?.overallResult === 'FAIL') riskScore += 100
        if (!lastInspection) riskScore += 30

        if (door.nextInspectionDate && new Date(door.nextInspectionDate) < today) {
          const daysOverdue = Math.floor((today.getTime() - new Date(door.nextInspectionDate).getTime()) / (1000 * 60 * 60 * 24))
          riskScore += Math.min(daysOverdue, 50)
        }

        return {
          doorNumber: door.doorNumber,
          location: door.location,
          buildingName: door.building.name,
          status: lastInspection?.overallResult || 'NOT_INSPECTED',
          riskScore,
          nextInspectionDate: door.nextInspectionDate
        }
      })
      .filter((door) => door.riskScore > 0)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10)

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))

    // Header with branding
    doc.fontSize(24).fillColor('#dc2626').text('Fire Door Inspection Report', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(12).fillColor('#666666').text(user.tenant.companyName, { align: 'center' })
    doc.fontSize(10).fillColor('#999999').text(`Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}`, { align: 'center' })
    doc.moveDown(1.5)

    // Executive Summary
    doc.fontSize(16).fillColor('#1f2937').text('Executive Summary')
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#374151')

    // Stats box - Key Performance Indicators
    const statsY = doc.y
    doc.rect(50, statsY, 495, 140).fillAndStroke('#f9fafb', '#e5e7eb')

    // Calculate additional metrics
    const totalBuildings = buildingStats.size
    const highRiseBuildings = Array.from(buildingStats.keys()).filter(buildingId => {
      const door = doors.find(d => d.building.id === buildingId)
      return door?.building.topStoreyHeight && door.building.topStoreyHeight > 11
    }).length
    const highRiseDoors = doors.filter(d => d.building.topStoreyHeight && d.building.topStoreyHeight > 11)
    const highRisePassCount = highRiseDoors.filter(d => d.inspections[0]?.overallResult === 'PASS').length
    const highRiseCompliance = highRiseDoors.length > 0 ? ((highRisePassCount / highRiseDoors.length) * 100).toFixed(1) : '0'
    // Count doors where the most recent inspection requires attention
    const doorsRequiringAttention = doors.filter(door => {
      const latestInspection = door.inspections[0]
      return latestInspection?.status === 'REQUIRES_ACTION' ||
             latestInspection?.overallResult === 'REQUIRES_ATTENTION'
    })
    const requiresAttention = doorsRequiringAttention.length
    const uninspected = doors.filter(d => d.inspections.length === 0).length

    // Left column
    doc.fillColor('#374151')
    doc.fontSize(10).text(`Total Fire Doors: ${totalDoors}`, 70, statsY + 15)
    doc.text(`Compliance Rate: ${complianceRate}%`, 70, statsY + 35)
    doc.text(`Passed Inspections: ${passCount}`, 70, statsY + 55)
    doc.text(`Failed Inspections: ${failCount}`, 70, statsY + 75)
    doc.text(`Requires Attention: ${requiresAttention}`, 70, statsY + 95)
    doc.text(`Uninspected: ${uninspected}`, 70, statsY + 115)

    // Right column (moved further left for better spacing)
    doc.text(`Total Buildings: ${totalBuildings}`, 310, statsY + 15)
    doc.text(`High-Rise Buildings: ${highRiseBuildings}`, 310, statsY + 35)
    doc.text(`High-Rise Compliance: ${highRiseCompliance}%`, 310, statsY + 55)
    doc.text(`Overdue Inspections: ${overdueCount}`, 310, statsY + 75)
    doc.text(`Total Inspections: ${inspections.length}`, 310, statsY + 95)

    doc.y = statsY + 150
    doc.moveDown(1)

    // Top 5 Recurring Faults
    if (topFaults.length > 0) {
      doc.fontSize(14).fillColor('#1f2937').text('Top 5 Recurring Faults')
      doc.moveDown(0.5)
      doc.fontSize(10).fillColor('#374151')

      topFaults.forEach((fault, index) => {
        doc.text(`${index + 1}. ${fault.fault} (${fault.count} occurrence${fault.count !== 1 ? 's' : ''})`, { indent: 20 })
      })
      doc.moveDown(1)
    }

    // Worst Performing Building
    if (worstBuilding !== null) {
      const building = worstBuilding as { name: string; failureRate: number; failedDoors: number; totalDoors: number }
      doc.fontSize(14).fillColor('#1f2937').text('Worst Performing Building')
      doc.moveDown(0.5)
      doc.fontSize(10).fillColor('#374151')
      doc.text(`Building: ${building.name}`, { indent: 20 })
      doc.text(`Failure Rate: ${building.failureRate}%`, { indent: 20 })
      doc.text(`Failed Doors: ${building.failedDoors} of ${building.totalDoors}`, { indent: 20 })
      doc.moveDown(1)
    }

    // Critical Doors
    if (criticalDoors.length > 0) {
      doc.addPage()
      doc.fontSize(14).fillColor('#1f2937').text('Critical Doors Requiring Immediate Attention')
      doc.moveDown(0.5)
      doc.fontSize(9).fillColor('#374151')

      // Table header
      const tableTop = doc.y
      doc.fontSize(9).fillColor('#666666')
      doc.text('Door', 50, tableTop, { width: 70 })
      doc.text('Location', 125, tableTop, { width: 100 })
      doc.text('Building', 230, tableTop, { width: 100 })
      doc.text('Status', 335, tableTop, { width: 100 })
      doc.text('Risk', 440, tableTop, { width: 100 })

      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke('#e5e7eb')

      let currentY = tableTop + 20
      doc.fontSize(8).fillColor('#374151')

      criticalDoors.forEach((door) => {
        if (currentY > 700) {
          doc.addPage()
          currentY = 50
        }

        doc.text(door.doorNumber, 50, currentY, { width: 70 })
        doc.text(door.location, 125, currentY, { width: 100 })
        doc.text(door.buildingName, 230, currentY, { width: 100 })
        doc.text(door.status.replace(/_/g, ' '), 335, currentY, { width: 100 })
        doc.text(door.riskScore.toString(), 440, currentY, { width: 100 })

        currentY += 20
      })
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
        'Content-Disposition': `attachment; filename="fire-door-report-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF report:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}
