import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'
import archiver from 'archiver'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const { id } = await params

    // Get building with all doors and their latest inspections
    const building = await prisma.building.findFirst({
      where: {
        id,
        tenantId: user.tenant.id
      },
      include: {
        fireDoors: {
          include: {
            inspections: {
              orderBy: { inspectionDate: 'desc' },
              take: 1
            }
          },
          orderBy: { doorNumber: 'asc' }
        }
      }
    })

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 })
    }

    // Create a ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    const chunks: Buffer[] = []
    archive.on('data', (chunk) => chunks.push(chunk))

    // Generate a PDF for each door
    for (const door of building.fireDoors) {
      const pdfChunks: Buffer[] = []

      // Create PDF in a promise to handle async properly
      const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 })

        doc.on('data', (chunk) => pdfChunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(pdfChunks)))
        doc.on('error', reject)

        // Header
        doc.fontSize(20).text('Fire Door Inspection Report', { align: 'center' })
        doc.moveDown()
        doc.fontSize(12).text(`Building: ${building.name}`, { align: 'center' })
        doc.text(`Door: ${door.doorNumber}`, { align: 'center' })
        doc.moveDown(2)

        // Door Details
        doc.fontSize(16).text('Door Information')
        doc.moveDown(0.5)
        doc.fontSize(10)
        doc.text(`Location: ${door.location}`)
        doc.text(`Door Type: ${door.doorType.replace(/_/g, ' ')}`)
        doc.text(`Fire Rating: ${door.fireRating}`)
        if (door.manufacturer) {
          doc.text(`Manufacturer: ${door.manufacturer}`)
        }
        doc.moveDown()

        // Latest Inspection
        if (door.inspections.length > 0) {
          const inspection = door.inspections[0]
          doc.fontSize(16).text('Latest Inspection')
          doc.moveDown(0.5)
          doc.fontSize(10)
          doc.text(`Date: ${new Date(inspection.inspectionDate).toLocaleDateString()}`)
          doc.text(`Type: ${inspection.inspectionType}`)
          doc.text(`Status: ${inspection.status}`)
          if (inspection.overallResult) {
            doc.text(`Result: ${inspection.overallResult}`)
          }

          if (inspection.actionRequired && inspection.actionDescription) {
            doc.moveDown()
            doc.fontSize(12).text('Action Required:', { underline: true })
            doc.fontSize(10).text(inspection.actionDescription)
          }

          if (inspection.inspectorNotes) {
            doc.moveDown()
            doc.fontSize(12).text('Inspector Notes:', { underline: true })
            doc.fontSize(10).text(inspection.inspectorNotes)
          }
        } else {
          doc.fontSize(12).text('No inspections recorded for this door')
        }

        doc.end()
      })

      archive.append(pdfBuffer, { name: `${door.doorNumber.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf` })
    }

    await archive.finalize()

    const zipBuffer = Buffer.concat(chunks)

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${building.name.replace(/[^a-zA-Z0-9]/g, '_')}_All_Door_Reports.zip"`
      }
    })
  } catch (error) {
    console.error('Error generating ZIP:', error)
    return NextResponse.json(
      { error: 'Failed to generate ZIP file' },
      { status: 500 }
    )
  }
}
