import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  generateBuildingTemplate,
  generateFireDoorTemplate,
  generateImportGuide,
} from '@/lib/csv-export'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let csv: string
    let filename: string

    switch (type) {
      case 'buildings':
        csv = generateBuildingTemplate()
        filename = 'building-import-template.csv'
        break

      case 'doors':
        csv = generateFireDoorTemplate()
        filename = 'fire-door-import-template.csv'
        break

      case 'guide':
        csv = generateImportGuide()
        filename = 'import-guide.csv'
        break

      default:
        return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}
