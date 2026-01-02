import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateBuildingSafetyEvidencePack } from '@/lib/safety-evidence-pack'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const buildingId = id

    // Get user's tenant info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tenantId = user.tenantId
    const tenantName = user.tenant.companyName
    const tenantLogoUrl = user.tenant.logoUrl

    const pdfBuffer = await generateBuildingSafetyEvidencePack(buildingId, tenantId, tenantName, tenantLogoUrl)

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="safety-evidence-pack-${buildingId}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating safety evidence pack:', error)
    return NextResponse.json({ error: 'Failed to generate safety evidence pack' }, { status: 500 })
  }
}
