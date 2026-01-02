import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { createAuditLog } from '@/lib/audit-trail'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const evidence = await prisma.evidenceRecord.findMany({
      where: {
        entityType,
        entityId,
        tenantId: user.tenantId
      },
      include: {
        uploadedByUser: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(evidence)
  } catch (error) {
    console.error('Error fetching evidence:', error)
    return NextResponse.json({ error: 'Failed to fetch evidence' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const entityType = formData.get('entityType') as string
    const entityId = formData.get('entityId') as string
    const recordType = formData.get('recordType') as string
    const description = formData.get('description') as string

    if (!file || !entityType || !entityId || !recordType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'evidence')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${originalName}`
    const filePath = join(uploadsDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create evidence record in database
    const evidence = await prisma.evidenceRecord.create({
      data: {
        entityType,
        entityId,
        recordType,
        fileName: file.name,
        fileUrl: `/uploads/evidence/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
        description: description || null,
        uploadedBy: session.user.id,
        tenantId: user.tenantId
      },
      include: {
        uploadedByUser: {
          select: {
            name: true
          }
        }
      }
    })

    // Create audit log
    await createAuditLog({
      entityType: 'EVIDENCE',
      entityId: evidence.id,
      action: 'UPLOAD_EVIDENCE',
      userId: session.user.id,
      tenantId: user.tenantId,
      afterSnapshot: {
        recordType: evidence.recordType,
        fileName: evidence.fileName,
        relatedEntityType: entityType,
        relatedEntityId: entityId
      }
    })

    return NextResponse.json(evidence)
  } catch (error) {
    console.error('Error uploading evidence:', error)
    return NextResponse.json({ error: 'Failed to upload evidence' }, { status: 500 })
  }
}
