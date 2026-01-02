import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import {
  getBrandingConfig,
  validateBrandingConfig,
  sanitizeCustomCss,
  BrandingConfig,
} from '@/lib/branding'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const branding = getBrandingConfig(user.tenant)
    return NextResponse.json(branding)
  } catch (error) {
    console.error('Error fetching branding:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branding' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins can update branding
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const body: Partial<BrandingConfig> = await request.json()

    // Debug logging (updated validation supports relative paths)
    console.log('Received branding update:', body)
    console.log('logoUrl:', body.logoUrl, 'type:', typeof body.logoUrl)
    console.log('faviconUrl:', body.faviconUrl, 'type:', typeof body.faviconUrl)

    // Validate branding config
    const validation = validateBrandingConfig(body)
    if (!validation.valid) {
      console.log('Validation errors:', validation.errors)
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    // Sanitize custom CSS if provided
    if (body.customCss) {
      body.customCss = sanitizeCustomCss(body.customCss)
    }

    // Update tenant branding
    const updatedTenant = await prisma.tenant.update({
      where: { id: user.tenant.id },
      data: {
        ...(body.companyName && { companyName: body.companyName }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
        ...(body.faviconUrl !== undefined && { faviconUrl: body.faviconUrl }),
        ...(body.primaryColor && { primaryColor: body.primaryColor }),
        ...(body.secondaryColor && { secondaryColor: body.secondaryColor }),
        ...(body.accentColor && { accentColor: body.accentColor }),
        ...(body.textColor && { textColor: body.textColor }),
        ...(body.backgroundColor && { backgroundColor: body.backgroundColor }),
        ...(body.brandingEnabled !== undefined && { brandingEnabled: body.brandingEnabled }),
        ...(body.customCss !== undefined && { customCss: body.customCss }),
      },
    })

    const branding = getBrandingConfig(updatedTenant)
    return NextResponse.json(branding)
  } catch (error) {
    console.error('Error updating branding:', error)
    return NextResponse.json(
      { error: 'Failed to update branding' },
      { status: 500 }
    )
  }
}
