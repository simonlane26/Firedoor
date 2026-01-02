import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { createOrUpdateUsageRecord, trackMonthlyUsageForAllTenants } from '@/lib/usage-tracking'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const period = body.period ? new Date(body.period) : new Date()

    const usageRecord = await createOrUpdateUsageRecord({
      tenantId: user.tenant.id,
      period
    })

    return NextResponse.json(usageRecord)
  } catch (error) {
    console.error('Error tracking usage:', error)
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    )
  }
}

// Admin endpoint to track all tenants (for cron jobs)
export async function GET(request: Request) {
  // Check for admin API key in header for cron jobs
  const apiKey = request.headers.get('x-api-key')

  // For now, require admin user session
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserWithTenant()

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const results = await trackMonthlyUsageForAllTenants()

    return NextResponse.json({
      success: true,
      tracked: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    })
  } catch (error) {
    console.error('Error tracking all tenants usage:', error)
    return NextResponse.json(
      { error: 'Failed to track usage for all tenants' },
      { status: 500 }
    )
  }
}
