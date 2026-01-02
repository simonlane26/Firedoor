import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { getTenantLimits } from '@/lib/limits'

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
    const limits = await getTenantLimits(user.tenant.id)
    return NextResponse.json(limits)
  } catch (error) {
    console.error('Error fetching limits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch limits' },
      { status: 500 }
    )
  }
}
