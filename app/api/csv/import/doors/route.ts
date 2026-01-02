import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserWithTenant } from '@/lib/tenant'
import { importFireDoorsFromCSV } from '@/lib/csv-import'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins and managers can import doors
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const user = await getUserWithTenant()

  if (!user?.tenant) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 })
    }

    const csvData = await file.text()

    const result = await importFireDoorsFromCSV(csvData, user.tenant.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error importing fire doors:', error)
    return NextResponse.json(
      { error: 'Failed to import fire doors', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
