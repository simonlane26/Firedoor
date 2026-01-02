import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  return NextResponse.json(user.tenant)
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  // Check if user is admin
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Only admins can update tenant settings' },
      { status: 403 }
    )
  }

  const body = await request.json()

  // Only allow updating specific fields
  const allowedUpdates = {
    companyName: body.companyName,
    contactEmail: body.contactEmail,
    contactPhone: body.contactPhone,
    primaryColor: body.primaryColor,
    secondaryColor: body.secondaryColor,
    logoUrl: body.logoUrl,
  }

  const updated = await prisma.tenant.update({
    where: { id: user.tenant.id },
    data: allowedUpdates,
  })

  return NextResponse.json(updated)
}
