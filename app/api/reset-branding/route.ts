import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Temporary endpoint to reset branding settings
// This clears any local file references that don't exist in production
export async function POST() {
  try {
    // Update all tenants to use null branding (will fall back to default logo)
    await prisma.tenant.updateMany({
      data: {
        logoUrl: null,
        faviconUrl: null,
        primaryColor: null,
        accentColor: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Branding settings reset successfully',
    })
  } catch (error: any) {
    console.error('Reset branding error:', error)
    return NextResponse.json(
      { error: 'Failed to reset branding', details: error.message },
      { status: 500 }
    )
  }
}
