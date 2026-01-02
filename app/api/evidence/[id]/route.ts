import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { createAuditLog } from '@/lib/audit-trail'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get evidence record
    const evidence = await prisma.evidenceRecord.findFirst({
      where: {
        id,
        tenantId: user.tenantId
      }
    })

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 })
    }

    // Capture evidence details before deletion
    const evidenceSnapshot = {
      recordType: evidence.recordType,
      fileName: evidence.fileName,
      entityType: evidence.entityType,
      entityId: evidence.entityId
    }

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), 'public', evidence.fileUrl)
      await unlink(filePath)
    } catch (error) {
      console.error('Error deleting file:', error)
      // Continue even if file deletion fails
    }

    // Delete database record
    await prisma.evidenceRecord.delete({
      where: { id }
    })

    // Create audit log
    await createAuditLog({
      entityType: 'EVIDENCE',
      entityId: id,
      action: 'DELETE_EVIDENCE',
      userId: session.user.id,
      tenantId: user.tenantId,
      beforeSnapshot: evidenceSnapshot
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting evidence:', error)
    return NextResponse.json({ error: 'Failed to delete evidence' }, { status: 500 })
  }
}
