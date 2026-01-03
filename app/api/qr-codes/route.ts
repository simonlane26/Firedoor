import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserWithTenant } from '@/lib/tenant'
import QRCode from 'qrcode'

// Generate QR codes for doors
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const { doorIds, qrType = 'verification' } = await request.json()

    if (!doorIds || !Array.isArray(doorIds) || doorIds.length === 0) {
      return NextResponse.json({ error: 'Door IDs required' }, { status: 400 })
    }

    const frontendUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const qrCodes = []

    for (const doorId of doorIds) {
      const door = await prisma.fireDoor.findUnique({
        where: {
          id: doorId,
          tenantId: user.tenant.id
        },
        include: { building: true }
      })

      if (!door) {
        continue
      }

      // Generate URL based on QR type
      const url = qrType === 'inspection'
        ? `${frontendUrl}/inspect/${door.id}`
        : `${frontendUrl}/verify/${door.id}`

      const verificationUrl = url

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Update door with QR code URL
      await prisma.fireDoor.update({
        where: { id: door.id },
        data: { qrCodeUrl: verificationUrl }
      })

      qrCodes.push({
        doorId: door.id,
        doorNumber: door.doorNumber,
        location: door.location,
        building: door.building.name,
        qrCodeDataUrl,
        verificationUrl
      })
    }

    return NextResponse.json({ qrCodes })
  } catch (error) {
    console.error('QR code generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR codes' },
      { status: 500 }
    )
  }
}
